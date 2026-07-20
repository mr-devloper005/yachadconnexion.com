'use client'

import { Clock3, Mail, MessageSquareText, Send } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const contactNotes = [
  { icon: MessageSquareText, title: 'Start with context', body: 'A short note with the main details is enough to begin.' },
  { icon: Mail, title: 'Use a reachable email', body: 'We will use your contact details only to reply to your request.' },
  { icon: Clock3, title: 'Expect a thoughtful response', body: 'Messages are reviewed and routed to the right next step.' },
]

export default function ContactPage() {
  return (
    <EditableSiteShell className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
      <main className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="editable-label text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{pagesContent.contact.eyebrow}</p>
            <h1 className="editable-display mt-5 max-w-4xl text-6xl font-medium leading-[0.9] sm:text-8xl lg:text-[8rem]">{pagesContent.contact.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--slot4-muted-text)]">{pagesContent.contact.description}</p>

            <div className="mt-10 grid gap-4">
              {contactNotes.map((note) => (
                <div key={note.title} className="rounded-md border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-5">
                  <note.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <h2 className="editable-display mt-4 text-2xl font-medium">{note.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{note.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="editable-label text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">Message form</p>
                <h2 className="editable-display mt-2 text-4xl font-medium leading-none">{pagesContent.contact.formTitle}</h2>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <Send className="h-5 w-5" />
              </div>
            </div>
            <EditableContactLeadForm />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
