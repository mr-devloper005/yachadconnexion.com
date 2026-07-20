// ✏️ EDITABLE — theme the ads to match this site. Devs own this file.
// You control the LOOK here (radius, border, shadow, background, label color).
// You CANNOT change the ad's shape/fit from here — that stays locked in
// src/lib/ad-slots.ts, so the ad always displays correctly no matter what.

import type { AdSkin } from '@/lib/ads/ad-frame'

// Site-wide default skin — tune to your brand.
export const adSkin: AdSkin = {
  radius: '6px',
  border: '1px solid #e6e6e6',
  shadow: '0 1px 0 rgba(17,17,17,0.10)',
  background: '#ffffff',
  labelClassName: 'bg-[#e05a4a] text-white',
}

// Optional per-slot overrides — adjust only where you need to.
export const adSkinBySlot: Partial<Record<string, AdSkin>> = {
  sidebar: { radius: '6px', shadow: 'none', border: '1px solid #e6e6e6' },
  popup: { radius: '8px' },
  header: { radius: '6px', background: '#fafafa' },
  rail: { radius: '6px' },
  feature: { radius: '6px' },
  interstitial: { radius: '6px', shadow: '0 20px 60px rgba(0,0,0,0.5)' },
  anchor: { radius: '6px', shadow: '0 6px 24px rgba(0,0,0,0.18)' },
}

/** Merge site default + per-slot override for a slot. */
export function skinFor(slot: string): AdSkin {
  return { ...adSkin, ...(adSkinBySlot[slot] ?? {}) }
}
// junior tweak


