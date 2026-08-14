# NIBREXO — GLOBAL COMPONENT SYSTEM
### UI Component Standard v1.0
*This document extends Brand Identity v1.0 and Layout & Design Principles v1.0. It does not redefine color, type, spacing units, or grid — it defines how those tokens assemble into the reusable components every future page must use. No page should invent a one-off component variant; if a need isn't met here, it's a signal to extend this document first, not to freelance in a page file.*

---

## 0. HOW TO USE THIS DOCUMENT

- Every component below is a **contract**, not a suggestion — same states, same spacing logic, same naming, everywhere it appears.
- Components are organized by family. Each family opens with shared rules (the "belongs to the same design language" logic), followed by per-component specifics only where they diverge.
- Full note framework (Purpose / When to use / When not / Visual / Interaction / Accessibility / UX / Designer / Developer / Scalability / Business) is applied at the family level and to any component whose behavior is distinct enough to need it. Variants that only differ in a token value (color, size) are captured in tables instead of repeated prose — repetition would work against the "easy to scan" principle this whole system is built on.

---

## 1. FOUNDATIONAL COMPONENT TOKENS
*(Missing-standard flag: the brief didn't ask for this explicitly, but no component library holds together without it. Adding it here as the base layer everything else references.)*

| Token Category | Scale |
|---|---|
| **Sizing** (buttons, inputs, icons) | `sm` 32px · `md` 40px · `lg` 48px · `xl` 56px — height, not width |
| **Border Radius** | `sm` 8px (inputs, tags, small buttons) · `md` 12px (buttons, cards, dropdowns) · `lg` 16–20px (modals, large cards) · `full` (avatars, dots, pills) — matches Brand Identity §2 |
| **Elevation (shadow)** | `0` flat/none · `1` resting card (subtle, 2px blur) · `2` hover/raised · `3` dropdown/popover · `4` modal/dialog — each level roughly doubles blur+offset from the last, always in Graphite at low opacity, never pure black |
| **Z-Index** | `dropdown` 100 · `sticky-nav` 200 · `overlay` 300 · `modal` 400 · `toast` 500 — fixed scale, never arbitrary per-component values |
| **Motion** | Inherits Layout §9: 150–250ms micro, 300–400ms structural, ease-out on enter / ease-in on exit |
| **Focus Ring** | 2px solid Primary (`#2563EB`), 2px offset from element edge, visible on every interactive element without exception |

**Developer note:** These are the tokens every component spec below assumes. Implement as CSS custom properties or a design-token JSON source of truth — component code should never hardcode a shadow, radius, or z-index value directly.

---

## 2. BUTTONS

**Family purpose:** The primary mechanism for user action. Buttons carry more conversion weight than any other component — their hierarchy must be unambiguous at a glance.

**Shared rules across all button types:** height from the sizing scale (§1), 12px horizontal icon-to-label gap, minimum 44×44px touch target on tablet/mobile regardless of visual size, label is always a verb + outcome (per Brand Identity §8 voice rules), never all-caps beyond short tags.

### Primary Button
- **Purpose:** The single most important action in a given context — one per section, one per page for the page-level goal.
- **When to use:** Main conversion action ("Start your project," "Buy now").
- **When NOT to use:** More than once per section — if two actions feel equally important, that's a hierarchy problem to solve, not a reason to duplicate this style.
- **Visual:** Solid Primary (`#2563EB`) fill, White text, `md` radius (12px), Elevation 0 at rest.
- **Interaction:** Hover → fill shifts to Secondary (`#1E40AF`) + Elevation 1; Pressed → Elevation 0, slight fill darken; Focus → visible focus ring.
- **Accessibility:** White-on-Primary passes AA at button-text sizes (per Brand Identity §3); focus ring mandatory for keyboard users.
- **Business impact:** Because it's used sparingly, when it appears, users trust it's the important choice — diluting this by overuse directly reduces conversion clarity.

### Secondary Button
- **Purpose:** A meaningful but non-primary action that still deserves visual weight (e.g., "View pricing" next to a primary "Get started").
- **Visual:** Solid Secondary (`#1E40AF`) fill or a Graphite-outline with Graphite text — pick one system-wide (recommend: Graphite outline, White fill, to keep solid-fill exclusive to Primary and preserve its signal value).
- **Interaction:** Same states as Primary, scaled down in visual weight.

### Outline Button
- **Purpose:** Lower-emphasis actions that need to look like an action, not a link ("Learn more," "View details").
- **Visual:** 1.5px Graphite or Primary border, transparent fill, matching text color.
- **When NOT to use:** Never pair two outline buttons of equal weight side by side without a clear priority order — always accompany with a solid Primary/Secondary if a real choice is being presented.

### Ghost Button
- **Purpose:** The lowest-emphasis clickable action — dismissive or auxiliary actions ("Cancel," "Skip").
- **Visual:** No border, no fill, text-only in Graphite; underline or Primary color shift on hover only.
- **When NOT to use:** Never as the only action in a section — ghost buttons exist in contrast to a stronger action nearby, not alone.

### Icon Button
- **Purpose:** Compact actions where an icon alone is unambiguous (close, edit, favorite, menu).
- **Visual:** 40×40px default hit area, icon centered at 20px, `sm` radius or full circle for isolated actions (e.g., avatar-adjacent icons).
- **Accessibility:** Always requires `aria-label` — an icon alone is never sufficient for screen readers, no exceptions.

### Floating Action Button (FAB)
- **Purpose:** A single, persistent, high-priority action in dashboard/app contexts (future SaaS platform) — not used in marketing-site contexts.
- **Visual:** 56px circular, Elevation 2 at rest, Elevation 3 on hover, Primary fill.
- **When NOT to use:** Marketing/content pages — reserve for application/dashboard UI where a persistent action (e.g., "New project") benefits from always being reachable.

### Button Groups
- **Purpose:** Related actions presented together (e.g., view toggles, segmented filters).
- **Visual:** Connected radius logic — only the outer corners of the group use `md` radius, inner edges are flush (0px) so the group reads as one control, not stacked separate buttons.

### Button States (applies to every button type above)

| State | Visual Treatment |
|---|---|
| Default | Base style per variant above |
| Hover | Elevation +1, fill/border color shifts one step deeper (Primary → Secondary) |
| Focus | 2px Primary focus ring, always visible for keyboard nav, never removed via CSS |
| Pressed | Elevation returns to 0, fill darkens further, subtle scale to 0.98x max |
| Disabled | 40% opacity, no hover/pressed response, cursor: not-allowed, never removed from layout (avoid layout shift) |
| Loading | Label replaced by centered spinner at same button dimensions (no resize), button becomes non-interactive |
| Success | Brief (800–1200ms) checkmark icon swap in place of label, then reverts or navigates — never a permanent state |
| Error | Button returns to default state; error communicates via adjacent inline message, never by recoloring the button itself (keeps error meaning consistent across the system — see Feedback Components §6) |

**CRO note:** Loading state must never allow a second click to fire a duplicate action — disable interaction the instant loading begins, not after a debounce delay.

---

## 3. CARDS

**Family purpose:** The primary container for grouped, scannable content across the entire site — from a single feature to a full pricing plan.

**Shared rules:** `lg` radius (16px) default, Elevation 1 at rest, Elevation 2 on hover only when the card is itself clickable (never add hover elevation to a static/informational card — it falsely implies interactivity), internal padding 24px (32px for content-heavy cards like pricing), consistent card width within any single row/grid.

| Card Type | Purpose | Distinguishing Rule |
|---|---|---|
| **Feature Card** | Explain one product/service capability | Icon + heading + 1–2 line description max — never a paragraph |
| **Product Card** | Represent one purchasable digital product | Image/thumbnail top, price bottom-right, consistent aspect ratio across the grid |
| **Pricing Card** | Present one plan | Center plan (if any) gets Elevation 2 + Primary border by default to guide choice; never more than one visually "recommended" plan per pricing table |
| **Portfolio Card** | Show one case study/project | Image-dominant, minimal text overlay, hover reveals title/category only |
| **Blog Card** | Preview one article | Image, category tag, title, 1-line excerpt, read time — never author photo at grid-scale (adds noise at small size) |
| **Testimonial Card** | Build trust via a real quote | Quote first, attribution (name/role/company) below, avoid decorative giant quotation marks — let content carry weight |
| **Team Card** | Introduce a person | Photo, name, role — social links on hover only, not permanently visible (reduces clutter) |
| **Statistics Card** | Present one key number | Number is always the largest element on the card, label is secondary, never more than 4 stat cards in one row (cognitive limit) |
| **Dashboard Card** | Future SaaS data display | Header + content + optional footer action, consistent internal grid regardless of data type shown |
| **Empty Card** | Placeholder when no content exists yet | Icon + short explanation + single action (e.g., "No projects yet — Create your first one") — never a blank box |

**Card Hover Behaviour:** Only cards that lead somewhere (clickable) get hover treatment (Elevation lift + 2–4px translateY). Static/display cards (Statistics, Team without links) stay flat on hover.

**Card Hierarchy:** Within any grid, all cards are equal weight *unless* one is deliberately marked as recommended/featured (Pricing Card rule above) — never let inconsistent shadow/border treatment imply hierarchy that isn't intentional.

**Accessibility note:** If an entire card is clickable, the whole card must be a single focusable/interactive element (not a div with an onClick and a separately-tabbable link inside it) — this is one of the most common accessibility failures in card-based UIs.

---

## 4. FORMS

**Family purpose:** Every point of data collection — the highest-friction moment on the site, so clarity here has outsized business impact.

**Shared rules:** `sm` radius (8px), 40px default height (`md`), 16px internal horizontal padding, label always above the field (never placeholder-as-label — placeholders disappear on input and hurt usability/accessibility), 8px gap between label and field, 16px gap between distinct fields, 1.5px border in Graphite at 20% opacity default, Primary border + focus ring on focus.

| Field | Notes |
|---|---|
| **Input Field** | Base pattern all others extend from |
| **Textarea** | Fixed default height (~4 lines), user-resizable vertically only |
| **Checkbox** | 20×20px, `sm` radius, Primary fill when checked, label always clickable (not just the box) |
| **Radio Button** | 20×20px, full radius, same clickable-label rule as checkbox |
| **Toggle Switch** | Used for instant-effect binary settings only (not form submission choices — use checkbox for those), Primary fill when on |
| **Dropdown / Select Menu** | Matches input field height/border, chevron icon right-aligned, opens as Elevation 3 panel |
| **Search Box** | Icon-left, always includes a visible clear (×) action once text is entered |
| **Date Picker** | Opens as Elevation 3 calendar panel, never a native OS picker on desktop (breaks visual consistency) — native picker acceptable on mobile where OS pickers are expected/better UX |
| **File Upload** | Drag-and-drop zone + explicit "Browse" button (never drag-only — many users don't know they can drag) |
| **Password Field** | Always includes a visibility-toggle icon (eye icon), never auto-masks with no way to verify input |
| **Phone Field** | Country code selector + number, validates format on blur not on every keystroke |
| **OTP Field** | Individual boxed digits, auto-advances focus per digit, auto-submits on final digit only if explicitly confirmed with the user's product flow |

**Validation Rules:**
- Validate on blur, not on every keystroke (keystroke-level validation feels punishing and increases form abandonment)
- Re-validate on submit regardless of blur state, to catch anything missed
- Required fields marked with a subtle asterisk + `aria-required`, never color alone

**Error Messages:** Inline, directly below the field, in a consistent error color (a Graphite-adjacent red, to be added as a semantic token — see §14 missing-standard note), paired with an icon, specific and actionable ("Enter a valid email address," never just "Invalid").

**Success Messages:** Inline checkmark + brief confirmation text, or field border shifts to a semantic success color — never a full-page interruption for field-level success.

**Disabled State:** 40% opacity, cursor not-allowed, always paired with a reason if the disabling isn't self-evident (e.g., "Complete step 1 first").

**Accessibility note:** Every field requires a programmatically associated `<label>` (not just visual proximity), error messages must be linked via `aria-describedby`, and focus order must follow visual/logical order exactly.

---

## 5. NAVIGATION

**Family purpose:** Orientation and wayfinding — the system users rely on to trust they know where they are and where they can go.

| Component | Rule |
|---|---|
| **Top Navigation** | Sticky by default (see Sticky Navigation below), max 6 primary items before requiring grouping — more than that signals IA problems, not a nav-design problem |
| **Mega Menu** | Used only when a top-level item has 3+ meaningful sub-categories (e.g., future Marketplace); organized in columns with clear category headers, never a flat list of 20+ links |
| **Dropdown Navigation** | Simple single-column reveal for items with 2–6 children; opens on click (not hover-only) for accessibility and touch-parity |
| **Sidebar Navigation** | Reserved for future SaaS/dashboard and documentation contexts, not the marketing site; collapsible on tablet, off-canvas on mobile |
| **Breadcrumb** | Used on any page nested more than one level deep (docs, blog categories, product detail); Graphite text, Primary for the final/current (non-clickable) item |
| **Pagination** | Numbered for content archives (blog, docs); "Load more" or infinite scroll only for visual/discovery-driven grids (portfolio, product marketplace) — never mix both patterns on the same content type |
| **Tabs** | Used for switching between views of *related* content within the same context (never used as a substitute for actual page navigation — that breaks browser back-button expectations and SEO) |
| **Sticky Navigation** | Compresses slightly (reduced height/padding) after ~80px scroll to reclaim vertical space without disappearing |
| **Mobile Navigation** | Off-canvas full-height panel, not a small dropdown — mobile nav is a primary interaction, not an afterthought |
| **Search Navigation** | Persistent search icon in top nav on content-heavy contexts (docs, blog, marketplace); expands to a full search overlay, never a cramped inline input |

**SEO note:** Tabs and accordions that hide content via `display:none` at load can under-index that content — for anything SEO-critical (e.g., product descriptions, FAQ content), ensure content is present in the DOM and only visually collapsed, using accessible show/hide patterns rather than removal.

---

## 6. FEEDBACK COMPONENTS

**Family purpose:** Tell the user what just happened, is happening, or will happen — the system's honesty layer.

| Component | Purpose | Rule |
|---|---|---|
| **Alerts** | Persistent, page-level or section-level messages | Inline within content flow, semantic color-coded (info/success/warning/error), always dismissible unless blocking |
| **Toast Notifications** | Transient confirmation of an action | Top-right or bottom-center (pick one, system-wide), auto-dismiss after 4–6s, never used for anything requiring user action (use a Modal instead) |
| **Progress Bars** | Communicate determinate progress (upload, multi-step checkout) | Always paired with a percentage or step label — a bar alone without context creates anxiety, not reassurance |
| **Loading Spinner** | Indeterminate short waits (<2s) | Used sparingly — prefer Skeleton Loading for anything longer or layout-shaped |
| **Skeleton Loading** | Predictable-layout content still loading | Matches the actual shape/proportions of the content it's replacing — generic gray boxes that don't match final layout increase perceived load time |
| **Empty States** | No content exists yet | Icon + explanation + primary action — same pattern as Empty Card, applied at full-page scale |
| **Error States** | Something failed | Explain what happened in plain language, offer a clear next step (retry, contact support) — never a raw technical error message to the end user |
| **Success States** | Confirm completion of a meaningful action | Brief, celebratory but restrained (no confetti/heavy animation — inconsistent with brand calmness), clear next step offered |
| **Confirmation Dialog** | Gate a destructive or high-stakes action | Modal-based (see §9), requires explicit acknowledgment, destructive actions get a distinct semantic-error-colored confirm button, never Primary blue for a delete action |

---

## 7. SHOP COMPONENTS

**Family purpose:** The commerce layer — every component here has direct, measurable business impact on conversion and trust.

| Component | Rule |
|---|---|
| **Product Grid** | Consistent card aspect ratio (Product Card, §3), 3–4 columns desktop, 2 tablet, 1 mobile |
| **Product Filters** | Sidebar on desktop, collapsible drawer on mobile/tablet — never hidden behind an extra tap on desktop where space allows persistent visibility |
| **Category / Price / Rating Filter** | Consistent filter-control style (checkbox lists, range slider for price) — active filters always visible as removable tags above the grid, so the user never loses track of what's applied |
| **Sort Dropdown** | Top-right of grid, standard Dropdown component (§4), default sort always disclosed (e.g., "Featured") |
| **Wishlist Button** | Icon button, top-right corner of Product Card, toggles filled/outline heart, never requires a page navigation to register |
| **Add To Cart** | Primary Button style when it's the main action on a product page; Secondary/Outline when it's a secondary action within a grid card (avoid two Primary-weight actions per card) |
| **Quantity Selector** | Stepper pattern (–, number, +), inline with Add to Cart, min value enforced at 1 (or product-defined minimum) |
| **Shopping Cart** | Slide-in panel from the right by default (keeps user in flow without a full page navigation), full-page cart only at the final checkout step |
| **Coupon Field** | Collapsed/expandable ("Have a coupon?") rather than always-visible — an always-visible empty discount field visually implies the product is overpriced |
| **Checkout Progress** | Horizontal stepper, always shows total steps and current position, steps are labeled (not numbers alone) |
| **Order Summary** | Sticky on desktop during multi-step checkout, itemized, no surprise costs introduced at the final step (a major trust/abandonment factor) |
| **Invoice Preview** | Clean, print-optimized layout, follows the same typographic hierarchy as the rest of the brand (not a generic invoice template look) |
| **Download Button** | Distinct from Add to Cart — appears post-purchase, always paired with format/file-size info for digital products |
| **License Information Box** | Plain-language summary up front ("Personal use," "Commercial use — up to X projects"), full legal text available via expand/link, never legal-only text with no plain-language summary — this is a trust and conversion factor specific to a digital-product business |

**Business/CRO note:** For a digital-product store specifically, trust signals (secure checkout indicators, clear license terms, visible refund/support policy) belong near the purchase decision point, not buried in a footer link — this is a missing-standard addition given Nibrexo's business model.

---

## 8. CONTENT COMPONENTS

| Component | Rule |
|---|---|
| **Accordion** | Single-open or multi-open depending on context (FAQ = single-open recommended, to reduce visual sprawl; documentation = multi-open acceptable) — pick one behavior per context and stay consistent within it |
| **FAQ** | Built on Accordion pattern, questions phrased as the user would ask them (not marketing-voiced) |
| **Timeline** | Vertical on mobile always; vertical or horizontal on desktop depending on number of steps (horizontal only comfortable up to ~5 steps) |
| **Pricing Table** | Column-based, consistent feature-row alignment across all plans so comparison is scannable at a glance — misaligned rows are one of the most common pricing-table failures |
| **Comparison Table** | Sticky first column/header on scroll for wide tables, checkmark/x icons over text where possible for scan speed |
| **Feature List** | Icon + short label, never more than 6–8 items before requiring grouping or an accordion |
| **Statistics** | Large number, small label, per Card §3 rules when card-contained; standalone statistic blocks follow the same size hierarchy |
| **Logo Wall** | Grayscale/monochrome treatment by default (keeps focus on Nibrexo's palette, not competing brand colors), full color only on hover if interactive |
| **Testimonials** | Rotating carousel or static grid — carousel requires visible pagination dots and pause-on-hover, never autoplay without a pause control (accessibility requirement, not optional) |
| **Call-To-Action Blocks** | Follows Layout §8 CTA section rules — one primary action, generous surrounding space |
| **Newsletter Box** | Single email field + single action, explicit statement of what they're signing up for and frequency — never a bare "Subscribe" with no context |
| **Social Links** | Icon-only, consistent icon set (§ Brand Identity §6), grouped and equally spaced, never styled per-platform with brand-specific colors (breaks Nibrexo's palette discipline — use a single neutral treatment) |

---

## 9. MEDIA COMPONENTS

| Component | Rule |
|---|---|
| **Image Gallery** | Consistent grid or masonry (pick one system-wide), lazy-loaded below the fold |
| **Lightbox** | Dark-scrim overlay, image centered, close via ×, click-outside, and Escape key — all three, always |
| **Video Player** | Custom-styled controls matching brand (never bare native browser controls on marketing pages), captions/subtitles supported by default |
| **Image Comparison** | Before/after slider pattern for case studies/redesign work — draggable handle, keyboard-operable (arrow keys) for accessibility |
| **Hero Media** | Follows Layout §3 Hero Width rules; video heroes always muted-autoplay-looped with a visible pause control, never autoplay with sound |
| **Illustration Blocks** | Follow Brand Identity §5 illustration rules exactly — no exceptions per placement |

**Performance note:** All media components load via lazy-loading below the fold and serve responsive image sizes (`srcset`) — this is a Core Web Vitals and SEO factor, not just a nice-to-have, and directly affects the "fast" technical goal from the project brief.

---

## 10. MODALS

**Shared rules:** Elevation 4, `lg` radius (16–20px), dark-scrim backdrop (Graphite at ~60% opacity), centered, max-width 480px for auth/simple modals, closes via ×, click-outside (except for destructive-confirmation and payment-in-progress modals, which require explicit action), and Escape key.

| Modal | Rule |
|---|---|
| **Login / Register** | Single-column form, social-login options (if any) above the email/password divider, single Primary CTA |
| **Forgot Password** | Single field, single action, clear next-step messaging after submit (don't leave the user wondering if it worked) |
| **Newsletter** | Never triggered on page load with zero delay/scroll trigger — exit-intent or scroll-depth trigger only, to avoid feeling aggressive (undermines "trustworthy, calm" brand personality) |
| **Confirmation** | Short, states the consequence plainly, two clearly differentiated actions (confirm vs. cancel) |
| **Delete Warning** | Same as Confirmation, but confirm action uses the semantic error/destructive color, never Primary blue |
| **Success Dialog** | Brief, one clear next action (e.g., "Continue," "View order"), auto-focus on that action for keyboard users |

**Accessibility note:** Focus must move into the modal on open (to the first focusable element or the modal container), be trapped within the modal while open, and return to the triggering element on close — this is a hard requirement, not a nice-to-have.

---

## 11. SEARCH EXPERIENCE

| Component | Rule |
|---|---|
| **Search Bar** | Available from persistent nav (§5), expands to full-width overlay on activation |
| **Instant Search** | Debounced (250–300ms after typing stops) before querying, to avoid excessive requests and flicker |
| **No Results State** | Never a dead end — always suggest alternatives, popular items, or a "browse all" fallback |
| **Search Suggestions** | Shown as the user types, capped at ~5–6 to stay scannable |
| **Search History** | Optional, user-clearable, never shown without a clear way to remove individual or all entries (privacy consideration) |

---

## 12. ACCESSIBILITY (SYSTEM-WIDE STANDARDS)

These apply to every component above without exception:

- **Keyboard Navigation:** Every interactive element reachable and operable via Tab/Shift+Tab/Enter/Space/Escape/Arrow keys as semantically appropriate; logical tab order matches visual order.
- **Focus States:** Always visible (§1 Focus Ring token), never suppressed via `outline: none` without a replacement that meets or exceeds default visibility.
- **Touch Targets:** Minimum 44×44px on any touch-capable breakpoint, regardless of the element's visual size.
- **ARIA Support:** Semantic HTML first, ARIA roles/attributes only to fill genuine gaps (e.g., custom dropdowns, tabs, modals) — never ARIA as a substitute for correct base markup.
- **Screen Readers:** All meaningful content and state changes announced (loading, error, success) via appropriate live regions; decorative elements marked `aria-hidden`.
- **Color Contrast:** Every text/background and icon/background pairing meets WCAG AA minimum (4.5:1 normal text, 3:1 large text/UI) — cross-check against Brand Identity §3's flagged Support-color limitation before using it near any text.

---

## 13. RESPONSIVE BEHAVIOUR (COMPONENT-LEVEL)

Extends Layout §6 to the component layer specifically:

- **Desktop:** Full component set available, hover states active, multi-column card grids, persistent filters/sidebars.
- **Tablet:** Touch targets increase to 44px minimum, hover-dependent reveals (e.g., Team Card social links) gain a tap-equivalent, filter panels may collapse to a drawer.
- **Mobile:** Single-column card grids, off-canvas navigation/filters, sticky elements (nav, order summary) re-evaluated for necessary screen real estate — never stack multiple sticky elements that together consume more than ~20% of viewport height.

---

## 14. MICRO-INTERACTIONS

Extends Layout §9 (duration/easing) with component-specific interaction meaning:

| Interaction | Rule |
|---|---|
| **Hover** | Communicates "this is interactive" — subtle elevation/color shift only, per component rules above |
| **Click** | Immediate visual acknowledgment (pressed state) within one frame — no perceptible delay between click and feedback, even if the resulting action takes longer |
| **Focus** | Same visual language as hover but persistent until focus moves — never rely on hover styling to also serve as focus styling |
| **Loading** | Component-appropriate (button spinner, skeleton, progress bar) chosen per §6 rules — never a generic full-page blocking spinner for a component-level action |
| **Success / Error** | Consistent semantic color + icon language system-wide (see §15 missing-standard note on semantic color tokens) |
| **Selection** | Clear, immediate visual state change (checked, active tab, selected filter) — never dependent on color alone (pair with icon/weight change for colorblind users) |
| **Expansion / Collapse** | Smooth height animation (300ms, ease-out expand / ease-in collapse) with a rotating chevron/icon indicator, content never appears/disappears instantly without transition |

---

## 15. CONSISTENCY RULES

**Naming Convention:** `[family]-[variant]-[size]` (e.g., `button-primary-md`, `card-pricing-featured`) — applies across design files and code so designers and developers are always referencing the same component by the same name. No component exists under two different names in different files.

**Spacing Consistency:** Every component pulls padding/margin exclusively from the Layout §4 8px scale — component-level spacing is never a "special case" value.

**Sizing Consistency:** Every interactive element snaps to the §1 sizing scale (32/40/48/56px heights) — no component invents its own height.

**Typography Consistency:** Every text element within a component maps to a defined Brand Identity §4 type level — component text is never manually sized outside that scale.

**Missing-standard addition — Semantic Color Tokens:** The Brand Identity palette (§3 of that document) defines brand roles, but doesn't yet define **semantic** states (success/warning/error/info) needed throughout this component library (form validation, alerts, buttons, badges). Recommended additions, kept distinct from the brand palette so they're never confused with brand-expressive color:
- Success: a clean green (e.g., `#15803D`)
- Warning: a amber-adjacent but distinct tone from brand Accent, to avoid confusing "warning" with "brand emphasis" (e.g., `#B45309` is already claimed by Accent — recommend a separate `#D97706` or similar for warning specifically)
- Error/Destructive: a clear red (e.g., `#DC2626`)
- Info: reuse brand Primary (`#2563EB`) — informational state and brand trust color are naturally aligned

This should be ratified alongside this document since multiple components above (form validation, alerts, delete confirmations) depend on it.

---

## 16. THINGS TO AVOID

| Mistake | Why It Hurts | Prevention |
|---|---|---|
| **Inconsistent button hierarchy** (multiple Primary buttons per section) | Confuses the user about the intended action, dilutes conversion | One Primary per section/page context, enforced at design-review stage |
| **Placeholder-as-label in forms** | Fails accessibility, loses context once user starts typing | Always use persistent labels above fields |
| **Autoplay video/audio with sound** | Jarring, breaks trust and calm brand personality, accessibility violation | Muted autoplay only, explicit user action for sound |
| **Removing focus outlines without replacement** | Makes the site unusable for keyboard-only users | Focus ring token (§1) applied everywhere, never `outline: none` alone |
| **Color-only state indication** | Excludes colorblind users, unclear at a glance for everyone | Pair color with icon, weight, or text change |
| **Overusing modals for non-critical info** | Interrupts flow unnecessarily, feels aggressive | Reserve modals for genuinely blocking/critical interactions; use inline or toast otherwise |
| **Mismatched empty states (generic "No data")** | Feels broken/unfinished, dead-end for the user | Every empty state gets an explanation + next action, per §6 |
| **Card hover effects on non-clickable cards** | Falsely implies interactivity, erodes trust in the hover signal system-wide | Hover elevation reserved strictly for clickable cards |

---

## SENIOR REVIEW ADDENDUM — GAPS IDENTIFIED AND CLOSED

Reviewing this document as a cross-functional team before finalizing surfaced several gaps not explicitly requested in the brief but necessary for the system to actually hold together in production. These are folded into the sections above, and summarized here for visibility:

1. **Foundational tokens (§1)** — sizing, elevation, z-index, and motion scales didn't exist yet; every component below referenced them, so they had to be defined first.
2. **Semantic color tokens (§15)** — the brand palette has no success/warning/error/info colors, and forms/alerts/shop components can't function without them. Flagged as a decision needed from you, not silently invented as final.
3. **Trust/security signals for commerce (§7)** — the brief listed cart/checkout mechanics but not the trust layer (license clarity, no-surprise-cost checkout) that most directly affects conversion for a digital-product business specifically.
4. **Performance/Core Web Vitals note (§9)** — ties the component system back to the project's stated technical goal (fast, SEO-friendly), which a component library can either support or undermine depending on media-loading rules.
5. **SEO behavior of hide/show components (§5)** — tabs/accordions can accidentally hurt indexing if implemented carelessly; flagged explicitly since it's an easy, invisible mistake.
6. **Naming convention system (§15)** — without one, "consistency" is a wish, not a rule enforceable across a growing team.

### Still Open — Needs Your Decision
- **Semantic colors (success/warning/error/info):** confirm the suggested hex values in §15, or provide preferred ones.
- **Dark mode:** not addressed in this v1.0 — confirm whether Nibrexo needs a dark mode variant now or later; it changes how elevation/shadow tokens should be architected from the start even if not implemented immediately.
- **RTL/internationalization:** confirm if Nibrexo needs right-to-left language support for any target market (affects icon-button directionality, form field alignment) — cheaper to plan for now than retrofit later.

---

This document is now locked as v1.0, alongside Brand Identity v1.0 and Layout & Design Principles v1.0. Together, these three form the complete foundation. Once the open decisions above are confirmed, we're ready to move into actual page design — Homepage is the natural first candidate.
