import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'

export function Hero() {
  const navigate = useNavigate()
  return (
    <Container as="section" className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl">
          Caption smarter. Ship faster.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-400 md:text-xl">
          AI-powered caption editing for video creators — transcribe, translate, and export in minutes
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button variant="primary" size="lg" onClick={() => navigate('/auth')}>
            Start for Free
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/auth')}>
            Watch Demo
          </Button>
        </div>
      </div>
    </Container>
  )
}
