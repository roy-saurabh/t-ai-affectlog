# AffectLog — Visual QA Checklist
## Dark Pastel Premium UI/UX (v3)

Pre-launch visual quality review. Each item must pass before shipping the UI.

---

## 1. TYPOGRAPHY

- [ ] Inter variable font loads correctly on all pages (check DevTools → Network → Fonts)
- [ ] `font-feature-settings: "cv02","cv03","cv04","cv11"` applied globally
- [ ] `font-optical-sizing: auto` applied to html element
- [ ] `-webkit-font-smoothing: antialiased` applied globally
- [ ] Hero headline renders at correct size (clamp between 2.6rem–4.25rem)
- [ ] No text renders below 11px on mobile
- [ ] Heading hierarchy is semantic (one H1 per page)
- [ ] Line height is comfortable for all body copy (1.625+)
- [ ] Letter spacing is correct on hero headings (−0.035em range)
- [ ] Mono font (JetBrains Mono) used only for: API endpoints, schema names, metric labels, code snippets, audit IDs

---

## 2. COLOR — DARK PASTEL SYSTEM

- [ ] No raw saturated colors remain (`#22d3ee`, `#10b981`, `#8B5CF6`, `#2563EB`)
- [ ] Primary CTA uses pastel gradient: `#93C5FD → #67E8F9 → #A7F3D0`
- [ ] Primary CTA text is dark ink (`#08111F`), not white
- [ ] Secondary CTA uses glass/outline style with pastel border
- [ ] Ghost buttons use muted text color `#8391A8`
- [ ] Focus ring is `rgba(103,232,249,0.70)` pastel cyan, 2px, 2px offset
- [ ] Body background is `#070B1A` (not `#050814`)
- [ ] Alternating sections use `#070B1A` / `#0B1224` — never pure black
- [ ] Text hierarchy: `#F8FAFC` → `#D8E0EE` → `#AEBBD0` → `#8391A8` → `#6F7D96`
- [ ] Badge colors match semantic mappings (privacy=green, data=blue, model=violet)
- [ ] Charts use pastel series colors (cyan, violet, green, blue, pink)

---

## 3. SPACING

- [ ] Marketing sections: minimum 7rem top/bottom padding (desktop: 9rem+)
- [ ] Hero top padding accounts for 72px fixed header
- [ ] Container max-width: 1440px for full-hd, 1280px for wide
- [ ] Cards have 1.25rem–1.5rem internal padding (desktop), 1rem (mobile)
- [ ] Console screens: 24px–32px gutters
- [ ] No cramped elements within cards

---

## 4. HERO QUALITY

- [ ] Every marketing page has a unique, custom hero visual (SVG/React)
- [ ] Hero visuals reference real AffectLog concepts (not generic icons)
- [ ] Hero visuals have subtle animation (beam flow, node pulse, float)
- [ ] `prefers-reduced-motion` disables all hero animations
- [ ] Hero visual is visible on tablet (not hidden)
- [ ] Hero visual is simplified (not hidden) on mobile
- [ ] Hero eyebrow pill appears above headline
- [ ] Hero subheadline width ≤ 680px (desktop)
- [ ] Hero has three CTAs: primary, secondary, technical/tertiary

---

## 5. PAGE-SPECIFIC QUALITY

### Homepage `/`
- [ ] "Request Managed Access" primary CTA is visible in hero
- [ ] "Deploy Community Edition" secondary CTA is visible
- [ ] HeroDataSpaceVisual renders with animated beams
- [ ] Trust badge strip appears below CTAs
- [ ] Capability grid shows 12 items in 4-column layout
- [ ] Edition split (Community vs Managed) shows two cards
- [ ] Ecosystem section shows CARiSMA / LOLA / AffectLog
- [ ] Final CTA band appears before footer

### Security `/security`
- [ ] SecurityShieldVisual renders
- [ ] Privacy principles listed as cards
- [ ] No mention of raw data export being allowed

### Dataset Audit `/dataset-audit`
- [ ] xAPI event stream visual is present
- [ ] "Run Dataset Audit" primary CTA is visible

### Guided Assessment `/guided-assessment`
- [ ] GuidedWizardScopeVisual renders
- [ ] Scope matrix shows available/needs-input/out-of-scope categories

### Compliance Exports `/compliance-exports`
- [ ] ComplianceJsonLdGraphVisual renders
- [ ] JSON-LD mentioned at least once

### Model Assessment `/model-assessment`
- [ ] ModelExplanationGraphVisual renders
- [ ] "Register a Model" or "View Model Adapters" CTA visible

---

## 6. CTA CLARITY

- [ ] Every marketing page has ≥1 primary CTA in hero
- [ ] Every marketing page has a mid-page CTA or CTA band
- [ ] Every marketing page ends with a final CTA section
- [ ] CTA labels are specific (not "Learn more" alone)
- [ ] CTAs link to correct routes (`/request-access`, `/community`, `/guided-assessment`)
- [ ] CTAs have accessible names (not just "→")

---

## 7. RESPONSIVE BEHAVIOR (check at 1440 / 1280 / 1024 / 768 / 390 / 360px)

- [ ] No horizontal overflow at any breakpoint
- [ ] Hero copy and visual stack correctly on tablet/mobile
- [ ] Navigation collapses to hamburger at <1024px
- [ ] Mobile drawer opens from the right, full height
- [ ] Mobile drawer has CTAs in footer
- [ ] Mobile drawer closes on link click
- [ ] Cards become single-column on mobile
- [ ] CTA buttons become full-width or 2-column on mobile
- [ ] Footer links are legible on mobile
- [ ] Charts remain readable or show simplified mobile variant

---

## 8. MOBILE DRAWER

- [ ] Hamburger button visible and labeled
- [ ] Drawer opens with spring animation
- [ ] Drawer background is dark pastel (`#0B1224`)
- [ ] All nav sections are collapsible within drawer
- [ ] "Request Managed Access" CTA present in drawer footer
- [ ] Close button labeled and functional
- [ ] Body scroll locked while drawer is open

---

## 9. CHART READABILITY

- [ ] Dark chart backgrounds (no white chart panels)
- [ ] Pastel series colors (cyan, violet, green, blue, pink) applied
- [ ] Gridlines are subtle (opacity ~0.08–0.12)
- [ ] Axis labels readable (color ≥ `#8391A8`)
- [ ] Tooltips use dark glass style
- [ ] Chart titles concise and precise
- [ ] Lorenz curve (Gini) includes "What this means" explanation
- [ ] Coverage@K includes K values and explanation
- [ ] PII heatmap shows action taken (hash / redact / suppress)

---

## 10. FORM USABILITY

- [ ] All inputs have visible labels (not placeholder-as-label)
- [ ] Required vs optional clearly indicated
- [ ] Focus ring visible on inputs (pastel cyan)
- [ ] Error messages linked to fields via `aria-describedby`
- [ ] Error text is specific and actionable
- [ ] Long forms are multi-step, not a single scroll
- [ ] Privacy note present on request access form
- [ ] Success state shows clear next steps

---

## 11. EMPTY STATES

- [ ] Dataset list empty state has upload/sample action
- [ ] Audit run empty state has "Start Guided Assessment" action
- [ ] Model list empty state has "Register a Model" action
- [ ] Admin queue empty state is legible and informative
- [ ] Empty states are not plain gray boxes

---

## 12. LOADING STATES

- [ ] Skeleton cards use pastel shimmer animation (not white flash)
- [ ] Long audit jobs show progress, not indefinite spinner
- [ ] Heavy dashboard sections show skeletons before data
- [ ] `prefers-reduced-motion` stops shimmer animations

---

## 13. ERROR STATES

- [ ] Network error shows: what happened, why, how to fix
- [ ] Validation errors are field-specific (not toast-only)
- [ ] 404 page has "Go home" and docs links
- [ ] Permission error shows clear explanation

---

## 14. ACCESSIBILITY

- [ ] WCAG AA contrast for all text on dark backgrounds
- [ ] Skip-to-content link present and functional
- [ ] All images have alt text (or `aria-hidden` if decorative)
- [ ] SVG hero visuals have `role="img"` and `aria-label`
- [ ] Keyboard navigation works (Tab, Shift+Tab, Enter, Escape)
- [ ] Focus ring visible in keyboard navigation mode
- [ ] Form errors linked to fields via aria
- [ ] `prefers-reduced-motion` respected globally
- [ ] No color-only information (icons + text + color combined)
- [ ] Buttons have accessible names

---

## 15. PERFORMANCE

- [ ] LCP < 2.5s on homepage (local dev)
- [ ] No layout shift (CLS ≈ 0)
- [ ] No animation jank on mid-range hardware
- [ ] Inter font preloaded or loaded via `@fontsource-variable/inter`
- [ ] Heavy hero visuals lazy-loaded where possible
- [ ] No unnecessary re-renders in animated visuals
- [ ] `will-change: transform` only on actively animated elements

---

## 16. PUBLIC PAGE COMPLIANCE

- [ ] No mention of `D3.7` on any public page
- [ ] No mention of `TRL` on any public page
- [ ] No unexplained acronyms without context (PDC, RBAC, xAPI defined at first use)
- [ ] No broken links in navigation
- [ ] No `TODO` or placeholder text visible in UI
- [ ] No fake screenshots or stock imagery

---

## SIGN-OFF CRITERIA

This visual QA pass is **complete** when:

1. All checklist items above are marked ✓
2. Screenshot tests pass for desktop and mobile (`npx playwright test tests/e2e/visual-screenshot.spec.ts`)
3. No WCAG AA contrast failures detected
4. No horizontal overflow found at any breakpoint
5. All marketing pages have unique hero visuals
6. No forbidden internal terms on public pages
7. Focus rings visible in browser keyboard navigation
8. Reduced motion mode disables all nonessential animations

---

## HOW TO RUN VISUAL TESTS

```bash
# Start the frontend
cd src/affectlog/frontend
npm run dev

# In another terminal, run visual tests
npx playwright test tests/e2e/visual-screenshot.spec.ts

# Screenshots saved to:
# test-results/screenshots/
```

---

*Last updated: June 2026 | Dark Pastel UI/UX Pass v3*
