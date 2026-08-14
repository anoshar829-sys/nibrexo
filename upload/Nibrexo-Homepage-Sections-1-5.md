# NIBREXO — HOMEPAGE: SECTIONS 1–5 SPECIFICATION
### Featured Products · Why Nibrexo · Agency Services · How We Work · Featured Portfolio
*Builds on the finalized Hero (v1.0) and the locked v1.2 Homepage Section Sequence. Covers only the five sections requested. Testimonials, FAQ, Newsletter, Final CTA, and Footer are not started, per instruction.*

---

## THE CONTINUOUS STORY

Before the section-by-section detail, the throughline these five sections are built to carry:

**Hero** establishes *who and what* → **Featured Products** proves it concretely while attention is highest → **Why Nibrexo** answers *why this and not an alternative* now that the visitor has something real to evaluate → **Agency Services** widens the offer without competing with what was just shown → **How We Work** de-risks that wider offer by explaining process → **Featured Portfolio** proves the process actually produces results. Each section exists to answer the specific uncertainty the previous section would otherwise leave open — that's the "continuous conversation," not a stylistic device layered on top of five independent blocks.

---

## SECTION 1 — FEATURED PRODUCTS

**Purpose:** Convert the Hero's promise into visible proof, immediately, while curiosity is highest. This is the highest-priority section on the page (v1.1/v1.2) and should read that way structurally, not just in copy.

**Ideal number of featured products: 4.** Reasoning: 3 reads as sparse for a "premium ecosystem" claim; 6+ starts to feel like an exhaustive list rather than a curated selection, which undercuts the "featured" framing and adds page weight before trust is even established. 4 fills a clean 2×2 or 4-across grid at every breakpoint without an awkward remainder row.

**Visual Hierarchy:**
1. Section eyebrow + H2 (e.g., "Featured Products") — smallest weight, sets context
2. One-line section intro (optional, only if it adds something the H2 doesn't already say — otherwise omit; an empty-calorie intro line is exactly the kind of clutter Brand Identity §8 warns against)
3. Product grid — the section's dominant visual mass
4. "View All Products" CTA — positioned after the grid, not floated separately

**Product Card contents (per Component System §3, extended for this context):**
- Product image (consistent aspect ratio across all 4)
- Category label (small, above the product name — e.g., "UI Kit," "Template") — this replaces a separate category-filter UI. Homepage is curation, not filtering; filtering belongs on the Products page itself
- Product name (H3-level)
- One-line benefit (not a description — "Ship a landing page in an afternoon," not a feature list)
- Price
- Optional badge (**New** or **Bestseller** only) — used only where genuinely true. No manufactured urgency badges ("Only 3 left," countdown timers) — this would directly contradict the "no invented statistics/trust theater" principle already locked for the Hero and extends naturally to the whole page

**CTA:** "View All Products" — **Primary button weight**, not secondary. Reasoning: this is a deliberate, considered exception to "one primary CTA per section" caution — this section's entire purpose is advancing the top-priority journey, so reinforcing it with full visual weight here is consistent with, not a violation of, the site's priority hierarchy. It should still be visually distinct from the Hero's "Explore Products" (same intent, different context/copy) so it doesn't feel like an exact repeat.

---

## SECTION 2 — WHY NIBREXO

**Deliberate rhythm choice:** Section 1 was dense (a 4-item grid). Per Layout §10's breathing-pattern rule, this section must be the "open" counterpart — lower density, more whitespace, no card grid. This is a content/trust section, not a product section, and should look different enough that the visitor feels the page taking a breath.

**Headline direction (avoiding generic claims):**
> Not the fastest way to launch. The right way.

*(Directional, not final — the point is specificity over superlative. Avoid anything a competitor could paste onto their own homepage unchanged — "premium quality," "unmatched excellence," etc. This headline works because it makes an actual claim: speed isn't the differentiator, craft is.)*

**Supporting copy — three short differentiators, not a paragraph:**
1. **Designed in-house, not resold.** Every product starts as an original design, not a licensed or flipped asset.
2. **Built by people who run an agency.** The same team that designs for paying clients builds what's in the store — the bar doesn't move.
3. **Clear ownership, always.** What you buy is yours to use — no confusing tiers, no surprise restrictions.

*(These three specifically counter the most common skepticism about a "digital product store" — that it's a reseller marketplace with vague licensing. This is differentiation grounded in something checkable, not asserted.)*

**Visual Direction:** No product imagery repeated here (already shown in Section 1) and no stock-style illustration. Recommend a restrained **3-column icon + statement layout** — one small Lucide icon per differentiator, no card borders/backgrounds, generous horizontal spacing between the three. This is editorial, not componentized — it should read more like a considered statement than another feature grid, reinforcing the rhythm shift.

**Layout:** Centered section heading, then the 3-column statement row below it, generous top/bottom section padding (Layout §4's upper spacing range, since this is a "quiet" section).

**Trust Elements:** The three differentiators above *are* the trust elements — this section deliberately doesn't add a separate trust badge row, which would be redundant with what the copy already establishes and would reintroduce visual density right after asking for a breathing moment.

---

## SECTION 3 — AGENCY SERVICES

**What deserves preview:** Three core service categories, not the full services catalog (which lives on the Services page itself). Recommend the three broadest, most legible categories — e.g., **Brand Identity, Web Design, Product Design** — rather than niche/specific offerings a first-time visitor wouldn't have context for yet.

**Card count: 3.** Matches the curated-not-exhaustive pattern already set by Featured Products (4) and will be echoed by Featured Portfolio (3, below) — consistent restraint, not an arbitrary number.

**Card format:** Feature Card (Component §3), not Product Card — no price, no "add to cart" affordance; icon or minimal illustration + service name + one-line description + text-link-weight "Learn more," not a button (keeps this section's total visual weight below Section 1's, per the locked priority hierarchy).

**Recommended Section CTA:** **"View Services"** — reusing the exact locked label from the Hero (v1.1), not a new phrase. Consistency here matters: a visitor who skipped the Hero CTA gets a second, identically-worded chance, which is more effective than making them parse a differently-worded option and wonder if it goes somewhere different.

**How services connect to products (without competing):** A single line of framing copy above the three cards resolves this directly through wording rather than layout tricks:
> Need something templates can't cover? Our team designs it from scratch.

This explicitly positions Services as the answer to a need Products *doesn't* meet, rather than an alternative to it — the two pillars stay complementary, not competitive, exactly as the framing requirement asked for.

**Visual weight vs. Section 1:** Smaller grid (3 cards vs. 4), no product-style imagery-heavy cards, shorter section height overall — the section should visibly read as "substantial but secondary" the moment a visitor scrolls into it, without needing to read any copy to sense that.

---

## SECTION 4 — HOW WE WORK

**Step count: 4.** *(Discover → Design → Build → Deliver.)* Reasoning: 3 steps can feel too thin for a custom agency engagement (undersells the process); 5+ starts to feel like a sales-heavy methodology slide. 4 is enough to convey real process without becoming a wall of steps to read through.

**Visual Style:** Horizontal timeline on desktop (Component §8 Timeline — comfortably supports up to ~5 steps horizontally), collapsing to a vertical stacked timeline on tablet/mobile. A thin connecting line runs beneath/behind the four steps, reinforcing "process," not just "a list of four things."

**Icons vs. Illustration:** **Icons** (Lucide, per the locked icon library), not illustrations. Brand Identity §5's own guidance is that illustration is reserved for abstract concepts that need visual explanation — a 4-step process with clear, self-explanatory labels doesn't need that weight. An icon per step keeps this section light and fast-reading, consistent with the "reduce uncertainty quickly" mission stated in this brief.

**Interaction:** Steps reveal with the standard staggered entrance (Motion §3 pattern, ~60–80ms delay per step) as the section scrolls into view; the connecting line can draw in alongside the stagger (a simple width/scale transition, not a separate complex animation) to reinforce the sense of sequence. No hover-triggered reveal-on-demand — all four steps should be visible and scannable immediately, since hiding process steps behind interaction would work against the section's trust-building purpose.

**Reasoning for this section's existence:** This directly serves the *Services* uncertainty specifically — "how does working with an agency actually work" is a real, common hesitation for custom/consultative offers in a way it isn't for a self-serve product purchase (already resolved by Section 1's instant-delivery framing). Positioning this section right after Agency Services, not earlier, ties the reassurance to the exact moment it's needed.

---

## SECTION 5 — FEATURED PORTFOLIO

**How projects appear:** Portfolio Card (Component §3) — image-dominant, hover reveals title/category overlay, no visible text block below the image by default (keeps the section visually calm and let the work speak first).

**Card count: 3.** Same curated-selection reasoning as Sections 1 and 3 — a homepage preview should feel like a highlight reel, not an archive.

**Preview Style:** Large, high-quality project imagery, consistent aspect ratio across all three, subtle image scale-on-hover (Motion §6, 1→1.02–1.03 max) as the only interaction — no autoplay video, no carousel, keeping this section simple relative to the more information-dense sections before it.

**Filtering:** **None.** Filtering by category/industry belongs on the full Portfolio page, not the homepage — introducing filter controls here would add interactive complexity to a section whose entire job is a quick, confident glance at quality, not a browsing task.

**CTA:** "View Full Portfolio" — Outline/Secondary button weight, positioned after the three cards, consistent with this section's role as proof-of-Services rather than a primary conversion moment in its own right.

**Future Scalability:** As the actual case-study library grows, the featured 3 are a manually curated (not automatically "most recent") selection — this keeps the homepage always showing the strongest available work rather than whatever happens to be newest, and requires no component or layout change as the underlying Portfolio page scales.

---

## SECTION TRANSITIONS

| Between | Why This Order | Scroll Feel | Motion's Job |
|---|---|---|---|
| **Hero → Featured Products** | Curiosity from the Hero needs to be resolved with something concrete fast — this is the single most important transition on the page | Should feel immediate — no long empty scroll-gap, Featured Products should already be partially visible near the bottom of the Hero's viewport as an implicit "there's more" cue | Standard staggered grid entrance (Motion §3) — nothing more elaborate; the transition's job is proven by content, not motion |
| **Featured Products → Why Nibrexo** | Dense → open, per Layout §10's rhythm rule — this is the page's first deliberate "exhale" | Should feel like a pace change, not just a new section — achieved through the density/whitespace contrast itself, not through a different motion style | Simple fade+rise (Motion §3 standard pattern) — motion stays consistent even as visual density changes, so the *content* signals the pace shift, not a novelty transition effect |
| **Why Nibrexo → Agency Services** | Trust established → now widen the offer | Should feel like a natural "and there's more" rather than an abrupt topic change — the framing line ("Need something templates can't cover?") does this work in copy | Standard fade+rise, no stagger needed for the framing line itself, staggered entrance for the 3 service cards |
| **Agency Services → How We Work** | Introducing a custom/consultative offer immediately raises "how does this work" — answered right away rather than left open | Should feel like the page is anticipating the visitor's next question, reinforcing the "reduces uncertainty" mission | Staggered step entrance (Motion §3/§4), connecting-line draw-in |
| **How We Work → Featured Portfolio** | Process claim needs proof immediately after being made, while it's still fresh | Should feel like the payoff of the previous section, not a new topic | Standard staggered card entrance, no special transition effect — the strongest thing this transition has going for it is the work itself |

**Governing motion note across all five sections:** every transition reuses the same core entrance language (fade+rise, staggered per Motion §3) already locked system-wide — no section invents a new animation style. Variety across this page comes from **layout and density**, not from a growing library of different scroll effects — directly consistent with Motion §1's "if more than one effect could apply, choose the simplest" rule and the explicit avoid-unnecessary-effects instruction in this brief.

---

## COPYWRITING TONE

Consistent with Brand Identity §8 throughout: direct, specific, no buzzwords ("revolutionize," "seamless," "unlock," "game-changing" appear nowhere above). Trust is built through **specific, checkable claims** ("designed in-house, not resold") rather than superlatives ("the best digital products"). Every headline in this document makes an assertion a competitor couldn't paste onto their own site unchanged — that's the practical test being applied throughout, not just a stated principle.

---

## RESPONSIVE DESIGN

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Featured Products | 4-column grid | 2-column grid | 1-column stack |
| Why Nibrexo | 3-column icon/statement row | 3-column, tighter gutters, or stacks to 1 column if type sizing requires it (test at build time) | 1-column stack |
| Agency Services | 3-column card row | 3-column or 1-column depending on card content length (test at build time — this is a build-time judgment call, not a foundation-level rule to force in advance) | 1-column stack |
| How We Work | Horizontal 4-step timeline | Horizontal if space allows, otherwise vertical (test against actual step-label length) | Vertical stacked timeline |
| Featured Portfolio | 3-column grid | 2-column grid (one card wraps) or 1-column, whichever avoids an awkward single-card orphan row | 1-column stack |

All sections inherit Layout §6's general rules (single-column stacking by default on mobile, 44px touch targets, section spacing reduces to 64px) — the table above only calls out per-section column-count specifics that aren't already covered generically.

---

## ACCESSIBILITY

- **Reading Order:** DOM order matches visual order exactly in every section and at every breakpoint — no CSS-only reordering that would desync sighted scanning from keyboard/screen-reader order (Layout §2 accessibility note, reapplied here)
- **Keyboard Navigation:** Every card that leads somewhere (Product, Service, Portfolio cards) is a single focusable element per Component §3's accessibility rule — not a div with a separately-tabbable link buried inside
- **Touch Targets:** All CTAs and cards meet the 44×44px minimum on tablet/mobile without exception
- **Heading Hierarchy:** H1 (Hero, already set) → H2 per section ("Featured Products," "Why Nibrexo," "Agency Services," "How We Work," "Featured Portfolio" or their final marketing-copy equivalents) → H3 for individual item titles within each section (product names, service names, step names, project titles) — no heading level is skipped anywhere on the page
- **Color Contrast:** All text uses already-verified token pairs (Foundation Finalization Phase 2) — no new color combination is introduced by any of these five sections

---

## SEO

- **Heading Hierarchy:** As above — this gives the page a clean, crawlable outline: one H1, five H2s, multiple H3s, exactly matching what a search engine (and a screen-reader user navigating by heading) would want
- **Internal Links:** Every Product Card → its Product Detail page; every Service Card → its Service Detail page; every Portfolio Card → its Case Study Detail page; every "View All"/"View Services"/"View Full Portfolio" CTA → its respective hub page — this is Phase 6's pillar-and-cluster model getting its first concrete application, with the homepage itself acting as an additional strong internal-link source pointing into every major hub
- **Keyword Opportunities:** "Premium digital products" and specific product-category terms (Section 1), "creative design agency" and specific service names — Brand Identity, Web Design, Product Design (Section 3) — occur naturally within card labels and headings rather than being forced into paragraph copy, which is both better SEO practice and consistent with the natural-language voice rule
- **Content Hierarchy:** Matches the visual hierarchy exactly — nothing is styled to look more important than its actual heading level, and nothing is marked up at a heading level that doesn't match its visual weight (a discipline worth stating explicitly, since it's a common, easy-to-miss inconsistency)

---

## BUSINESS REASONING PER SECTION

| Section | Digital Product Sales | Agency Leads | Brand Authority | Future Expansion |
|---|---|---|---|---|
| **Featured Products** | Direct, primary driver — this section's entire job | Indirect (demonstrates quality bar) | Demonstrates craft immediately | Grid/card pattern scales to hundreds of products without redesign |
| **Why Nibrexo** | Supports by resolving marketplace-reseller skepticism | Equally supports Services credibility | Primary purpose of this section | Differentiator copy is reusable across future SaaS/AI/Marketplace positioning with minor edits |
| **Agency Services** | Minor halo effect (proves the team behind the products is credible) | Direct, primary driver | Supports (shows range beyond templates) | New service categories slot into the same 3-card pattern; the featured 3 can rotate |
| **How We Work** | Minimal direct impact | Directly reduces engagement friction/hesitation | Supports (process transparency reads as confidence) | Reusable template for any future consultative offering (e.g., SaaS onboarding/implementation) |
| **Featured Portfolio** | Minor halo effect | Direct proof supporting the Agency Leads goal | Strong — third-party-feeling proof (even without invented testimonials) | Card pattern absorbs unlimited future case studies; featured selection is curation, not a structural limit |

---

## QUALITY REVIEW — WEAKNESSES IDENTIFIED AND RESOLVED

1. **Initial risk:** giving "View All Products" only Secondary weight, mechanically following the general "one primary CTA per section" rule, would have under-served the single highest-priority journey on the page. **Resolved:** explicitly justified as a deliberate exception in Section 1, not a silent rule-break.
2. **Initial risk:** placing a trust-badge row under Why Nibrexo's three differentiators, in addition to the differentiators themselves, would have reintroduced density immediately after asking for a breathing moment. **Resolved:** the three differentiators are treated as the trust elements; no redundant badge row.
3. **Initial risk:** using different CTA copy ("Browse Services" vs. Hero's "View Services") would have created unnecessary label drift for the same destination. **Resolved:** Section 3 explicitly reuses the locked Hero label.
4. **Initial risk:** adding portfolio filtering to match the "premium, feature-rich" instinct would have added interactive complexity to the page's calmest, most confidence-building section. **Resolved:** explicitly excluded, with reasoning, in Section 5.
5. **CRO check:** every section's CTA weight (Primary/Secondary/Outline/text-link) was cross-checked against the locked priority hierarchy (Products > Services > Resources) — no section's CTA outranks a higher-priority section's CTA anywhere on this page.
6. **Motion check:** confirmed no section introduces a new transition style beyond fade+rise/stagger — avoids exactly the "growing library of scroll effects" failure mode Motion §1 warns against.

---

These five sections are specified and ready for review. Per your instruction, Testimonials, FAQ, Newsletter, Final CTA, and Footer have not been started. Waiting for approval before continuing.
