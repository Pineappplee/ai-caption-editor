import { apiClient } from '@/lib/api-client'
import type { IAuthService } from './interface'
import type { LoginParams, SignUpParams, AuthResult, AuthUser } from './types'

export class HttpAuthService implements IAuthService {
  private cachedUser: AuthUser | null = null

  private mapUser(u: any): AuthUser {
    return {
      id: u.id.toString(),
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl || undefined,
      plan: u.plan === 'pro' ? 'pro' : 'free',
    }
  }

  async login(params: LoginParams): Promise<AuthResult> {
    const data = await apiClient.post<any>('/api/v1/auth/login', {
      email: params.email,
      password: params.password,
    })
    
    apiClient.setTokens(data.accessToken, data.refreshToken)
    const user = this.mapUser(data.user)
    this.cachedUser = user
    return { user, token: data.accessToken }
  }

  async signup(params: SignUpParams): Promise<AuthResult> {
    const data = await apiClient.post<any>('/api/v1/auth/register', {
      name: params.name,
      email: params.email,
      password: params.password,
    })
    
    apiClient.setTokens(data.accessToken, data.refreshToken)
    const user = this.mapUser(data.user)
    this.cachedUser = user
    return { user, token: data.accessToken }
  }

  async logout(): Promise<void> {
    const refreshToken = apiClient.getRefreshToken()
    if (refreshToken) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refreshToken })
      } catch (err) {
        console.warn('Backend logout failed', err)
      }
    }
    apiClient.clearTokens()
    this.cachedUser = null
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (this.isGuest()) {
      return this.cachedUser
    }
    const token = apiClient.getAccessToken()
    if (!token) return null

    try {
      const data = await apiClient.get<any>('/api/v1/auth/me')
      const user = this.mapUser(data)
      this.cachedUser = user
      return user
    } catch (err) {
      console.warn('Failed to retrieve current user', err)
      return null
    }
  }

  getToken(): string | null {
    return apiClient.getAccessToken()
  }

  async refreshToken(): Promise<string> {
    const refreshToken = apiClient.getRefreshToken()
    if (!refreshToken) throw new Error('No refresh token available')
    
    const data = await apiClient.post<any>('/api/v1/auth/refresh', { refreshToken })
    apiClient.setTokens(data.accessToken, data.refreshToken)
    return data.accessToken
  }

  async validateSession(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return user !== null
  }

  async loginAsGuest(): Promise<AuthResult> {
    const user: AuthUser = {
      id: 'guest_user',
      name: 'Guest User',
      email: 'guest@studio.io',
      plan: 'free',
    }
    this.cachedUser = user
    const token = 'mock_guest_token_' + Date.now()
    apiClient.setTokens(token, 'mock_guest_refresh_token')
    return { user, token }
  }

  isGuest(): boolean {
    return this.cachedUser?.id === 'guest_user'
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    // Backend doesn't support OAuth yet, fallback to mock callback flow
    await new Promise((r) => setTimeout(r, 200))
    window.location.href = `/auth?provider=${provider}&code=mock_oauth_code`
  }

  async handleOAuthRedirectCallback(): Promise<AuthResult> {
    // Mock successful callback since backend doesn't support OAuth
    await new Promise((r) => setTimeout(r, 300))
    const user: AuthUser = {
      id: 'oauth_user_' + Date.now(),
      name: 'OAuth User',
      email: 'oauth@example.com',
      plan: 'pro',
    }
    this.cachedUser = user
    const token = 'mock_oauth_token_' + Date.now()
    apiClient.setTokens(token, 'mock_oauth_refresh_token')
    return { user, token }
  }
}
