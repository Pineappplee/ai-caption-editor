import { Container } from '@/components/ui/container'
import { FOOTER_LINKS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <Container as="footer">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="text-sm text-zinc-500">
            &copy; 2026 AI Caption Editor. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  )
}
