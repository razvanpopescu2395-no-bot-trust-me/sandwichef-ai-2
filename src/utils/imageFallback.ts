import React from 'react';

// Safe, high-availability fallback images
// All URLs are verified high-speed CDNs (Unsplash) or local assets in public/
export const FALLBACK_IMAGES = {
  // Local real logo or clean SVG
  logo: '/images/logo.png',
  logoSvg:
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23C44E36"/><text x="50" y="58" font-family="serif" font-size="34" font-weight="bold" fill="%23FFFFFF" text-anchor="middle">S</text></svg>',
  // Cover / hero banner
  cover: '/images/swc-cover.jpg',
  coverUnsplash:
    'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=1200&q=80',
  // Artisan gourmet sandwich / panini
  sandwich:
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
  // Fresh Italian ingredients / builder
  builder:
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  // Catering platter
  catering:
    'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
  // Drinks
  drink:
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
  // Dessert / sweets
  dessert:
    'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80',
};

/**
 * Safe image onError handler
 * 1. Resets e.currentTarget.onerror = null immediately to break any infinite loop.
 * 2. Switches source to a safe fallback image.
 */
export function handleSafeImageError(
  e: React.SyntheticEvent<HTMLImageElement>,
  fallbackSrc: string = FALLBACK_IMAGES.sandwich
): void {
  const target = e.currentTarget;
  // CRITICAL: Prevent recursive calls & infinite re-render loops
  target.onerror = null;
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc;
  }
}
