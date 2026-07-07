export interface DocSection {
  id: string
  title: string
  icon: string
  content: DocContent[]
}

export type DocContent = {
  id: string
  title: string
  body: string
  type: 'text' | 'tip' | 'warning' | 'code'
} | {
  id: string
  title: string
  body: string
  type: 'list'
  items: string[]
} | {
  id: string
  title: string
  body: string
  type: 'steps'
  steps: string[]
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

export interface ReleaseNote {
  version: string
  date: string
  title: string
  changes: { type: 'feature' | 'improvement' | 'fix'; description: string }[]
}

export interface TutorialItem {
  id: string
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
}

export const HELP_SECTIONS: DocSection[] = [
  {
    id: 'getting-started', title: 'Getting Started', icon: 'Compass',
    content: [
      { id: 'gs-1', title: 'Welcome to AI Caption Editor', type: 'text', body: 'AI Caption Editor is a professional tool for creating, editing, and exporting captions for your video content. Whether you are a content creator, educator, or accessibility professional, this guide will help you get up and running quickly.' },
      { id: 'gs-2', title: 'Creating Your First Project', type: 'steps', body: 'Follow these steps to create your first caption project:', steps: ['Click "New Project" from the sidebar or dashboard.', 'Choose a video file to upload or import from a URL.', 'Wait for automatic transcription to complete.', 'Review and edit the generated captions.', 'Customize the caption style using the Style panel.', 'Export your captions in your preferred format.'] },
      { id: 'gs-3', title: 'Interface Overview', type: 'text', body: 'The editor is divided into several key areas: the toolbar on the left provides editing tools, the center area shows your video preview, the right panel contains tabs for captions, styling, AI assistance, and media management. The timeline at the bottom gives you precise control over timing.' },
      { id: 'gs-4', title: 'Pro Tip: Keyboard Navigation', type: 'tip', body: 'Use keyboard shortcuts to speed up your workflow. Press Space to play/pause, S to split a clip, and Ctrl+Z to undo. See the Keyboard Shortcuts section for a full list.' },
    ],
  },
  {
    id: 'tutorials', title: 'Tutorials', icon: 'BookOpen',
    content: [
      { id: 'tut-1', title: 'Quick Start Tutorial (5 min)', type: 'text', body: 'In this quick tutorial, you will learn the basics of AI Caption Editor. By the end, you will have created your first set of captions and exported them as an SRT file.' },
      { id: 'tut-2', title: 'Advanced Caption Styling', type: 'text', body: 'Learn how to use the full power of the Style panel to create professional-looking captions. Covers font selection, stroke and shadow effects, animation presets, and position customization.' },
      { id: 'tut-3', title: 'Working with Multiple Languages', type: 'text', body: 'AI Caption Editor supports translation and multi-language caption tracks. This tutorial covers creating, managing, and exporting captions in multiple languages from a single project.' },
      { id: 'tut-4', title: 'Batch Processing Tips', type: 'tip', body: 'For multiple videos with similar content, create a template project with your preferred style settings. Then duplicate the project and replace the video file for each new video.' },
    ],
  },
  {
    id: 'documentation', title: 'Documentation', icon: 'FileText',
    content: [
      { id: 'doc-1', title: 'Projects Overview', type: 'text', body: 'Projects are the central organizing unit in AI Caption Editor. Each project contains a video file, its associated captions, style settings, and timeline markers. Projects can be organized, searched, and filtered from the Projects page.' },
      { id: 'doc-2', title: 'Caption Editing', type: 'text', body: 'Captions can be edited at the word level from the Transcript panel. Each word shows its confidence score, allowing you to quickly identify and correct low-confidence transcriptions. You can also adjust timing by dragging caption boundaries on the timeline.' },
      { id: 'doc-3', title: 'Style System', type: 'text', body: 'The Style panel provides comprehensive control over caption appearance. Changes are applied in real-time to the video preview. You can save and load style presets, copy styles between captions, and use the animation presets for dynamic text effects.' },
      { id: 'doc-4', title: 'Timeline Features', type: 'list', body: 'The timeline provides the following features:', items: ['Multi-track support (video, audio, captions)', 'Drag-and-drop clip positioning', 'Snap-to-grid and snap-to-edges', 'Waveform visualization for audio tracks', 'Zoom in/out with mouse wheel or slider', 'Split, merge, and trim caption clips', 'Undo/redo for all timeline actions'] },
    ],
  },
  {
    id: 'keyboard-shortcuts', title: 'Keyboard Shortcuts', icon: 'Keyboard',
    content: [
      { id: 'ks-1', title: 'Playback Shortcuts', type: 'list', body: '', items: ['Space - Play / Pause', '→ - Skip forward 5 seconds', '← - Skip back 5 seconds', 'J - Rewind 1 second', 'K - Pause', 'L - Fast forward 1 second'] },
      { id: 'ks-2', title: 'Editing Shortcuts', type: 'list', body: '', items: ['S - Split selected clip', 'Delete - Delete selected clip', 'Ctrl+Z / ⌘Z - Undo', 'Ctrl+Shift+Z / ⌘⇧Z - Redo', 'Ctrl+X / ⌘X - Cut', 'Ctrl+C / ⌘C - Copy', 'Ctrl+V / ⌘V - Paste'] },
      { id: 'ks-3', title: 'Navigation Shortcuts', type: 'list', body: '', items: ['Ctrl+F / ⌘F - Search', 'Ctrl+E / ⌘E - Open Export Center', 'Ctrl+B / ⌘B - Toggle sidebar', 'Ctrl+T / ⌘T - Toggle timeline', 'Ctrl+0 / ⌘0 - Fit timeline to view', 'Ctrl++ / ⌘+ - Zoom in', 'Ctrl+- / ⌘− - Zoom out'] },
    ],
  },
  {
    id: 'faq', title: 'FAQs', icon: 'HelpCircle',
    content: [
      { id: 'faq-1', title: 'What video formats are supported?', type: 'text', body: 'AI Caption Editor supports MP4, MOV, WebM, and AVI video formats. For audio-only projects, MP3, WAV, AAC, and FLAC files are supported.' },
      { id: 'faq-2', title: 'How accurate is the auto-transcription?', type: 'text', body: 'The auto-transcription engine achieves over 95% accuracy for clear speech in supported languages. Accuracy may vary with background noise, multiple speakers, or heavy accents. The confidence score for each word is displayed in the transcript panel.' },
      { id: 'faq-3', title: 'Can I export captions without the video?', type: 'text', body: 'Yes. You can export captions as standalone files in SRT, VTT, ASS, TXT, or JSON formats. These exports do not include the video file.' },
      { id: 'faq-4', title: 'How do I translate captions to another language?', type: 'text', body: 'Select the captions you want to translate, then use the AI Assistant panel with a translation prompt. The AI will generate translated captions that you can review and adjust before finalizing.' },
      { id: 'faq-5', title: 'Is there a limit on project file size?', type: 'text', body: 'For the Pro plan, individual video files up to 4GB are supported. The Free plan has a 500MB file size limit. Total storage depends on your plan.' },
    ],
  },
  {
    id: 'release-notes', title: 'Release Notes', icon: 'Megaphone',
    content: [
      { id: 'rn-1', title: 'Version 1.0.0 - Initial Release', type: 'text', body: 'Welcome to AI Caption Editor! This initial release includes auto-transcription, caption editing, style customization, AI assistance, and multi-format export.' },
      { id: 'rn-2', title: 'Version 1.1.0 - AI Enhancements', type: 'text', body: 'Added AI-powered caption suggestions, translation support, and the AI generation panel for creating images and video assets.' },
      { id: 'rn-3', title: 'Version 1.2.0 - Timeline Improvements', type: 'text', body: 'Introduced multi-track timeline, waveform visualization, snap-to-grid, and keyboard shortcut customization.' },
    ],
  },
  {
    id: 'report-bug', title: 'Report a Bug', icon: 'Bug',
    content: [
      { id: 'rb-1', title: 'How to Report a Bug', type: 'steps', body: 'To help us fix issues quickly, please follow these steps:', steps: ['Check the FAQs and documentation to see if the issue is already known.', 'Take a screenshot or screen recording showing the issue.', 'Note any error messages that appear in the console.', 'Click the "Submit Report" button below to send us the details.', 'Our team typically responds within 24 hours.'] },
      { id: 'rb-2', title: 'Submit a Bug Report', type: 'tip', body: 'When submitting a bug report, include your browser version, operating system, and steps to reproduce the issue. The more detail you provide, the faster we can resolve it.' },
    ],
  },
  {
    id: 'request-feature', title: 'Request a Feature', icon: 'Lightbulb',
    content: [
      { id: 'rf-1', title: 'Suggest a Feature', type: 'text', body: 'We value your feedback! Feature requests help us prioritize what to build next. Before requesting, please check the release notes to see if your feature is already planned.' },
      { id: 'rf-2', title: 'How to Submit', type: 'steps', body: '', steps: ['Describe the feature you would like to see.', 'Explain how it would benefit your workflow.', 'Share any examples of similar features in other tools.', 'Submit your request using the form below.', 'Vote on existing feature requests from other users.'] },
    ],
  },
  {
    id: 'community', title: 'Community', icon: 'Users',
    content: [
      { id: 'com-1', title: 'Join Our Community', type: 'text', body: 'Connect with other AI Caption Editor users, share tips, ask questions, and stay up to date with the latest developments.' },
      { id: 'com-2', title: 'Community Resources', type: 'list', body: '', items: ['GitHub Repository - Browse source code and contribute', 'Discord Server - Chat with the community', 'Twitter/X - Follow for updates and tips', 'YouTube Channel - Video tutorials and demos', 'Community Forum - Ask questions and share workflows'] },
    ],
  },
  {
    id: 'about', title: 'About', icon: 'Info',
    content: [
      { id: 'ab-1', title: 'About AI Caption Editor', type: 'text', body: 'AI Caption Editor is a professional caption creation and editing tool built with modern web technologies. It combines automatic speech recognition with powerful editing tools to make caption creation fast and accessible.' },
      { id: 'ab-2', title: 'License', type: 'text', body: 'This application is licensed under the MIT License. You are free to use, modify, and distribute this software subject to the terms of the license. A copy of the license is available in the source repository.' },
      { id: 'ab-3', title: 'Open Source Components', type: 'list', body: 'This application uses the following open-source components:', items: ['React - UI library (MIT)', 'Vite - Build tool (MIT)', 'TypeScript - Programming language (Apache 2.0)', 'Tailwind CSS - Utility CSS framework (MIT)', 'Zustand - State management (MIT)', 'Lucide Icons - Icon library (ISC)', 'Radix UI - Headless UI primitives (MIT)', 'shadcn/ui - Component library (MIT)'] },
      { id: 'ab-4', title: 'Version Information', type: 'text', body: 'AI Caption Editor v1.2.0 - Build 2026.07.01' },
    ],
  },
]

export const FAQ_CATEGORIES = [
  { id: 'general', label: 'General', count: 2 },
  { id: 'export', label: 'Export', count: 1 },
  { id: 'transcription', label: 'Transcription', count: 1 },
  { id: 'translation', label: 'Translation', count: 1 },
  { id: 'limits', label: 'Limits', count: 1 },
]

export const TUTORIALS: TutorialItem[] = [
  { id: 'tut-qs', title: 'Quick Start', description: 'Create your first captions in 5 minutes', duration: '5 min', difficulty: 'beginner', category: 'Getting Started' },
  { id: 'tut-style', title: 'Advanced Styling', description: 'Master the caption style editor', duration: '10 min', difficulty: 'intermediate', category: 'Styling' },
  { id: 'tut-multi', title: 'Multiple Languages', description: 'Work with multi-language captions', duration: '8 min', difficulty: 'intermediate', category: 'Translation' },
  { id: 'tut-export', title: 'Export Workflows', description: 'Optimize your export pipeline', duration: '6 min', difficulty: 'beginner', category: 'Export' },
  { id: 'tut-ai', title: 'AI Assistant Deep Dive', description: 'Leverage AI for caption improvement', duration: '12 min', difficulty: 'advanced', category: 'AI' },
  { id: 'tut-timeline', title: 'Timeline Mastery', description: 'Advanced timeline editing techniques', duration: '15 min', difficulty: 'advanced', category: 'Editing' },
]
