import { ArrowUpRight, CheckCircle2, Layers3, Sparkles } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

const stats = ['Clear pages', 'Simple actions', 'Focused browsing']

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <p className="editable-label text-xs font-semibold uppercase tracking-[0.18em] text-[var(--slot4-accent)]">{pagesContent.about.badge}</p>
              <h1 className="editable-display mt-5 max-w-5xl text-6xl font-medium leading-[0.9] sm:text-8xl lg:text-[8.5rem]">About {SITE_CONFIG.name}</h1>
            </div>
            <div className="rounded-md border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8">
              <p className="text-xl leading-9 text-[var(--slot4-page-text)]">{pagesContent.about.description}</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item} className="rounded border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-4">
                    <CheckCircle2 className="h-5 w-5 text-[var(--slot4-accent)]" />
                    <p className="mt-3 text-sm font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[0.65fr_0.35fr]">
            <article className="rounded-md border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-7 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                <Layers3 className="h-6 w-6" />
              </div>
              <h2 className="editable-display mt-8 max-w-3xl text-5xl font-medium leading-[0.95] sm:text-6xl">{pagesContent.about.title}</h2>
              <div className="mt-8 grid gap-5 text-base leading-8 text-[var(--slot4-muted-text)] md:grid-cols-2">
                {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </article>

            <aside className="grid gap-5">
              {pagesContent.about.values.map((value, index) => (
                <div key={value.title} className="rounded-md border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="editable-label text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">0{index + 1}</span>
                    <Sparkles className="h-5 w-5 text-[var(--slot4-accent)]" />
                  </div>
                  <h3 className="editable-display mt-5 text-3xl font-medium leading-none">{value.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
                </div>
              ))}
            </aside>
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-md border border-[var(--editable-border)] bg-[var(--slot4-dark-bg)] p-6 text-white sm:flex-row sm:items-center sm:justify-between">
            <p className="editable-display text-3xl font-medium">Need a hand finding your way around?</p>
            <a href="/contact" className="inline-flex items-center justify-center gap-2 rounded bg-[var(--slot4-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-1">
              Contact us <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
