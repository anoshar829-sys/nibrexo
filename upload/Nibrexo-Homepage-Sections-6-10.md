# NIBREXO — HOMEPAGE: SECTIONS 6–10 SPECIFICATION
### Testimonials · FAQ · Newsletter · Final CTA · Footer
*Completes the homepage per the locked v1.2 Section Sequence. Builds directly on the finalized Hero and Sections 1–5. This closes out the Homepage module — after approval, the full page spec is complete and ready for visual/code production.*

---

## THE CONTINUOUS STORY, CONTINUED

Featured Portfolio just proved the agency's work is real. What's left is closing the loop: reassure any remaining skeptics (**Testimonials**), remove any last practical objections (**FAQ**), capture the visitors who aren't ready to buy today but might be later (**Newsletter**), make the final ask clearly and once (**Final CTA**), and hand off cleanly to the rest of the site (**Footer**). These five sections are lower-density and faster to move through than Sections 1–5 by design — the persuading work is largely done; this is resolution, not more argument.

---

## SECTION 6 — TESTIMONIALS

**⚠ Content dependency flag:** This section requires real client/customer quotes to launch. Per the no-invented-testimonials rule (already locked for the Hero and applying site-wide), the structure below is fully specified, but populated here with clearly marked placeholders only. **This section should not go live with fabricated names, companies, or quotes** — if real testimonials aren't ready by launch, the better options are (a) delay this section and let Featured Portfolio carry the proof burden alone, or (b) launch with a small number of real, even modest quotes rather than a full polished set of invented ones. Flagging this now so it doesn't get silently filled with placeholder-turned-permanent content later.

**Purpose:** Third-party-feeling proof, positioned as the page's Statistics-equivalent moment directly before FAQ (Layout §8's proof-before-objection-handling pattern).

**Format:** Static grid (2–3 testimonials visible at once) rather than an autoplay carousel. Reasoning: with a small initial testimonial set (realistically 2–4 quotes at launch), a carousel implies more content exists than actually does, and autoplay adds a decision (pause control, per Component §8) this small a data set doesn't need. Static grid is simpler, faster to scan, and doesn't overstate what's available yet. Recommend revisiting carousel format once the testimonial library grows past ~6.

**Card content (per Component §3 Testimonial Card):**
- Quote (kept short — 1–3 sentences; long testimonials get excerpted, not run in full)
- Attribution: name, role, company — real, or the section doesn't ship
- No decorative giant quotation marks (Component §3's existing guidance) — quality of the quote carries the section, not typographic ornament

**Placeholder structure (for review only):**
> "[Specific, checkable result the client experienced]"
> — [Name], [Role] at [Company]

**Visual Direction:** Same restrained, no-card-border treatment considered for Why Nibrexo would feel repetitive here — recommend a light card with subtle border (Component §3 default card treatment) instead, so this section reads as distinctly "evidence," visually separated from the more editorial Why Nibrexo section earlier on the page.

---

## SECTION 7 — FAQ

**Purpose:** Remove the last practical objections standing between a persuaded visitor and an action — positioned correctly, right after proof, right before the final CTA push (Layout §8).

**Question Selection (6–8 total, mixed by journey, Products-weighted first):**
1. What's included when I buy a digital product? *(Products)*
2. How does licensing work? *(Products — directly answers the trust concern raised in Why Nibrexo)*
3. Do you offer refunds? *(Products)*
4. How long does an agency project typically take? *(Services)*
5. What's the process for starting a project with you? *(Services — reinforces How We Work)*
6. Do you work with small businesses/startups, or only larger clients? *(Services)*
7. Can I get support after I download a product? *(Support/general)*

*(Placeholder question set for structural review — final answers require real policy/process details, not invented ones; this is a content-accuracy dependency, not a design one.)*

**Format:** Accordion, single-open (Component §8's recommended pattern for FAQ context specifically, to avoid visual sprawl if multiple answers are expanded at once).

**Layout:** Single centered column, max-width constrained to Reading Width (680px, Layout §3) — FAQ answers are prose and should follow the same line-length comfort rule as any other body text.

**Motion:** Section-level fade+rise on entry (Motion §3); no per-item stagger (Motion §3's existing FAQ guidance — a late-page utility section shouldn't add stagger delay with no real payoff). Accordion expand/collapse follows the standard 300ms/250ms height animation (Motion §5).

---

## SECTION 8 — NEWSLETTER

**Purpose:** Capture visitors who are interested but not ready to convert today — specifically routes into Journey 3 (Resources) as its entry point on the homepage, per the locked journey map.

**Format:** Newsletter Box (Component §8) — single email field, single action, explicit statement of value and frequency (Component §8's existing rule against a bare "Subscribe" with no context).

**Copy direction:**
> Get occasional product drops and design resources — no spam, unsubscribe anytime.
> [Email field] [Get updates]

**Recommendation once real content exists:** this converts meaningfully better if tied to a specific lead magnet (a free resource/template) rather than a generic "join our newsletter" ask — directly connects to the Free Resources → Email Signup step already defined in Journey C (Sitemap Blueprint). At placeholder stage, generic value copy is used; this is flagged as a content opportunity to strengthen later, not a structural gap.

**Visual Direction:** Low-density, centered, generous whitespace — intentionally the quietest section on the page (per the "lower-key-then-high-key" sequencing established in the v1.2 addendum, this is the "lower-key" half of the closing pair with Final CTA).

---

## SECTION 9 — FINAL CTA

**Purpose:** The page's last, highest-weight conversion moment — closes the page the same way the Hero opened it, reinforcing Digital Products as the dominant close (v1.1/v1.2 priority is maintained all the way to the last section, not just at the top of the page).

**Content direction:**
> Headline: Ready to see what you can build?
> Subhead: Browse the store, or talk to us about something custom.
> Primary CTA: Explore Products
> Secondary text link: Or view services

**Reasoning:** This deliberately mirrors the Hero's CTA structure in miniature — same primary label, same priority order, same one-solid-button-plus-lighter-secondary-option pattern (Component §2/§7 CTA strategy) — so the page's opening and closing moments feel like the same conversation, not two different pitches. This is the strongest single piece of evidence that the "continuous conversation" goal set out at the top of this document has actually been achieved structurally, not just claimed.

**Visual Direction:** Full-width, high-contrast section (Primary or Secondary blue background, White text) — the one section on the page where a strong color block is appropriate, since it's the single most important remaining action and deserves to visually interrupt the page's mostly-white rhythm at exactly this one point. Generous padding above and below (Layout §11's premium-through-spacing logic, applied at the page's most consequential moment).

**Motion:** Standard fade+rise entry, no additional embellishment — Motion §9's success-experience-adjacent restraint principle applies here too: the moment doesn't need decoration to matter, it needs clarity.

---

## SECTION 10 — FOOTER

**Purpose:** Navigation and trust-signal infrastructure, consistent across every page site-wide (Foundation Finalization Phase 7 / Sitemap Part 4) — the homepage footer is the same component as every other page's footer, not a custom variant, with one exception noted below.

**Structure (per already-locked Footer Navigation spec):**
- **Product** column: Products, Pricing
- **Company** column: About, Careers, Contact
- **Resources** column: Blog, Guides, Free Resources
- **Legal** column: Privacy, Terms, Refund Policy, License, Cookies, Disclaimer
- Social links row (Component §8, neutral/monochrome icon treatment)
- Copyright line

**⚠ Homepage-specific variance flagged:** The site-wide footer template normally includes a Newsletter Box (per the Sitemap Blueprint's Footer Navigation spec). On the homepage specifically, this would duplicate Section 8's dedicated Newsletter section just above it. **Recommendation: omit the footer newsletter box on the homepage only**, since a visitor who scrolled past Section 8 without signing up is unlikely to sign up seconds later in the footer — the redundant ask adds clutter without adding conversion probability. Every other page (which doesn't have a dedicated Newsletter section) keeps the footer newsletter box as originally specified.

**Visual Direction:** Dark surface (Graphite background, per Brand Identity's use of Dark as a footer treatment) — the one other place besides Final CTA where the page departs from its White-dominant canvas, and doing so here signals "you've reached the end of the page" architecturally, not just through content.

**Motion:** No scroll-reveal animation (Motion §3's existing Footer guidance — by the time a visitor reaches the footer, further reveal ceremony reads as excessive).

---

## SECTION TRANSITIONS (CONTINUED)

| Between | Why This Order | Scroll Feel | Motion's Job |
|---|---|---|---|
| **Featured Portfolio → Testimonials** | Visual proof (the work) is immediately followed by verbal proof (what clients say about it) — two different proof types, back to back, compound rather than repeat | Should feel like continued momentum, not a new topic | Standard fade+rise, static grid entrance (no stagger needed for 2–3 items) |
| **Testimonials → FAQ** | Emotional/social proof resolved → practical/logistical doubts resolved next, correct order per Layout §8 | Should feel like the page shifting from "why trust us" to "how does this actually work in practice" | Section-level fade+rise only, no item-level stagger (§7) |
| **FAQ → Newsletter** | Objections resolved → capture the not-ready-yet segment before making the final hard ask | Should feel low-pressure, a soft moment before the final push | Simple fade+rise, deliberately unremarkable — this section should not compete for attention |
| **Newsletter → Final CTA** | Soft ask → hard ask, deliberate lower-key-then-high-key sequencing (v1.2) | Should feel like a clear escalation — the page's calmest section immediately followed by its boldest | Fade+rise, but the *color block* itself (§9) does the attention-directing work, not motion — consistent with Motion's overall principle that layout/content should carry weight before motion does |
| **Final CTA → Footer** | Conversion moment closes → clean handoff to site-wide navigation infrastructure | Should feel like arriving, not scrolling further into more persuasion | No reveal animation at all (§10) — the absence of motion here is itself the signal that persuasion has ended |

---

## COPYWRITING TONE

Same standard as Sections 1–5: specific over superlative, no buzzwords. Worth noting explicitly for this batch: FAQ answers and Testimonial quotes are the two places on the entire homepage where copy needs to be **verifiably accurate**, not just well-written — an FAQ answer or testimonial that overstates reality is a trust liability precisely because these sections exist to build trust. Flagging this because it's a different bar than persuasive copywriting elsewhere on the page.

---

## RESPONSIVE DESIGN

| Section | Desktop | Tablet | Mobile |
|---|---|---|---|
| Testimonials | 2–3 column grid | 2-column or 1-column depending on quote length | 1-column stack |
| FAQ | Single centered column (680px) | Same, full-width within tablet margins | Same, full-width within mobile margins |
| Newsletter | Centered, inline email field + button | Same | Stacked (field above button, full-width) |
| Final CTA | Centered, generous horizontal padding | Same | Centered, CTA becomes full-width |
| Footer | 4-column layout | 2-column layout | Single-column stacked, accordion-style collapse optional for the nav columns if the list feels long on small screens |

---

## ACCESSIBILITY

- **Reading Order:** Consistent with Sections 1–5 — DOM order matches visual order throughout, no exceptions in this batch
- **Keyboard Navigation:** FAQ accordion items are fully keyboard-operable (Enter/Space to expand, per Component §8); Newsletter field/button and Final CTA button follow standard focus order
- **Touch Targets:** Newsletter button, Final CTA button, and footer links all meet 44×44px minimum
- **Heading Hierarchy:** H2 per section continues the pattern from Sections 1–5 ("Testimonials," "FAQ," etc., or final marketing-copy equivalents); FAQ questions are H3 or styled as accordion triggers with correct `aria-expanded` state (Component §12); Footer navigation columns use `<nav>` landmarks with appropriately labeled headings, not visually-styled-only headers
- **Color Contrast:** Final CTA's solid-color-background text (White on Primary/Secondary) and Footer's light-text-on-dark treatment both need explicit re-verification against the semantic tokens (Foundation Finalization Phase 2) since they're the only two sections in the entire homepage that don't use the standard White/Background canvas — flagged here as a specific QA checkpoint, not assumed automatically safe just because the tokens exist

---

## SEO

- **Heading Hierarchy:** Continues cleanly from Sections 1–5 — H2 per section, appropriate sub-levels within (FAQ questions, if marked as headings rather than accordion-only triggers, should be H3, consistent with product/service/step naming elsewhere on the page)
- **Internal Links:** Footer is the page's highest-density internal linking section by far — every major hub page (Products, Services, Blog, Guides, Free Resources, Legal pages) gets a direct link here, reinforcing the pillar-and-cluster model (Phase 6) from the page that will receive the most inbound links site-wide
- **Structured Data Opportunity:** FAQ content is a strong candidate for FAQ structured data markup (schema.org FAQPage) once real content is finalized — flagged as a technical-SEO opportunity for the build phase, not something this specification needs to resolve now
- **Content Hierarchy:** Testimonials and FAQ both reinforce keyword-relevant trust language (licensing, refunds, project timelines) that's genuinely useful to both users and search intent — not keyword-stuffed, just naturally present because the content itself is genuinely about those topics

---

## BUSINESS REASONING PER SECTION

| Section | Digital Product Sales | Agency Leads | Brand Authority | Future Expansion |
|---|---|---|---|---|
| **Testimonials** | Supports (if Products-focused quotes are included) | Supports (if Services-focused quotes are included) | Primary purpose | Grid absorbs unlimited future quotes; format doesn't change as the library grows |
| **FAQ** | Directly reduces purchase hesitation (licensing/refunds) | Directly reduces engagement hesitation (process/timeline) | Supports (transparency itself builds authority) | New questions add as rows, no structural change |
| **Newsletter** | Indirect, long-cycle (Journey C eventually converges back to Products) | Indirect | Builds ongoing relationship/audience | Directly feeds the future Academy/Community modules' eventual audience base |
| **Final CTA** | Direct, primary driver of the page's last conversion opportunity | Secondary driver | Reinforces the consistency established since the Hero | Same three-tier CTA pattern reusable on any future landing page |
| **Footer** | Indirect (navigation/discovery) | Indirect (navigation/discovery) | Trust infrastructure (legal transparency, clear company info) | Every future module (SaaS, Academy, Marketplace) adds its own footer links without restructuring the column system |

---

## QUALITY REVIEW — WEAKNESSES IDENTIFIED AND RESOLVED

1. **Initial risk:** populating Testimonials with realistic-sounding placeholder quotes (fake names, plausible companies) to make the spec "look finished" would have created exactly the kind of fabricated trust content the project has explicitly ruled out since the Hero. **Resolved:** placeholder marked unmistakably as a structural example, with an explicit content-dependency flag rather than a polished fake.
2. **Initial risk:** defaulting Testimonials to a carousel (the more "premium-feeling" pattern) without checking against the likely small initial quote count would have overstated how much proof actually exists at launch. **Resolved:** static grid recommended instead, with reasoning tied to realistic content volume.
3. **Initial risk:** keeping the footer's newsletter box on the homepage by default (since it's the standard site-wide component) would have created a redundant ask right after the dedicated Newsletter section. **Resolved:** explicitly flagged and removed for the homepage instance only.
4. **CRO check:** confirmed the Final CTA mirrors the Hero's exact CTA structure and priority order rather than introducing a new pattern at the last moment — the page's open and close are now demonstrably consistent, not just similarly worded.
5. **Accessibility check:** Final CTA and Footer were separately flagged for contrast re-verification since they're the only two sections breaking from the White/Background canvas — called out explicitly rather than assumed safe.

---

The Homepage specification is now complete end-to-end: Hero, Sections 1–5, and Sections 6–10. Two content dependencies are flagged as launch blockers rather than design gaps: real Testimonials content, and finalized FAQ answers/policies. Everything else is ready to move into visual design or code production whenever you are.
