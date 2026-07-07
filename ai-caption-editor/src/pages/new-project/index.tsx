import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Film, Music, LayoutTemplate, FilePlus } from 'lucide-react'
import { useServices } from '@/services'
import type { InputMethod, ProjectConfig, Template, RecentFile, WizardStep } from '@/services/wizard'
import { Stepper } from './stepper'
import { UploadArea } from './upload-area'
import { TemplateCard } from './template-card'
import { ProjectForm } from './project-form'



const STEPS: WizardStep[] = [
  { id: 'method', label: 'Source', description: 'Choose input method' },
  { id: 'configure', label: 'Configure', description: 'Set project options' },
  { id: 'create', label: 'Create', description: 'Review and create' },
]

const DEFAULT_CONFIG: ProjectConfig = {
  name: '',
  language: 'EN',
  aspectRatio: '16:9',
  frameRate: 30,
  outputResolution: '1920x1080',
}

const INPUT_METHODS: { id: InputMethod; label: string; description: string; icon: typeof Film }[] = [
  { id: 'upload', label: 'Upload Video', description: 'Import a video file to caption', icon: Film },
  { id: 'import', label: 'Import Audio', description: 'Transcribe from an audio file', icon: Music },
  { id: 'template', label: 'Start from Template', description: 'Use a pre-built template', icon: LayoutTemplate },
  { id: 'blank', label: 'Blank Project', description: 'Start from scratch', icon: FilePlus },
]

export function NewProjectPage() {
  const { wizard: service } = useServices()
  const navigate = useNavigate()
  const [step, setStep] = useState('method')
  const [inputMethod, setInputMethod] = useState<InputMethod | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const [config, setConfig] = useState<ProjectConfig>(DEFAULT_CONFIG)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    service.getTemplates().then(setTemplates)
    service.getRecentFiles().then(setRecentFiles)
  }, [service])

  const handleNext = () => {
    if (step === 'method') setStep('configure')
    else if (step === 'configure') setStep('create')
  }

  const handleBack = () => {
    if (step === 'configure') setStep('method')
    else if (step === 'create') setStep('configure')
    else navigate('/projects')
  }

  const handleCreate = async () => {
    setCreating(true)
    const newProject = await service.createProject(config, inputMethod ?? 'blank', selectedFile ?? undefined)
    setCreating(false)
    navigate(`/editor/${newProject.id}`)
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800/50 px-6 py-5 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex size-9 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">New Project</h1>
            <p className="text-sm text-zinc-500">
              Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
            </p>
          </div>
        </div>
      </div>

      <div className="border-b border-zinc-800/50 px-6 py-4 lg:px-8">
        <Stepper steps={STEPS} currentStep={step} />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-8">
        {step === 'method' && (
          <div className="mx-auto max-w-4xl">
            <h2 className="text-lg font-semibold text-zinc-100">Choose Input Method</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Select how you want to start your project
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {INPUT_METHODS.map((method) => {
                const Icon = method.icon
                const isSelected = inputMethod === method.id
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setInputMethod(method.id)
                      setSelectedTemplate(null)
                      setSelectedFile(null)
                    }}
                    className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500'
                        : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                    }`}
                  >
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      <Icon className="size-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${
                        isSelected ? 'text-purple-300' : 'text-zinc-100'
                      }`}>
                        {method.label}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">{method.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            {inputMethod && (inputMethod === 'upload' || inputMethod === 'import') && (
              <div className="mt-8">
                <UploadArea
                  inputMethod={inputMethod}
                  recentFiles={recentFiles}
                  onFileSelect={(file) => {
                    setSelectedFile(file)
                    setConfig((c) => ({
                      ...c,
                      name: file.name.replace(/\.[^/.]+$/, ''),
                    }))
                  }}
                  onRecentFileSelect={(file) => {
                    setConfig((c) => ({
                      ...c,
                      name: file.name.replace(/\.[^/.]+$/, ''),
                    }))
                  }}
                />
              </div>
            )}

            {inputMethod === 'template' && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-zinc-400">Choose a Template</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {templates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={selectedTemplate?.id === t.id}
                      onSelect={(template) => {
                        setSelectedTemplate(template)
                        setConfig((c) => ({
                          ...c,
                          name: template.name,
                        }))
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {inputMethod === 'blank' && (
              <div className="mt-8 rounded-2xl border border-zinc-700 bg-zinc-800/30 p-8 text-center">
                <FilePlus className="mx-auto size-10 text-zinc-500" />
                <p className="mt-3 text-sm font-medium text-zinc-300">Blank Project</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Start with an empty project and add media later
                </p>
              </div>
            )}
          </div>
        )}

        {step === 'configure' && (
          <div className="mx-auto max-w-2xl">
            <h2 className="text-lg font-semibold text-zinc-100">Configure Project</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Set your project name, language, and output preferences
            </p>

            {selectedFile && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <p className="text-xs text-zinc-500">Selected file</p>
                <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
              </div>
            )}

            {selectedTemplate && (
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3">
                <p className="text-xs text-zinc-500">Template</p>
                <p className="text-sm font-medium text-zinc-200">{selectedTemplate.name}</p>
              </div>
            )}

            <div className="mt-6">
              <ProjectForm config={config} onChange={setConfig} />
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="mx-auto max-w-2xl">
            <h2 className="text-lg font-semibold text-zinc-100">Review & Create</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Review your project configuration before creating
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Project Name</p>
                    <p className="text-sm font-medium text-zinc-200">{config.name || 'Untitled'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Input Method</p>
                    <p className="text-sm font-medium text-zinc-200">
                      {inputMethod === 'upload' ? 'Upload Video'
                        : inputMethod === 'import' ? 'Import Audio'
                          : inputMethod === 'template' ? `Template: ${selectedTemplate?.name}`
                            : 'Blank Project'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Language</p>
                    <p className="text-sm font-medium text-zinc-200">{config.language}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Aspect Ratio</p>
                    <p className="text-sm font-medium text-zinc-200">{config.aspectRatio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Frame Rate</p>
                    <p className="text-sm font-medium text-zinc-200">{config.frameRate} fps</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Output Resolution</p>
                    <p className="text-sm font-medium text-zinc-200">{config.outputResolution}</p>
                  </div>
                </div>
              </div>

              {selectedFile && (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <p className="text-xs text-zinc-500">File</p>
                  <p className="text-sm font-medium text-zinc-200">{selectedFile.name}</p>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                  <Check className="size-3 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">Ready to create</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Your project will be created with the configured settings. You can always change these later.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800/50 px-6 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            <ArrowLeft className="size-4" />
            {step === 'method' ? 'Cancel' : 'Back'}
          </button>

          {step === 'create' ? (
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !config.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Project'}
              <Check className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                step === 'method' && !inputMethod
              }
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRight className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
