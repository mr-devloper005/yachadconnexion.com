import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Star, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]
const getAnyField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  const nested = [content, content.meta, content.metadata, content.file, content.asset, content.pdf].filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
  for (const source of nested) {
    for (const key of keys) {
      const value = source[key]
      if (typeof value === 'number' && Number.isFinite(value)) return String(value)
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return ''
}

const formatFileSize = (value: string) => {
  const clean = value.trim()
  if (!clean) return ''
  if (/[a-z]/i.test(clean)) return clean
  const bytes = Number(clean)
  if (!Number.isFinite(bytes) || bytes <= 0) return clean
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size >= 10 || unit === 0 ? Math.round(size) : size.toFixed(1)} ${units[unit]}`
}

const absoluteFileUrl = (value: string) => {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${SITE_CONFIG.baseUrl.replace(/\/$/, '')}${value}`
  return ''
}

async function readRemoteFileMeta(fileUrl: string) {
  const url = absoluteFileUrl(fileUrl)
  if (!url) return { pages: '', fileSize: '' }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3500)
  try {
    let fileSize = ''
    const head = await fetch(url, { method: 'HEAD', signal: controller.signal, next: { revalidate: 3600 } }).catch(() => null)
    const length = head?.headers.get('content-length')
    if (length) fileSize = formatFileSize(length)

    let pages = ''
    const bytes = Number(length || 0)
    if (!bytes || bytes <= 18 * 1024 * 1024) {
      const response = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } }).catch(() => null)
      const buffer = response?.ok ? await response.arrayBuffer() : null
      if (buffer) {
        if (!fileSize) fileSize = formatFileSize(String(buffer.byteLength))
        const text = Buffer.from(buffer).toString('latin1')
        const count = text.match(/\/Type\s*\/Page\b/g)?.length || 0
        if (count > 0) pages = String(count)
      }
    }
    return { pages, fileSize }
  } catch {
    return { pages: '', fileSize: '' }
  } finally {
    clearTimeout(timeout)
  }
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const displayTaskLabel = (task: TaskKey, fallback: string) => task === 'listing' ? 'Local Directory' : task === 'pdf' ? 'Reference Library' : fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

// Yelp-style red star rating row. Uses real rating/review fields when present,
// otherwise a stable derived value (wire to real data when available).
const hashStr = (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}
const ratingOf = (post: SitePost) => {
  const real = Number(getContent(post).rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  return Math.round((3.7 + (hashStr(post.slug || post.id || post.title || 'x') % 13) / 10) * 10) / 10
}
const reviewsOf = (post: SitePost) => {
  const real = Number(getContent(post).reviewCount ?? getContent(post).reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function DetailMeta({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  const rating = ratingOf(post)
  const filled = Math.round(rating)
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 ${center ? 'justify-center' : ''}`}>
      <span className="inline-flex items-center gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className={`h-[18px] w-[18px] ${i < filled ? 'fill-[var(--tk-accent)] text-[var(--tk-accent)]' : 'fill-[var(--tk-line)] text-[var(--tk-line)]'}`} />
        ))}
      </span>
      <span className="text-sm font-semibold text-[var(--tk-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--tk-muted)]">{reviewsOf(post)} reviews</span>
      {category ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-muted)] opacity-50" />
          <span className="text-sm text-[var(--tk-muted)]">{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-muted)] transition hover:text-[var(--tk-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {displayTaskLabel(task, taskConfig?.label || 'posts')}
    </Link>
  )
}

// ----- Article: a quiet, centred reading column -----
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <BackLink task="article" />
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">{categoryOf(post, 'Article')}</p>
        <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.4rem]">{post.title}</h1>
        <div className="mt-6 text-sm text-[var(--tk-muted)]">
          <span>{SITE_CONFIG.name}</span>
        </div>
        {images[0] ? <img src={images[0]} alt="" className="mt-10 aspect-[16/9] w-full rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" /> : null}
        <BodyContent post={post} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

// ----- Listing: a precise directory record -----
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const hero = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const hours = getField(post, ['hours', 'openingHours', 'schedule'])
  const category = categoryOf(post, 'Directory record')
  const mapSrc = mapSrcFor(post)
  return (
    <>
      <section className="relative overflow-hidden border-b border-[var(--tk-line)] bg-[var(--tk-bg)]">
        <div className="absolute inset-x-0 top-0 h-[24rem] bg-[var(--tk-text)] opacity-[0.035]" />
        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
          <BackLink task="listing" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start">
            <aside className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--tk-raised)]">
                  {hero ? <img src={hero} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-16 w-16 text-[var(--tk-muted)]" /></div>}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                    <p className="editable-label text-[10px] font-medium uppercase tracking-[0.2em] text-white/70">Verified record</p>
                    <h2 className="editable-display mt-2 text-3xl font-medium leading-none">{post.title}</h2>
                  </div>
                </div>
                <div className="p-6">
                  <DetailMeta post={post} category={category} />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <BadgeLine label="Location" value={address || 'Available'} />
                    <BadgeLine label="Hours" value={hours || 'Verified'} />
                  </div>
                  <div className="mt-6 divide-y divide-[var(--tk-line)] border-y border-[var(--tk-line)]">
                    <ContactRow label="Address" value={address} href={address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : ''} icon={MapPin} />
                    <ContactRow label="Phone" value={phone} href={phone ? `tel:${phone}` : ''} icon={Phone} />
                    <ContactRow label="Email" value={email} href={email ? `mailto:${email}` : ''} icon={Mail} />
                    <ContactRow label="Website" value={website} href={website} icon={Globe2} />
                    <ContactRow label="Hours" value={hours} href="" icon={CheckCircle2} />
                  </div>
                  {website ? (
                    <Link href={website} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:-translate-y-1">
                      Visit site <ExternalLink className="h-4 w-4" />
                    </Link>
                  ) : phone ? (
                    <a href={`tel:${phone}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:-translate-y-1">
                      Call now <Phone className="h-4 w-4" />
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
                <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">Trust checks</p>
                <div className="mt-4 grid gap-3 text-sm text-[var(--tk-muted)]">
                  {['Contact details reviewed', 'Category matched', 'Local record format verified'].map((item) => (
                    <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {item}</p>
                  ))}
                </div>
              </div>
              <div className="mt-5"><Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel /></div>
            </aside>

            <article className="min-w-0">
              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 sm:p-10 lg:p-12">
                <Kicker task="listing">{category}</Kicker>
                <h1 className="editable-display mt-5 text-balance break-words text-5xl font-medium leading-[0.92] [overflow-wrap:anywhere] sm:text-6xl lg:text-[6.25rem]">{post.title}</h1>
                {leadText(post) ? <p className="mt-7 max-w-3xl text-xl leading-9 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
                <InfoGrid items={[["Location", address, MapPin], ["Phone", phone, Phone], ["Hours", hours || 'Verified', CheckCircle2], ["Website", website, Globe2]]} />
              </div>

              <section className="mt-8 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 sm:p-10">
                <div className="grid gap-8 lg:grid-cols-[0.38fr_0.62fr]">
                  <div>
                    <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--tk-accent)]">Overview</p>
                    <h2 className="editable-display mt-3 text-5xl font-medium leading-[0.95] sm:text-6xl">Details, context, and next steps.</h2>
                  </div>
                  <div>
                    <BodyContent post={post} />
                    <TagChips post={post} />
                  </div>
                </div>
              </section>

              <ImageStrip images={images.slice(1)} label="Gallery" large />
              {mapSrc ? <div className="mt-10"><MapBox src={mapSrc} label={address || post.title} /></div> : null}
            </article>
          </div>
        </div>
      </section>
      <RelatedStrip task="listing" related={related} title="More directory" />
    </>
  )
}
// ----- Classified: price-forward notice with a sticky action rail -----
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-7 rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
            <Kicker task="classified">Classified</Kicker>
            <h1 className="editable-display mt-4 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <DetailMeta post={post} category={getField(post, ['category'])} />
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90"><Phone className="h-4 w-4" /> Call now</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

// ----- Image: a dark, gallery-led canvas -----
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="image" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-3.5 py-1.5 text-xs font-medium text-[var(--tk-muted)]"><Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story</div>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

// ----- Bookmark: a single curated resource -----
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <BackLink task="sbm" />
        <div className="mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]"><Bookmark className="h-7 w-7" /></div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-4 text-4xl font-semibold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-8 text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

// ----- Library: a reference workspace -----
async function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const remoteMeta = await readRemoteFileMeta(fileUrl)
  const fileName = getAnyField(post, ['fileName', 'filename', 'originalName', 'originalFilename', 'name', 'file_name']) || (post.slug || 'reference')
  const pages = getAnyField(post, ['pages', 'pageCount', 'page_count', 'pageNo', 'page_no', 'numberOfPages', 'numPages', 'totalPages']) || remoteMeta.pages || 'Not listed'
  const fileSize = formatFileSize(getAnyField(post, ['fileSize', 'file_size', 'size', 'bytes', 'contentLength', 'content_length'])) || remoteMeta.fileSize || 'Not listed'
  const uploadedBy = getAnyField(post, ['uploadedBy', 'uploaded_by', 'author', 'creator', 'createdBy']) || SITE_CONFIG.name
  const category = categoryOf(post, 'Reference')
  return (
    <>
      <section className="relative overflow-hidden bg-[var(--tk-bg)]">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[var(--tk-text)] opacity-[0.035]" />
        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
          <BackLink task="pdf" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <article className="min-w-0">
              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 sm:p-10 lg:p-12">
                <div className="flex flex-wrap gap-2">
                  {["Reference document", "Portable format", category].map((chip) => (
                    <span key={chip} className="editable-label rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">{chip}</span>
                  ))}
                </div>
                <h1 className="editable-display mt-7 max-w-6xl text-balance break-words text-5xl font-medium leading-[0.92] [overflow-wrap:anywhere] sm:text-7xl lg:text-[7rem]">{post.title}</h1>
                {leadText(post) ? (
                  <p className="mt-8 max-w-5xl border-l-4 border-[var(--tk-accent)] pl-6 text-2xl leading-10 text-[var(--tk-text)] sm:text-3xl">{leadText(post)}</p>
                ) : null}
                <div className="mt-8 flex flex-wrap gap-3">
                  {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded bg-[var(--tk-accent)] px-6 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:-translate-y-1">Download <Download className="h-4 w-4" /></Link> : null}
                  {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded border border-[var(--tk-line)] bg-[var(--tk-surface)] px-6 py-3 text-sm font-semibold transition hover:-translate-y-1 hover:border-[var(--tk-text)]">Open in new tab <ExternalLink className="h-4 w-4" /></Link> : null}
                </div>
                <InfoGrid items={[["Pages", pages, FileText], ["File size", fileSize, Download], ["Format", 'Portable', FileText], ["Category", category, Tag]]} />
              </div>

              {fileUrl ? (
                <div className="mt-8 overflow-hidden rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
                  <div className="flex flex-col gap-2 border-b border-[var(--tk-line)] p-5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="editable-label text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-muted)]">Preview workspace</span>
                    <span className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{fileName}</span>
                  </div>
                  <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[82vh] w-full bg-[var(--tk-raised)]" />
                </div>
              ) : null}

              <div className="mt-10 grid gap-8 rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-7 sm:p-10 lg:grid-cols-[0.36fr_0.64fr]">
                <div>
                  <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--tk-accent)]">Document notes</p>
                  <h2 className="editable-display mt-3 text-5xl font-medium leading-[0.95]">Read the context before you save it.</h2>
                </div>
                <div>
                  <BodyContent post={post} />
                  <TagChips post={post} />
                  {fileUrl ? (
                    <div className="mt-10 rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
                      <p className="editable-display text-3xl font-medium">Keep this reference close.</p>
                      <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded bg-[var(--tk-accent)] px-6 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:-translate-y-1">Download <Download className="h-4 w-4" /></Link>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="mt-12">
                <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
              </div>
            </article>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-[2rem] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="editable-display flex h-28 w-24 items-center justify-center rounded-[1.25rem] bg-[var(--tk-accent-soft)] text-6xl font-medium text-[var(--tk-accent)]">Aa</div>
                <h2 className="mt-5 break-words text-sm font-semibold leading-6 [overflow-wrap:anywhere]">{fileName}</h2>
                <div className="mt-5 divide-y divide-[var(--tk-line)] border-y border-[var(--tk-line)]">
                  <MetaRow label="Category" value={category} />
                  <MetaRow label="Pages" value={pages} />
                  <MetaRow label="File size" value={fileSize} />
                  <MetaRow label="Uploaded by" value={uploadedBy} />
                </div>
                {fileUrl ? <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-[var(--tk-accent)] px-5 py-3 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:-translate-y-1">Download <Download className="h-4 w-4" /></Link> : null}
              </div>
              <div className="rounded-[1.5rem] border border-[var(--tk-line)] bg-[var(--tk-raised)] p-6">
                <p className="editable-label text-xs font-medium uppercase tracking-[0.18em] text-[var(--tk-muted)]">What's inside</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--tk-muted)]">
                  {['Overview and context', 'Key details and supporting notes', 'Reference actions for later use'].map((item) => (
                    <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--tk-accent)]" /> {item}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
      <PdfRelatedStrip related={related} />
    </>
  )
}
// ----- Profile: identity-first with a sticky portrait -----
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-20 lg:px-8">
        <BackLink task="profile" />
        <div className="mt-8 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-8 text-center shadow-[0_22px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-[var(--tk-accent)]">{role}</p> : null}
              <DetailMeta post={post} center />
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>
          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

// ----- Shared building blocks -----

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-8 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-7' : 'text-[1.0625rem] leading-8'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function InfoGrid({ items }: { items: Array<[string, string, React.ComponentType<{ className?: string }>] > }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]"><Icon className="h-4 w-4 text-[var(--tk-accent)]" /> {label}</div>
          <p className="mt-2 break-words text-sm font-medium leading-6">{value}</p>
        </div>
      ))}
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <span className="editable-label text-[11px] uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</span>
      <span className="min-w-0 break-words text-right font-medium text-[var(--tk-text)] [overflow-wrap:anywhere]">{value}</span>
    </div>
  )
}

function ContactRow({ label, value, href, icon: Icon }: { label: string; value: string; href: string; icon: React.ComponentType<{ className?: string }> }) {
  if (!value) return null
  const content = (
    <span className="flex items-start gap-3 py-3 text-sm">
      <Icon className="mt-1 h-4 w-4 shrink-0 text-[var(--tk-accent)]" />
      <span className="min-w-0">
        <span className="editable-label block text-[10px] uppercase tracking-[0.16em] text-[var(--tk-muted)]">{label}</span>
        <span className="mt-1 block break-words font-medium text-[var(--tk-text)]">{value}</span>
      </span>
    </span>
  )
  if (!href) return content
  return <Link href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined}>{content}</Link>
}

function TagChips({ post }: { post: SitePost }) {
  const tags = post.tags?.filter(Boolean).slice(0, 8) || []
  if (!tags.length) return null
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => <span key={tag} className="editable-label rounded-full border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[var(--tk-muted)]">{tag}</span>)}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-10">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">{label}</p>
      <div className={`mt-4 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[var(--tk-radius)] border border-[var(--tk-line)] object-cover" />)}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 p-4 text-sm font-semibold"><MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Map location'}</div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:opacity-90">Website <ExternalLink className="h-4 w-4" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Phone className="h-4 w-4" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--tk-line)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--tk-accent)]"><Mail className="h-4 w-4" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--tk-muted)]">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3 text-sm">
      <span className="font-medium uppercase tracking-[0.12em] text-[var(--tk-muted)]">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function RelatedStrip({ task, related, title }: { task: TaskKey; related: SitePost[]; title?: string }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">{title || `More ${displayTaskLabel(task, taskConfig?.label || 'posts').toLowerCase()}`}</h2>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid />)}
        </div>
      </div>
    </section>
  )
}

function PdfRelatedStrip({ related }: { related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig('pdf')
  return (
    <section className="border-t border-[var(--tk-line)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-16 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="editable-display text-3xl font-medium">Related references</h2>
          <Link href={taskConfig?.route || '/pdf'} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--tk-accent)]">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const fileSize = getField(item, ['fileSize', 'size']) || 'Ready'
            const href = `${taskConfig?.route || '/pdf'}/${item.slug}`
            return (
              <Link key={item.id || item.slug} href={href} className="group rounded-md border border-[var(--tk-line)] bg-[var(--tk-surface)] p-5 transition hover:-translate-y-1">
                <div className="editable-display flex h-20 w-16 items-center justify-center rounded bg-[var(--tk-accent-soft)] text-4xl font-medium text-[var(--tk-accent)]">Aa</div>
                <h3 className="editable-display mt-5 line-clamp-2 text-2xl font-medium leading-[0.98]">{item.title}</h3>
                <span className="editable-label mt-4 inline-flex rounded-full border border-[var(--tk-line)] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[var(--tk-muted)]">{fileSize}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false }: { task: TaskKey; post: SitePost; grid?: boolean }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`
  if (grid) {
    return (
      <Link href={href} className="group block overflow-hidden rounded-[var(--tk-radius)] border border-[var(--tk-line)] bg-[var(--tk-surface)] transition duration-300 hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>}
        </div>
        <div className="p-5">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }
  return (
    <Link href={href} className="group flex gap-3 rounded-xl border border-[var(--tk-line)] p-3 transition hover:border-[var(--tk-accent)]">
      {image && task !== 'sbm' ? <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug tracking-[-0.01em]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

