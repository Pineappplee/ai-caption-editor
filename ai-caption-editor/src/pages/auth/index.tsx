import { useState } from 'react'
import { AuthLayout } from './auth-layout'
import { SignInForm } from './sign-in-form'
import { SignUpForm } from './sign-up-form'

type AuthView = 'sign-in' | 'sign-up'

export function AuthPage() {
  const [view, setView] = useState<AuthView>('sign-in')

  if (view === 'sign-in') {
    return (
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to your caption editor workspace"
        footer={
          <>
            New to the editor?{' '}
            <button
              type="button"
              onClick={() => setView('sign-up')}
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Create an account
            </button>
          </>
        }
      >
        <SignInForm />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start captioning with AI-powered tools"
      footer={
        <>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setView('sign-in')}
            className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            Sign in
          </button>
        </>
      }
    >
        <SignUpForm />
    </AuthLayout>
  )
}
