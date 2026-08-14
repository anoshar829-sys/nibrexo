# NIBREXO — LAYOUT & DESIGN PRINCIPLES
### Foundation Document v1.0
*This document defines the structural rules for every page built on Nibrexo. It extends the Brand Identity & Visual DNA (v1.0) — it does not redefine color, type, or shape language, only how they're arranged in space. Every future page is built against this document; deviations must be flagged and justified before implementation.*

---

## 1. OVERALL LAYOUT PHILOSOPHY

Nibrexo's layout system exists to make one thing true on every page: **the user always knows what matters most, in under two seconds, without scanning.**

Three governing principles:

- **Hierarchy before decoration.** Layout's job is to rank content by importance. If a layout choice doesn't clarify what to look at first, it's decoration, not structure.
- **Predictability builds trust.** A premium brand doesn't surprise the user with structure — surprise comes from craft and content, not from where the navigation or CTA might be hiding this time.
- **Space is a hierarchy signal, not a gap-filler.** More space around something means it matters more. This is the single most-used tool in the entire system — see Section 11.

**Designer note:** When a layout feels "boring," the fix is almost never more visual elements — it's better pacing, better proportion, or a stronger content idea. Resist decorating structure.

---

## 2. GRID SYSTEM

Consistent with Brand Identity Section 2, restated here with full implementation detail.

| Breakpoint | Range | Columns | Gutter | Margin (edge) |
|---|---|---|---|---|
| Desktop (large) | ≥1440px | 12 | 24px | 80px |
| Desktop (standard) | 1200–1439px | 12 | 24px | 64px |
| Tablet | 768–1199px | 8 | 24px | 40px |
| Mobile | 320–767px | 4 | 16px | 20px |

**Designer note:** Columns define alignment points, not literal division of every element into equal slices. A hero headline might span 7 of 12 columns while its supporting image spans 5 — the grid is a snapping system, not a forced symmetry rule.

**Developer note:** Build the grid as a CSS Grid or Flexbox container with the column/gutter/margin values above as design tokens (`--grid-columns`, `--grid-gutter`, `--grid-margin`), not hardcoded per-section. This is what makes the system scalable into SaaS dashboard layouts later, which will need denser grids without breaking brand consistency.

**Accessibility note:** Column count changes are a visual convenience only — reflow at each breakpoint must preserve reading order in the DOM. Never use CSS to visually reorder content in a way that breaks logical/tab order.

---

## 3. CONTAINER WIDTHS

| Container | Max Width | Use |
|---|---|---|
| **Reading Width** | 680px | Long-form text: blog body copy, documentation, legal pages |
| **Content Width** | 960px | Standard section content: feature explanations, forms |
| **Max Width (default page container)** | 1280px | The outer boundary for all standard sections |
| **Hero Width** | 1280px (content), visual elements may break to 1440px | Hero sections — text stays inside 1280px, but supporting visuals/gradients may extend wider for atmosphere |
| **Wide Sections** | Full viewport width (100vw) | Logo walls, image galleries, comparison tables, full-bleed testimonial banners — used deliberately, never as default |

**Designer note:** Reading Width (680px) is deliberately narrower than Content Width. Text and layout have different optimal widths — text optimizes for eye comfort (character count), layout optimizes for visual composition. Conflating the two is a common cause of walls of text that feel exhausting to read.

**UX note:** Full-bleed (Wide Sections) should never be used for primary reading content — it's reserved for content that benefits from scale (imagery, logos, data visualizations) where line-length rules don't apply.

**Future scalability note:** When SaaS dashboards are introduced, they will need a separate "Application Width" container (likely full-width with internal panel-based layout) — this is intentionally excluded from the marketing-site system defined here and will get its own dedicated layout spec when that module begins.

---

## 4. SPACING SYSTEM

Base unit: **8px** (as defined in Brand Identity). All spacing decisions below are multiples of this unit — never arbitrary pixel values.

| Spacing Type | Value | Use |
|---|---|---|
| **Section Spacing** | 96–128px (desktop), 64px (mobile) | Vertical space between major page sections |
| **Internal Spacing** | 48–64px | Space between sub-groups within a section (e.g., headline block to content grid) |
| **Card Spacing** | 24–32px (between cards), 24px (padding inside a card) | Grid of cards/features |
| **Text Spacing** | 16px (paragraph to paragraph), 8px (heading to eyebrow label) | Typographic rhythm within a text block |
| **Button Spacing** | 12px (icon to label), 16–24px (between adjacent buttons) | CTA groupings |
| **Content Spacing** | 32–48px | Space between a heading block and the content that follows it |

**White Space Philosophy:** Every spacing value answers one question: *"how related are these two things?"* Closely related elements (a label and its input, an icon and its button text) sit close — 8–12px. Loosely related elements (two different feature cards) sit far apart — 24–32px. Unrelated elements (two different sections) get the most space — 96px+. This is the core logic behind every number in this table; it is never arbitrary.

**Designer note:** When in doubt between two spacing values, choose the larger one. Premium brands are consistently under-crowded, never over-crowded — see Section 11.

**Developer note:** Implement spacing as design tokens on the 8px scale (`--space-1: 8px` through `--space-16: 128px`), never as raw pixel values in component code. This is what prevents "spacing drift" as more contributors touch the codebase.

---

## 5. ALIGNMENT RULES

**Horizontal Alignment**
- Marketing/landing sections: predominantly left-aligned text (matches natural reading start point), centered only for hero headlines and CTA-focused moments where symmetry reinforces a single, singular message
- Never center body paragraphs longer than 2 lines — centered ragged-edge text is harder to scan
- Data-dense content (tables, pricing, docs): always left-aligned, numbers right-aligned for scannability

**Vertical Alignment**
- Within a section: content vertically centers relative to its paired visual (text block and image share a vertical center), not top-aligned by default — top-alignment is reserved for content-dense sections (docs, listings) where scanning from the top matters more than visual balance

**Content Balance**
- A text-heavy side is always balanced by a simpler visual side, and vice versa — never pair dense text with a dense/busy illustration; one side of any split section should always be the "quiet" side

**Visual Rhythm**
- Alternate the visual/text side across consecutive two-column sections (image-left, then image-right, then image-left) to prevent the page from feeling like a repeated template — this single technique does more for scroll-pacing than any additional visual effect

**UX note:** Alignment consistency is one of the fastest things a user's eye detects as "unpolished" when it's wrong. A single card in a grid that's 4px off from its siblings will register as an error even if the user can't articulate why.

**Accessibility note:** Centered text must never be used for any content a screen-reader-independent sighted user needs to scan quickly under time pressure (pricing tables, form errors) — left-alignment always wins for functional content.

---

## 6. RESPONSIVE RULES

**Desktop Behavior (≥1200px)**
Full multi-column layouts, side-by-side text/visual pairings, generous section spacing (96–128px), hover states fully active.

**Tablet Behavior (768–1199px)**
Multi-column layouts collapse to 2-column or stack earlier than desktop; touch targets increase to minimum 44×44px; hover-dependent interactions get a tap-equivalent; section spacing reduces to ~80px.

**Mobile Behavior (320–767px)**
Single-column stacking by default; all side-by-side sections become stacked (visual above or below text, never side-by-side at this width); CTAs become full-width or clearly prioritized (primary CTA visually dominant, secondary CTA visually subordinate); section spacing reduces to 64px.

**Image Scaling**
Images scale fluidly within their container (never fixed pixel width) using `max-width: 100%` logic; art direction may swap to a cropped/simplified version at mobile widths rather than shrinking a wide desktop image into an illegible thumbnail.

**Typography Scaling**
Follows the ratio table in Brand Identity Section 4 — headings compress more aggressively than body text as viewport shrinks; body text never drops below 16px at any breakpoint.

**Layout Adaptation**
Grid columns reduce (12 → 8 → 4) rather than simply shrinking a 12-column layout proportionally — content should be *re-composed* for smaller viewports, not just scaled down.

**Developer note:** Design mobile layouts as their own composition, not as an automatic reflow of the desktop grid. The most common mobile-web failure mode is treating mobile as "desktop, but smaller" instead of "the same content, re-prioritized."

**Accessibility note:** Touch target minimum of 44×44px is non-negotiable at tablet/mobile breakpoints, including for icon-only buttons — this affects motor-impaired users significantly more than visual appearance.

---

## 7. VISUAL HIERARCHY

**Primary Content:** The single most important element per section (usually the headline or hero visual) — should be identifiable within the first 500ms of viewing, achieved through size, position (top/center), and contrast, never through color alone.

**Secondary Content:** Supporting explanation (subheadings, short paragraphs) — smaller, positioned immediately adjacent to primary content, never competing for the same visual weight.

**Supporting Content:** Proof elements (stats, logos, testimonials, badges) — smallest visual weight, positioned after primary/secondary content in reading order, reinforces rather than introduces.

**CTA Priority**
- Every section has at most **one** primary CTA — multiple equally-weighted CTAs create decision paralysis and dilute conversion intent
- Secondary/tertiary actions (e.g., "Learn more") are always visually subordinate — text link or outline button, never a second solid-fill button competing with the primary
- Primary CTA is positioned where the eye naturally lands after consuming the value proposition — typically directly following the Context → Value → Proof sequence from Brand Identity Section 2

**Reading Order:** Every section should be comprehensible if a user reads *only* the headline of each section, top to bottom, skipping everything else. If a page fails this test, the hierarchy isn't doing its job.

**Designer note:** Test hierarchy by squinting at a full-page screenshot — if you can't tell what's most important in a blurred view, the hierarchy relies on reading rather than seeing, which is a structural failure, not a content failure.

---

## 8. SECTION STRUCTURE

Every section type below has a defined job and a defined relationship to what comes before/after it — sections should never feel interchangeable or arbitrary in sequence.

| Section | Job | Connects To Next By |
|---|---|---|
| **Hero** | State what Nibrexo does and for whom, in one breath | Ending with a visual or content cue that implies "here's proof" — sets up Feature/Stats |
| **Feature** | Show *how* the value is delivered, broken into digestible pieces | Building from broad (what) to specific (how) — naturally leads to deeper Content sections |
| **Content** | Go deep on one specific value proposition, case, or capability | Ends by resolving the reader's "but how does this actually work" question, setting up Statistics/proof |
| **Statistics** | Convert explanation into evidence — numbers, outcomes, scale | Provides the credibility that makes the following CTA feel earned, not premature |
| **FAQ** | Remove final objections before conversion | Positioned late in the page — after value/proof, right before the final CTA, addressing doubts raised by everything above it |
| **CTA** | Convert. Single, clear, high-contrast action | Terminal section before Footer — should feel like the natural conclusion of everything above, not an interruption |
| **Footer** | Navigation, trust signals (legal, social proof), secondary conversion paths | N/A — end of page, but must maintain the same visual calm as every section above (footers are not a dumping ground) |

**UX note:** Sections should never be reordered purely for "visual variety." The sequence above exists because it mirrors how a skeptical visitor actually makes a decision: understand → see how → go deeper → get proof → resolve doubt → act. Breaking this order (e.g., CTA before proof) measurably increases bounce and decreases conversion trust.

**Designer note:** Not every page needs every section, but the sections that *are* present must stay in this relative order. A page can skip "Content" and go straight from Feature to Statistics — it cannot put Statistics before Feature.

---

## 9. CONTENT WIDTH RULES

- **Paragraph width:** Constrained to Reading Width (680px) or a per-column equivalent — target 60–75 characters per line regardless of container
- **Heading width:** Headings may run wider than body text (up to Content Width, 960px) since large type at low character-density remains scannable at wider measures — but hero headlines should still break naturally at a comfortable point, never running the full 1280px container edge-to-edge
- **Card width:** Cards in a grid maintain equal width within their row; minimum card width of 280px before wrapping to a new row/breakpoint; card internal padding (24px) is included in width calculations, not additive

**Designer note:** Long, unbroken lines of text are the single most common readability failure in premium-brand websites that otherwise look polished — a beautiful page that's tiring to read isn't a premium experience, it's a good-looking mistake.

---

## 10. DESIGN RHYTHM

The page should feel like a **breathing pattern**, not a flat scroll: dense → open → dense → open. Concretely:

- A content-dense section (Feature grid, Statistics) is always followed by a lower-density, higher-whitespace section (a simple statement, a quote, generous padding) — never two dense sections back-to-back
- Background treatment alternates subtly (White → Support tint → White) to mark section boundaries without needing hard dividers/borders, which read as visually heavy
- Visual side (image-left/right) alternates per Section 5's Visual Rhythm rule
- Section spacing (Section 4) is itself part of the rhythm — it's the "rest" between "notes"

**Avoiding Visual Fatigue:** If three or more sections in a row use the same layout pattern (e.g., three consecutive "text-left, image-right" blocks), the page starts to feel templated rather than crafted, regardless of content quality. Vary composition every 2 sections at most.

**Designer note:** Think of the page like a piece of music — verse/chorus dynamics, not a monotone. Constant intensity (even if that intensity is "premium and calm") still reads as flat over a long scroll.

---

## 11. PREMIUM EXPERIENCE THROUGH SPACING

Spacing is the cheapest and most reliable lever for making a website feel expensive. Examples:

- **A $10 product page** crams five features into one row with 8px gaps and centers everything to "fit."
- **A $10,000 product page** shows one feature at a time with 64px of air around it, because the space itself communicates *"this idea doesn't need to fight for your attention — it's confident enough to stand alone."*

This is why Stripe, Linear, and Apple's product pages often show *less* content per screen than their competitors, not more — restraint reads as confidence, and confidence reads as premium.

**Concrete reasoning for Nibrexo:**
- Generous section spacing (96–128px) signals the brand isn't anxious to cram in every message — it trusts the visitor to keep scrolling
- Wide margins around CTAs (never tight/cramped buttons) signal the action is important enough to deserve room, not squeezed in as an afterthought
- A hero section with one clear headline and real breathing room outperforms — visually and often in conversion — a hero stuffed with five value props at once

**Designer note:** When a stakeholder asks "can we fit more above the fold," the correct response is usually: *"we can fit more information, but we'd lose the thing that currently makes this feel premium — which is the information we're choosing to leave out."*

---

## 12. THINGS TO AVOID

| Problem | Why It Hurts the Brand | Prevention |
|---|---|---|
| **Crowded layouts** | Reads as budget/rushed, undermines "premium, minimal" personality | Enforce minimum spacing values in Section 4 as a floor, never a suggestion |
| **Random spacing** | Breaks visual rhythm, looks unintentional even if content is good | All spacing must be a multiple of the 8px base unit — no exceptions |
| **Uneven margins** | Signals lack of craft/attention to detail, erodes trust fastest of any layout flaw | Margins locked to the grid system (Section 2) per breakpoint |
| **Broken hierarchy** | User doesn't know what to look at or do first — directly hurts conversion | Enforce the one-primary-CTA and Context→Value→Proof→Action structure per section |
| **Inconsistent alignment** | Registers as "unpolished" even when the user can't say why | Snap every element to the grid; never eyeball alignment |
| **Weak CTA positioning** | Buries the conversion moment, wastes the trust built by the rest of the page | CTA always follows proof (Section 8); never place it before value is established |

---

## SUMMARY: HOW THIS DOCUMENT IS USED

Every future page starts from this structure, not from a blank canvas:
1. Identify which sections (Section 8) the page needs, in the defined relative order
2. Apply container widths (Section 3) and grid (Section 2) per section type
3. Apply spacing (Section 4) as a floor, not a suggestion
4. Check hierarchy (Section 7) — one primary focus per section, one primary CTA per page
5. Check rhythm (Section 10) — no more than 2 consecutive sections with the same composition pattern
6. Sanity-check against Section 12 before calling any page "done"

This document is now locked as v1.0, alongside Brand Identity v1.0. Together they are the full foundation — the next modules (Component Library, then individual pages) will be built directly on top of both.
