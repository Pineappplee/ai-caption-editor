import { Container } from '@/components/ui/container'
import { FEATURES } from '@/lib/constants'

export function Features() {
  return (
    <Container as="section" className="pb-24 md:pb-32">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-purple-600/10 text-purple-400">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold text-zinc-100">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                {feature.description}
              </p>
            </div>
          )
        })}
      </div>
    </Container>
  )
}
