# NIBREXO — HOMEPAGE: FINAL SECTIONS SPECIFICATION (CORRECTED)
### Resources & Learning · Testimonials · FAQ · Newsletter & Community · Final CTA · Footer
*Supersedes the previous "Sections 6–10" document, which incorrectly omitted Resources & Learning. This document follows the confirmed, permanent v1.2 order exactly: Featured Portfolio → **Resources & Learning** → Testimonials → FAQ → Newsletter & Community → Final CTA → Footer. No architecture, journey, or CTA decision from any prior document is altered here — two minor, flagged, easily-reversible extensions are noted inline where this brief asked for something not previously specified.*

---

## SECTION 6 — RESOURCES & LEARNING

**Purpose:** Introduce the supporting pillar (Journey 3) directly after the strongest proof section (Featured Portfolio), while remaining the visually lightest of the three pillar-representing sections on the page — consistent with v1.1's "Resources must remain the lightest-weight" rule.

**Hierarchy:** No single "featured" article given elevated treatment. This is a deliberate choice, not an oversight: giving one piece of content a larger, feature-style card would increase this section's visual weight relative to Featured Products (4 cards) and Agency Services (3 cards), working against the locked priority order. Instead: **one flat row of 3 cards**, each representing a different content type — one Blog post, one Guide, one Free Resource — so the section demonstrates the full breadth of Resources without elevating any single piece.

**Card Layout (Blog Card pattern, Component §3, extended):**
- Thumbnail image
- Small type tag ("Blog," "Guide," or "Free Resource") — replaces a separate featured/category treatment, communicates variety directly on the card
- Title (H3-level)
- One-line excerpt
- Read time (Blog/Guide) or "Free download" indicator (Free Resource) in place of read time

**Recommended CTA:** **"Explore Resources"** — reusing the exact locked label from v1.1, text-link weight (the lowest of the three CTA tiers established site-wide), positioned after the 3-card row.

**Lead-Generation Strategy:** The Free Resources card in this row links directly to that resource's dedicated landing/email-gate page (Journey C's entry point), not to a generic Resources hub — this section is one of the two homepage entry points into Journey 3 (the other being Newsletter & Community, §9), and both should route as directly as possible into the same funnel rather than adding an extra click.

**SEO Benefits:** Direct homepage links into Blog and Guides content reinforce the pillar-and-cluster internal-linking model (Phase 6) from the site's highest-authority page; fresh, rotating content here gives search engines a reason to recrawl the homepage more frequently than a fully static page would.

**Future Expansion:** As Blog/Guides/Free Resources content grows, the 3 cards are a manually curated, rotating selection (same pattern as Featured Products and Featured Portfolio) — no structural change required as the underlying libraries scale into the hundreds.

---

## SECTION 7 — TESTIMONIALS

**⚠ Launch Dependency:** No real testimonials exist yet. Per the no-invented-content rule (locked since the Hero), this section is fully specified structurally but contains no fabricated names, companies, quotes, or ratings. See the consolidated Launch Dependencies section at the end of this document.

**Layout:** Static grid, not an autoplay carousel — with a realistically small initial testimonial count (2–4 at launch), a carousel would imply more proof exists than actually does. Revisit carousel format once the library exceeds ~6 quotes.

**Number of Cards:** 2–3 visible at once.

**Card Hierarchy:** Quote is the dominant element (largest text); attribution (name, role, company) is secondary, smaller weight, positioned below the quote — never the reverse, since the quote itself is what does the persuading.

**Avatar Placement:** Small (40–48px), circular, positioned beside the attribution line, not above the quote — avatars are a supporting trust cue, not a headline element. If a real photo isn't available for a given testimonial, use initials-based placeholder avatars (Component System pattern), never a stock/generic headshot, which would itself read as a small trust violation.

**Navigation:** None needed at launch-scale card counts (2–3 fits without pagination). If the format later shifts to carousel (per the future-scalability note above), navigation follows Component §8's existing carousel rules: visible pagination dots, pause-on-hover, no autoplay without a pause control.

**Mobile Behaviour:** Single-column stack, full-width cards.

**Future Scalability:** Grid absorbs additional testimonials as rows without any layout change; the carousel-conversion threshold (~6+) is the only structural trigger point to plan for.

---

## SECTION 8 — FAQ

**⚠ Launch Dependency:** Licensing, refund, usage-rights, download, support, account, and payment answers must be verified against actual finalized policy before publishing — placeholder question set only, see Launch Dependencies.

**Question Categories (unchanged from prior draft, reaffirmed):** Licensing, Refunds, Usage Rights, Downloads, Support, Account, Payment — Products-related questions ordered first, reflecting the same priority weighting used throughout the page.

**Accordion Behaviour:** Single-open pattern (Component §8), 300ms/250ms expand/collapse (Motion §5), chevron rotation indicator.

**Accessibility:** Each question is a `<button>` with `aria-expanded` state; answer panels use `aria-hidden`/height-based reveal (not `display:none` removal, preserving SEO indexability per Phase 7's earlier accordion/SEO note); focus order follows visual order; keyboard-operable via Enter/Space.

**Search Support:** Not required at launch scale (6–8 questions is easily scannable without it). **Future scalability recommendation:** once the FAQ list grows past roughly 12–15 items, add a lightweight filter/search input above the accordion (reuses the Search Box component, Component §4) rather than letting the list grow indefinitely — flagged as a future trigger point, not a launch requirement.

**Future Expansion:** New questions add as additional accordion rows; category grouping (e.g., visual sub-headers for "Products," "Services," "Account") becomes worth adding once the list exceeds ~10 questions, to keep it scannable — same trigger point as the search recommendation above.

---

## SECTION 9 — NEWSLETTER & COMMUNITY

**Framing note (flagged above):** This section is a newsletter signup. "Community" in the section name reflects tone/aspiration in copy only — no forum, discussion feature, or member system is being specified or implied here, consistent with the Sitemap Blueprint's earlier finding that Community needs its own dedicated scoping before any real feature work.

**Purpose:** Capture visitors not ready to convert today; the homepage's second (and final) entry point into Journey 3, alongside Resources & Learning (§6).

**Headline:**
> Stay in the loop

**Supporting Copy:**
> Get new products, design resources, and the occasional deep-dive — straight to your inbox. Nothing else.

*(Deliberately avoids "join our community" as a literal claim, per the framing note above — "stay in the loop" promises exactly what the section delivers: an email list, not a platform.)*

**Input Layout:** Single email field + single button, inline side-by-side on desktop/tablet, stacked full-width on mobile (Component §4 standard input pattern).

**CTA Hierarchy:** One action only — "Get Updates" (Primary Button weight, but small/compact sizing, since this remains the page's deliberately lower-key conversion moment ahead of Final CTA, per the v1.2 lower-key-then-high-key sequencing).

**Privacy Reassurance:** Micro-copy directly beneath the field:
> No spam. Unsubscribe anytime. See our [Privacy Policy].

**Success State:** Inline replacement of the form with a brief confirmation message (Component §9/Motion §9 pattern) — no modal, no page navigation, consistent with how Newsletter success is already specified system-wide.

**Future Automation Readiness:** Signup capture should tag the source context (e.g., "homepage-newsletter" vs. a specific Free Resources gate) at the data layer — this directly supports the still-open Free Resources → Product Recommendations personalization item flagged in two previous documents. Not a design decision, a data-architecture note worth keeping attached to this section so it isn't lost by the time Resources is actually built.

---

## SECTION 10 — FINAL CALL TO ACTION

*(Unchanged from the prior draft — reaffirmed here for completeness within the corrected document.)*

**Headline:**
> Ready to see what you can build?

**Supporting Copy:**
> Browse the store, or talk to us about something custom.

**Primary CTA:** Explore Products
**Secondary CTA:** Or view services *(text-link weight, not a second button)*

**Visual Treatment:** Full-width solid Primary/Secondary color block, White text — the one deliberate high-contrast interruption on an otherwise White-dominant page, reserved for the single most consequential remaining moment.

**Trust Reinforcement:** No new trust claim introduced here — this section's job is to convert trust already built by every prior section into one final action, not to argue the case again.

**Motion:** Standard fade+rise entry only — no additional embellishment, consistent with Motion §9's restraint principle for consequential moments.

---

## SECTION 11 — FOOTER

**Structure (5 elements — flagged extension from the locked 4-column model, per the note above):**

| Element | Contents |
|---|---|
| **Brand Area** | Logo, one-line tagline, social links row (Component §8, monochrome treatment) |
| **Products** | Browse Products, Pricing |
| **Services** | *(New column, flagged above)* Our Services, Portfolio, Book a Consultation |
| **Resources** | Blog, Guides, Free Resources |
| **Company** | About, Contact, **Support/FAQ** *(Support folded in here rather than as a separate column, per the flagged resolution above)*, Careers |
| **Legal** | Privacy, Terms, Refund Policy, License, Cookies, Disclaimer *(kept as its own column, unchanged from the locked structure — not demoted to a bottom bar)* |

**Newsletter Shortcut:** A compact, single-field signup (not the full Newsletter Box from §9) — appropriate here since a visitor reaching the footer without signing up at §9 is unlikely to convert from a second full ask; the shortcut exists for genuinely footer-first visitors (e.g., those who came from a shared link and scrolled straight down), not as a repeated pitch. **Homepage-specific note (reaffirmed from the prior document):** since this page already has a dedicated Newsletter section above, keep this shortcut minimal — email field + small button, no restated value-prop copy — to avoid the section feeling redundant.

**Copyright:** Bottom bar, standard `© [Year] Nibrexo. All rights reserved.`

**Back-to-Top:** Small, unobtrusive button/link in the footer's bottom-right — appears only after the visitor has scrolled past a threshold (e.g., past the Hero), not visible on initial page load.

**Visual Direction:** Dark surface (Graphite background), unchanged from the prior specification — the footer and Final CTA remain the only two sections departing from the White/Background canvas.

**Motion:** No scroll-reveal animation, unchanged.

**Future Expansion:** Every future module (SaaS, Academy, Marketplace) adds a link within an existing column (or, if truly warranted, its own future column) — the 6-element structure above is designed to absorb that growth without a footer redesign.

---

## SCROLL EXPERIENCE

| Between | Transition Logic | Motion |
|---|---|---|
| **Featured Portfolio → Resources & Learning** | Proof of work → a lighter-weight pivot toward long-term value (content, not another sales pitch) — deliberately lowers the page's intensity after five sections building toward and proving the two main pillars | Standard fade+rise, no stagger delay beyond the normal 3-card entrance |
| **Resources & Learning → Testimonials** | Content pivot → back to proof, specifically social/emotional proof this time | Standard fade+rise |
| **Testimonials → FAQ** | Emotional proof resolved → practical objections resolved next | Section-level fade+rise only |
| **FAQ → Newsletter & Community** | Objections resolved → soft, low-pressure ask before the final hard ask | Simple fade+rise, deliberately unremarkable |
| **Newsletter & Community → Final CTA** | Soft ask → hard ask, the page's clearest escalation moment | Fade+rise; the color-block visual (§10) carries the attention-shift, not motion |
| **Final CTA → Footer** | Conversion moment closes → clean handoff to site infrastructure | No reveal animation — absence of motion signals persuasion has ended |

**Governing note:** every transition in this batch reuses the same fade+rise language already locked system-wide — consistent with the calm, premium reading rhythm established since the Hero, and with Motion §1's "choose the simplest applicable effect" rule.

---

## COPYWRITING

Professional, clear, human, trustworthy — consistent with Brand Identity §8 throughout this document. No hype language appears in any headline or CTA above ("stay in the loop," not "join our exclusive community"; "ready to see what you can build," not "unlock your potential"). FAQ and Testimonials remain the two sections where copy accuracy matters more than persuasive polish, as noted in the prior draft.

---

## RESPONSIVE DESIGN

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Resources & Learning | 3-column grid | 3-column (tighter gutters) or 1-column if card content requires it | 1-column stack |
| Testimonials | 2–3 column grid | 2-column or 1-column depending on quote length | 1-column stack |
| FAQ | Single centered column (680px) | Same, full-width within margins | Same, full-width within margins |
| Newsletter & Community | Inline field + button | Same | Stacked, full-width |
| Final CTA | Centered, generous padding | Same | Centered, full-width CTA |
| Footer | 6-element multi-column layout | 2–3 column layout, Brand Area spans full width above the nav columns | Single-column stacked; nav columns may collapse to accordions if list length warrants it |

---

## ACCESSIBILITY

- **Heading Hierarchy:** H2 per section (including "Resources & Learning," restoring the level skipped by the earlier omission), H3 for card titles and FAQ questions — no skipped levels anywhere in this batch
- **Keyboard Navigation:** FAQ accordion (Enter/Space), Newsletter field/button, Footer links, and Back-to-Top all follow standard tab order matching visual order
- **Accordion Accessibility:** `aria-expanded`, `aria-controls`, and visible focus state on every FAQ trigger, per §8 above
- **Newsletter Form Accessibility:** Email field has a programmatically associated `<label>` (visually hidden if the placeholder-as-label anti-pattern is avoided via a compact inline design — the label still exists in the DOM), error/success states communicated via `aria-live` region
- **Focus States:** Standard 2px Primary focus ring on every interactive element in this batch, no exceptions
- **Touch Targets:** All CTAs, FAQ triggers, footer links, and Back-to-Top button meet 44×44px minimum
- **Reduced Motion:** All entrance animations in this batch collapse to near-instant opacity change under `prefers-reduced-motion`, consistent with Motion §12 — no exceptions introduced by these six sections

---

## SEO

- **Internal Linking:** Resources & Learning cards link into Blog/Guides/Free Resources hubs; Footer is the page's highest-density internal-link section, reaching every major hub site-wide (Products, Services, Resources, Company/Support, Legal)
- **FAQ Schema:** Once real content is finalized, mark up with `FAQPage` structured data — strong candidate for rich-result eligibility given the licensing/refund/process question set
- **Article Schema:** Not directly applicable to the homepage itself, but the Blog/Guide cards in Resources & Learning should link to pages that carry `Article`/`BlogPosting` schema on their own detail pages — noted here as a downstream dependency, not a homepage-level requirement
- **Footer Hierarchy:** Footer nav uses `<nav>` landmarks with appropriate labeling per column, reinforcing the site's full IA to crawlers from the page most likely to be indexed and linked-to externally
- **Search Discoverability:** FAQ content (once verified) is genuinely useful, naturally keyword-relevant text (licensing, refunds, timelines) — no keyword-stuffing needed, the content itself does the work

---

## BUSINESS STRATEGY

| Section | Customer Trust | Email Growth | Digital Product Sales | Agency Lead-Gen | SEO Authority | Long-Term Brand Growth |
|---|---|---|---|---|---|---|
| Resources & Learning | Supports | Indirect driver (routes to §9/lead magnets) | Indirect, long-cycle | Indirect | Primary driver | Primary driver |
| Testimonials | Primary driver | — | Supports | Supports | — | Supports |
| FAQ | Primary driver | — | Direct (removes purchase friction) | Direct (removes engagement friction) | Supports | — |
| Newsletter & Community | Supports | Primary driver | Indirect, long-cycle | Indirect | — | Primary driver |
| Final CTA | — | — | Primary driver | Secondary driver | — | Supports (consistent close) |
| Footer | Supports (transparency/legal access) | Minor (shortcut) | Indirect (navigation) | Indirect (navigation) | Supports | Supports |

---

## LAUNCH DEPENDENCIES

*Consolidated as its own section, per instruction — nothing here is hidden inside another part of the document.*

- **Real Testimonials** — names, companies, quotes, ratings (Testimonials section, §7)
- **Verified FAQ Answers** — licensing, refunds, usage rights, downloads, support, account, payment (FAQ section, §8)
- **Final Refund Policy** — referenced by both FAQ and Legal footer link
- **Licensing Details** — referenced by FAQ, and previously by Why Nibrexo's differentiation copy
- **Multi-Currency Decision** — flagged in the Foundation Finalization audit, still unresolved, affects Products/Pricing display sitewide, not specific to this batch of sections but worth restating here since it hasn't been closed
- **Final Payment Providers** — affects Checkout trust signals and potentially FAQ's Payment question
- **Legal Verification** — Privacy Policy, Terms, Refund Policy, License, Cookies Policy, Disclaimer content itself (footer links exist structurally; the underlying legal text does not yet)
- **Free Resources → Product Recommendations Personalization Logic** — flagged across three prior documents now; needed before Resources & Learning's lead-gen loop (§6) and Newsletter's automation readiness (§9) can fully function as specified
- **Community Scoping** — if "Community" is ever meant to become a real feature rather than a tone/framing choice, it needs its own dedicated scoping session (per the Sitemap Blueprint audit) before any design work begins

---

## QUALITY REVIEW

1. **Corrected the Resources omission** — confirmed against the locked v1.2 order and re-verified in the source document (Foundation Finalization) before writing this specification, rather than trusting memory of the previous (flawed) draft.
2. **Resources & Learning's lack of a "featured" treatment** was a deliberate CRO/hierarchy decision, not an underspecified default — explicitly reasoned in §6 against the priority-weighting rule.
3. **Footer's Services/Support placement** was flagged rather than silently decided, per this brief's explicit instruction — resolved with reasoning, easily reversible if you'd prefer a different column arrangement.
4. **"Community" framing risk** — caught before any section content implied a real community feature exists; resolved by treating it as tone/copy only and cross-referencing the still-open Sitemap audit finding.
5. **Newsletter shortcut vs. full Newsletter section redundancy** — re-confirmed from the prior document's reasoning, kept consistent rather than re-litigated.

---

This completes the Homepage specification: Hero, Featured Products, Why Nibrexo, Agency Services, How We Work, Featured Portfolio, Resources & Learning, Testimonials, FAQ, Newsletter & Community, Final CTA, and Footer — twelve sections, matching the confirmed v1.2 order exactly. No implementation or code generated, per instruction. Waiting for approval before moving to Homepage UI Production.
