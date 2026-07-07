export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  plan: 'free' | 'pro'
}

export interface LoginParams {
  email: string
  password: string
  remember?: boolean
}

export interface SignUpParams {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResult {
  user: AuthUser
  token: string
}

export interface AuthError {
  code: string
  message: string
}
