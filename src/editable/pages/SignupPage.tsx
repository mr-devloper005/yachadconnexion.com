import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, UserPlus } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

const points = ['Create access quickly', 'Use a simple local account', 'Come back whenever you need']

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Sign up', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div className="self-center rounded-md border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 shadow-[0_1px_0_rgba(17,17,17,0.10)] sm:p-9">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="editable-label text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">New account</p>
                <h1 className="editable-display mt-2 text-4xl font-medium leading-none">{pagesContent.auth.signup.formTitle}</h1>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
            <EditableLocalSignupForm />
            <p className="mt-6 text-sm text-[var(--slot4-muted-text)]">Already have an account? <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-[var(--slot4-accent)] underline-offset-4 hover:underline">{pagesContent.auth.signup.loginCta} <ArrowRight className="h-3.5 w-3.5" /></Link></p>
          </div>

          <div className="flex flex-col justify-between rounded-md border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] p-7 text-white sm:p-10">
            <div>
              <p className="editable-label text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{pagesContent.auth.signup.badge}</p>
              <h2 className="editable-display mt-5 max-w-4xl text-6xl font-medium leading-[0.9] sm:text-8xl lg:text-[8rem]">{pagesContent.auth.signup.title}</h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65">{pagesContent.auth.signup.description}</p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {points.map((point) => (
                <div key={point} className="rounded border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <p className="mt-3 text-sm font-medium text-white/75">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
