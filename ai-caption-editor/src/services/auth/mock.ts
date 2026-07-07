import type { IAuthService } from './interface'
import type { LoginParams, SignUpParams, AuthResult, AuthUser } from './types'

const MOCK_USER: AuthUser = {
  id: 'user_1',
  name: 'Alex Johnson',
  email: 'alex@studio.io',
  avatarUrl: undefined,
  plan: 'pro',
}

export class MockAuthService implements IAuthService {
  private currentUser: AuthUser | null = null
  private token: string | null = null

  async login(_params: LoginParams): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 600))
    this.currentUser = MOCK_USER
    this.token = 'mock_token_' + Date.now()
    return { user: this.currentUser, token: this.token }
  }

  async signup(_params: SignUpParams): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 600))
    this.currentUser = {
      ...MOCK_USER,
      name: _params.name,
      email: _params.email,
    }
    this.token = 'mock_token_' + Date.now()
    return { user: this.currentUser, token: this.token }
  }

  async logout(): Promise<void> {
    await new Promise((r) => setTimeout(r, 200))
    this.currentUser = null
    this.token = null
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.currentUser
  }

  getToken(): string | null {
    return this.token
  }

  async refreshToken(): Promise<string> {
    this.token = 'mock_refreshed_token_' + Date.now()
    return this.token
  }

  async validateSession(): Promise<boolean> {
    return this.currentUser !== null
  }

  async loginAsGuest(): Promise<AuthResult> {
    this.currentUser = {
      id: 'guest_user',
      name: 'Guest User',
      email: 'guest@studio.io',
      plan: 'free',
    }
    this.token = 'mock_guest_token_' + Date.now()
    return { user: this.currentUser, token: this.token }
  }

  isGuest(): boolean {
    return this.currentUser?.id === 'guest_user'
  }

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    await new Promise((r) => setTimeout(r, 500))
    window.location.href = `/auth?provider=${provider}&code=mock_oauth_code`
  }

  async handleOAuthRedirectCallback(): Promise<AuthResult> {
    await new Promise((r) => setTimeout(r, 600))
    this.currentUser = MOCK_USER
    this.token = 'mock_oauth_token_' + Date.now()
    return { user: this.currentUser, token: this.token }
  }
}
