import { Check } from 'lucide-react'
import type { WizardStep } from '@/services/wizard'

interface StepperProps {
  steps: WizardStep[]
  currentStep: string
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const currentIdx = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIdx
        const isCurrent = i === currentIdx

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-3">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-purple-600 text-white'
                    : isCurrent
                      ? 'border-2 border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border border-zinc-600 bg-zinc-800 text-zinc-500'
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <p
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-zinc-100' : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-zinc-600">{step.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-4 h-px w-16 sm:w-24 ${
                  isCompleted ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
