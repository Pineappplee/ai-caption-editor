import type { LoginParams, SignUpParams, AuthResult, AuthUser } from './types'

export interface IAuthService {
  login(params: LoginParams): Promise<AuthResult>
  signup(params: SignUpParams): Promise<AuthResult>
  logout(): Promise<void>
  getCurrentUser(): Promise<AuthUser | null>
  getToken(): string | null

  // Session & JWT Validation
  refreshToken(): Promise<string>
  validateSession(): Promise<boolean>

  // Guest Mode
  loginAsGuest(): Promise<AuthResult>
  isGuest(): boolean

  // OAuth Integration
  loginWithOAuth(provider: 'google' | 'github'): Promise<void>
  handleOAuthRedirectCallback(): Promise<AuthResult>
}
