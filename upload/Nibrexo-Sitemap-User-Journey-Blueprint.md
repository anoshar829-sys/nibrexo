# NIBREXO — SITEMAP & USER JOURNEY BLUEPRINT
### Master Reference v1.0
*This document expands and supersedes Phase 5–7 of the Foundation Finalization document with full detail. It fully inherits and does not alter: Phases 1–4 and 8 of that document, and the v1.1 Business Navigation Strategy addendum (Digital Products = highest priority, Agency Services = secondary, Resources = supporting). Anything below that references priority, CTA labels, or nav structure is applying those locked decisions, not re-deciding them.*

---

## PART 1 — COMPLETE WEBSITE SITEMAP

```
Home  [Highest-traffic entry point — see Part 5]

├── Products  ★ PRIMARY BUSINESS PILLAR
│   ├── Category (e.g., Templates, UI Kits, Tools, AI Prompts)
│   │   └── Product Detail
│   ├── Cart
│   ├── Checkout
│   └── Payment Success
│
├── Services  (Secondary pillar)
│   ├── Service Detail (e.g., Brand Identity, Web Design, Product Design)
│   ├── Solutions (by industry — Healthcare, Education, Startups, Agencies)
│   ├── Portfolio
│   │   └── Case Study Detail
│   └── Book a Consultation
│
├── Resources  (Supporting pillar)
│   ├── Blog
│   │   ├── Category
│   │   └── Article
│   ├── Guides  (formerly "Documentation")
│   │   ├── Guide Category
│   │   └── Guide Detail
│   └── Free Resources
│       └── Email Signup (gate) → Product Recommendations
│
├── Pricing
│
├── About
│   ├── Team
│   └── Careers (future)
│
├── Support
│   ├── FAQ
│   ├── Contact
│   └── Ticket Submission
│
├── Account  (Utility Nav entry point)
│   ├── Login*
│   ├── Register*
│   ├── Forgot Password*
│   ├── Dashboard
│   ├── Orders
│   ├── Downloads
│   ├── Wishlist
│   └── Settings
│
├── Search Results
│
├── Legal
│   ├── Privacy Policy
│   ├── Terms of Service
│   ├── Refund Policy
│   ├── License
│   ├── Cookies Policy
│   └── Disclaimer
│
└── 404 / Error

Future Modules (placeholders in IA now, not built):
├── SaaS Platform
│   ├── Product / Features
│   ├── Pricing
│   ├── Signup / Onboarding
│   └── Dashboard (separate app shell — dark-mode-eligible)
├── AI Products
│   ├── Catalog
│   └── Product / Demo Detail
├── Marketplace
│   ├── Browse (multi-vendor)
│   ├── Vendor Storefront
│   └── Vendor Dashboard (separate onboarding track)
├── Academy  (= "Education Platform" from the original project brief, now named)
│   ├── Course Catalog
│   ├── Course Detail
│   └── Student Dashboard
└── Community  (new — not previously scoped)
    ├── Discussions
    └── Member Profiles
```

**\*Auth pages (Login/Register/Forgot Password):** Implemented as modals for in-context access (opened from Utility Nav without a full navigation, preserving cart/form state per Component System §10), but each has a real, directly linkable URL. This is required so password-reset emails, direct bookmarks, and non-JS/SEO contexts all work correctly — a modal-only implementation would break all three.

**Depth check:** Every page above is reachable within 3 clicks from Home, except individual Blog Articles and Guide Details at high content volume — acceptable and expected once the archive grows into hundreds of items (Part 6 addresses this with category/search as the real navigation mechanism at scale, not deep click-paths).

---

## PART 2 — USER JOURNEYS

### Journey A — Visitor → Product Purchase (Highest Priority)
1. Arrives at Home → sees Products as the visually dominant path (v1.1)
2. Home → Products (Primary Nav) or directly via Category-level SEO landing
3. Product Category → filters/sorts (Component §7) → Product Detail
4. Product Detail → reviews license info, trust signals → Add to Cart
5. Cart → Checkout → Payment → Payment Success
6. Payment Success → Account/Downloads (immediate access, no friction)
7. **Business note:** This is the shortest, most frictionless journey on the site by design — every extra step here has a measurable revenue cost, since this is the primary revenue journey (v1.1).

### Journey B — Visitor → Agency Client
1. Arrives at Home → Services (secondary CTA: "View Services")
2. Services → Solutions (self-identifies by industry: Healthcare, Education, Startup, Agency)
3. Solutions → Portfolio (proof of quality)
4. Portfolio → Case Study Detail (proof of outcome)
5. Case Study → Book a Consultation
6. Consultation form → Contact confirmation
7. **Business note:** Deliberately longer and proof-heavy — high-value agency clients need trust-building steps a product buyer doesn't (Layout §2 Context→Value→Proof→Action logic applies most heavily here).

### Journey C — Visitor → Resource Reader → Email Subscriber → Customer
1. Arrives via organic search/social directly on a Blog Article or Guide (not Home — this is the one journey that commonly bypasses the homepage entirely)
2. Article/Guide → Related content (Phase 6 cross-linking) or Free Resources
3. Free Resources → Email Signup (gate)
4. Post-signup → Product Recommendations (tagged to the resource topic, per the personalization note flagged in the prior response)
5. Recommendations → Product Detail → converges into Journey A
6. **Business note:** This is the long-cycle journey supporting SEO/authority (v1.1, Resources = supporting-but-strategic). Success here is measured over weeks/months, not a single session — nurture sequencing (email) matters more than on-page conversion pressure.

### Journey D — Returning Customer
1. Direct visit or Login (from any page's Utility Nav)
2. Account Dashboard → Orders/Downloads (primary return reason) or Wishlist
3. Optional: Dashboard surfaces relevant new Products (cross-sell) based on purchase history
4. **UX note:** Returning customers should never be routed back through the full Home → Products discovery path — Dashboard is a direct, no-friction re-entry point, distinct from Journey A's first-time discovery flow.

### Journey E — Support Journey
1. Any page → Support icon/link (Utility Nav or Footer)
2. Support → FAQ search first (self-serve, lowest cost/friction)
3. If unresolved → Contact or Ticket Submission
4. Submission → Confirmation, expected response time stated clearly
5. **UX note:** Support must be reachable in exactly one click from any page (persistent Utility Nav placement) — support-seeking users are often already frustrated, and adding navigation friction compounds that.

### Journey F — Future SaaS User
1. Discovers via Home (once SaaS launches, likely a 4th nav consideration — flagged in Part 8) or direct marketing
2. SaaS Product/Features → Pricing → Signup
3. Signup → Onboarding flow (first-run experience, empty states per Component §6/§16)
4. Onboarding → Dashboard (separate app shell, dark-mode-eligible per Foundation Finalization Phase 3)
5. **Business note:** This journey deliberately does not route through Products/Store — SaaS is architected in Phase 5 as its own module specifically so it doesn't dilute or get diluted by the digital-product-store journey's simplicity.

### Journey G — Marketplace Customer
1. Discovers via Home or a Marketplace-specific landing page (future)
2. Marketplace Browse → Vendor Storefront or direct Product
3. Purchase flow converges with Journey A's Cart/Checkout mechanics (same commerce backbone, different inventory source) — **this reuse is intentional**, not a limitation: Marketplace should not require a second, parallel checkout system
4. Separately: **Vendor** track (Browse/apply → Vendor Onboarding → Vendor Dashboard) is entirely distinct from the Customer track above and must never be cross-linked into the buyer journey — a buyer accidentally landing on seller-onboarding content is a common, avoidable marketplace UX failure

---

## PART 3 — PAGE RELATIONSHIPS

| Relationship Type | Rule |
|---|---|
| **Parent → Child** | Products → Category → Product Detail; Services → Service Detail / Solutions / Portfolio → Case Study; Resources → Blog/Guides/Free Resources → Article/Guide Detail; Account → Dashboard/Orders/Downloads/Wishlist/Settings |
| **Cross-Link: Products ↔ Services** | A Service Detail page links to relevant Products where genuinely applicable (e.g., a Brand Identity service page linking to a relevant template) — the one intentional pillar-crossing point established in Foundation Finalization Phase 6, unchanged here |
| **Cross-Link: Resources ↔ Products** | Every Blog Article/Guide links to relevant Product Recommendations (Journey C) — this is Resources' primary job as a supporting pillar, not incidental |
| **Cross-Link: Case Studies ↔ Services** | Every Case Study links back to the relevant Service Detail page it demonstrates |
| **Recommended CTAs** | Per v1.1: Home uses the three-tier CTA set (Explore Products / View Services / Explore Resources). Category and Article pages use page-type-specific terminal CTAs (Phase 6): "Add to Cart," "Request Proposal," Newsletter signup, respectively |
| **Internal Navigation Flow** | Utility Nav (Search, Account, Cart, Support) is present and identical on every single page, without exception — this is what lets a user jump between journeys without returning to Home first |

---

## PART 4 — NAVIGATION STRUCTURE

*(Fully inherits Foundation Finalization Phase 7 as amended by v1.1 — restated here in full for completeness, not re-decided.)*

| Nav Type | Structure |
|---|---|
| **Primary Navigation** | Products (highest visual weight) → Services → Resources (dropdown: Blog, Guides, Free Resources) → Pricing → About |
| **Secondary Navigation** | Context-specific only: Guides sidebar, Account sidebar, Blog category tabs — never appears globally |
| **Utility Navigation** | Search, Account (Login/Register modals or Dashboard if logged in), Cart, Support — persistent, identical on every page |
| **Footer Navigation** | Columns: Product (Products, Pricing) / Company (About, Careers, Contact) / Resources (Blog, Guides, Free Resources) / Legal (Privacy, Terms, Refund, License, Cookies, Disclaimer) — plus social row and newsletter box |
| **Dashboard Navigation** | Sidebar pattern, scoped to Account/Customer Dashboard now; a separate, distinct sidebar instance for future SaaS Dashboard (Phase 3, dark-mode-eligible) — these are two different navigation instances, not one shared component, since their content domains don't overlap |
| **Mobile Navigation** | Off-canvas panel, Primary + Utility items combined into one flat list |
| **Mega Menu Strategy** | Products (once category count exceeds ~3) and future Marketplace use mega menus; Resources uses a simple dropdown (3 items doesn't warrant mega-menu complexity); Services uses a simple dropdown |
| **Sticky Header Behaviour** | Compresses after ~80px scroll; side-column stickies (Order Summary, Guide Table of Contents) permitted concurrently since they occupy a different edge |
| **Search Behaviour** | Persistent icon → full-width overlay, debounced instant search, results grouped/labeled by type (Product / Article / Guide / Service) |

---

## PART 5 — CONVERSION STRATEGY

| Page | Primary Goal | Secondary Goal | Main CTA | Supporting CTA | Trust Signals | Exit Paths |
|---|---|---|---|---|---|---|
| **Home** | Route into Journey A | Build brand trust | Explore Products | View Services / Explore Resources | Logo wall, stats, testimonials | Any nav item, Search |
| **Product Detail** | Add to Cart | Build purchase confidence | Add to Cart / Buy Now | Wishlist | License clarity, reviews, secure-checkout indicator | Related Products, back to Category |
| **Cart** | Proceed to Checkout | Prevent abandonment | Checkout | Continue Shopping | No-surprise-cost messaging | Continue Shopping |
| **Checkout** | Complete purchase | Minimize anxiety | Pay Now | — (intentionally no secondary CTA — see Motion §2 checkout-minimalism rule) | Secure payment badges, clear step progress | Back to Cart only |
| **Service Detail** | Book a Consultation | Build authority | Book a Consultation | View Portfolio | Client logos, outcome stats | Related Case Studies |
| **Case Study** | Book a Consultation | Prove capability | Book a Consultation | View more Case Studies | Specific, named outcomes | Back to Portfolio |
| **Blog Article** | Newsletter signup or Resource-topic-matched product | Build authority/SEO | Explore Resources or topic-matched Product | Newsletter | Author credibility, related content | Related Articles |
| **Free Resources** | Email signup | Lead capture | Download / Get Access | — | Preview of resource quality | Browse more Resources |
| **Pricing** | Route to Checkout or Consultation depending on context | Clarify value | Explore Products / Book a Consultation | — | Transparent pricing, no hidden fees messaging | FAQ section |
| **Support/FAQ** | Self-serve resolution | Reduce ticket volume | Search FAQ | Contact Support | Response-time transparency | Contact form |
| **Account Dashboard** | Re-engagement (repeat purchase) | Reduce support load | View Downloads / Explore Products | — | Order history clarity | Any nav item |

---

## PART 6 — SEO STRUCTURE

**URL Hierarchy:**
```
nibrexo.com/
nibrexo.com/products/
nibrexo.com/products/[category]/
nibrexo.com/products/[category]/[product-slug]/
nibrexo.com/services/
nibrexo.com/services/[service-slug]/
nibrexo.com/case-studies/[case-study-slug]/
nibrexo.com/resources/blog/[category]/[article-slug]/
nibrexo.com/resources/guides/[category]/[guide-slug]/
nibrexo.com/resources/free/[resource-slug]/
```
Flat, predictable, human-readable — every URL segment matches its breadcrumb label exactly (Phase 6 breadcrumb strategy), so URL structure and visible navigation never diverge.

**Category Hierarchy:** Two levels maximum (Category → Product/Article), never three-plus levels deep — deeper hierarchies fragment link equity and confuse both users and crawlers at this business's scale. If Products eventually needs sub-categories at scale, use **filters** (color, price, type — already specified in Component §7) rather than a new URL tier; filters use canonical tags pointing to the parent category (Phase 6), avoiding duplicate-content dilution.

**Blog Hierarchy:** Categories are the URL-defining structure (few, stable, e.g., `/design/`, `/business/`, `/ai-tools/`); **tags are filtering-only and never generate their own indexed URLs** — this is a deliberate scalability decision: a blog with hundreds of posts and both category *and* tag URLs multiplies thin, near-duplicate pages that hurt SEO rather than help it.

**Internal Linking:** Governed by the pillar-and-cluster model (Foundation Finalization Phase 6): Products/Services category pages are pillars; individual Product/Case-Study/Article pages are cluster content linking back up. Resources content additionally cross-links laterally (Article → related Articles) and diagonally (Article → relevant Product), per Part 3 above.

**Breadcrumb Strategy:** `Home / Section / Subsection / Current Page`, matches URL structure exactly, present on every page nested more than one level deep (Component §5).

**Future Scalability:** The two-level category cap and tag/filter-not-URL rule are specifically what let this structure absorb hundreds of future products, articles, and guides without a URL-structure redesign — new content adds *rows* within the existing structure, never new *levels*.

---

## PART 7 — BUSINESS LOGIC

| Section | How It Supports the Business |
|---|---|
| **Digital Products** | Direct revenue, highest priority (v1.1) — the site's core commercial engine; every other section ultimately exists to feed traffic toward or build trust for this one |
| **Agency Services** | Higher-margin, relationship-based revenue; converts visitors who need more than an off-the-shelf product; builds Nibrexo's premium/credibility positioning, which also reflects favorably on Products |
| **Resources** | Zero direct revenue by design — its ROI is organic traffic, brand authority, and email-list growth that feeds Journey C back into Products over a longer time horizon |
| **Support** | Retention and trust infrastructure — reduces churn/refund requests and protects the reputation that both Products and Services depend on |
| **Customer Dashboard** | Retention mechanism — a good post-purchase experience (easy downloads, clear order history) is what makes a one-time buyer a repeat buyer |
| **Future AI Platform** | New revenue category leveraging the same trust/brand equity built by the current site — architected as its own module (Phase 5) specifically so it can launch without requiring Products/Services to be redesigned |
| **Future Marketplace** | Expands revenue from "Nibrexo-made products" to "Nibrexo-curated ecosystem" — reuses the existing commerce backbone (Journey G) rather than fragmenting into a parallel system |

---

## PART 8 — FUTURE EXPANSION

**How new products get added:** New Product Detail pages slot into existing Category pages using the established Product Card component (Component §3) — no new page type, no new template, no IA change required.

**How new services get added:** New Service Detail pages follow the existing template; if a genuinely new service category emerges, it's added as a new child of Services, not a new top-level nav item — protects the Primary Nav's 6-item cap (Phase 7) indefinitely.

**How SaaS gets added:** Launches as a fully separate module per Phase 5's placeholder structure — its own marketing pages, its own Dashboard app shell (Phase 3). The one open question: whether SaaS eventually earns a Primary Nav slot at launch, which would require removing or consolidating an existing item to protect the 6-item cap. Flagged for a decision at that time, not now — premature to solve before the SaaS module itself is scoped.

**How learning content gets added:** Academy launches as its own module (course catalog/detail/student dashboard), structurally identical in pattern to how Products and Resources already work — course content can cross-link into Resources (a Guide referencing a related Academy course) without requiring either system to change.

**How Marketplace gets added:** Reuses the existing Cart/Checkout backbone for the buyer side (Journey G); Vendor onboarding/dashboard is a wholly separate track, avoiding any risk of buyer/seller journey cross-contamination.

**Governing principle for all future expansion:** New content and new page types must fit into the existing two-level hierarchy, existing component library, and existing 6-item nav cap. If a future need genuinely can't fit — the first real test being SaaS's nav-slot question above — that's flagged and resolved explicitly, the same way every other conflict in this project has been, rather than quietly bending the system.

---

## FINAL ARCHITECTURAL AUDIT

Reviewing this blueprint as an Information Architect, UX Director, Business Strategist, SEO Architect, and Product Owner surfaced the following:

| Finding | Assessment | Resolution |
|---|---|---|
| **Community was introduced with zero prior scoping** — not in the original project brief's future vision (AI/SaaS/Education/Marketplace), and not defined beyond two placeholder child pages | Real scope-creep risk — a Community module implies moderation, user-generated content policy, and engagement mechanics far beyond an IA placeholder | Keep as a Future Modules placeholder only (as shown in Part 1), but flag explicitly: this needs its own dedicated scoping/business-case session before any further architecture work happens, unlike SaaS/AI/Marketplace/Academy which were already established in the original brief |
| **Auth pages' modal-vs-page tension** | Resolved earlier in this response | Hybrid approach locked (Part 1 footnote) |
| **SaaS Primary Nav slot is an unresolved future collision** | Real, but correctly deferred — solving it now would mean guessing at a product that isn't scoped yet | Explicitly flagged in Part 8 rather than silently decided |
| **Legal pages (Refund Policy, Cookies, Disclaimer) have no strong internal linking path beyond the footer** | This is correct, not a gap — legal pages are intentionally low-traffic, footer-only destinations; forcing them into primary navigation or content cross-links would be noise, not access | No change needed — noting explicitly so it's not mistaken for an oversight later |
| **Free Resources → Product Recommendations personalization** (flagged in the previous response) | Still open | Restated here as a standing item: needs tagging/category logic before Resources is built, not a pure IA concern |
| **Category depth cap (two levels) is currently untested against Marketplace's likely need for vendor-level grouping** (Browse → Vendor → Product is arguably a third level) | Minor tension with the "two levels maximum" rule in Part 6 | Vendor Storefront functions as a *parallel* browsing entry point, not a strict hierarchical level between Browse and Product — a product remains reachable via `Browse → Product` directly, with Vendor Storefront as an alternate path, not a mandatory intermediate step. This preserves the two-level SEO rule while still supporting vendor browsing |

**No structural weaknesses were found that require redesigning anything already locked.** Every finding above was either a genuine new scope item (Community) correctly deferred, an already-flagged open item restated for visibility, or a minor scoping clarification (Marketplace depth) resolved without contradicting Part 6's core SEO rule.

---

This document is now locked as v1.0, sitting on top of the full foundation (Brand Identity, Layout & Design Principles, Global Component System, Motion Design System, Foundation Finalization v1.1). The complete site structure is defined. The next module is Homepage page design, which can now proceed with a fully resolved sitemap, journey map, and navigation structure to build against.
