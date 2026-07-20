'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

const staticLinks = [
  
  { label: 'About', href: '/about' },
  { label: 'Directories', href: '/listings' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)]">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-5 px-5 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded border border-white/15 bg-white text-[var(--slot4-page-text)] transition group-hover:border-[var(--slot4-accent)]">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-7 w-7 object-contain" />
          </span>
          <span className="editable-display block max-w-[230px] truncate text-2xl font-medium leading-none">{SITE_CONFIG.name}</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {staticLinks.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`editable-label rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition ${
                  active ? 'bg-white text-[var(--slot4-page-text)]' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link href="/search" aria-label="Search" className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/15 transition hover:border-[var(--slot4-accent)] hover:bg-white/10">
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <>
              <Link href="/create" className="hidden items-center gap-2 rounded bg-[var(--editable-cta-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--editable-cta-text)] transition hover:-translate-y-1 sm:inline-flex">
                <PlusCircle className="h-4 w-4" /> Submit
              </Link>
              <button type="button" onClick={logout} className="hidden rounded border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-flex">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden items-center gap-2 rounded border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-flex">
                <LogIn className="h-4 w-4" /> Sign in
              </Link>
              <Link href="/signup" className="hidden items-center gap-2 rounded bg-[var(--editable-cta-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--editable-cta-text)] transition hover:-translate-y-1 sm:inline-flex">
                <UserPlus className="h-4 w-4" /> Get started
              </Link>
            </>
          )}
          <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex h-10 w-10 items-center justify-center rounded border border-white/15 lg:hidden" aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-[var(--editable-nav-bg)] px-5 py-5 lg:hidden">
          <div className="grid gap-2">
            {[...staticLinks, ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }])].map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`editable-label rounded px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] ${
                    active ? 'bg-white text-[var(--slot4-page-text)]' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? <button type="button" onClick={logout} className="editable-label rounded px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.16em] text-white/70 hover:bg-white/10 hover:text-white">Logout</button> : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
