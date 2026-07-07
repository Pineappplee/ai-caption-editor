export class ApiError extends Error {
  status: number
  code?: string
  details?: any

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export interface RequestOptions extends RequestInit {
  timeout?: number
  retry?: number
  retryDelay?: number
}

type RequestInterceptor = (options: RequestOptions) => Promise<RequestOptions> | RequestOptions
type ResponseInterceptor = (response: Response) => Promise<Response> | Response

const IDEMPOTENT_METHODS = ['GET', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

class ApiClient {
  private baseUrl: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '')
  }

  // Token storage helpers
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor)
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor)
  }

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb)
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((cb) => cb(token))
    this.refreshSubscribers = []
  }

  private async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      this.clearTokens()
      // Dispatch custom event to notify auth stores/UI to redirect
      window.dispatchEvent(new Event('auth:unauthorized'))
      throw new Error('Session expired')
    }

    const json = await response.json()
    if (json.success && json.data) {
      const { accessToken, refreshToken: newRefreshToken } = json.data
      this.setTokens(accessToken, newRefreshToken)
      return accessToken
    }

    throw new Error('Refresh response invalid')
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`
    
    // Apply request interceptors
    let finalOptions = { ...options }
    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(finalOptions)
    }

    // Default headers
    finalOptions.headers = {
      'Content-Type': 'application/json',
      ...finalOptions.headers,
    }

    // Attach JWT Bearer auth automatically if present
    const token = this.getAccessToken()
    if (token && !(finalOptions.headers as any)['Authorization']) {
      ;(finalOptions.headers as any)['Authorization'] = `Bearer ${token}`
    }

    const method = (finalOptions.method || 'GET').toUpperCase()
    const isIdempotent = IDEMPOTENT_METHODS.includes(method)
    const retriesMax = finalOptions.retry ?? (isIdempotent ? 2 : 0)
    const retryDelay = finalOptions.retryDelay ?? 1000

    let response: Response
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout ?? 15000)
    finalOptions.signal = controller.signal

    try {
      response = await fetch(url, finalOptions)
      clearTimeout(timeoutId)
    } catch (err: any) {
      clearTimeout(timeoutId)
      
      // Handle timeout abort
      if (err.name === 'AbortError') {
        if (retriesMax > 0) {
          await new Promise((r) => setTimeout(r, retryDelay))
          return this.request<T>(path, { ...options, retry: retriesMax - 1 })
        }
        throw new ApiError('Request timeout', 408, 'TIMEOUT')
      }

      // Handle network errors
      if (retriesMax > 0) {
        await new Promise((r) => setTimeout(r, retryDelay))
        return this.request<T>(path, { ...options, retry: retriesMax - 1 })
      }
      throw new ApiError(err.message || 'Network error', 0, 'NETWORK_ERROR')
    }

    // Apply response interceptors
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response)
    }

    // Handle 401 Unauthorized (Refresh token logic)
    if (response.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      if (this.isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          this.subscribeTokenRefresh((newToken) => {
            const headers = { ...finalOptions.headers } as any
            headers['Authorization'] = `Bearer ${newToken}`
            this.request<T>(path, { ...finalOptions, headers }).then(resolve).catch(reject)
          })
        })
      }

      this.isRefreshing = true

      try {
        const newAccessToken = await this.performRefresh()
        this.isRefreshing = false
        this.onTokenRefreshed(newAccessToken)
        
        // Retry current request
        const headers = { ...finalOptions.headers } as any
        headers['Authorization'] = `Bearer ${newAccessToken}`
        return this.request<T>(path, { ...finalOptions, headers })
      } catch (err) {
        this.isRefreshing = false
        this.clearTokens()
        window.dispatchEvent(new Event('auth:unauthorized'))
        throw err
      }
    }

    // Idempotent retry on 5xx errors
    if (response.status >= 500 && retriesMax > 0) {
      await new Promise((r) => setTimeout(r, retryDelay))
      return this.request<T>(path, { ...options, retry: retriesMax - 1 })
    }

    // Parse API JSON Response
    let responseData: any
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      responseData = await response.text()
    }

    if (!response.ok) {
      const message = responseData?.message || responseData?.error || response.statusText || 'API Error'
      const code = responseData?.data?.code || responseData?.code || 'API_ERROR'
      const details = responseData?.data?.details || responseData?.details
      throw new ApiError(message, response.status, code, details)
    }

    // Unpack standard backend envelope (success, message, data)
    if (responseData && typeof responseData === 'object' && 'success' in responseData) {
      return responseData.data as T
    }

    return responseData as T
  }

  // HTTP wrapper methods
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' })
  }

  post<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      headers: data instanceof FormData ? {} : undefined, // let browser set multipart boundary
    })
  }

  put<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
