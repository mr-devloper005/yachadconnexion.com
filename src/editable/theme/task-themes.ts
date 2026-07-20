import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY_FONT = "'Funnel Display', system-ui, -apple-system, 'Segoe UI', sans-serif"
const BODY_FONT = "'Mona Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY_FONT,
  fontBody: BODY_FONT,
  bg: '#f3f3f3',
  surface: '#ffffff',
  raised: '#fafafa',
  text: '#111111',
  muted: '#666666',
  line: '#e6e6e6',
  accent: '#e05a4a',
  accentSoft: '#ffdede',
  onAccent: '#ffffff',
  glow: 'rgba(224,90,74,0.16)',
  radius: '0.5rem',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Reading Desk', note: 'Long-form posts with calm hierarchy and generous context.' },
  listing: { ...base, kicker: 'Local Directory', note: 'Compare nearby records with practical contact details and trust cues.' },
  classified: { ...base, kicker: 'Notice Board', note: 'Short, timely offers arranged for fast scanning.' },
  image: { ...base, kicker: 'Visual Index', note: 'Image-led entries with a portfolio-style browsing rhythm.' },
  sbm: { ...base, kicker: 'Resource Shelf', note: 'Curated links and references grouped for easy return visits.' },
  pdf: { ...base, kicker: 'Reference Library', note: 'Browse useful guides, reports, and downloadable reference material.' },
  profile: { ...base, kicker: 'Profiles', note: 'People and organizations shown with identity and credibility.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
