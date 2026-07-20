'use client'

import Link from 'next/link'
import { ArrowUpRight, Send } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const labelFor = (key: string, label: string) => key === 'listing' ? 'Local Directory' : key === 'pdf' ? 'Reference Library' : label

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Stay connected</p>
            <h2 className="editable-display mt-4 max-w-4xl text-5xl font-medium leading-[0.95] sm:text-6xl lg:text-[4.375rem]">Keep your local research and reference work moving.</h2>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/create" className="inline-flex items-center gap-2 rounded bg-[var(--slot4-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1">
              Submit <Send className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10">
              Contact <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded bg-white">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-7 w-7 object-contain" />
              </span>
              <span className="editable-display text-2xl font-medium">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/65">{globalContent.footer?.description || SITE_CONFIG.description}</p>
            
          </div>

          <FooterColumn title="Discovery" links={taskLinks.map((task) => ({ label: labelFor(task.key, task.label), href: task.route }))} />
          <FooterColumn title="Resources" links={[{ label: 'Search', href: '/search' }, { label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }]} />
          <div>
            <h3 className="editable-label text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Account</h3>
            <div className="mt-5 grid gap-3">
              {(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }]).map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
                  {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ))}
              {session ? <button type="button" onClick={logout} className="text-left text-sm text-white/70 transition hover:text-white">Logout</button> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p>{globalContent.footer?.bottomNote}</p>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: Array<{ label: string; href: string }> }) {
  return (
    <div>
      <h3 className="editable-label text-xs font-semibold uppercase tracking-[0.18em] text-white/45">{title}</h3>
      <div className="mt-5 grid gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white">
            {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ))}
      </div>
    </div>
  )
}
