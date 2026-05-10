# Design System


## Visual Identity

Arachchi is luxury-minimal with a soft, warm undertone. Light, pinkish-cream base with deep contrast accents. Editorial typography, generous whitespace, intentional animations.

## Color Tokens

Define these as CSS custom properties in `globals.css`. All Tailwind classes reference them so a future second brand only swaps tokens.

```css
:root {
  --background: 24 35% 97%;          /* soft cream-pink */
  --foreground: 20 14% 12%;          /* near-black, warm */
  --primary: 20 14% 12%;             /* deep ink */
  --primary-foreground: 24 35% 97%;
  --accent: 350 35% 75%;             /* dusty pink accent */
  --muted: 24 20% 92%;
  --muted-foreground: 20 10% 40%;
  --border: 20 10% 88%;
  --ring: 350 35% 60%;
  --destructive: 0 70% 45%;
  --radius: 0;                       /* sharp corners for luxury feel */
}
```

## Typography

- Headings: a refined serif. Recommend `Cormorant Garamond` or `Fraunces` from Google Fonts. Final font to be confirmed from logo file.
- Body: a clean sans-serif. Recommend `Inter` or `Geist`.
- Logo wordmark: matches the uploaded logo (font to identify on next upload).
- Load via `next/font` with `display: swap` and only the weights actually used (typically 400 and 600 for sans, 400 and 500 for serif).

## Spacing and Layout

- 12-column grid, max content width 1440px, gutters 24px desktop / 16px mobile.
- Generous whitespace. Sections vertical padding minimum 96px desktop / 64px mobile.
- Sharp corners (`border-radius: 0`) on cards and buttons for the luxury feel.

## Animation Language

Define these constants and use them everywhere. Do not invent new timings ad hoc.

```ts
export const ease = {
  smooth: [0.4, 0, 0.2, 1],
  refined: [0.16, 1, 0.3, 1],
  emphasis: [0.6, 0.05, 0.1, 0.95],
};

export const duration = {
  micro: 0.2,
  short: 0.4,
  medium: 0.7,
  long: 1.2,
};
```

Where animations belong:
- Hero reveal on home page
- Page transitions (fade + subtle vertical shift, 0.4s)
- Product card hover (image swap, 0.3s)
- Scroll-triggered reveals on editorial sections
- Cart drawer slide-in
- Loading screen (described below)

Where animations do NOT belong:
- Forms, checkout fields, admin pages
- Anything that delays user interaction
- Anything that violates `prefers-reduced-motion`

Every animation must respect `prefers-reduced-motion` and degrade to instant.

## Loading Screen Specification

Shown once per session on the homepage only. Cookie/sessionStorage flag prevents repeats. Internal navigation never triggers it.

Sequence (total ~1.8s):
1. Soft pinkish-cream background fades in (0 to 100% opacity, 300ms)
2. "Arachchi" wordmark fades in with subtle blur-to-sharp transition (400ms blur 8px to 0px, opacity 0 to 1, slight scale 0.98 to 1)
3. Hold (400ms)
4. Wordmark fades out and lifts slightly (translateY -8px, opacity 1 to 0, 500ms)
5. Background fades to transparent revealing the homepage (500ms, slightly overlapping with step 4)

Implementation:
- Pure Framer Motion, no canvas, no GSAP, no WebGL
- Background-load homepage assets in parallel using Next.js `prefetch` so when the splash ends everything is ready
- `prefers-reduced-motion: reduce` skips the animation entirely

---

