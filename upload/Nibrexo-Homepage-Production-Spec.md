# NIBREXO — HOMEPAGE: PRODUCTION-LEVEL SPECIFICATION
### Resources & Learning · Testimonials · FAQ · Newsletter · Final CTA · Footer
*Continues from the approved Hero (6A) and Homepage Core Story (6B — Featured Products through Featured Portfolio). Confirmed section order unchanged. Two flagged, low-stakes conflicts with the prior (not-yet-approved) draft are resolved inline below — see note above. No architecture, order, or journey decision is altered.*

---

## SECTION 1 — RESOURCES & LEARNING

**Purpose:** Educational authority, SEO growth, lead generation, and long-term audience-building — the supporting pillar (Journey 3), positioned directly after Featured Portfolio and kept the visually lightest of the three pillar-representing sections on the page (v1.1).

**Content:**
- **Featured article:** one of three cards carries a small "Editor's Pick" badge — content distinction only, no size/layout elevation (see flagged resolution above)
- **Latest guides / Learning cards:** the remaining two cards draw from Guides and Blog, giving the row genuine content variety rather than three of the same type
- **Free resources:** if a lead-magnet resource is currently available, it takes one of the three card slots; if none exists yet, the row uses Blog + Guide + Guide instead — never an empty or placeholder-labeled card slot
- **Category navigation:** static type tag per card ("Blog," "Guide," "Free Resource") — no interactive filter/tab control (see flagged resolution above)

**CTA Hierarchy:** "Explore Resources" (locked v1.1 label), text-link weight — the lowest of the three CTA tiers site-wide, unchanged from prior reasoning.

**Business Notes:** Zero direct revenue by design; ROI is organic traffic and email-list growth that feeds back into Products over a longer horizon (Journey C). The Editor's Pick badge gives content team a lightweight way to promote strategically relevant content without a CMS change.

**UX Notes:** Positioned as a pace-lowering pivot after five sections of Products/Services proof — content here should read as "worth your time," not "buy this."

**UI Notes:** Flat 3-card row, Blog Card component pattern (Component §3), consistent aspect ratio, Editor's Pick badge is the only card-level visual differentiator.

**Motion Notes:** Standard fade+rise entrance, staggered per-card (60–80ms), no additional motion for the badge itself — it's a static label, not an animated callout.

**Accessibility Notes:** Cards are single focusable elements (Component §3 rule); Editor's Pick badge includes text content, not an icon-only/color-only indicator, so it's conveyed to screen readers and doesn't rely on color perception.

**SEO Notes:** Direct homepage links into Blog/Guides reinforce the pillar-and-cluster model (Phase 6) from the highest-authority page on the site; rotating content gives search engines a reason to recrawl the homepage more often.

**Developer Notes:** Card selection (including which item gets the Editor's Pick badge) should be a CMS-editable field, not hardcoded — this is content the team will want to rotate without a deploy.

**Future Scalability Notes:** Grid absorbs unlimited future Blog/Guide/Resource growth as manually curated rows; Editor's Pick is a single boolean flag on whichever three items are selected, requiring no structural change as the underlying libraries scale.

---

## SECTION 2 — TESTIMONIALS

**⚠ Launch Dependency:** No real testimonials exist. Structure fully specified; no fabricated names, companies, quotes, or ratings appear anywhere below.

**Layout:** Static grid (2–3 cards), not autoplay carousel — a carousel would imply more proof exists than a realistic launch-scale quote count supports. Revisit at ~6+ quotes.

**Card Hierarchy:** Quote is the dominant text element; attribution (name, role, company) is secondary and smaller, positioned below.

**Avatar Placement:** Small (40–48px), circular, beside the attribution line — never above the quote. Initials-based placeholder avatars where a real photo isn't available; never a generic stock headshot.

**Navigation:** None required at launch card counts. If/when the format shifts to carousel, Component §8's existing rules apply (visible pagination, pause-on-hover, no unpausable autoplay).

**Business Notes:** Primary trust-driver on the page alongside Featured Portfolio; supports both Product Sales and Agency Leads depending on which pillar a given quote addresses.

**UX Notes:** Should feel like the natural continuation of Featured Portfolio's proof — visual work, then verbal validation of it, back to back.

**UI Notes:** Light card with subtle border (Component §3 default), distinct from Why Nibrexo's borderless editorial treatment earlier on the page, so this section reads unambiguously as "evidence."

**Motion Notes:** Standard fade+rise, no stagger needed for 2–3 items.

**Accessibility Notes:** Avatar images carry `alt` text identifying the person by name, not a generic "avatar" label; quote text is real text content, never an image of text.

**SEO Notes:** Review-adjacent structured data (`Review`/`AggregateRating` schema) is a candidate once real, verifiable testimonials exist — flagged as a future opportunity, not something to implement against placeholder content.

**Developer Notes:** Build the card as a reusable component accepting quote/name/role/company/avatar as data fields from day one, even while empty — avoids a rebuild once real content arrives.

**Future Scalability Notes:** Grid absorbs additional testimonials as rows; carousel conversion is the only structural trigger point to plan for.

---

## SECTION 3 — FAQ

**⚠ Launch Dependency:** All policy-related answers (Licensing, Refunds, Downloads, Support, Usage Rights, Payments, Accounts) remain placeholders until formally verified against the Legal Documentation. FAQ.docx exists as a strong, internally consistency-checked candidate source (cross-referenced against both Detailed and Summary policy versions with no contradictions found) — but formal verification is a business/legal sign-off, not something this specification can complete on its own.

**Structure:** Single-open accordion (Component §8), question categories ordered Products-first (Licensing, Refunds, Downloads) then Support/Account/Payments, matching the page's established priority weighting.

**Business Notes:** Directly reduces purchase hesitation (Products) and engagement hesitation (Services); one of the two sections on the page (with Testimonials) where accuracy matters more than persuasive polish.

**UX Notes:** Positioned correctly per Layout §8 — after proof (Testimonials), before the final asks (Newsletter, Final CTA) — resolving practical doubts right when they'd otherwise linger into the closing sections.

**UI Notes:** Single centered column at Reading Width (680px); no card treatment — accordion rows only.

**Motion Notes:** Section-level fade+rise on entry, no per-item stagger; 300ms/250ms expand/collapse per item (Motion §5).

**Accessibility Notes:** Each question is a `<button>` with `aria-expanded`; answer panels use height-based reveal (not `display:none` removal) to stay indexable; full keyboard operability (Enter/Space).

**SEO Notes:** `FAQPage` structured data is a strong candidate once content is verified — flagged as a build-phase task contingent on the Launch Dependency above, not implemented against placeholder text.

**Developer Notes:** Build the accordion to source question/answer pairs from a CMS field or JSON, so verified legal content can be dropped in without a template change.

**Future Scalability Notes:** Once past ~12–15 questions, add a lightweight search/filter (Component §4 Search Box) and category sub-headers — not needed at launch scale.

---

## SECTION 4 — NEWSLETTER

**Framing confirmed:** email growth only — no forum, no UGC, no community platform implied or designed, consistent with the earlier Sitemap audit finding that Community needs its own dedicated scoping first.

**Headline:** Stay in the loop
**Supporting Copy:** Get new products, design resources, and the occasional deep-dive — straight to your inbox. Nothing else.
**Input Layout:** Single email field + single button, inline on desktop/tablet, stacked full-width on mobile.
**CTA Hierarchy:** One action only ("Get Updates"), compact Primary-weight button — deliberately lower-key than Final CTA, per the established sequencing.
**Privacy Reassurance:** "No spam. Unsubscribe anytime. See our Privacy Policy." — links to the Summary Privacy Policy per the Legal Content Governance Rule, which itself links to the Detailed version (once the missing-link gap flagged earlier is resolved).
**Success Message:** Inline form replacement with brief confirmation text — no modal, no navigation.

**Business Notes:** Primary email-growth driver on the page; indirect, long-cycle support for Product Sales via Journey C.

**UX Notes:** The page's deliberately quietest, lowest-pressure moment — should not compete visually with Final CTA immediately after it.

**UI Notes:** Centered, generous whitespace, no card/border treatment.

**Motion Notes:** Standard fade+rise, no embellishment.

**Accessibility Notes:** Email field has a programmatically associated label; success/error states communicated via `aria-live` region; button meets 44×44px touch target.

**SEO Notes:** Not directly SEO-relevant (form-based, not indexable content) — its value is downstream (nurtured subscribers becoming future organic-content readers/customers).

**Developer Notes:** Signup should tag source context (e.g., "homepage-newsletter") at the data layer to support the still-open Free Resources personalization item flagged in prior documents.

**Future Scalability Notes:** Same form structure supports future automated sequences (welcome series, product-launch announcements) without a redesign — a backend/ESP integration concern, not a UI one.

---

## SECTION 5 — FINAL CTA

**Headline:** Ready to see what you can build?
**Supporting Copy:** Browse the store, or talk to us about something custom.
**Primary CTA:** Explore Products
**Secondary CTA:** Or view services *(text-link weight)*

**Business Notes:** Primary conversion driver for the page's last opportunity; mirrors the Hero's exact CTA structure and priority order, closing the page the same way it opened.

**UX Notes:** No new trust argument introduced here — converts trust already built by every prior section into one final action.

**UI Notes:** Full-width solid Primary/Secondary color block, White text — the one deliberate high-contrast interruption on an otherwise White-dominant page.

**Motion Notes:** Standard fade+rise only — Motion §9's restraint principle for consequential moments; no additional embellishment.

**Accessibility Notes:** White-on-Primary/Secondary text re-verified against semantic tokens (this and Footer are the only two sections breaking from the White/Background canvas); CTA button meets all standard focus/touch-target requirements.

**SEO Notes:** Not a content-indexing concern; internal link value (→ Products, → Services) reinforces the pillar model same as any other CTA.

**Developer Notes:** Reuse the Hero's CTA component instance/styling directly rather than a new one-off — enforces the intentional visual echo.

**Future Scalability Notes:** Same three-tier CTA pattern (Primary/Secondary/text-link) is reusable as the closing section for any future landing page (SaaS, Marketplace, Academy).

---

## SECTION 6 — FOOTER

**Structure (confirmed, matches your specified column list exactly):**

| Element | Contents |
|---|---|
| **Brand** | Logo, one-line tagline, social links |
| **Products** | Browse Products, Pricing |
| **Services** | Our Services, Portfolio, Book a Consultation |
| **Company** | About, Contact, Support/FAQ, Careers *(Support remains here, as instructed)* |
| **Resources** | Blog, Guides, Free Resources |
| **Legal** | Privacy, Terms, Refund Policy, License, Cookies, Disclaimer |
| **Social** | Icon row within Brand area |
| **Copyright** | `© [Year] Nibrexo. All rights reserved.` |
| **Back-to-top** | Small button, appears after scrolling past the Hero, bottom-right |

No additional columns beyond this list — matches your "do not create unnecessary columns" instruction exactly, and reaffirms the same structure already reasoned through in the prior draft.

**Business Notes:** Trust infrastructure (legal transparency, company info) supporting every other section's credibility; highest internal-link density on the site.

**UX Notes:** Signals "end of page" architecturally (dark surface, per below) as well as through content — a visitor shouldn't need to read anything to sense they've reached the bottom.

**UI Notes:** Dark surface (Graphite background) — the only other section besides Final CTA departing from the White/Background canvas.

**Motion Notes:** No scroll-reveal animation — by the time a visitor reaches the footer, further reveal ceremony reads as excessive.

**Accessibility Notes:** `<nav>` landmarks per column with proper labeling; Back-to-top button is keyboard-operable and meets touch-target minimums; legal links have clear, non-ambiguous link text (never bare "here").

**SEO Notes:** Footer nav reinforces full site IA to crawlers from the page most likely to receive external inbound links; every major hub (Products, Services, Resources, Company, Legal) gets a direct link.

**Developer Notes:** Footer is a single shared component across every page site-wide, with the homepage-specific newsletter-shortcut omission (already flagged in the prior draft) as its only page-conditional variation.

**Future Scalability Notes:** Every future module (SaaS, Academy, Marketplace) adds a link within an existing column before any new column is considered — protects the "keep it clean" instruction indefinitely.

---

## RESPONSIVE DESIGN

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Resources & Learning | 3-column grid | 3-column, tighter gutters | 1-column stack |
| Testimonials | 2–3 column grid | 2-column or 1-column | 1-column stack |
| FAQ | Centered 680px column | Full-width within margins | Full-width within margins |
| Newsletter | Inline field + button | Same | Stacked, full-width |
| Final CTA | Centered, generous padding | Same | Centered, full-width CTA |
| Footer | 6-element multi-column | 2–3 column, Brand spans full width above nav | Single-column stacked |

---

## ACCESSIBILITY (CROSS-SECTION)

Keyboard navigation, focus states, and 44×44px touch targets apply without exception across all six sections. FAQ accordion uses `aria-expanded`/`aria-controls`. Newsletter form uses proper `<label>` association and `aria-live` for status messages. All entrance animations collapse to near-instant opacity change under `prefers-reduced-motion`, per Motion §12, with no exceptions introduced by this batch.

---

## SEO (CROSS-SECTION)

- **FAQ Schema:** `FAQPage` structured data, contingent on formal content verification (Launch Dependency)
- **Article Schema:** Not applied at the homepage level — Resources & Learning cards link to Blog/Guide detail pages, which should carry `Article`/`BlogPosting` schema on those pages themselves
- **Internal Linking:** Footer remains the page's highest-density internal-link section; Resources & Learning and every CTA reinforce the pillar-and-cluster model established in Phase 6
- **Structured Data Opportunities:** `Review`/`AggregateRating` for Testimonials once real content exists; `FAQPage` for FAQ once verified — both explicitly deferred, not implemented against placeholders

---

## BUSINESS STRATEGY SUMMARY

| Section | Trust | SEO | Email Growth | Product Sales | Agency Leads | Long-Term Authority |
|---|---|---|---|---|---|---|
| Resources & Learning | Supports | Primary | Indirect driver | Indirect | Indirect | Primary |
| Testimonials | Primary | — | — | Supports | Supports | Supports |
| FAQ | Primary | Supports (pending verification) | — | Direct | Direct | — |
| Newsletter | Supports | — | Primary | Indirect | Indirect | Primary |
| Final CTA | — | — | — | Primary | Secondary | Supports |
| Footer | Supports | Supports | Minor | Indirect | Indirect | Supports |

---

## LAUNCH DEPENDENCIES

*Consolidated, not hidden inside any section above.*

- **Real Testimonials** — names, companies, quotes, ratings
- **Verified FAQ Answers** — Licensing, Refunds, Downloads, Support, Usage Rights, Payments, Accounts (FAQ.docx exists as a consistency-checked candidate, not yet formally verified)
- **Final Legal Verification** — including the three still-open governance issues: missing "Read Full Privacy Policy" link, missing "Read Full Disclaimer" link, and the stray internal note inside the Detailed License Agreement's AI clause
- **Payment Provider Confirmation** — affects Checkout trust signals and the FAQ Payments question
- **Multi-Currency Decision** — open since the Foundation Finalization audit, affects Products/Pricing display sitewide
- **Final Refund Policy Verification** — content exists (Full Refund Policy, Detailed doc) pending the same formal sign-off as the rest of the legal set
- **Licensing Verification** — content exists (Digital Product License Agreement) pending formal sign-off
- **NDA Summary Gap** — deferred per your instruction, to be addressed in a later prompt, not resolved here
- **Free Resources → Product Recommendations personalization logic** — still open, referenced again here since Newsletter's automation-readiness note depends on it

---

## QUALITY REVIEW

1. **Featured article requirement** was reconciled with the priority-weighting rule via a content-level badge rather than a layout change — flagged explicitly rather than silently choosing one interpretation.
2. **Category navigation** was scoped down to static labels to preserve the "homepage is curation, not browsing" principle already applied consistently to Featured Portfolio.
3. **FAQ content status** was kept honest — placeholder-marked as instructed, with the real consistency-check work already done clearly credited rather than either ignored or overstated as "verified."
4. **Footer structure** cross-checked against your exact column list — confirmed matching with no unrequested additions.
5. **No section order, journey, or previously-approved Hero/Core Story decision was touched.**

---

This completes the Homepage Specification: Hero, Featured Products, Why Nibrexo, Agency Services, How We Work, Featured Portfolio, Resources & Learning, Testimonials, FAQ, Newsletter, Final CTA, and Footer. No code or implementation generated. Waiting for approval before moving to Homepage UI Production.
