# NIBREXO — FOUNDATION FINALIZATION
### Master Architectural Reference v1.0
*This document closes out the foundation phase. It reviews Brand Identity v1.0, Layout & Design Principles v1.0, Global Component System v1.0, and Motion Design System v1.0 for conflicts, completes every decision those documents left open, and defines the site-wide architecture (IA, linking, navigation) that page design will build on. Nothing here is silent — every conflict is named, every recommendation is explained, and items still requiring your sign-off are called out explicitly in the Confirmation Checklist at the end.*

---

# PHASE 1 — FOUNDATION REVIEW: CONFLICTS & GAPS

A line-by-line pass across all four documents surfaced the following. None of these are catastrophic — this is normal for a system built in sequential modules — but each needs an explicit resolution before it's safe to build pages on top of it.

### 1.1 — Two typography decisions were left open and never confirmed
**Where:** Brand Identity §4 flagged Amoresa as unsuitable and proposed Cabinet Grotesk + Sora, but you never explicitly confirmed it. Every document since has silently assumed that recommendation (Component System §4 references "Brand Identity §4 type levels" as settled).
**Risk:** If this gets confirmed differently later, three subsequent documents' typography references would need auditing.
**Resolution:** I'm treating Cabinet Grotesk (display) + Sora (interface/body) as **provisionally locked** for this document and moving forward — it's the working assumption every other document already depends on. Flagged again in the Confirmation Checklist. If you want Sora-only or a different display pairing, say so now and I'll issue a single amendment rather than letting it drift further.

### 1.2 — Icon library was never chosen, only shortlisted
**Where:** Component System §6 says "recommend Phosphor Icons or Lucide" without picking one.
**Risk:** A "component standard" that doesn't commit to one family isn't actually a standard — the first page built would force the decision informally, which is exactly the kind of undocumented judgment call this whole foundation phase exists to prevent.
**Resolution:** Locking **Lucide** as the default. Reasoning: slightly larger and more actively maintained open-source coverage as of early 2026, marginally more geometric/less rounded terminal style than Phosphor's default weight — a closer match to the "geometric, engineered" shape language in Brand Identity §2 than Phosphor's softer default. Phosphor remains a fine alternative if you have a specific preference; this is a low-cost decision to reverse if so.

### 1.3 — Semantic colors were proposed but not ratified
**Where:** Component System §15 proposed success/warning/error/info values as an open decision.
**Resolution:** Finalized in Phase 2 below, using the same values proposed there (no reason found to change them on review) — now promoted from "proposed" to "locked."

### 1.4 — The corner-radius scale was compressed when it moved from Brand Identity into component tokens, and lost a tier
**Where:** Brand Identity §2 defines five radius tiers (8 / 12 / 16–20 / **24** / full). Component System §1 compressed this into four token names (`sm` 8, `md` 12, `lg` 16–20, `full`) — the 24px "hero-level container" tier has no token name and was never used by name in the Motion or Component docs.
**Risk:** Without a named token, a future page builder has no way to correctly apply the 24px tier — it would either get rounded down to `lg` (16–20px) or invented ad hoc, breaking the five-tier system Brand Identity actually specified.
**Resolution:** Adding a fifth token, `xl` (24px), to the official Component System §1 scale, reserved specifically for hero-level containers and large media blocks per Brand Identity's original definition. This is a naming completion, not a new design decision — it restores what Brand Identity already specified.

### 1.5 — UI elevation shadows never got a light-direction rule; illustrations did
**Where:** Brand Identity §5 specifies illustration lighting as directional — "single light source, top-left, low opacity." Component System §1's elevation scale specifies shadow color (Graphite, low opacity) but not direction.
**Risk:** If a developer applies illustration-style top-left directional shadows to UI cards, it will look inconsistent with the more conventional, symmetric elevation most users expect from interface shadows (which imply light from directly above, not from a corner).
**Resolution:** UI elevation (cards, modals, dropdowns) uses a **near-vertical, bottom-weighted shadow** (small or zero x-offset, positive y-offset) — the standard interface convention, distinct on purpose from illustration lighting. Illustrations keep their top-left directional light per Brand Identity §5; UI elevation does not borrow it. Documented as an explicit distinction in Phase 2's Elevation tokens.

### 1.6 — Sticky elements were never checked for collision
**Where:** Component System §5 defines sticky Top Navigation; Component System §7 defines a sticky Order Summary during checkout; Component System §5 also allows a sticky Table of Contents on docs/blog. Motion §4 states "never more than one sticky element competing for the same screen edge simultaneously" — but never confirms these three don't collide.
**Resolution:** They don't collide in practice (top nav sticks to the top edge; Order Summary and Table of Contents stick within a side column, not the top edge) but this was implicit, not stated. Resolved explicitly in Phase 7 (Global Navigation Rules) with a stated rule: only one sticky element per screen *edge*, side-column stickies are permitted alongside a sticky top nav since they don't share an edge.

### 1.7 — "Light-first brand" (Brand Identity) was never reconciled with the open dark-mode question
**Where:** Brand Identity §3 states outright: "Nibrexo is a light-first brand." Component System §15 left dark mode as an open decision without addressing whether it conflicts with that identity statement.
**Risk:** If dark mode is built as a full parallel identity later, it could contradict a brand statement already made in a locked document.
**Resolution:** Addressed fully in Phase 3 — short version: light-first identity is preserved for the public marketing site; dark mode is scoped to future application/dashboard contexts only, which is a different design system need entirely and doesn't require Brand Identity's core statement to change.

### 1.8 — RTL was flagged as an open question but no document contains any LTR-dependent language to audit
**Where:** Layout §5 explicitly encodes LTR assumptions ("left-aligned text... matches natural reading start point"). No document uses CSS logical properties language (`margin-inline-start` vs `margin-left`), which is the actual mechanism that makes RTL cheap or expensive later.
**Resolution:** Addressed fully in Phase 4. No prior document needs to change — Phase 4 adds a "how to implement" layer on top of what's already locked, not a revision to it.

### Summary
No conflict found required un-doing a previous decision. Every issue above was a **gap** (something referenced but never finished) rather than a **contradiction** (two documents actively disagreeing). That's the expected outcome of a well-run sequential process — this phase exists to catch exactly this category of loose end before it reaches page design.

---

# PHASE 2 — SEMANTIC DESIGN TOKENS

Naming convention follows Component System §15: `color-[role]-[variant]`. These tokens sit on top of the raw brand palette (Brand Identity §3) — components reference semantic tokens, never raw hex values, so a future rebrand or dark-mode variant only requires remapping this layer.

| Token | Value (Light) | Purpose | Accessibility | Scalability |
|---|---|---|---|---|
| `color-primary` | `#2563EB` | Brand actions, links, focus | AA as text on white; AA as large-text/UI fill | Root of the entire interactive-element language |
| `color-primary-hover` | `#1E40AF` (Secondary) | Hover/pressed state of primary actions | Passes AA for white text — better contrast than default Primary | Reuses existing Secondary color rather than inventing a new one |
| `color-secondary` | `#1E40AF` | Secondary emphasis, gradients, dark-mode primary substitute | AA for white text | Already dual-purposed per Brand Identity §3 |
| `color-success` | `#15803D` | Confirmations, positive validation, completed states | AA for white text and as text on white | New — closes Component System §15's open item |
| `color-warning` | `#D97706` | Caution states, non-blocking alerts | AA at UI/large-text sizes; use as text-on-white for small text | Deliberately distinct from Accent (`#B45309`) so "brand emphasis" and "caution" are never visually confused |
| `color-error` | `#DC2626` | Validation errors, destructive actions, failed states | AA for white text and as text on white | Also serves as the "destructive" confirm-button color (Component §10) |
| `color-info` | `#2563EB` (= Primary) | Informational messages, neutral system notices | Inherits Primary's accessibility profile | Reuses Primary — informational tone and brand trust color are naturally aligned, no new hue needed |
| `color-neutral` | `#1F2937` (Graphite) | Default text, icons, borders-when-emphasized | AAA on white | The workhorse — already defined, promoted to semantic role here |
| `color-surface` | `#FFFFFF` | Card, modal, dropdown backgrounds | Baseline for all contrast math | Distinct from `background` so elevated content can be styled independently of the page canvas |
| `color-background` | `#FAFBFC` (near-white, new) | Page canvas, alternating section tint | Effectively AAA-safe with any text token above | New, minor addition — gives Layout §10's "White → tint → White" rhythm a formal token instead of relying on Support at low opacity, which risked accidentally introducing blue cast into neutral backgrounds |
| `color-border` | `#1F2937` at 12% opacity | Default component borders (inputs, cards, dividers-when-emphasized) | Not a text/foreground color — decorative/structural only, no contrast requirement | Single token drives every border in the system — changing it once updates everywhere |
| `color-divider` | `#1F2937` at 8% opacity | Hairline separators, lighter than border | Structural only | Distinct from `border` — dividers are for internal separation, borders imply a contained component boundary |
| `color-overlay` | `#1F2937` at 60% opacity | Modal/lightbox backdrop scrim | Structural only — must not be relied on for any text contrast itself | Matches Component §10's modal spec exactly, now formalized as a token |
| `color-disabled` | `#1F2937` at 40% opacity (applied via opacity, not a separate fill) | Disabled buttons/inputs (Component §2/§4) | Explicitly exempt from text-contrast requirements per WCAG (disabled content is not required to meet AA) — but must still be distinguishable in shape/position, never conveyed by opacity alone in isolation | Single opacity rule, not a separate color — keeps disabled state visually connected to its enabled counterpart |
| `color-hover` | Context-dependent (defined per component: Primary→Secondary, Surface→Background, etc.) | Hover feedback | Must maintain AA against its new background if text sits on it | Not a single hex — a *behavior* token (see Governing Rule below) |
| `color-focus` | `#2563EB` (= Primary), 2px ring | Focus indication (Component §1 Focus Ring) | Must be visible against every surface color in the system — verified against White, Background, and Surface tokens | Single ring color system-wide, never varies by component |
| `color-selection` | `#2563EB` at 10% opacity fill + Primary text/icon | Selected list items, active filters, chosen options | Selection must never rely on background tint alone — pairs with a border or icon change per Component §12 | Reused pattern across filters, dropdowns, tabs |
| `color-active` | `#2563EB` (Primary) | Current nav item, active tab | Same accessibility profile as Primary | Distinguished from `selection` — active is persistent/singular (current page), selection can be plural (multi-select filters) |
| `color-pressed` | `color-primary-hover` at 90% brightness (component-calculated, not a flat new hex) | Momentary pressed/click state (Component §2) | Transient — no independent accessibility requirement since it never appears at rest | Derived token, computed from `primary-hover` rather than hand-picked, keeping the palette from sprawling |

**Governing rule for behavioral tokens (`hover`, `pressed`):** These are not fixed colors — they're **rules for how to darken/shift an existing token**, applied consistently (one step deeper in the same hue family). This keeps the token count manageable as the component library grows into SaaS/dashboard contexts, rather than requiring a hand-picked hover color for every new component.

**Scalability note:** This token layer is what makes Phase 3 (dark mode) possible without a system rewrite — every component already references `color-surface`, `color-background`, etc. rather than raw hex, so a dark-mode theme is a matter of remapping this table, not re-touching every component spec.

---

# PHASE 3 — DARK MODE STRATEGY

### Should dark mode exist?
**Yes — but scoped, not universal.** Resolving the Phase 1.7 tension directly: Brand Identity's "light-first brand" statement describes Nibrexo's **public identity** — the marketing site, store, and agency presence that most visitors will ever see. That identity is preserved as-is. Dark mode is architected as an **interface preference for the future SaaS/AI dashboard product**, where users spend extended, repeated session time and dark mode is a genuine, expected utility (reduced eye strain, battery savings on OLED, a near-universal expectation in productivity software). This is the same pattern used by companies like Linear and Notion: marketing site stays light and brand-forward; the application layer offers a theme choice.

### Launch now or later?
**Architect now, launch later.** The token structure in Phase 2 already makes dark mode cheap to add later — building the dark-mode value mappings now (below) costs little and prevents a costly retrofit, but there's no need to ship a dark-mode toggle on the marketing site at initial launch. **Recommendation: dark mode ships alongside the first SaaS dashboard module, not with the Homepage.**

### How colors adapt (dashboard/app context only)
| Token | Light Value | Dark Value | Reasoning |
|---|---|---|---|
| `color-background` | `#FAFBFC` | `#111827` (deep graphite, not pure black) | Pure black causes excessive contrast/eye strain against white text; a deep graphite is easier to sustain visually over long sessions |
| `color-surface` | `#FFFFFF` | `#1F2937` (current Graphite, repurposed) | Graphite already exists in the palette — reusing it as dark-mode surface avoids inventing new tokens |
| `color-neutral` (text) | `#1F2937` | `#F3F4F6` (off-white, not pure white) | Pure white text on dark backgrounds causes halation/glow for many users — off-white is the accessible, comfortable convention |
| `color-primary` | `#2563EB` | `#3B82F6` (brightened) | Primary blue needs to brighten slightly to maintain sufficient contrast and visual energy against dark surfaces — same hue, adjusted lightness |
| `color-support` | `#85B1C9` | Used even more sparingly — its already-limited contrast profile (Brand Identity §3) gets worse against dark backgrounds, not better | Confirms and extends the existing "background/decorative only" restriction from Brand Identity §3 |
| `color-accent` | `#B45309` | `#D97706` (brightened toward the Warning token's hue) | Needs similar brightening logic to Primary; deliberately kept distinct from the Warning token itself to avoid the same brand/caution confusion Phase 2 already guards against |

### How elevation works
Shadows lose most of their visual meaning on dark backgrounds (a dark shadow on a dark surface has low visible contrast). **Dark mode elevation is communicated primarily through surface lightness, not shadow depth** — each elevation level (Component §1) gets a slightly lighter surface fill as it "rises," with shadow retained only as a secondary, subtle reinforcement. This is the standard, tested approach (used by Material Design's dark theme and most mature dark-mode systems) rather than an invented one.

### How illustrations adapt
Brand Identity §5 illustrations are built on transparent/white backgrounds with Graphite line work. In dark contexts, illustrations swap to transparent/dark-surface backgrounds with line work in the off-white neutral token, and fills shift from the light-mode palette tints to their dark-mode equivalents (table above) — same shapes, same stroke weight, same corner radius, only the token values change. No illustration is redrawn; the system is token-driven by design.

### How icons adapt
Same principle — icons reference `color-neutral` (text-equivalent) or `color-primary` per Component §6, so they invert automatically once those tokens remap. No separate dark-mode icon set is needed.

### How accessibility changes
All contrast pairs must be re-verified against the dark token values above (a pair that passes AA in light mode does not automatically pass in dark mode with inverted values) — this is a required QA step before any dark-mode UI ships, not an assumption. Additionally: reduce any glow/gradient intensity (Motion §11) in dark mode specifically, since bright glows against dark backgrounds are more visually fatiguing than the same effect against white.

### How motion changes
Per Motion §11, glass overlays and gradient glow are already tightly scoped — in dark mode, both need reduced opacity/intensity versions (a glow that reads as "subtle" on white can read as "glaring" on a dark surface). No other motion timing/easing rules change — duration and easing are perceptual, not color-dependent.

---

# PHASE 4 — RTL STRATEGY

Recommendation: implement using **CSS logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, etc.) instead of physical properties (`margin-left`, `padding-right`) from the first line of code written — this is what turns RTL from "a rebuild" into "a single `dir="rtl"` attribute flip." This is a developer-facing implementation note that belongs in this document because it affects how every component from the Component System must be built, even though RTL itself may not launch for some time.

| Area | RTL Rule |
|---|---|
| **Layout** | Grid direction mirrors — column 1 becomes the rightmost column. Achieved automatically if built with logical properties/CSS Grid's native `dir`-awareness; never hard-coded to physical left/right |
| **Navigation** | Primary nav item order mirrors (reading order follows script direction); logo position is a brand decision, not a directional one — recommend the Nibrexo wordmark stays in its trained/expected position (leading edge, i.e., visually right-aligned in RTL) since a wordmark is a fixed identity mark, not body content |
| **Icons** | Directional icons (arrows, chevrons, back/forward, "next/previous" pagination) flip horizontally. Icons with fixed real-world meaning (play button, checkmark, search magnifier, external-link icon) do **not** flip — flipping a play button, for example, would make it visually incorrect, not localized |
| **Buttons** | Icon+label order mirrors (icon that was left-of-label moves to right-of-label) — governed by logical-property flexbox ordering, not manual per-button logic |
| **Forms** | Label alignment and text-align flip to right; input text entry direction follows the field's content language (a form can be RTL-laid-out while still correctly handling an embedded LTR email address or phone number — this is a known, standard Unicode bidi behavior, not something to design around manually) |
| **Cards** | Image/text internal order mirrors alongside the text alignment |
| **Tables** | Column order mirrors; numeric data within cells stays LTR internally (numbers are not mirrored, per standard bidi text convention) — this applies to pricing tables, comparison tables, and any future dashboard data tables |
| **Animations** | Directional motion reverses — an element that slides in from the right in LTR slides in from the left in RTL (Motion §2/§5's slide-adjacent patterns, e.g., toast notifications, cart panel) |
| **Typography** | Sora and the recommended display pairing are Latin-script fonts — if Nibrexo expands into Arabic, Hebrew, or other RTL-script markets, a script-appropriate font pairing must be sourced at that time (no current recommendation exists for this, flagged as a future need, not a gap in this document — it can't be solved generically in advance of knowing the target script) |
| **Spacing** | The 8px spacing scale (Layout §4) is direction-agnostic and requires no changes — spacing values apply equally regardless of reading direction |
| **Future localization** | Beyond RTL, plan for text expansion (German/French translations commonly run 20–35% longer than English) — component text containers (buttons, nav labels, cards) should never be built with hard pixel-width text constraints; this is good practice independent of RTL and worth adopting now regardless of when localization actually happens |

---

# PHASE 5 — WEBSITE INFORMATION ARCHITECTURE

### Top-Level Sitemap

```
Home
├── Store (Digital Products)
│   ├── Category (e.g., Templates, UI Kits, Tools)
│   │   └── Product Detail
│   ├── Cart
│   └── Checkout
├── Agency Services
│   ├── Service Detail (e.g., Brand Identity, Web Design, Product Design)
│   ├── Industries / Solutions
│   │   └── (Healthcare, Education, Startups, Agencies — one page per audience segment named in the project brief)
│   └── Case Studies / Portfolio
│       └── Case Study Detail
├── Pricing
├── About
│   ├── Team
│   └── Careers (future)
├── Blog
│   ├── Category
│   └── Article
├── Documentation
│   ├── Guide Category
│   └── Guide Detail
├── Support / Help Center
│   ├── FAQ
│   ├── Contact
│   └── Ticket Submission
├── Account
│   ├── Dashboard
│   ├── Orders
│   ├── Downloads
│   ├── Wishlist
│   └── Settings
├── Search (global, cross-content)
├── Legal
│   ├── Privacy Policy
│   ├── Terms of Service
│   └── License Terms
└── 404 / Error

Future Modules (architected for, not built yet):
├── SaaS Platform
│   ├── Product/Features
│   ├── Pricing
│   ├── Signup/Onboarding
│   └── Dashboard (app shell — dark-mode-eligible, per Phase 3)
├── AI Products
│   ├── Product Catalog
│   └── Individual Product/Demo Pages
└── Marketplace
    ├── Browse (multi-vendor)
    ├── Vendor Storefronts
    └── Vendor Onboarding/Dashboard
```

**Designer/IA note:** Store and Agency Services are Nibrexo's two co-equal parent pillars (matching the business definition: "Digital Product Store + Creative Design Agency") — neither is nested under the other, and both are represented as top-level primary nav items. This is a deliberate structural decision: nesting one under the other would misrepresent the business as primarily one thing with the other as a side offering.

### User Journeys

| Journey | Path |
|---|---|
| **Agency Journey** | Home → Agency Services → Industry/Solution page (self-identifies audience) → Case Studies (proof) → Contact/Proposal request |
| **Store Journey** | Home or Store → Category → Product Detail → Add to Cart → Checkout → Success → Downloads (Account) |
| **Customer (post-purchase) Journey** | Success page → Account/Downloads → (later) Support if needed → (later) return via Account for repeat purchases |
| **Support Journey** | Any page (persistent utility nav) → Help Center → FAQ search → (if unresolved) Contact/Ticket → Confirmation |
| **Blog Journey** | Discovery (search/social/organic) → Article → Related Articles → Newsletter or contextual CTA (Store/Agency depending on article topic) |
| **Documentation Journey** | Search or Account-linked (post-purchase) → Guide Category → Guide Detail → Related Guides |
| **Search Journey** | Global search (any page) → Cross-content results (blog + store + docs + agency, clearly labeled by type) → Refine/filter → Destination page |
| **Future SaaS Journey** | Marketing/Product page → Pricing → Signup → Onboarding flow → Dashboard (first-run empty states per Component §6/§16) |
| **Future AI Products Journey** | Discover (Store or dedicated AI catalog) → Product/Demo page → Try or Subscribe → Dashboard/Account integration |
| **Future Marketplace Journey** | Two distinct tracks: **Buyer** (Browse → Vendor/Product → Purchase, converges with Store Journey) and **Vendor** (separate onboarding → Vendor Dashboard — architected as its own future module, not a Store sub-feature, since seller tooling has fundamentally different IA needs) |

---

# PHASE 6 — INTERNAL LINKING

**Breadcrumb Strategy:** Per Component System §5, breadcrumbs appear on any page nested more than one level deep. Format: `Home / Section / Subsection / Current Page` — current page is non-clickable, styled in the `color-active` token. Applies to: Store (Category > Product), Blog (Category > Article), Documentation (Category > Guide), Agency (Service > Case Study).

**Cross-Linking:**
- **Related Products:** Same category or shared tags, 3–4 shown, positioned after product description/before final CTA — never above the fold on a product page, where it would compete with the primary purchase decision
- **Related Services:** Agency service pages cross-link to relevant case studies and to Store products where genuinely relevant (e.g., a Brand Identity service page linking to a relevant template product) — this is the one place Store and Agency pillars intentionally cross-pollinate, since a visitor evaluating one is a plausible candidate for the other
- **Related Articles:** Tag/category-based, 3 shown max (Component §8 Feature List guidance on avoiding list overload applies here too)

**CTA Relationships:** Every page ends with exactly one contextually relevant primary CTA (Layout §8/§7), chosen by page type:
| Page Type | Terminal CTA |
|---|---|
| Product Detail | Add to Cart / Buy Now |
| Service Detail | Request Proposal / Contact |
| Blog Article | Newsletter signup or a relevant Store/Service link, matched to article topic |
| Documentation | "Was this helpful?" + related guide, not a sales CTA (documentation is a trust/support context, not a conversion one) |
| Case Study | Contact/Proposal |

**SEO Hierarchy:** Pillar-and-cluster model — Agency Services and Store Category pages act as pillar pages; individual Product Details, Case Studies, and Blog Articles are cluster content linking back to their relevant pillar. Breadcrumb structure (above) doubles as the SEO hierarchy signal (matches the URL structure and structured-data breadcrumb markup). Filtered/sorted Store pages (e.g., `?sort=price`) use canonical tags pointing to the unfiltered category page, to avoid duplicate-content dilution — a common and easily-missed SEO issue for commerce sites, flagged proactively here since it's a technical decision that needs to be correct from the first build, not retrofitted.

---

# PHASE 7 — GLOBAL NAVIGATION RULES

| Navigation Type | Rule |
|---|---|
| **Primary Navigation** | Max 6 top-level items (Component §5): Store, Agency Services, Solutions, Pricing, Blog, About — Documentation/Support/Account live in Utility Nav, not Primary, to stay within the limit |
| **Secondary Navigation** | Context-specific sub-navigation (Docs sidebar, Account sidebar, Blog category tabs) — appears only within its relevant section, never globally |
| **Utility Navigation** | Persistent top-right cluster: Search icon, Account icon, Cart icon (Store contexts) — consistent position across every page per Layout's predictability principle (§1) |
| **Mobile Navigation** | Off-canvas full-height panel (Component §5) containing Primary + Utility items combined into one flat, scannable list |
| **Dashboard Navigation** | Sidebar pattern (Component §5), reserved for future SaaS/Account-dashboard contexts — dark-mode-eligible per Phase 3 |
| **Footer Navigation** | Column-grouped: **Product** (Store, Agency Services, Pricing) / **Company** (About, Blog, Careers) / **Resources** (Documentation, Support, Blog) / **Legal** (Privacy, Terms, License) — plus a social links row (Component §8) and newsletter box (Component §8), consistent across every page |
| **Sticky Behaviour** | Top Navigation sticks to the top edge and compresses after ~80px scroll (Motion §2/Component §5). Side-column sticky elements (Order Summary during checkout, Table of Contents on docs) are permitted concurrently since they occupy a different edge — resolves the Phase 1.6 gap explicitly: **one sticky element per edge, not one sticky element per page** |
| **Search Behaviour** | Persistent icon expands to full-width overlay (Component §11), debounced instant search, results grouped and labeled by content type (Product / Article / Documentation / Service) since Nibrexo's search spans multiple content types — an unlabeled mixed-results list would be confusing given the breadth of content on this site |
| **Mega Menu Strategy** | Reserved for Store (once category count exceeds ~3, per Component §5's rule) and future Marketplace — Agency Services and other sections use a simple Dropdown Navigation instead, since they don't have enough sub-items to justify a mega menu's complexity |

---

# PHASE 8 — FINAL FOUNDATION AUDIT

Reviewing the complete four-document foundation plus this finalization document as a cross-functional senior team surfaced the following genuine gaps — things no single document above was responsible for catching, but which affect the whole system.

| Gap | Risk | Recommendation |
|---|---|---|
| **No cookie/privacy consent UI defined** | Legally required in most target markets (GDPR and equivalents); if designed ad hoc at launch, it will almost certainly break the calm, restrained brand personality (consent banners are a common "ugly exception" on otherwise polished sites) | Add a Consent Banner component to the Component System before Homepage build — small addendum, not a new document |
| **No numeric performance budget** | Motion §14 and Layout's technical goals say "fast" without a target; without a number, "fast" can't be tested or enforced during development | Recommend adopting standard Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms, as the formal performance budget for every page going forward |
| **No stated multi-currency/pricing-display approach** | Nibrexo's target users include international founders/agencies; Store and Pricing pages will need a real decision (single currency with disclaimer vs. localized display) before Checkout is designed, not after | Flagged as a business decision needed from you before Store/Checkout page design begins — not a design-system-level decision I should make unilaterally |
| **No token/documentation delivery tooling named** | Four solid documents exist, but nothing defines how designers and developers actually stay in sync day-to-day (a shared Figma library, a Style Dictionary/JSON token source, etc.) — without this, "keep it consistent" relies on everyone re-reading these documents rather than a shared source of truth | Recommend a Figma component library mirroring this document exactly, plus a JSON/CSS custom-property token file generated from Phase 2's table, as the next practical (non-design) task before heavy page production begins |
| **No versioning process for the foundation documents themselves** | Five documents now exist; if one changes later, there's no defined process for how that change propagates (does v1.0 become v1.1? What triggers a full re-audit like this one vs. a small addendum?) | Recommend: token-level or single-component changes get a lightweight addendum note at the bottom of the affected document; anything touching more than one document (like this Finalization phase) gets a new dated Foundation Review, following the pattern just established here |
| **Analytics/CRO tagging convention undefined** | The system is explicitly "high conversion focused" (Component System principles) but nothing defines how CTAs/events are tracked, which will affect naming decisions made during actual component build | Recommend a lightweight event-naming convention (e.g., `[page]_[component]_[action]`) be defined alongside the token/tooling work above — flagged as needed, not solved here, since it's more of an analytics-implementation decision than a design-system one |

**No structural scalability issues were found** in the four-document foundation itself — the token-first approach (Phase 2), the explicit future-module placeholders in the IA (Phase 5), and the dark-mode/RTL architecture (Phases 3–4) were specifically built to absorb SaaS, AI Products, and Marketplace expansion without requiring a foundational rewrite. The gaps above are operational/tooling gaps, not design gaps.

---

# CONFIRMATION CHECKLIST

Everything above is now applied and internally consistent, with the following items resolved provisionally and flagged for your explicit confirmation before they're treated as fully final:

1. **Typography:** Cabinet Grotesk + Sora — confirm, or correct (Phase 1.1)
2. **Icon library:** Lucide — confirm, or switch to Phosphor (Phase 1.2)
3. **Dark mode scope/timing:** App/dashboard-only, launches with the SaaS module rather than at site launch — confirm this matches your intent (Phase 3)
4. **Multi-currency/pricing display approach:** No recommendation made — needs your business decision before Store/Checkout design (Phase 8)

Everything else in this document — semantic tokens, RTL implementation approach, information architecture, internal linking, and global navigation rules — is locked as v1.0 alongside the four prior documents.

The foundation is complete. The next module is ready to be page design, starting with the Homepage, whenever you are.

---

# ADDENDUM v1.1 — BUSINESS NAVIGATION STRATEGY (DIGITAL PRODUCTS PRIORITY)
*Amends Phase 5, Phase 6, and Phase 7 only. Phases 1–4 and Phase 8 are unaffected and remain as written above. This is a permanent architectural rule, not a Homepage-specific decision — it governs navigation, IA, and CTA placement across the entire site going forward.*

### Conflict Resolution
Phase 5's original IA note described Store and Agency Services as co-equal pillars with deliberately equal nav weight. **This is now superseded.** Digital Products is confirmed as Nibrexo's primary revenue focus and receives the highest visual and navigational priority site-wide. Agency Services is secondary. Resources & Learning is supporting. The underlying page inventory from Phase 5 doesn't change — no page is removed — but priority, prominence, and nav structure do.

### The Three Primary Journeys (Locked)

| Journey | Priority | Flow |
|---|---|---|
| **1. Digital Products** | Highest — primary revenue source | Home → Products → Product Categories → Product Detail → Checkout → Payment → Download → Customer Dashboard |
| **2. Agency Services** | Secondary — high-value client acquisition | Home → Services → Portfolio → Case Studies → Book a Consultation → Contact |
| **3. Resources & Learning** | Supporting — SEO, authority, long-term funnel | Home → Resources → Blog → Guides → Free Resources → Email Signup → Product Recommendations |

**Governing rule:** every future page, nav decision, and internal link must support one of these three journeys while keeping Journey 1 visually and structurally dominant. If a future request would give Agency Services or Resources equal prominence to Products, that's a conflict with this rule and must be flagged before proceeding — the same way this addendum flagged the conflict it's resolving.

### Amendment to Phase 5 — Information Architecture
"Resources" is now a formal top-level IA node, replacing the previous flat/separated treatment of Blog and Documentation:

```
Resources (new parent node)
├── Blog
│   └── Article
├── Guides (formerly "Documentation")
│   └── Guide Detail
└── Free Resources (new — lead-magnet downloads: templates, checklists, mini-kits)
    └── Email Signup (gate) → Product Recommendations (post-signup)
```

Store's sitemap position is unchanged but is now explicitly the highest-weighted branch in the tree. Agency Services' sitemap position is unchanged, weighted second.

### Amendment to Phase 7 — Global Navigation Rules
Primary Navigation is restructured from the original six-item list to reflect journey priority (still within the 6-item cap from Component §5):

| Position | Item | Priority Treatment |
|---|---|---|
| 1 | **Products** | Highest visual weight — leads the nav, may use a distinct treatment (e.g., first position, optionally paired with the Primary CTA styling elsewhere on the page) to reinforce it as the default path |
| 2 | **Services** | Standard nav treatment |
| 3 | **Resources** | Dropdown/mega-menu containing Blog, Guides, Free Resources — standard nav treatment, supporting-tier content organized under one roof instead of scattered |
| 4 | **Pricing** | Unchanged |
| 5 | **About** | Unchanged |

Documentation is absorbed into Resources → Guides (no longer lives in Utility Nav). Support remains in Utility Nav alongside Search, Account, and Cart, unchanged. "Solutions/Industries" pages (Phase 5) are absorbed as a sub-section within Services rather than a separate top-level item, since Services is now clearly the secondary — not primary — nav destination and doesn't need its own top-level sibling competing with Products.

### Amendment to Phase 6 — CTA Strategy
The site-wide CTA hierarchy is now explicitly ranked, with exact labels locked:

| CTA Tier | Label | Leads To |
|---|---|---|
| Primary | **Explore Products** | Journey 1 |
| Secondary | **View Services** | Journey 2 |
| Supporting | **Explore Resources** | Journey 3 |

These three labels are now the standard CTA set for the Homepage and any other page (e.g., a future landing page) that needs to route a visitor into one of the three journeys rather than a page-specific action. Existing page-type-specific terminal CTAs from Phase 6 (Product Detail → "Add to Cart," Service Detail → "Request Proposal," etc.) are unaffected — those apply once a visitor is already inside a journey; this addendum governs the *entry point* into each journey.

### Homepage Content Sequence (Locked v1.2 — supersedes the original 6-question order below)
**Confirmed final section order:**
```
Hero
↓
Featured Products ⭐
↓
Why Nibrexo
↓
Agency Services
↓
How We Work
↓
Featured Portfolio
↓
Resources
↓
Testimonials
↓
FAQ
↓
Newsletter
↓
Final CTA
↓
Footer
```

**Change from the original v1.1 ordering:** the original 6-question sequence placed "Why trust Nibrexo?" immediately after Hero, before Products. This confirmed order moves trust-building ("Why Nibrexo") to directly after Featured Products instead. This is accepted as an improvement, not just a deviation: the Hero already carries an inline trust statement (Hero Specification §8 — "Instant download. Clear licensing. No surprises."), so trust isn't skipped early on, it's reinforced once the visitor has seen concrete product proof to attach that trust to — showing tangible value while attention is highest, then immediately answering "why should I believe this," is a defensible and commonly effective sequence.

**Priority weighting still applies exactly as before:** Featured Products carries the largest footprint/most prominent treatment of any content section; Agency Services (via Why Nibrexo → Agency Services → How We Work → Featured Portfolio) is substantial but secondary; Resources is a single, lighter-weight section reflecting its supporting-tier status. Testimonials functions as the page's proof/statistics moment (Layout §8's Statistics-before-FAQ pattern), positioned directly before FAQ as that pattern specifies. Newsletter and Final CTA are sequenced as two distinct, deliberately lower-key-then-high-key conversion moments — Newsletter captures Journey 3 (Resources/email) stragglers before the page's last, highest-weight CTA moment closes the page.

*(Original v1.1 ordering, retained for change-history only:)*
~~1. Who is Nibrexo? 2. Why trust? 3. Products 4. Services 5. Why different 6. Where next~~ — superseded by the confirmed order above.

This addendum is now locked as part of the permanent foundation. The Homepage has not been generated — per your instruction, this response only acknowledges and integrates the strategy.
