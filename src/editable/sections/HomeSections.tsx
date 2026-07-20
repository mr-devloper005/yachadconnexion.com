import Link from 'next/link'
import { ArrowRight, CheckCircle2, Search, Tag } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditableExcerpt, getEditablePostImage, postHref } from '@/editable/cards/PostCards'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = dc.shell.section

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

const categorySlug = (value: string) => {
  const normalized = value.trim().toLowerCase()
  const known = CATEGORY_OPTIONS.find((item) => item.slug === normalized || item.name.toLowerCase() === normalized)
  return known?.slug || normalized.replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const categoryLabel = (value: string) => {
  const slug = categorySlug(value)
  const known = CATEGORY_OPTIONS.find((item) => item.slug === slug)
  return known?.name || value.trim().replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function homeCategories(posts: SitePost[]) {
  const counts = new Map<string, { label: string; count: number }>()
  for (const post of posts) {
    const raw = categoryOf(post)
    if (!raw) continue
    const slug = categorySlug(raw)
    if (!slug) continue
    const current = counts.get(slug)
    counts.set(slug, { label: current?.label || categoryLabel(raw), count: (current?.count || 0) + 1 })
  }
  const discovered = Array.from(counts.entries())
    .map(([slug, item]) => ({ slug, ...item }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))

  if (discovered.length >= 6) return discovered.slice(0, 12)
  const fallback = CATEGORY_OPTIONS.filter((item) => !counts.has(item.slug)).slice(0, 12 - discovered.length)
    .map((item) => ({ slug: item.slug, label: item.name, count: 0 }))
  return [...discovered, ...fallback]
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Explore ${SITE_CONFIG.name}`
  const featured = pool.slice(0, 5)

  return (
    <section className="relative overflow-hidden bg-[var(--slot4-dark-bg)] text-white">
      <div className={`${container} py-20 sm:py-24 lg:py-28 xl:py-[8.75rem]`}>
        <EditableReveal className="mx-auto max-w-6xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
            <span className="editable-label text-xs font-medium uppercase tracking-[0.16em] text-white/75">{pagesContent.home.hero.badge}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
          </div>
          <h1 className={`${dc.type.heroTitle} mx-auto mt-6 max-w-[12ch]`}>{heroTitle}</h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl">{pagesContent.home.hero.description}</p>
          <form action="/search" className="mx-auto mt-9 flex max-w-3xl flex-col gap-3 rounded-md border border-white/10 bg-white p-2 text-[var(--slot4-page-text)] sm:flex-row">
            <label className="flex min-h-12 flex-1 items-center gap-3 px-4">
              <Search className="h-5 w-5 text-[var(--slot4-accent)]" />
              <input name="q" placeholder={pagesContent.home.hero.searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]" />
            </label>
            <button className="rounded bg-[var(--slot4-accent)] px-7 py-3 text-sm font-semibold text-white transition hover:-translate-y-1">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/listing" className={dc.button.primary}>Browse directory <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/pdf" className="inline-flex items-center justify-center gap-2 rounded border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10">Open library <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </EditableReveal>
      </div>
      {featured.length ? (
        <div className="overflow-hidden border-y border-white/10 py-5">
          <div className="editable-hero-marquee flex gap-5">
            {[...featured, ...featured].map((post, index) => (
              <Link key={`${post.id || post.slug}-${index}`} href={postHref(primaryTask, post, primaryRoute)} className="group w-[420px] shrink-0 overflow-hidden rounded-md border border-white/10 bg-white/5">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={getEditablePostImage(post)} alt="" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.04]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export function EditableStoryRail({ primaryRoute, posts, timeSections }: HomeSectionProps) {
  const categories = homeCategories(dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]))
  if (!categories.length) return null
  return (
    <section className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} ${dc.shell.sectionY}` }>
        <EditableReveal className="mx-auto max-w-4xl text-center">
          <p className={dc.type.eyebrow}>I. Browse by category</p>
          <h2 className={`${dc.type.sectionTitle} mt-4`}>Start with the topic you need.</h2>
        </EditableReveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <EditableReveal key={category.slug} index={index}>
              <Link href={`${primaryRoute}?category=${encodeURIComponent(category.slug)}`} className={`group flex min-h-44 flex-col justify-between ${dc.surface.card} p-5 ${dc.motion.lift}`}>
                <span className="flex items-center justify-between gap-3">
                  <Tag className="h-5 w-5 text-[var(--slot4-accent)]" />
                  <span className="editable-label text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)]">
                    {category.count ? `${category.count} ${category.count === 1 ? 'entry' : 'entries'}` : 'Explore'}
                  </span>
                </span>
                <span className="editable-display text-3xl font-medium leading-none text-[var(--slot4-page-text)]">{category.label}</span>
              </Link>
            </EditableReveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href={primaryRoute} className={dc.button.secondary}>View all categories <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  )
}

function PreviewCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <EditableReveal index={index}>
      <Link href={href} className={`group block overflow-hidden ${dc.surface.card} ${dc.motion.lift}`}>
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={getEditablePostImage(post)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
          <span className="editable-label absolute bottom-4 left-4 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--slot4-page-text)]">{categoryOf(post) || 'Entry'}</span>
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-3xl font-medium leading-[0.96]">{post.title}</h3>
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-[var(--slot4-muted-text)]">{getEditableExcerpt(post, 130)}</p>
        </div>
      </Link>
    </EditableReveal>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const activity = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)]).slice(0, 9)
  if (!activity.length) return null
  return (
    <section className="bg-[var(--slot4-warm)]">
      <div className={`${container} ${dc.shell.sectionY}`}>
        <EditableReveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={dc.type.eyebrow}>II. Featured previews</p>
            <h2 className={`${dc.type.sectionTitle} mt-4 max-w-3xl`}>Fresh records and resources, arranged like a gallery.</h2>
          </div>
          <Link href={primaryRoute} className={dc.button.secondary}>See all <ArrowRight className="h-4 w-4" /></Link>
        </EditableReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activity.map((post, index) => <PreviewCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />)}
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'III. Fresh this week', title: 'Newly added to the platform.' },
  browse: { eyebrow: 'IV. Popular this month', title: 'Entries getting more attention.' },
  index: { eyebrow: 'V. From the archive', title: 'Useful finds worth another look.' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length).slice(0, 3)
  if (!visible.length) return null

  return (
    <>
      <section className="bg-[var(--slot4-dark-bg)] text-white">
        <div className={`${container} py-16 sm:py-20 lg:py-24`}>
          <EditableReveal className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--slot4-accent)]">Responsive index</p>
              <h2 className="editable-display mt-4 text-5xl font-medium leading-[0.95] sm:text-6xl">Useful on a desk, quick on a phone.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Active sections', SITE_CONFIG.tasks.filter((task) => task.enabled).length],
                ['Featured entries', posts.length],
                ['Browse modes', visible.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-white/10 bg-white/[0.04] p-6">
                  <p className="editable-display text-5xl font-medium">{value}</p>
                  <p className="editable-label mt-3 text-xs uppercase tracking-[0.16em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </EditableReveal>
        </div>
      </section>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore.' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-warm)]'}>
            <div className={`${container} py-16 sm:py-20`}>
              <EditableReveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className={dc.type.eyebrow}>{copy.eyebrow}</p>
                  <h2 className="editable-display mt-3 max-w-3xl text-4xl font-medium leading-[0.98] sm:text-5xl">{copy.title}</h2>
                </div>
                <Link href={section.href || primaryRoute} className={dc.button.secondary}>See all <ArrowRight className="h-4 w-4" /></Link>
              </EditableReveal>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {section.posts.slice(0, 8).map((post, postIndex) => (
                  <PreviewCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={postIndex} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="bg-[var(--slot4-page-bg)]">
      <div className={`${container} pb-16 sm:pb-20 lg:pb-24`}>
        <EditableReveal className="rounded-md border border-[var(--editable-border)] bg-white p-8 text-center sm:p-12 lg:p-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <p className={`${dc.type.eyebrow} mt-6`}>{pagesContent.home.cta.badge}</p>
          <h2 className="editable-display mx-auto mt-4 max-w-3xl text-5xl font-medium leading-[0.95] sm:text-6xl">{pagesContent.home.cta.title}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.home.cta.description}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/create" className={dc.button.primary}>Submit <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/contact" className={dc.button.secondary}>Contact <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
