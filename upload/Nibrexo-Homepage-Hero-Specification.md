# NIBREXO — HOMEPAGE: HERO SECTION SPECIFICATION
### Above-the-Fold Product Spec v1.0
*Scope: Hero section only. Builds directly on Brand Identity v1.0, Layout & Design Principles v1.0, Global Component System v1.0, Motion Design System v1.0, Foundation Finalization v1.1, and the Sitemap & User Journey Blueprint v1.0. Every recommendation below applies a decision already locked in those documents — nothing here introduces a new system-level rule. Do not proceed to the next homepage section until this is approved.*

---

## 1. HERO OBJECTIVE

Within 3–5 seconds, a first-time visitor should be able to answer: *what is this, is it credible, and what do I do next.* The Hero's single job is to convert uncertainty into a confident first click — not to explain the full business. Everything below is designed against that one objective; anything that doesn't serve it (an extra headline, a fourth CTA, a decorative flourish) is deliberately left out.

---

## 2. BUSINESS REASONING

Per the locked v1.1 Business Navigation Strategy, the Hero's job is to route visitors into one of three journeys, weighted by priority:
- **Primary:** Explore Digital Products (highest revenue priority)
- **Secondary:** View Services (high-value, lower-volume)
- **Supporting:** Explore Resources (long-cycle, SEO-driven)

The Hero achieves this through **CTA hierarchy, not through excluding Services from the message** — the headline and supporting copy speak to Nibrexo's overall quality/craft (which covers both Products and Services credibly), while the CTA cluster does the actual routing work, weighted correctly. This avoids a common mistake: trying to make the *headline* justify the priority order, which usually produces vague, trying-to-please-everyone copy. Hierarchy belongs in layout and CTA weight (Layout §7), not in diluted messaging.

---

## 3. UX STRATEGY — ANSWERING THE FIVE QUESTIONS

| Question | Answered By |
|---|---|
| Who are you? | Eyebrow label + brand wordmark (already in view via nav) |
| What do you do? | Headline + subheadline, naming both Products and Services plainly |
| Why should I trust you? | Microcopy trust statement near the CTA (§8) — proximity to the action point is deliberate, since trust needs to be present *at the moment of decision*, not just somewhere on the page |
| Why are you different? | Implied through tone and visual restraint themselves, not claimed outright — per Brand Identity's voice principle, "premium" is demonstrated, not asserted. No headline copy below claims to be different; the craft of the page does that work |
| What should I do next? | Primary CTA, visually dominant, positioned exactly where the eye lands after reading (§5) |

**Reducing uncertainty, creating curiosity without confusion:** The Hero commits to one clear headline claim rather than hedging across multiple ideas — ambiguity (not lack of information) is what creates hesitation. Curiosity is created by *specificity* ("thoughtfully built," not "revolutionary"), which invites the visitor to scroll and verify the claim, rather than by withholding information.

---

## 4. UI STRATEGY

Restrained, content-led, high-contrast-of-importance (one dominant element, everything else clearly secondary). No decorative graphics, no fake 3D, no heavy gradient — per the brief's explicit avoid-list, which is fully consistent with Brand Identity §2's shape language and Motion §11's already-scoped restraint on glow/gradient/glass. The Hero's premium feel comes from **spacing, type quality, and precision**, not from visual effects — directly applying Layout §11's "Premium Experience Through Spacing" reasoning to the highest-visibility section on the site.

---

## 5. RECOMMENDED LAYOUT

| Property | Specification |
|---|---|
| **Content Width** | Text column constrained to Layout §3's Hero Width rule — text content stays within the 1280px container; the hero visual (§9) may extend toward 1440px for atmosphere, per the same rule |
| **Hero Height** | `min-height: 85vh` on desktop (not a rigid 100vh) — full-viewport height often forces awkward whitespace on short/wide monitors and hides the scroll cue (§13) entirely; 85vh leaves the next section's top edge just barely visible, which itself functions as a scroll invitation. On mobile, height is content-driven (`auto`), never forced to a viewport percentage, since mobile viewport heights vary too much (browser chrome, notches) for a fixed vh value to be reliable |
| **Grid Structure** | 12-column grid (Layout §2), asymmetric split: text content spans columns 1–6/7, hero visual spans columns 7/8–12 — an intentional asymmetry per Layout §2's allowance for focal-point creation, not a rigid 50/50 split |
| **Content Alignment (horizontal)** | Left-aligned text — per Layout §5, centered text is reserved for single-message, no-competing-content moments; this Hero has a headline, subheadline, trust microcopy, and two CTAs, which reads better left-aligned and top-to-bottom than centered |
| **Text Alignment** | Left, ragged-right (never justified, per Layout §4 typography rules) |
| **CTA Placement** | Directly below the subheadline and trust microcopy, left-aligned with the text block — positioned exactly where the eye naturally lands after reading (Layout §7 reading-order logic), never floated separately from the copy that justifies it |
| **Visual Placement** | Right-hand column, vertically centered relative to the text block (Layout §5 default vertical-alignment rule) |
| **Spacing Rules** | Section padding: 128px top (96px if a persistent announcement bar exists above it — not currently scoped, no assumption made), 64px minimum bottom before the scroll-cue element; text-block internal spacing follows Layout §4 (32–48px between headline group and CTA group) |
| **Responsive Behaviour** | Desktop: side-by-side per above. Tablet (768–1199px): visual moves below text, both full-width within the 8-column grid. Mobile: fully stacked, visual below text, CTAs become full-width stacked buttons (not side-by-side — thumb-friendly, per Layout §6) |
| **Reading Flow** | Z-pattern (Layout §2): eyebrow (top-left) → headline → subheadline → CTAs (still left side) → visual (pulls the eye right, completing the Z) |
| **Visual Balance** | Text side is the "busy" side (multiple text elements); visual side is deliberately the "quiet" side (Layout §5's content-balance rule) — a single, restrained visual, not a busy composition, so the two sides read as balanced rather than competing |
| **Whitespace Strategy** | Generous — this is the site's single most important spacing-as-premium-signal moment (Layout §11). If a future stakeholder asks to add more elements above the fold, the correct answer is the same one already established in Layout §11: we'd be trading the thing that currently makes this feel premium for more information density |

---

## 6. COPYWRITING RECOMMENDATIONS

*(Directional copy for structure/tone approval — not final marketing copy, per placeholder-content confirmation.)*

**Eyebrow label:**
> Digital Products · Creative Design

**Hero Headline (H1):**
> Thoughtfully built digital products for brands that care about the details.

**Supporting Headline / Subheadline:**
> Nibrexo creates premium templates, tools, and creative work for founders and teams who don't want to compromise on quality — browse the store, or bring us your next project.

**Trust Statement (microcopy, positioned near the CTA cluster):**
> Instant download. Clear licensing. No surprises.

**Primary CTA:** Explore Products *(locked label, v1.1)*
**Secondary CTA:** View Services *(locked label, v1.1)*
**Optional Supporting Text/Link:** Or explore free resources → *(tertiary, text-link weight, routes to Journey 3 per v1.1 — deliberately not a third button, to avoid diluting the two-button CTA hierarchy)*

**Reasoning:** The headline makes one specific, checkable claim ("thoughtfully built... care about the details") rather than an unverifiable superlative — consistent with Brand Identity §8's voice rule against vague claims. The subheadline is the only place both Products and Services are named explicitly in plain language, which resolves the "make Services discoverable without competing with Products" requirement through wording rather than through equal visual weight.

---

## 7. CTA STRATEGY

| CTA | Component Mapping | Visual Weight |
|---|---|---|
| Explore Products | Primary Button (Component §2) | Solid Primary fill — the only solid-fill button in the Hero, reinforcing single-primary-action hierarchy (Layout §7) |
| View Services | Secondary/Outline Button (Component §2) | Outline, Graphite border — present and legible, clearly secondary |
| Explore free resources | Text link, not a button component | Lowest visual weight by design — Component §2's rule that ghost/link-level actions exist in contrast to a stronger nearby action, not as a third equal option |

This structure directly implements Foundation Finalization Phase 6/v1.1's CTA-tier system in its first real application.

---

## 8. TRUST STRATEGY

Per the brief's explicit constraint, no invented statistics, logos, or testimonials appear in the Hero. Trust is built through **specificity and clarity**, not borrowed credibility:

- **Professional Quality Promise:** implied by the headline's specific claim ("care about the details") rather than a separate badge/statement
- **Secure Digital Delivery / Clear Product Ownership:** stated directly in the trust microcopy ("Instant download. Clear licensing. No surprises.") — this is the one place a concrete, honest, non-invented claim belongs in the Hero, since it's operationally true from day one regardless of how many products exist yet
- **Transparent Communication:** reflected in the plain-language subheadline, not a separate element
- **Customer-Centric Approach / Future Scalability:** these are better demonstrated in the Features/Statistics sections further down the page (with real proof, once it exists) than asserted in the Hero — the Hero's trust job is narrower and more immediate: prove clarity and competence in the first few seconds, not carry the site's entire trust argument

---

## 9. HERO VISUAL STRATEGY

**Recommended direction: a curated, abstract composition of real product UI — not a raw screenshot, not a stock illustration, not a generic 3D render.**

**Reasoning:** Brand Identity §7 already establishes that Hero Images should prefer "abstract product visuals, UI compositions" over generic stock photography or literal renders — this Hero directly applies that rule rather than introducing a new one. Given Products is the highest-priority journey (v1.1), the single most effective visual is one that *shows* the product category concretely (interface previews, a few product cards, a device-frame composition per Component §7's mockup rules) rather than an abstract illustration that requires explanation. A brand illustration would be calmer but less concrete; raw UI mockups alone would feel like a screenshot dump; abstract-only composition (shapes/gradients) would look premium but say nothing about what's actually being sold. The curated-composition approach is the one option that is simultaneously on-brand (flat, geometric, restrained per Brand Identity §5), concrete (visitors immediately understand "this is a product store"), and differentiated (a specific, designed composition rather than a template stock hero).

**Composition guidance:** 2–3 layered product/UI previews at slightly offset depth (Brand Identity §5's 2–3-layer depth-via-layering rule), soft elevation shadow (Component §1's vertical, bottom-weighted UI shadow — not illustration-style directional lighting, per the Foundation Finalization Phase 1.5 distinction), optional single soft gradient glow behind the composition (Motion §11's one-per-page allowance, used here rather than saved for later, since the Hero is the highest-impact place to spend it).

---

## 10. MOTION STRATEGY

Directly applies Motion System §3 (Hero stagger) and §11 (Premium Details), not new rules:

| Element | Timing |
|---|---|
| Page entry | Fade+rise, standard page-load pattern (Motion §2) |
| Eyebrow reveal | 0ms delay |
| Headline reveal | 80ms delay |
| Subheadline reveal | 160ms delay |
| Trust microcopy + CTA cluster reveal | 240ms delay |
| Hero visual entrance | 120ms delay, slightly longer duration (larger element, per Motion §1's "heavier elements move slower" principle), parallel to the text stagger rather than after it |
| Button interaction | Component §2 states — hover elevation+color shift (150ms), press (100ms scale to 0.98) |
| Primary CTA hover | Subtle magnetic effect (Motion §11) — scoped specifically to this button, per the existing rule that magnetic effects are reserved for true hero-level primary CTAs only |
| Scroll indicator | Slow, subtle opacity pulse (~2s cycle, matching Motion §11's "live indicator" restraint level) — a small downward chevron or line, not an animated bouncing arrow (bouncing reads as a dated, over-eager pattern) |
| Loading behaviour | Hero visual reserves its aspect-ratio space before load (§14) — no layout shift as it resolves in; if the visual takes any perceptible time to load, it fades in rather than popping in (Motion §7) |

**Reduced-motion fallback:** Entire stagger sequence collapses to a single near-instant (≤50ms) opacity change per Motion §12 — all content appears essentially at once, nothing is lost informationally, since the stagger is a delivery style, not a source of information.

---

## 11. ACCESSIBILITY NOTES

- **WCAG:** Headline (Graphite on White/Background) passes AAA; body/subheadline text passes AA at minimum; Primary Button (White on Primary Blue) passes AA at button-text size, per Brand Identity §3's already-verified pairs — no new contrast pair is introduced here that hasn't already been checked
- **Keyboard Navigation:** Tab order follows visual/reading order exactly — eyebrow (non-interactive, skipped) → headline (non-interactive) → Primary CTA → Secondary CTA → supporting text link → (then into page nav for the next section)
- **Focus States:** Standard 2px Primary focus ring (Component §1) on both CTA buttons and the text link, no exceptions
- **Readable Typography:** Headline at Display size (64px desktop/36px mobile per Brand Identity §4) with -2–3% tracking; subheadline at Body Large (18px) — both within already-established, tested type levels
- **Accessible Buttons:** Both CTAs meet the 44×44px minimum touch target on mobile/tablet (Component §12), have clear, descriptive labels (no "Click here"), and are real `<button>`/`<a>` elements, never divs with click handlers
- **High Contrast:** No text sits directly on the Support-tint background if used near the hero visual glow — text remains on White/Background tokens exclusively, per the Brand Identity §3 flagged limitation of the Support color
- **Reduced Motion Support:** Per §10 above — fully respected, no exceptions

---

## 12. SEO NOTES

- **H1 Strategy:** The Hero Headline is the page's single H1 — exactly one per page, no exceptions. It should naturally include the core concept ("digital products") without keyword-stuffing; the current draft ("Thoughtfully built digital products for brands that care about the details") does this without reading as SEO-copy-first, matching Brand Identity §8's natural-language voice rule
- **Supporting Heading Structure:** The Subheadline is **not** marked up as an H2 — it's a styled paragraph (`<p>` with a large-body-text style). Making it an H2 with no subsequent heading-structured content directly beneath it creates an orphaned, empty-feeling heading hierarchy; the real H2s belong to the Features/Services/Resources sections further down the page, which haven't been designed yet
- **Keyword Placement:** Primary concept ("digital products") appears in the H1; secondary concept ("creative design"/"services") appears in the eyebrow label and subheadline — natural placement, not forced repetition
- **Meta Description Intent:** Not authored here (belongs to page `<head>`, not the Hero component), but should echo the Hero's core claim — a future meta description should center on "premium digital products and creative design services," matching what the Hero actually promises, since a mismatched meta description hurts click-through and bounce metrics alike
- **Semantic Structure:** `<section>` with an `aria-label` or heading-based landmark, H1 inside it, CTAs as real interactive elements — no semantic surprises

---

## 13. PERFORMANCE NOTES

- **Fast Loading:** Hero is the page's Largest Contentful Paint (LCP) candidate — the hero visual and headline text must be prioritized, not deferred
- **Minimal Layout Shift:** Hero visual container reserves its exact aspect-ratio space before the asset loads (CSS `aspect-ratio`), preventing any CLS as it resolves in
- **Optimized Images / Modern Formats:** Hero visual served as WebP/AVIF with a JPEG fallback, correctly sized `srcset` per breakpoint — never a single oversized image scaled down by CSS
- **Explicit exception to the general lazy-loading rule (Motion §9):** the Hero visual is **above the fold and must NOT lazy-load** — it should be preloaded/priority-loaded, the opposite treatment from every other image on the page. This is worth stating explicitly since the system's default rule (lazy-load images below the fold) would be actively wrong if misapplied here
- **Responsive Media:** Correctly sized per breakpoint, not simply scaled
- **Lightweight Motion:** Entrance stagger and CTA hover use only `transform`/`opacity` (Motion §13) — no layout-triggering properties animated

---

## 14. RESPONSIVE BEHAVIOUR

Summarized from §5, restated for clarity:
- **Desktop (≥1200px):** Side-by-side text/visual split, full stagger sequence, magnetic CTA hover active
- **Tablet (768–1199px):** Stacked (text above visual), full-width within 8-column grid, touch targets increase to 44px, magnetic hover effect has no touch equivalent (simply omitted, not replaced — per Motion §12, hover-only decorative effects don't need a forced touch substitute when they carry no functional information)
- **Mobile (320–767px):** Fully stacked, content-driven height (not vh-based), CTAs stack full-width vertically (Secondary CTA below Primary, not side-by-side), scroll cue may be omitted on mobile where the next section is already partially visible without it

---

## 15. DEVELOPER NOTES

- Build the text/visual split using the 12-column grid tokens already defined (Layout §2) — asymmetric column-span, not a custom flexbox ratio invented for this section alone
- All spacing pulls from the 8px scale (Layout §4) — no one-off pixel values
- Hero visual composition should be implemented as an SVG or a small set of optimized raster images with CSS-driven layering/shadow (Component §1 elevation tokens) — avoid a single flattened hero image, which would prevent independent loading/animation of the layered elements and hurt LCP flexibility
- Stagger sequence implemented via CSS animation-delay on a shared entrance class, not individually hand-timed JS — keeps the pattern reusable for every future section reveal (Motion §3) built the same way
- Reduced-motion fallback implemented via a single `prefers-reduced-motion` media query overriding the stagger delays to near-zero, not a duplicated no-motion component variant

---

## 16. FUTURE SCALABILITY

- The eyebrow + headline + subheadline + dual-CTA structure is reusable as the template pattern for any future top-of-page hero (SaaS marketing page, Marketplace landing page, Academy landing page) — only the copy and CTA labels change, not the structure
- The hero visual's "curated composition, not a single flat image" approach scales naturally — as new product categories or the SaaS/AI/Marketplace modules launch, the composition can rotate or update its featured previews without any structural redesign
- CTA hierarchy (one primary, one secondary, one tertiary link) is the same three-tier pattern already locked site-wide (v1.1) — any future page needing to route into multiple journeys reuses this exact pattern rather than inventing a new CTA arrangement

---

## SENIOR REVIEW — WEAKNESSES IDENTIFIED AND RESOLVED BEFORE FINALIZING

1. **Initial draft risk:** making the Hero visual literally load lazily by default (inheriting the site-wide rule blindly) would have hurt LCP — caught and explicitly reversed in §13.
2. **Initial draft risk:** marking the subheadline as an H2 for "semantic completeness" would have created an orphaned heading with no following H2-structured content — caught and corrected in §12, subheadline is a styled paragraph instead.
3. **Initial draft risk:** giving Services equal button weight to Products in the CTA row would have contradicted the v1.1 priority mandate even while technically "making it discoverable" — resolved by keeping Services as a clearly secondary (outline, not solid) CTA rather than a second solid button.
4. **Initial draft risk:** a fully bouncing/looping scroll-indicator animation was considered and rejected — it reads as a dated, slightly desperate pattern inconsistent with "calm, confident" brand personality; replaced with a slow opacity pulse.
5. **CRO consideration:** the trust microcopy was deliberately placed adjacent to the CTA cluster rather than higher in the hero — trust statements are most effective at the exact moment of decision, not earlier in the reading flow where they'd just be general reassurance with no immediate action to attach to.

---

This Hero specification is ready for your review. Per your instruction, no other homepage section has been started. Once approved (as-is or with revisions), the next section — Features or Product Highlights, per the Homepage Content Sequence locked in Foundation Finalization v1.1 — is ready to spec.
