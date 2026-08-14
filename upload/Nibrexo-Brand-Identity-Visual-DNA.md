# NIBREXO — BRAND IDENTITY & VISUAL DNA
### Foundation Document v1.0
*This document is the single source of truth for every visual decision made on Nibrexo — website, product UI, marketing, illustration, and future platforms. No page, component, or asset should contradict it without an explicit, documented reason.*

---

## 1. BRAND FOUNDATION

**Company:** Nibrexo
**Business:** Premium Digital Product Store + Creative Design Agency
**Future Expansion:** AI Products, SaaS Platform, Education Platform, Digital Marketplace

**Mission of this document:** Define a visual identity so consistent and deliberate that quality is communicated before a single word is read — timeless enough to support an agency today and an AI/SaaS/education ecosystem five years from now.

### Brand Personality
Premium · Minimal · Modern · Elegant · Professional · Creative · Friendly · Confident · Trustworthy · Future-Ready · Technology-Inspired · Calm · Purpose-Driven

### Never
Cheap · Corporate-cold · Overly playful · Noisy · Over-decorative · Generic

### Emotional Response on Arrival
Trust → Curiosity → Professionalism → Confidence → Creativity → Innovation → Clarity → Calmness

This ordering matters: **trust is established first**, through restraint and precision, before curiosity is invited through motion and creative detail. A visitor should never feel "sold to" before they feel "respected."

---

## 2. VISUAL LANGUAGE

**Overall Design Direction**
Structured minimalism with quiet confidence. Every screen reads as engineered, not decorated. Nibrexo earns visual interest through precision, rhythm, and restraint — not through ornamentation.

**Visual Tone**
Cool, clean, and quietly optimistic. Light-dominant surfaces with deep, deliberate accents. Never stark/clinical — warmth comes from spacing, type pairing, and the amber accent used sparingly.

**Communication Style**
Direct, confident, uncluttered. One idea per section. If a sentence needs a qualifier to sound impressive, cut it.

**Emotional Direction**
Calm authority. Nibrexo doesn't need to shout to be taken seriously — the same instinct that makes Stripe's docs feel trustworthy.

**Shape Language**
Geometric, rounded-rectangle based. Soft enough to feel human, structured enough to feel engineered. Avoid sharp 0px corners (feels cold/legacy-enterprise) and avoid heavy pill/blob shapes (feels consumer-app/playful).

**Corner Radius Philosophy**
A single consistent radius scale, used predictably by component size — never arbitrary:
- Small elements (tags, badges, inputs, small buttons): **8px**
- Standard components (cards, buttons, dropdowns): **12px**
- Large surfaces (modals, feature cards, images): **16–20px**
- Hero-level containers / large media blocks: **24px**
- Full circles only for avatars, status dots, and icon containers under 48px

Never mix radius values within the same component family on the same page.

**Layout Philosophy**
Grid-first, content-led. Layout should never fight for attention with content — it exists to make content easier to scan and trust. Asymmetry is allowed *only* to create intentional focal points (e.g., hero visuals), never as decoration.

**White Space Philosophy**
Whitespace is a design element, not "empty space to fill." It is used to:
- Signal hierarchy (more space above = more important)
- Create breathing room around high-value actions (CTAs never feel crowded)
- Let single products/ideas feel premium by not competing for attention

Rule of thumb: if a section feels like it needs more content to look "finished," add space instead.

**Grid Philosophy**
- Desktop: 12-column grid, 1200–1280px max content width, 24px gutters
- Tablet: 8-column grid, 24px gutters
- Mobile: 4-column grid, 16px gutters
- Base spacing unit: **8px**, all spacing values are multiples of 8 (8/16/24/32/48/64/96/128)

**Visual Balance**
Left-weighted text, right-weighted or centered visual — for LTR markets this creates natural reading flow (read → see proof → act). Balance is optical, not purely mathematical: large solid shapes need more surrounding space than fine detail to *feel* equal.

**Content Hierarchy**
Every section follows: **Context → Value → Proof → Action.** Headline sets context, subhead delivers value, supporting content (stats, logos, testimonials) proves it, CTA converts it.

**Reading Flow**
Z-pattern for hero/landing sections, F-pattern for content-dense pages (docs, blog, dashboards). Never force a reading pattern that fights the content type.

**Interaction Philosophy**
Every interactive element must telegraph its interactivity within 150ms of hover/focus, and every state change must be reversible and predictable. Motion clarifies cause-and-effect — it never exists purely for delight. See Section 9.

---

## 3. COLOR SYSTEM

| Role | Hex | Name |
|---|---|---|
| Primary | `#2563EB` | Nibrexo Blue |
| Secondary | `#1E40AF` | Deep Blue |
| Support | `#85B1C9` | Mist Blue |
| Dark | `#1F2937` | Graphite |
| White | `#FFFFFF` | Pure White |
| Accent | `#B45309` | Amber Bronze |

### Primary — `#2563EB` Nibrexo Blue
- **Purpose:** The brand's core identifier. Represents trust, intelligence, and technology.
- **Emotion:** Confidence, clarity, forward motion.
- **Use for:** Primary buttons, links, active states, key icons, brand accents, focus rings.
- **Do not use for:** Large body backgrounds (overwhelms), body text (fails comfortable reading contrast at length), decorative fills with no functional purpose.
- **Accessibility:** White text on Primary = passes AA for large text and UI components; use `18px+/bold` or `24px+/regular` for text directly on this fill. For small body text, use Primary *as* the text color on white/light backgrounds instead (passes AA there).
- **Ideal pairing:** White backgrounds, Dark text, Support as a soft companion tint.

### Secondary — `#1E40AF` Deep Blue
- **Purpose:** Depth and gravity. Used to add hierarchy without introducing a new hue.
- **Emotion:** Stability, seriousness, premium weight.
- **Use for:** Hover/pressed states of Primary elements, gradients paired with Primary, dark-mode primary substitute, secondary headings on light backgrounds.
- **Do not use for:** Primary CTA default state (reserve Primary for the "main" action — Secondary is the *response* to interaction, not the resting state).
- **Accessibility:** Passes AA for white text at normal body sizes — better contrast than Primary. Safe for small UI text on white.
- **Ideal pairing:** Primary (as a hover/gradient partner), White, Graphite text.

### Support — `#85B1C9` Mist Blue
- **Purpose:** Softens the palette; used for atmosphere, not statements.
- **Emotion:** Calm, air, openness.
- **Use for:** Section background tints, illustration fills, chart secondary series, subtle dividers, disabled states, large decorative shapes.
- **Do not use for:** Any text, small icons, or any element requiring WCAG AA contrast on white — its contrast ratio against white is roughly 2:1, well under the 4.5:1 minimum for text. Treat it strictly as a background/decorative color.
- **Accessibility:** Fails as a text/foreground color on light backgrounds. Safe as a *background* under Dark or Primary text/icons.
- **Ideal pairing:** White (as a tint), Graphite text laid on top of it, Primary as an accompanying accent shape.

### Dark — `#1F2937` Graphite
- **Purpose:** The workhorse neutral. Not pure black — softer, more premium, less harsh on screens.
- **Emotion:** Authority, readability, groundedness.
- **Use for:** Body text, headings on light backgrounds, dark-mode surfaces, footer backgrounds, icons.
- **Do not use for:** Large full-bleed backgrounds paired with low-contrast imagery (creates murky, heavy sections) — pair with intention.
- **Accessibility:** Passes AAA for text on White. This is your default body copy color, not pure black.
- **Ideal pairing:** White, Support (as background), Primary (as link/accent color within Dark text blocks).

### White — `#FFFFFF`
- **Purpose:** The dominant canvas. Nibrexo is a light-first brand.
- **Emotion:** Clarity, honesty, space.
- **Use for:** Primary backgrounds, cards, negative space, breathing room around dense content.
- **Do not use for:** Long-scroll pages with zero section differentiation — pair with subtle off-white (`#FAFBFC`-level) or Support tints to create rhythm without breaking the light-first feel.
- **Accessibility:** Baseline for all contrast calculations above.
- **Ideal pairing:** Everything — it's the connective tissue of the system.

### Accent — `#B45309` Amber Bronze
- **Purpose:** The single warm note in an otherwise cool system. Used to create focus, not decoration.
- **Emotion:** Craft, warmth, premium detail — signals "this matters" without shouting.
- **Use for:** Rare highlight moments — a single stat, a "new" badge, a key differentiator callout, hover accents on premium/agency-tier content. Should appear on a page as a deliberate exception, not a repeated pattern.
- **Do not use for:** Primary CTAs (reserve blue for action — amber for emphasis creates confusing dual-CTA hierarchy), large fills, anything appearing more than once or twice per page.
- **Accessibility:** Passes AA for white text at large sizes only; for small text use Accent as foreground text on White/light backgrounds, not the reverse.
- **Ideal pairing:** Used sparingly against White or Graphite — never adjacent to Support (both are mid-tone, low-contrast against each other).

### Governing Rule
**Blue family (Primary/Secondary/Support) = 90% of every screen. Graphite/White = structure and text. Amber = the exception, never the rule.** If a page has more than one prominent amber moment, that's a signal the hierarchy is unclear — fix the hierarchy, don't add more amber.

---

## 4. TYPOGRAPHY SYSTEM

### ⚠ Flagged Decision: Heading Font
Amoresa is a handwritten/calligraphy script typeface with a personal-use-only license — inconsistent with "premium technology brand" and legally unsuitable for commercial deployment. **Recommended replacement below.** If there's a specific reason for keeping Amoresa (e.g. existing logotype), flag it and we'll scope it to a single, contained use (like the wordmark only) rather than system-wide headings.

### Font Stack (Recommended)

| Role | Font | Why |
|---|---|---|
| Display / Hero Headlines | **Cabinet Grotesk** (or General Sans / Clash Display) | Geometric with warmth — gives hero moments personality without breaking trust |
| Interface Headings / Secondary | **Sora** | Already chosen — modern, technical, excellent at UI scale, wide weight range |
| Body Text | **Inter** or **Sora (Regular/Light)** | Inter is purpose-built for screen legibility at small sizes; use if Sora's body-weight rendering feels too geometric for long-form reading |

*(If Cabinet Grotesk/General Sans is unavailable via your licensing setup, Sora alone — Bold for display, Regular for body — is a fully safe fallback and keeps the system to one typeface family.)*

### Heading Hierarchy
| Level | Size (Desktop) | Size (Mobile) | Weight | Line Height | Use |
|---|---|---|---|---|---|
| Display (H1 Hero) | 64px | 36px | 700 | 1.05 | One per page, hero only |
| H1 | 48px | 32px | 700 | 1.1 | Page-level title |
| H2 | 36px | 28px | 600 | 1.2 | Section headers |
| H3 | 24px | 20px | 600 | 1.3 | Subsection headers |
| H4 | 18px | 16px | 600 | 1.4 | Card/component titles |

### Body Hierarchy
| Level | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| Body Large | 18px | 400 | 1.6 | Intros, lead paragraphs |
| Body Default | 16px | 400 | 1.6 | Standard copy |
| Body Small | 14px | 400 | 1.5 | Captions, metadata, labels |
| Micro | 12px | 500 | 1.4 | Tags, timestamps, legal |

### Reading Comfort Rules
- Max line length: **60–75 characters** for body text (never full-width paragraphs on desktop)
- Body text minimum size: **16px** — never smaller, on any surface, for any reason
- Paragraph spacing: minimum 1.5× the line-height value

### Letter Spacing
- Display/H1: **-2% to -3%** (tight, premium, large-type convention)
- H2–H4: **-1%**
- Body: **0%** (default)
- Micro/labels (uppercase): **+4–6%** (uppercase always needs positive tracking to stay legible)

### Line Height
- Headings: 1.05–1.3 (tighter as size increases)
- Body: 1.5–1.6 (looser for reading comfort)
- Never below 1.4 for any paragraph over two lines

### Responsive Typography
- Scale down using the ratios in the table above — never linearly shrink everything by the same percentage (headings compress more than body text as screens shrink)
- Body text size never changes across breakpoints — only line length and spacing adapt

### Common Mistakes to Avoid
- Mixing more than 2 type families on one screen
- Justified text (creates uneven rivers of whitespace, hurts readability)
- All-caps for anything longer than 3–4 words
- Insufficient contrast between heading weights (H1 700 next to H2 700 with only a size change reads flat — vary weight, not just size)

---

## 5. ILLUSTRATION LANGUAGE

**Art Style:** Geometric-flat with subtle depth via layered shapes and soft shadows — never fully flat (feels dated), never skeuomorphic (feels heavy). Think "engineered simplicity," closer to abstract-technical than cartoon-friendly.

**Character Style:** Nibrexo does not use human characters/mascots in core brand illustration. If a human presence is ever needed (education/onboarding contexts), use abstract, geometric figure representations — never detailed faces or specific ethnicities/genders that could feel exclusionary or dated quickly.

**Objects:** Abstracted representations of real objects (devices, documents, interfaces-within-illustrations) — simplified to essential shapes, not literal renders.

**Perspective:** Isometric or flat-front only. No forced 3D perspective, no vanishing points — keeps illustrations feeling calm and controlled rather than dynamic/chaotic.

**Stroke Style:** When outlines are used, consistent 2px stroke weight at a standard 1200px canvas, scaling proportionally. Strokes in Graphite or Primary only.

**Corner Style:** Matches the UI corner radius philosophy (Section 2) — rounded, never sharp, never fully circular except for intentional "dot/node" elements.

**Color Usage:** Illustrations draw from the core palette only — Primary, Secondary, Support as fills; Graphite for line work; Accent used in at most one focal element per illustration, never as a base fill.

**Background Style:** Transparent or White by default. Support-tint backgrounds acceptable for contained illustration blocks (e.g., feature cards).

**Lighting:** Flat, even lighting with soft directional shadow (single light source, top-left, low opacity) for subtle depth — no dramatic gradients or glow effects.

**Depth:** Achieved through layering and scale, not shadows alone. 2–3 layers maximum per illustration.

**Consistency Rules:**
- Every illustration uses the same stroke weight, corner radius, and light direction
- No illustration introduces a color outside the core palette
- Complexity is capped — if an illustration needs more than ~5 distinct shapes to read clearly, simplify the concept, not just the shapes

**When to use illustrations:** Explaining abstract concepts (how a process works, empty states, onboarding, feature differentiation) where photography would feel too literal or corporate stock-photo generic.

**When NOT to use illustrations:** Trust-building moments (testimonials, team, case studies) — those need real photography or honest data, not illustration, or they undercut credibility.

---

## 6. ICON LANGUAGE

- **Family:** Single consistent icon set across the entire product (recommend Phosphor Icons or Lucide — both open-source, consistent stroke logic, huge coverage for future SaaS/dashboard needs)
- **Stroke Thickness:** 1.5–2px at 24px canvas size, scaling proportionally
- **Corner Radius:** Rounded terminals and joins (matches brand shape language) — avoid icon sets with sharp/mitered corners
- **Filled vs Outline:** Outline as default/resting state; filled version reserved for active/selected states only (navigation, tabs, toggles) — this gives you a built-in state language for free
- **Sizes:** Standard scale of 16 / 20 / 24 / 32px — never arbitrary sizing, snap to this scale
- **Consistency:** One icon family system-wide. Never mix outline sets from different libraries — inconsistent stroke weights are one of the fastest ways a UI reads as "unfinished"
- **Accessibility:** Icons used as standalone interactive elements (no visible label) must always have an accessible label (`aria-label`) and a minimum 44×44px tap target on touch devices, even if the visual icon is smaller

---

## 7. IMAGE & PHOTOGRAPHY STYLE

**Mockups:** Clean device frames (browser chrome or minimal device bezels only) — no cluttered desktop backgrounds, no fake browser tabs with unrelated content. Product screenshots should be the hero of the mockup, not the frame.

**Hero Images:** Prefer abstract product visuals, UI compositions, or high-quality environmental photography over generic "people in an office" stock photography. If people are shown, they must look authentic and specific, not stock-generic.

**Background Images:** Subtle, low-contrast, often blurred or used as texture (gradient meshes, soft geometric patterns in Support/Primary tones) — never competing with foreground content.

**Product Previews:** Always shown in-context (inside a device frame or clean container), consistent shadow/elevation treatment across every preview.

**Photography Style (when used):** Natural light, minimal styling, authentic over staged. Cool color grading that complements the blue palette — avoid warm/orange color grading that clashes with the brand system (reserve warmth for the Accent color, not photography).

**Lighting:** Soft, even, natural — no harsh studio lighting or heavy vignettes.

**Composition:** Generous negative space around subjects — photography should feel as considered as the layout it sits in, not cropped tight out of necessity.

**Cropping:** Consistent aspect ratios per use case (e.g., all team photos 1:1, all case study heroes 16:9) — never mix ratios within the same content type.

**Consistency:** Every image on the site should look like it belongs to the same shoot/system, even if sourced from different places. When in doubt, run stock photography through a consistent cool color grade before use.

---

## 8. VOICE & TONE

**Core principle:** Say less, mean more. Nibrexo talks like a senior person who respects your time — not a salesperson, not a hype machine.

| Context | Approach |
|---|---|
| **Website Headlines** | Clear over clever. State the outcome, not the metaphor. |
| **Buttons/CTAs** | Verb + outcome ("Start your project," "See pricing") — never generic ("Click here," "Submit") |
| **Descriptions** | One idea per sentence. Cut every adjective that isn't doing work. |
| **Marketing** | Confident, specific, proof-driven — claims are backed by something concrete (numbers, examples), never vague superlatives |
| **Emails** | Direct subject lines, no false urgency, no exclamation-point stacking |
| **Documentation** | Precise, step-based, assumes competence — never condescending, never over-explains basics |
| **Support** | Warm but efficient — acknowledge the problem in one line, then solve it |

**Words/Patterns to Avoid:**
"Revolutionize," "game-changing," "unlock your potential," "seamless" (overused to the point of meaninglessness), "in today's fast-paced world," exclamation points in body copy, rhetorical questions as headlines ("Ready to transform your business?").

**Instead:** Say what it does, for whom, and why it matters — in that order.

---

## 9. INTERACTION & MOTION PRINCIPLES

*(Referenced from Section 2, detailed here for implementation consistency.)*

- **Purpose over decoration:** Every animation must clarify state, hierarchy, or cause-and-effect. If removing an animation loses zero information, remove it.
- **Duration:** 150–250ms for micro-interactions (hover, focus, toggles), 300–400ms for larger transitions (modals, page sections). Never exceed 500ms for any UI feedback.
- **Easing:** Ease-out for elements entering/appearing, ease-in for elements leaving — never linear (feels robotic), never heavy bounce/elastic easing (undermines "premium calm").
- **Hover States:** Subtle — slight elevation (shadow), slight color shift (Primary → Secondary), never scale transforms above 1.03x.
- **Scroll Animations:** Fade/slide-in allowed for section entrances, used once per section max — repeated per-element stagger animations feel busy and slow down perceived performance.
- **Loading States:** Skeleton screens preferred over spinners wherever layout is predictable — reduces perceived wait time.

---

## 10. BRAND CONSISTENCY RULES

### What Never Changes (without an explicit, documented decision)
1. The six core brand colors and their defined roles (Section 3)
2. The typography scale and font roles (Section 4)
3. The 8px spacing system and corner radius scale (Section 2)
4. The icon family and stroke weight (Section 6)
5. The motion duration/easing standards (Section 9)
6. The "Amber = exception, not pattern" rule

### What Can Flex Per Page (within the system)
- Content layout arrangement (as long as it uses the defined grid)
- Which illustration or photography style is used *where* (as long as it follows Section 5/7 rules)
- Section-specific copy tone (within the defined voice)

### How Future Work Stays Consistent
- Every new page/component starts by referencing this document, not by referencing the *previous page* (previous pages may contain undocumented judgment calls — this document is the source of truth)
- If a new requirement seems to need a new color, font, radius value, or motion pattern, that's a signal to solve it within the existing system first — new tokens are added only when the system genuinely cannot express the need, and only with an explicit reason logged
- Any deviation must be flagged and justified before implementation, not discovered after

---

## Open Decision Needed From You
Before we move to the first page/module, please confirm:
1. **Typography:** Proceed with Cabinet Grotesk (display) + Sora (interface/body) as recommended, or keep Sora-only as a single-family system? Or is there a specific reason Amoresa needs to stay (e.g., existing wordmark)?
2. **Icon library:** Any preference between Phosphor and Lucide, or should I pick based on the first module's needs?

Once confirmed, this document is locked as v1.0 and every future module will be built against it.
