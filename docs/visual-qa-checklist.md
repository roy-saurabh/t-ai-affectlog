# AffectLog Visual QA Checklist

Pre-launch visual quality review. Each item must pass before shipping the UI.

---

## 1. Typography Consistency

- [ ] Inter Variable is loaded and applied globally (`font-sans` on `html`)
- [ ] JetBrains Mono is used only for: API names, code snippets, schema names, metric tags, terminal output
- [ ] Hero headlines use `text-display-xl` or `text-h1` with negative tracking (`-0.03em` or tighter)
- [ ] Body text uses `text-body` (16px) or `text-body-lg` (18px) with `leading-relaxed`
- [ ] Small labels use `text-caption` (12px) or `text-small` (14px)
- [ ] No raw pixel font sizes (`style={{ fontSize: "37px" }}`) — use scale utilities or `clamp()`
- [ ] `stat-label` utility applied to uppercase tracking labels
- [ ] `metric-big` utility applied to large numeric values
- [ ] All gradient text uses `gradient-text-trust` or `gradient-text-cyan` classes

---

## 2. Spacing Consistency

- [ ] Marketing section padding: `py-24 md:py-28 lg:py-32` (112–128px)
- [ ] Container max-widths: `max-w-7xl` (wide), `max-w-4xl` (tight), `max-w-3xl` (editorial)
- [ ] Section padding is `section-py` not ad-hoc values
- [ ] 8px base grid respected (use Tailwind spacing scale, not arbitrary `px-[37px]`)
- [ ] Card padding: `p-5` (standard), `p-6` (glass), `p-8` (feature cards)
- [ ] No text block wider than `760px` (max-content) unless deliberate layout

---

## 3. Color Consistency

- [ ] Dark backgrounds: `#050814` (darkest), `#080D1F` (raised), `#0C1328` (elevated)
- [ ] No arbitrary hex colors that don't match the design token palette
- [ ] Accent colors used semantically:
  - Cyan `#22D3EE`: primary accent, data, xAPI
  - Violet `#8B5CF6`: model/explainability
  - Green `#10B981`: privacy, compliance, success
  - Blue `#2563EB`: primary buttons
  - Amber `#F59E0B`: warnings only
  - Red `#EF4444`: errors and risk only
- [ ] Border colors use `rgba(148,163,184,0.12–0.20)` not hardcoded `#374151`
- [ ] No generic purple, blue, or pink not in the token palette

---

## 4. Mobile Responsiveness

- [ ] Hero copy stacks above visual on `< lg` breakpoints
- [ ] Hero CTAs wrap to two rows on mobile (no overflow)
- [ ] All marketing sections have appropriate mobile padding (`py-16 md:py-24`)
- [ ] Card grids: 1 column on mobile, 2 on `sm`, 3–4 on `lg`+
- [ ] Footer: accordion on mobile, grid on `md`+
- [ ] Header: drawer navigation on `< lg`
- [ ] No horizontal scroll on any viewport (test with DevTools device emulation)
- [ ] CTA buttons: `full-width` or `flex-wrap` on mobile, not cut off
- [ ] Tables convert to stacked cards or scroll gracefully on mobile
- [ ] Diagrams and SVG visuals: `w-full` responsive, not fixed pixel widths

---

## 5. Header Behavior

- [ ] Header is `fixed` on all marketing pages
- [ ] Transparent over hero section (no background when `scrollY === 0`)
- [ ] Glass/blur surface after scroll (`bg-bg-950/92 backdrop-blur-xl`)
- [ ] Height: 72px desktop, 64px mobile
- [ ] Logo is visible in both transparent and scrolled states
- [ ] Mega menus open on hover/focus, close on mouse leave or Escape
- [ ] Mobile drawer opens from right, full-screen overlay
- [ ] Active page is visually highlighted in nav
- [ ] Skip-to-content link present and functional (keyboard accessibility)
- [ ] No layout shift when header transitions states

---

## 6. Footer Behavior

- [ ] CTA band renders above the main footer columns
- [ ] CTA band headline and buttons are legible and not cut off
- [ ] EU funding attribution is present
- [ ] All 6 footer columns render correctly on desktop
- [ ] Mobile accordion: columns are collapsed by default, expand on tap
- [ ] External links have `target="_blank" rel="noopener noreferrer"`
- [ ] External links have `ExternalLink` icon (11px, opacity 30%)
- [ ] Bottom bar license text is present
- [ ] "Raw datasets never committed" disclaimer is present

---

## 7. CTA Visibility and Quality

- [ ] Every marketing page has at least 3 CTAs: hero, mid-page, final band
- [ ] Hero CTA is a full `bg-gradient` button (not just a link)
- [ ] CTA labels are specific: "Run Guided Assessment" not "Get Started"
- [ ] Forbidden CTA labels: "Learn more", "Get started", "Click here", "Submit"
- [ ] Hover state: button lifts `-translate-y-0.5` and shadow intensifies
- [ ] Focus-visible ring on all interactive elements
- [ ] Loading state on form submit buttons (`<Loader2 animate-spin />`)
- [ ] CTABand component used for final section on every marketing page

---

## 8. Animation Restraint

- [ ] `prefers-reduced-motion` respected via CSS `@media (prefers-reduced-motion: reduce)`
- [ ] No bouncing or repeating decorative animations visible at rest
- [ ] Animated beams: `beamTravel` keyframe at `opacity: 0.4–0.9` (never fully opaque)
- [ ] Glow orbs: `opacity: 0.3–0.5` (subtle, not intrusive)
- [ ] Page scroll animations: `FadeUp` with `whileInView` and `viewport={{ once: true }}`
- [ ] Transition durations: `150–250ms` for micro-interactions, `400–600ms` for reveals
- [ ] No `infinite` animations that distract from reading content
- [ ] Grid backgrounds: opacity `0.025–0.04` (barely visible texture)
- [ ] No 3D CSS transforms or perspective effects

---

## 9. Accessibility

- [ ] All page landmarks: `<header>`, `<main id="main-content">`, `<footer>`, `<nav aria-label>`
- [ ] Heading hierarchy: one `<h1>` per page, logical `h2–h4` nesting
- [ ] All icons that are decorative: `aria-hidden="true"`
- [ ] All icons that convey meaning: `aria-label` on parent or adjacent text
- [ ] Color contrast: body text (#CBD5E1 on #080D1F) must pass WCAG AA (4.5:1 minimum)
- [ ] Focus rings visible on all interactive elements
- [ ] Form labels: every `<input>` has associated `<label htmlFor>`
- [ ] Form error messages: `aria-describedby` linking error text to input
- [ ] Checkbox/radio: proper `aria-required`, `aria-checked` where applicable
- [ ] SVG visuals: `role="img"` and `aria-label` describing the diagram
- [ ] Mobile menu: `aria-expanded`, `aria-controls`, `aria-label` on hamburger button
- [ ] No text-in-image without DOM duplicate

---

## 10. Chart and Data Readability

- [ ] All Recharts charts have proper `aria-label` or adjacent text description
- [ ] Chart colors use the token palette (cyan, violet, emerald, amber, red)
- [ ] Chart labels are legible at 14px minimum
- [ ] Empty state is shown when no data is available (not blank space)
- [ ] Loading skeleton shown while data is fetching
- [ ] Metric cards show `—` for null/undefined values, never empty space
- [ ] Gini bar fills animate on mount (`transition-all duration-700`)

---

## 11. Empty / Loading / Error States

- [ ] All async components show skeleton loader (`.skeleton` class)
- [ ] Empty dataset list: shows CTA to upload or use synthetic sample
- [ ] Empty audit runs list: shows wizard CTA
- [ ] API error: shows error state with retry option (not blank page)
- [ ] Form validation: inline errors appear on blur/submit
- [ ] Form success: clear success confirmation (not just button going to disabled)

---

## 12. Forbidden Content on Public Pages

- [ ] No "D3.7", "D3.8", or any deliverable identifier visible
- [ ] No "TRL" (Technology Readiness Level) references
- [ ] No raw GitHub issue URLs in visible copy
- [ ] No "lorem ipsum" or placeholder text
- [ ] No "Coming soon" or "TODO" in rendered copy
- [ ] No internal project jargon: "ALT-AI", "WP3", "Consortium"
- [ ] No broken external links (verify key links work)

---

## 13. Cross-Browser Checks

- [ ] Chrome / Chromium latest
- [ ] Firefox latest
- [ ] Safari 16+ (macOS and iOS)
- [ ] Edge latest
- [ ] Mobile Safari (iOS 16+)
- [ ] Chrome Android

Key checks:
- [ ] `backdrop-filter: blur()` fallback tested on Firefox
- [ ] `-webkit-text-fill-color: transparent` gradient text works on Safari
- [ ] CSS custom properties (`var(--bg-950)`) resolve correctly
- [ ] Animations: no jank on 60fps scroll
- [ ] Webfonts: Inter loads before FCP (no FOUT)

---

## 14. Performance (Local Baseline)

- [ ] Homepage LCP < 2.5s on localhost (Chrome DevTools, throttled CPU 4x)
- [ ] No layout shift (CLS = 0) on homepage hero section
- [ ] SVG visuals are inline or small — no unoptimized raster images
- [ ] Lazy-loaded pages via `React.lazy()` — confirmed in Network panel
- [ ] No synchronous imports of heavy libraries in critical path
- [ ] Framer Motion tree-shaken (only used components imported)
- [ ] No `console.error` or `console.warn` in browser devtools
- [ ] No TypeScript compile errors (`npm run typecheck` passes)

---

## 15. Content Checklist

- [ ] Home page: headline, subheadline, 3+ CTAs, trust bar, capability grid, workflow, ecosystem, developer section, final CTA
- [ ] Community page: hero, included features, comparison table, contribution paths, final CTA
- [ ] Managed Cloud page: hero, why managed, onboarding flow, final CTA
- [ ] Pricing page: hero, 4 tier cards, comparison table, final CTA
- [ ] Security page: hero, 6 security pillars, privacy-by-default, disclosure, final CTA
- [ ] Developers page: hero, quickstart code, contribution types, good first issues, final CTA
- [ ] Self-host page: hero, requirements, quick setup steps, security hardening, final CTA
- [ ] Request Access page: 3-step form, deployment choice, org details, requirements, success state
- [ ] Product page: hero, 7-layer stack, formats, guardrails, final CTA
- [ ] Guided Assessment page: hero, 8 wizard steps, why guided, final CTA
- [ ] Dataset Audit page: hero, xAPI workflow, metrics gallery, output artifacts, final CTA
- [ ] Model Assessment page: hero, adapters, guardrails, final CTA
- [ ] Compliance Exports page: hero, artifact stack, JSON-LD graph, limitations, final CTA
- [ ] Ecosystem page: hero, lifecycle visual, 3 tools, PDC interop, final CTA
- [ ] OpenAPI page: hero, API categories, auth, try locally, final CTA
- [ ] Docs page: hero, 8 doc cards, 6 quickstart paths, final CTA
- [ ] App dashboard: greeting, 4 metric cards, quick actions, recent runs, capability summary

---

## Running Checks

```bash
# TypeScript typecheck
cd src/affectlog/frontend && npm run typecheck

# Build (catches import errors)
npm run build

# Lint
npm run lint

# Dev server for manual QA
npm run dev
```

---

*Last updated: 2026-06-05. Update this checklist when new pages or components are added.*
