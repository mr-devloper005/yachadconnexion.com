import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Local Directory and Reference Library',
      description: 'Find local records, guides, reports, articles, profiles, and curated resources in one focused discovery platform.',
      openGraphTitle: 'Local Directory and Reference Library',
      openGraphDescription: 'Search local records and reference materials through a clear, modern discovery experience.',
      keywords: ['local directory', 'reference library', 'guides', 'reports', 'content discovery'],
    },
    hero: {
      badge: 'Curated Local Index',
      title: ['Find useful places,', 'guides, and reports.'],
      description: 'A sharper way to search nearby records, download reference material, and keep moving through trusted local information.',
      primaryCta: { label: 'Browse the directory', href: '/listing' },
      secondaryCta: { label: 'Open the library', href: '/pdf' },
      searchPlaceholder: 'Search places, guides, topics, and categories',
      focusLabel: 'Focus',
      featureCardBadge: 'Live index',
      featureCardTitle: 'Recent records shape the front-page discovery flow.',
      featureCardDescription: 'Fresh directory entries and reference materials stay visible without changing the platform behavior.',
    },
    intro: {
      badge: 'About the platform',
      title: 'Built for local discovery and reference work in the same place.',
      paragraphs: [
        'Visitors can move from a local record to a guide, from a saved resource to an article, and from search to action without losing context.',
        'The platform keeps practical details, downloadable references, profiles, and supporting posts connected through one consistent browsing system.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'Local records with location and contact cues.',
        'Reference materials with clear metadata and download actions.',
        'Search across every active section.',
        'Simple submission flow for authenticated members.',
      ],
      primaryLink: { label: 'Browse the directory', href: '/listing' },
      secondaryLink: { label: 'Open the library', href: '/pdf' },
    },
    cta: {
      badge: 'Start contributing',
      title: 'Add something useful to the index.',
      description: 'Submit a local record, share a guide, or send a resource that helps visitors make better decisions.',
      primaryCta: { label: 'Submit', href: '/create' },
      secondaryCta: { label: 'Contact', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest entries in this section.',
    },
  },
  about: {
    badge: 'About',
    title: 'A simple place to explore what matters.',
    description: `${slot4BrandConfig.siteName} is designed to make browsing, reading, saving, and returning to useful information feel calm and straightforward.`,
    paragraphs: [
      'The experience is intentionally direct: clear pages, readable summaries, simple actions, and enough structure to help people find their next step without friction.',
      'Every screen is built around focus. Visitors can search, browse, submit, and contact the team through a consistent interface that stays out of the way.',
    ],
    values: [
      {
        title: 'Clear structure',
        description: 'Pages are organized with plain language, strong hierarchy, and predictable actions.',
      },
      {
        title: 'Useful context',
        description: 'Important details stay visible so visitors can understand what they are looking at quickly.',
      },
      {
        title: 'Quiet confidence',
        description: 'The interface uses restrained styling and consistent patterns to keep attention on the content.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Send a note and we will take it from there.',
    description: 'Use this page for questions, updates, requests, feedback, or anything that needs a thoughtful response.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search across the site by keyword, topic, category, or title.',
    },
    hero: {
      badge: 'Search',
      title: 'Find what you need without the noise.',
      description: 'Use a keyword, category, or content type to narrow the page quickly.',
      placeholder: 'Search by keyword, topic, category, or title',
    },
    resultsTitle: 'Latest results',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Create and submit new content for the site.',
    },
    locked: {
      badge: 'Welcome back',
      title: 'Sign in to submit new content.',
      description: 'Use your account to open the publishing workspace and prepare entries for the active sections of this site.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Submit useful local and reference content.',
      description: 'Choose the content type, add details, and prepare a clean entry with links, images, summary, and body content.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Submit entry',
    successTitle: 'Entry submitted successfully.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign-in page for this site.',
      badge: 'Welcome back',
      title: 'Step back into your space.',
      description: 'Sign in to continue where you left off and keep your activity connected.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create an account first, then sign in.',
      success: 'Sign in successful. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Signup page for this site.',
      badge: 'Join in',
      title: 'Create an account in a minute.',
      description: 'Set up access so you can return, submit, and continue using the site with less friction.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created successfully. Redirecting...',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related articles',
      fallbackTitle: 'Article details',
    },
    listing: {
      relatedTitle: 'More directory',
      fallbackTitle: 'Directory details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'Suggested articles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
