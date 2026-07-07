import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { NAV_LINKS } from '@/lib/constants'

export function Header() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#21233A]/80 backdrop-blur-md">
      <Container as="header" className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-purple-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-zinc-100">
            AI Caption Editor
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </Container>
    </header>
  )
}
