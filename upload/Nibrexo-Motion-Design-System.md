# NIBREXO — MOTION DESIGN SYSTEM
### Premium Experience Guidelines v1.0
*This document extends Brand Identity v1.0, Layout & Design Principles v1.0, and the Global Component System v1.0. It defines how the static system defined in those documents moves, responds, and transitions. Where a request conflicts with a rule already established (see flagged notes throughout), the resolution is stated explicitly rather than silently overriding either document.*

---

## 0. MOTION PHILOSOPHY

**Why motion exists on Nibrexo:** Motion is not decoration — it is the layer that communicates *cause and effect, relationship, and priority* in ways static design cannot. Every millisecond of animation on this site must answer: "what would the user misunderstand without this?"

**How motion improves UX:** It confirms actions happened (button press → visible feedback), previews what's about to happen (a card lifting before it's clicked signals it's clickable), and reduces cognitive load by showing *change* rather than forcing the user to detect it themselves (content appearing vs. abruptly replacing).

**How motion improves readability:** Staggered, sequential reveals let the eye process information in the intended order rather than being confronted with a full, dense screen at once — motion paces the reading experience the way punctuation paces a sentence.

**How motion improves accessibility:** Motion can clarify state changes for users who might miss a static color change (a field shifting smoothly to an error state is more noticeable than an instant color swap) — but only when it respects `prefers-reduced-motion` (§13) and never becomes the *only* channel conveying information.

**How motion guides attention:** Directional motion (elements entering from a consistent direction) and timing (what appears first) are among the strongest attention-direction tools available — stronger than color, because the eye is drawn to *change* before it processes *what changed*.

**How motion increases trust:** Predictable, consistent motion timing across the whole site builds an unconscious sense of reliability — the same instinct that makes a well-engineered physical product (a car door, a laptop hinge) feel trustworthy before you know anything about its internals. Erratic or inconsistent timing has the opposite effect, even if each individual animation looks fine in isolation.

**How motion affects perceived quality:** Duration and easing are, technically, tiny details — but they're one of the fastest signals a user's brain uses to judge "cheap" vs. "premium," often faster than they consciously register layout or color. Slightly-too-fast, linear-eased motion feels cheap regardless of how good the visual design is; correctly-eased, unhurried motion feels expensive even on a simple layout.

---

## 1. ANIMATION PRINCIPLES

**Natural Movement:** All motion follows physical intuition — objects don't teleport, they don't move at constant velocity (nothing in the physical world does), and larger/heavier-feeling elements (modals, page sections) move more slowly than small/light elements (icons, toggles).

**Consistency:** The same *type* of transition always means the same thing system-wide. If content entering the viewport fades+rises, it does so everywhere — a user should never have to relearn what an animation means on a different page.

**Timing & Duration Scale** (extends Layout §9 / Component §1 motion tokens with the full system):

| Speed | Duration | Use |
|---|---|---|
| Instant | 100ms | State toggles (checkbox, radio) — feedback must feel immediate |
| Fast | 150–200ms | Button/icon hover, focus rings, small UI feedback |
| Standard | 250–300ms | Card hover lift, dropdown open, tab switch |
| Moderate | 350–450ms | Modal open/close, section reveals, page-level transitions |
| Slow | 500–700ms | Large hero elements, page transitions, hero background motion — this is the ceiling; nothing on Nibrexo animates slower than this |

**Delay:** Used only for staggered sequences (§4) — never used to artificially "add drama" to a single element. A single element that could animate immediately should never have an arbitrary delay added.

**Acceleration / Deceleration (Easing):**
- **Ease-out** (fast start, slow finish) for anything *entering* — mimics an object arriving and settling, feels natural and calm
- **Ease-in** (slow start, fast finish) for anything *exiting* — mimics an object departing with intent
- **Ease-in-out** for anything that moves and returns (hover states, toggles)
- **Never linear** — linear motion has no physical analog and is the single fastest way to make an interface feel robotic/cheap
- **Never bounce/elastic/spring-overshoot** — overshoot easing reads as playful/consumer-app, directly conflicting with "calm, confident, premium" brand personality

**Motion Hierarchy:** Primary content (headline, hero visual) animates first and/or most prominently; supporting content follows with shorter delay and subtler movement. Motion hierarchy should always match visual hierarchy (Layout §7) — never animate a secondary element more dramatically than the primary one it supports.

**Motion Rhythm:** Extends Layout §10's breathing-pattern logic into time: sections shouldn't all animate identically back-to-back. Vary entrance style subtly (fade+rise vs. simple fade) the way Layout §10 varies visual composition, to avoid the page feeling metronomic.

**User Attention:** Only one thing should be animating to draw attention at any given moment in a static viewport — simultaneous competing animations fracture attention rather than directing it.

**Motion Restraint:** The default assumption for any new element is **no animation** unless a specific purpose is identified. This is the single governing rule of the entire system — restraint is not the absence of a decision, it *is* the decision.

**Micro Feedback:** Every interactive element provides feedback within one frame of interaction (§ Component System §14) — this is about responsiveness, not embellishment, and matters more for perceived quality than any entrance animation.

---

## 2. PAGE TRANSITIONS

**Governing decision:** Nibrexo uses **fade + slight rise (8–12px)**, never slide, scale, or blur, for page-level transitions. Reasoning: slide transitions imply spatial relationship between pages (like a carousel) which doesn't exist in a typical site's IA and can be disorienting; scale transitions feel more like an app/game convention than a content site; blur transitions are expensive to render well and often read as a loading glitch rather than an intentional effect. Fade+rise is calm, fast, universally legible, and matches the "elements settle into place" language used throughout the reveal system (§4).

| Page Type | Transition Behavior |
|---|---|
| **Landing Page** | Fade+rise on load (staggered per §4 hero rules), no exit transition needed on first load |
| **Internal Pages** | Fade+rise, 300ms — consistent with all standard navigations |
| **Store Pages** | Same as internal, with product grid using staggered entrance (§4) on first paint |
| **Dashboard Pages** (future SaaS) | Faster, 200ms fade only (no rise) — dashboards are used repeatedly by the same person; speed matters more than ceremony once a user is a returning, task-focused visitor |
| **Blog Pages** | Standard fade+rise; featured image may cross-fade specifically for visual continuity from the blog list thumbnail |
| **Checkout** | Minimal motion — 200ms fade only between steps, explicitly *less* animated than marketing pages, because friction/anxiety during payment should never be added to by decorative motion; speed and stability matter more here than anywhere else on the site |
| **Support / Contact** | Standard fade+rise |
| **404** | Standard fade+rise, paired with a distinct, calm illustration (per Brand Identity §5) — never played for humor/gimmick, which undercuts trust at a moment the user is already slightly frustrated |
| **Success Page** | Fade+rise plus the subtle success motion defined in §9 — the one place a slightly warmer, more celebratory (but still restrained) motion moment is appropriate |
| **Error Page** | Standard fade+rise — deliberately *not* dramatized; an error should feel calmly handled, not amplified |
| **Loading Page** (full-page, rare) | No transition in — this state should barely be seen; if a full loading page is visible for more than ~1s, that's a performance problem to fix, not a motion opportunity |

**Developer note:** Implement page transitions via CSS view-transitions or a lightweight opacity/transform animation on route change — avoid heavy JS transition libraries where CSS achieves the same result; ties directly to §14 Performance.

---

## 3. SECTION REVEALS

**Trigger:** Intersection Observer at ~15–20% element visibility (element is meaningfully in view, not just touching the viewport edge) — never on page load for below-the-fold content, and never on every scroll pixel (that causes jank).

**Shared reveal pattern:** Fade + 16–24px rise, 350–450ms, ease-out. Applied once per element on first entry — **never re-triggers on scroll-back-up-and-down again** (re-triggering reads as buggy, not premium, and actively annoys users scanning back through a page).

| Section | Animation Detail |
|---|---|
| **Hero** | On load (not scroll-triggered, since it's already in view): staggered entrance — eyebrow label (0ms) → headline (80ms delay) → subheadline (160ms) → CTA (240ms) → hero visual (120ms, animates in parallel with text, slightly slower duration since it's visually larger) |
| **Features** | Staggered per card, 60–80ms delay between each, capped at 4–5 items staggering before the rest reveal together (beyond that, sequential delay makes the section feel slow to finish) |
| **Pricing** | Cards reveal together (not staggered) — pricing needs to be compared side-by-side immediately, sequential reveal would delay the comparison the user is there to make |
| **FAQ** | Simple fade+rise on the section container as a whole; individual accordion items don't need entrance stagger (adds delay to an already-late-page utility section with no payoff) |
| **Testimonials** | Fade+rise, carousel (if used) begins any autoplay only after the section has fully entered and settled |
| **Portfolio** | Staggered per item, slightly faster (250ms/40ms delay) since portfolio grids are often larger — long stagger sequences on big grids feel sluggish |
| **Blog** | Same staggered card pattern as Features |
| **Products** | Same as Portfolio — grid-scale content favors speed over ceremony |
| **CTA** | Simple fade+rise, no stagger (it's a single focused block by design — Layout §8) |
| **Newsletter** | Simple fade+rise |
| **Footer** | No scroll-reveal animation at all — by the time a user reaches the footer, continued "reveal ceremony" reads as excessive; footer should simply be present |

---

## 4. SCROLL EXPERIENCE

| Effect | When to Use | When NOT to Use |
|---|---|---|
| **Fade** | Default entrance treatment for nearly all content | Never combine fade with more than one other effect on the same element (fade+rise is the ceiling of complexity for standard content) |
| **Move (rise)** | Paired with fade as the standard entrance (§3) | Never move elements more than ~24px — larger movement reads as sliding, not settling |
| **Scale** | Rare accent use only — e.g., a hero visual scaling from 96%→100% on load for subtle presence | Never on text (scaling text on entry hurts legibility during the transition and feels gimmicky) |
| **Blur** | Very limited — e.g., a background decorative shape resolving from soft blur to sharp as a hero loads, once per page maximum | Never on foreground/readable content — blur-to-sharp text transitions are a performance and legibility risk |
| **Parallax** | Extremely limited — at most one subtle background-layer parallax moment (e.g., hero background shape moving slightly slower than foreground content on scroll) | Never multi-layer parallax, never on text, never anywhere it could disorient or contribute to motion sickness (§13) — heavy parallax is explicitly on the Things-to-Avoid list and directly conflicts with brand calmness |
| **Float** | Reserved for a single, very subtle decorative background shape (§12), if used at all | Never as a repeated pattern across multiple elements/sections — constant floating is explicitly flagged as a mistake (§16) |
| **Stick** | Navigation (§ Component System §5), Order Summary during checkout, Table of Contents on long docs/blog pages | Never more than one sticky element competing for the same screen edge simultaneously |
| **Pin** | Rare, intentional storytelling moments only (e.g., a case-study section where an image stays pinned while supporting text scrolls past) — used at most once per page if at all | Never as a default pattern; pinning is disorienting if overused and should feel like a deliberate narrative choice, not a template default |
| **Reveal** | The default mechanism for all section entrances (§3) | N/A — this is the baseline, not an exception |

**Governing rule:** If more than one of the above effects would apply to the same element, choose the simplest one that achieves the goal. Nibrexo's scroll experience should feel calm and controlled, never like a demo reel of scroll techniques.

---

## 5. MICRO-INTERACTIONS

Extends Component System §14 with motion-specific timing per element:

| Element | Feedback |
|---|---|
| **Buttons** | Per Component §2 states — hover elevation+color shift (150ms), press (100ms scale-down to 0.98) |
| **Cards** | Hover lift (2–4px translateY + elevation increase), 250ms ease-out, only on clickable cards |
| **Links** | Underline slides in from left or opacity/color shift, 150ms — never a bold jump/weight change (causes layout shift) |
| **Navigation** | Active-state indicator slides/fades to new position (200ms) rather than jumping |
| **Search** | Expand animation 250ms ease-out; results fade in individually as they resolve (not all-at-once if async) |
| **Inputs** | Border color + focus ring transition, 150ms; label micro-shift if using a floating-label pattern (not required by Component System, but if adopted: 150ms ease-out) |
| **Dropdowns** | Panel fades+rises in (200ms), individual options have no separate entrance animation (adds unnecessary delay to a utility interaction) |
| **Tabs** | Active indicator slides to new tab position (250ms), content cross-fades (200ms) rather than instantly swapping |
| **Accordions** | Height animates smoothly (300ms expand / 250ms collapse, ease-out/ease-in respectively), chevron rotates in parallel |
| **Checkboxes / Radio Buttons** | Checkmark draws in or fills (150–200ms) — a satisfying, precise micro-moment; never a jarring instant swap |
| **Wishlist** | Icon fill transitions with a subtle scale-pulse (1 → 1.15 → 1, ~300ms total) — one of the few places a slightly more expressive micro-moment is appropriate, since it's a low-stakes, high-frequency delight opportunity |
| **Cart** | Item addition triggers a brief icon/count pulse (same pattern as wishlist), cart panel slides in from the right (300ms ease-out) |
| **Filters** | Applied filter tags fade+scale in (200ms); removing a filter fades it out before the grid re-flows (prevents jarring instant re-layout) |
| **Pagination** | Page content cross-fades (250ms) rather than jumping instantly, current-page indicator slides |
| **Downloads** | Button transitions through Component §2 loading state, completes with a brief success checkmark (§9) |
| **Notifications** (toast) | Slide+fade in from the edge (250ms ease-out), auto-dismiss fades out (200ms ease-in) — never abrupt disappearance |

---

## 6. HOVER EXPERIENCE

**Governing philosophy:** Hover should always feel like *quiet acknowledgment*, never a performance. The test for every hover effect below: would a senior engineer at a company like Stripe or Linear consider this restrained, or would they consider it try-hard? If uncertain, remove an intensity step.

| Element | Hover Behavior |
|---|---|
| **Images** | Very subtle scale (1 → 1.02–1.03 max) with overflow-hidden container, 300ms ease-out — communicates "this is explorable" without feeling gimmicky |
| **Cards** | Elevation lift + 2–4px rise (§5) — the primary hover language for the whole site |
| **Buttons** | Color/fill shift + elevation per Component §2 — no scale transform beyond the 0.98 press-state |
| **Icons** | Color shift to Primary, no movement — icons are small enough that any transform reads as jittery rather than elegant |
| **Navigation** | Underline or subtle color shift on nav items, active-page indicator persists distinctly from hover state |
| **Products** | Image swap-on-hover (primary photo → secondary/lifestyle photo) is acceptable and common in commerce UX — crossfade, not hard cut, 200ms |
| **Portfolio** | Overlay fades in with title/category (§ Component §3 Portfolio Card rule), image beneath may have the same subtle scale as Images above |
| **Statistics** | No hover effect — these are informational, not interactive; adding hover motion here falsely implies clickability |
| **Pricing** | Card-level hover only on non-featured plans (subtle lift); the featured/recommended plan already has permanent emphasis (Component §3) and doesn't need additional hover distinction |

**Avoid childish effects — explicitly excluded from this system:** wobble/jelly effects, confetti/emoji bursts on hover, cursor-following blobs, exaggerated bounce, color-cycling/rainbow effects, and sound effects on hover. None of these appear anywhere in Nibrexo's motion vocabulary.

---

## 7. LOADING EXPERIENCE

| Context | Pattern |
|---|---|
| **Skeleton Loading** | Matches final content's exact shape/proportions (Component §6) — used for cards, lists, dashboard panels |
| **Progress Indicators** | Determinate bar with label for known-duration processes (uploads, multi-step checkout); always paired with percentage or step count |
| **Lazy Loading** | Images/media fade in (200ms) once loaded rather than popping in abruptly; reserve a placeholder space (via aspect-ratio) so layout never shifts as content loads — critical for both perceived quality and Core Web Vitals (CLS) |
| **Image Loading** | Low-quality placeholder (blurred or solid brand-tint color matching the image's dominant tone) fades to full image on load |
| **Page Loading** | Should rarely be visible at all given performance targets (§14); if unavoidable (slow network), a minimal branded spinner, never a full-screen splash with logo animation (reads as legacy/heavy, not premium-fast) |
| **Button Loading** | Component §2 spec — label replaced by spinner at fixed dimensions, no layout shift |
| **Checkout Loading** | Same minimal philosophy as Checkout page transitions (§2) — speed and reassurance over decoration; consider an explicit "Processing your payment, don't refresh" message paired with the loading state, since anxiety is highest here |
| **Dashboard Loading** | Skeleton-first (matches the eventual data layout), never a blocking spinner for a page the user will return to repeatedly |
| **Product Loading** | Skeleton grid matching final Product Card layout (Component §3) |

---

## 8. SUCCESS EXPERIENCE

**Governing philosophy:** "Subtle celebration" means a single, restrained motion moment — a checkmark drawing in, a soft scale-pulse, a brief color transition — never confetti, particle effects, or multi-second animation sequences. The emotional payoff comes from *resolution* (tension → relief), not spectacle.

| Moment | Treatment |
|---|---|
| **Purchase / Order Success** | Checkmark icon draws in (400ms), success message fades+rises in immediately after (staggered ~100ms), order summary follows |
| **Download Ready** | Button success state (Component §2) — brief checkmark swap, then reveals the download action |
| **Account Created** | Same checkmark pattern, transitions into onboarding/next-step content |
| **Newsletter Joined** | Inline confirmation message replaces the form (fade cross-transition), no separate modal needed for something this low-stakes |
| **Message Sent** | Same inline-replacement pattern as newsletter |
| **Payment Successful** | Most significant success moment on the site — checkmark + brief scale-settle (1 → 1.05 → 1, 400ms total), paired with clear next-step content; still no confetti — restraint reinforces trust precisely at the highest-stakes moment |
| **Login Success** | Minimal — fade transition into the destination page is sufficient; login is a frequent, low-emotional-stakes action and doesn't need its own celebration moment |

---

## 9. ERROR EXPERIENCE

**Governing philosophy:** Motion during errors exists to *reduce* frustration, never to dramatize the failure. No shake effects, no red flashing, no aggressive attention-grabbing motion — calm acknowledgment plus a clear path forward.

| Error | Recovery-Focused Treatment |
|---|---|
| **404** | Calm fade+rise entrance, brand-consistent illustration (Brand Identity §5), clear navigation options back to useful content — never a joke/gimmick that undercuts trust |
| **500 / Network Failure** | Plain-language explanation, retry action with Component §2 loading state, no dramatized error iconography |
| **Payment Failed** | Inline, specific message near the failed field/step (not a generic modal), retry path immediately visible — this is a high-anxiety moment; motion should feel like steady reassurance, not additional alarm |
| **Login Failed** | Field-level inline error (Component §4 pattern), gentle border-color transition (never a shake — shake is a dated, slightly patronizing pattern that reads as scolding the user) |
| **Validation Errors** | Field-level, inline, appears via smooth height/opacity transition beneath the field (Component §4) |
| **Empty Cart** | Not technically an "error," but recovery-focused: friendly illustration + clear browse/shop CTA (see §11 Empty States) |
| **Search Empty** | Same pattern — no results is reframed as "here's what to try next," not a dead end |
| **Product Not Found** | Same 404-adjacent pattern, scoped to the store context, with a link back to the relevant category |
| **Download Error** | Inline retry action on the button itself (returns to default state, then re-attempts on click) rather than a separate error page |

---

## 10. EMPTY STATES

Motion layer on top of Component §6/§16 empty-state content rules: every empty state fades+rises in like any other content (§3 pattern) — no special/different animation category is needed. The differentiator is content (icon + explanation + action), not motion. Applies consistently to: Wishlist, Cart, Dashboard, Orders, Downloads, Search, Notifications, Support, Blog, Portfolio.

---

## 11. PREMIUM DETAILS
*(See the conflict note at the top of this document — each item below is scoped deliberately, not applied broadly.)*

| Detail | Scoped Guidance |
|---|---|
| **Floating background shapes** | At most one subtle, slow-moving (or entirely static) decorative shape per hero section — never multiple, never fast, never present on every section of a page |
| **Soft gradient glow** | Reserved for hero sections and pricing "featured plan" emphasis only — a single soft glow, low opacity, never stacked with other effects |
| **Blur transitions** | Only for a single decorative background element resolving into focus on load (§4) — never on content |
| **Card lift** | The system's primary, most-used hover language (§6) — this is the workhorse effect, not a rare accent |
| **Magnetic buttons (subtle)** | Scoped to true hero-level primary CTAs only, and kept extremely subtle (a few px of cursor-following offset, capped) — not applied to standard buttons throughout the site, where it would feel gimmicky at repetition |
| **Ripple effects** | Not adopted. This is a Material Design signature pattern; using it works against Nibrexo having a distinct motion identity. Component press-states (§ Component §2, scale-down on press) achieve the same "acknowledged" feeling without borrowing another design system's language |
| **Cursor feedback (optional)** | Optional and low-priority — if implemented, scoped to a custom cursor state only on large interactive canvas areas (e.g., portfolio case-study hero), never system-wide |
| **Animated counters** | Appropriate for Statistics components (Component §3/§8) — numbers count up once on scroll-entry, never re-trigger, never used for values that could feel manipulative (e.g., artificially inflating perceived speed of a counter) |
| **Progress bars** | Functional use only (§7) — not used decoratively |
| **Live indicators** | Small pulsing dot (slow, subtle opacity pulse, ~2s cycle) for genuinely live/real-time states only (e.g., "X people viewing this product," support chat online status) — never fabricated to imply activity that isn't real |
| **Status badges** | Static, no motion needed — a badge appearing follows the standard fade+rise entrance, nothing further |
| **Background movement** | Same constraint as floating shapes — at most one slow, subtle instance, never a repeated pattern |
| **Glass overlays (where appropriate)** | Scoped strictly to elevated overlay contexts (modals, mega-menu panels) where a subtle backdrop-blur helps separate layers functionally — not used as a general surface treatment on cards or sections, which would conflict with Brand Identity's flat, non-layered shape language |
| **Noise textures (very subtle)** | Not adopted as a default. Conflicts with the clean, flat illustration/surface language in Brand Identity §5. If you have a specific reason to want subtle texture (e.g., a printed/tactile feel for a specific campaign), flag it and we'll scope a one-off use rather than adding it to the base system |
| **Gradient lighting** | Same scope as soft gradient glow — hero and featured-moment use only |

---

## 12. ACCESSIBILITY

- **`prefers-reduced-motion` is respected globally, without exception.** When set, all entrance animations (fade+rise, stagger, scale, parallax, floating/background movement) are replaced with an instant or near-instant (≤50ms) opacity-only change. Functional motion that communicates state (loading spinners, focus rings) remains, since removing it would remove necessary information — only *decorative* and *large-scale* motion is disabled.
- **Alternatives are provided, not just "less motion."** Where motion currently communicates something (e.g., a counter animating up to show growth), the reduced-motion version still shows the end value clearly and immediately — the information is never lost, only the animated delivery of it.
- **Motion sickness avoidance:** No parallax beyond the single scoped exception in §4, no scale/zoom transitions on large content areas, no simultaneous multi-directional movement — these are common vestibular triggers and are excluded from the system entirely, not just minimized.
- **Keyboard usability is never gated by animation.** No interactive element becomes focusable or operable only after an animation completes; animations must not trap or delay keyboard focus.
- **Animations never block interaction.** A user can always click through/interrupt a non-critical animation (e.g., clicking a nav item mid-page-transition should register immediately, not queue behind the animation finishing).

---

## 13. PERFORMANCE

- **CSS animations/transitions are the default implementation** for all standard motion (hover, entrance, state changes) — GPU-accelerated properties only (`transform`, `opacity`), never animating `width`, `height`, `top`/`left`, or `box-shadow` directly (all trigger layout/paint recalculation and hurt frame rate).
- **JavaScript is reserved for what CSS genuinely can't do** — scroll-triggered reveal logic (Intersection Observer, which is lightweight), complex sequenced staggers, and the very limited parallax/pin exceptions in §4. Full animation libraries are avoided unless a specific, justified need (e.g., complex SVG path animation) can't be reasonably achieved otherwise.
- **Lighthouse/Core Web Vitals protection:** every media element reserves layout space (aspect-ratio) before load to prevent Cumulative Layout Shift; animations never run on page-load-critical content in a way that delays Largest Contentful Paint.
- **Battery/mobile protection:** any continuous/looping motion (live indicator pulse, rare background movement) uses the lightest possible CSS technique, pauses when the tab/element is not visible (`IntersectionObserver`/`visibilitychange`), and is disabled entirely under `prefers-reduced-motion`.

---

## 14. THINGS TO AVOID

| Mistake | Why It Hurts | Prevention |
|---|---|---|
| **Fast, flashy motion** | Reads as cheap/aggressive, opposite of "calm, premium" | Duration scale (§1) sets a floor — nothing under 100ms except instant toggles |
| **Long transitions** | Feels sluggish, frustrates users on repeat visits | 700ms hard ceiling (§1) for any single animation |
| **Random/inconsistent movement** | Undermines the trust-through-consistency effect (§0) | Every entrance pattern reuses the same fade+rise language (§3) |
| **Constant floating** | Distracting, drains battery, explicitly contradicts brand calmness | At most one subtle instance per page (§11), never a repeated pattern |
| **Heavy parallax** | Motion-sickness risk, dated aesthetic, disorienting | Effectively excluded (§4/§12) except one narrow, optional exception |
| **Distracting effects generally** | Pulls attention away from content instead of toward it | Motion Restraint principle (§1) — no animation without identified purpose |
| **Excessive blur** | Performance cost, legibility risk, murky "unfinished" look | Scoped to single decorative background use only (§4/§11) |
| **Overused glassmorphism** | Conflicts with flat brand surface language, ages quickly as a trend | Scoped strictly to modal/overlay contexts (§11) |
| **Animation without purpose** | The core anti-pattern this entire document exists to prevent | Every rule above ties motion to a specific UX, trust, or hierarchy function |

---

## SENIOR REVIEW ADDENDUM — WEAKNESSES IDENTIFIED AND RESOLVED

Reviewing as a cross-functional team before finalizing surfaced the following, folded into the sections above:

1. **Direct contradiction in the original brief** — "floating background shapes" was requested as a Premium Detail while "constant floating" was simultaneously flagged as a mistake to avoid. Resolved (§11) by scoping floating elements to a single, slow, optional instance — satisfies the premium-detail intent without violating the avoid-list rule.
2. **Trend-driven patterns (ripple, glassmorphism, noise texture) risked contradicting Brand Identity's flat, restrained surface language.** Rather than adopting them wholesale or rejecting them outright, each was scoped to a narrow, justified context or explicitly not adopted, with reasoning — keeping this document consistent with decisions already locked in rather than quietly overriding them.
3. **Checkout and payment moments needed explicitly *less* motion than the rest of the site, not more** — the original brief treated all "success/error" states similarly, but financial-transaction moments carry higher user anxiety, where restraint matters more than anywhere else on the site. Added explicit lower-motion guidance for Checkout throughout §2, §7, §9.
4. **No performance/CWV grounding for the "float/parallax/blur" scroll effects** as originally listed — added explicit GPU-property-only implementation guidance (§13) so these effects can't silently become a performance liability.
5. **Reduced-motion handling needed to distinguish decorative vs. functional motion**, rather than a blanket "turn everything off," which would remove genuinely useful state feedback (loading, focus) for users who need it most. Clarified in §12.

---

This document is now locked as v1.0, alongside Brand Identity, Layout & Design Principles, and the Global Component System — all four now form the complete foundation. The Homepage is ready to be built directly against this full system whenever you're ready to move into page work.
