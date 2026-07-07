import { Header } from './header'
import { Hero } from './hero'
import { Features } from './features'
import { Footer } from './footer'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#21233A]">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  )
}
