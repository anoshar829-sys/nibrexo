# Nibrexo API Contract Audit — Current Active Routes

This audit was checked against the active Flask URL map, adapter source, and temporary-database API tests. Responses use the common envelope `{"ok": true, "data": ...}` or `{"ok": false, "error": {"message": ...}}`. No endpoint returns passwords, password hashes, provider secrets, or encryption keys.

**Frontend adapters audited:** `public-api.js`, `store-api.js`, `account-api.js`, `admin-api.js`, and `automation-api.js`.

**Infrastructure status:** local regression tests use SQLite. Production is designed for the same Flask contracts on Vercel with Supabase PostgreSQL, but no live Supabase or Vercel verification is claimed.

## Auth API

| Method / URL | Browser request | Auth / authorization | Success / empty | Controlled errors |
|---|---|---|---|---|
| `POST /api/auth/register` | JSON: `name`, `email`, `password` | Public; server always assigns `customer` | `201` user/session cookie | `422` invalid input; `409` duplicate email |
| `POST /api/auth/login` | JSON: `email`, `password` | Public; database-backed limiter keyed by hashed normalized email + client IP | `200` user/session cookie and limiter cleared | `401` invalid/inactive credentials; `429` after five failures in 15 minutes |
| `POST /api/auth/logout` | No body | Optional current session | `200` revokes/clears session | Safe no-op when no cookie |
| `GET /api/auth/me` | No body | Required | `200` safe user object | `401` no valid session |
| `POST /api/auth/forgot-password` | JSON: `email` | Public | `202` only after real email delivery is configured | `422` invalid email; currently `503` and explicitly states no email was sent |
| `POST /api/auth/reset-password` | JSON: `token`, `password` | Reset token | `200` resets password and revokes active sessions | `422` invalid body; `400` invalid/used/expired token |

## Public, Store, and System API

| Method / URL | Browser request | Auth / authorization | Success / empty | Controlled errors |
|---|---|---|---|---|
| `GET /api/health` | No body | Public | `200` health/database state | `503` database unavailable |
| `GET /api/products` | No body | Public | `200` published products; empty `products: []` | Controlled generic errors only |
| `GET /api/products/<slug>` | URL slug | Public | `200` published product | `404` not published/not found |
| `GET /api/categories` | No body | Public | `200` published categories; empty array | Controlled generic errors only |
| `GET /api/services` | No body | Public | `200` published services; empty array | Controlled generic errors only |
| `GET /api/services/<slug>` | URL slug | Public | `200` published service | `404` not found |
| `GET /api/docs` | No body | Public | `200` published documentation; empty array | Controlled generic errors only |
| `GET /api/docs/<slug>` | URL slug | Public | `200` published documentation entry | `404` not found |
| `GET /api/blog` | No body | Public | `200` published posts; empty array | Controlled generic errors only |
| `GET /api/blog/<slug>` | URL slug | Public | `200` published post | `404` not found |
| `POST /api/checkout` | JSON: item `productId` / `quantity`; `Idempotency-Key` header supported | Authenticated customer | `201` pending server-priced order; duplicate key returns existing order | `401`, `422` invalid/unavailable items, `503` coupon validation; payment remains unavailable, never paid |
| `POST /api/newsletter/subscribe` | JSON: `email`, `marketingConsent` | Public consent required | No provider success is claimed | `422` invalid/no consent; currently `503 NOT_CONFIGURED` |
| `POST /api/analytics/events` | JSON: allowed `eventType`, safe payload; optional idempotency header | Public | `202` `localRecorded: true`, `externalDelivery: not_configured` | `422` unsupported event |
| `POST /api/webhooks/payment/<provider>` | Provider body/signature | Provider verification boundary | No configured provider success path | Currently `503 NOT_CONFIGURED` |

## Customer API

Every route below requires an authenticated session. Collection routes filter by the current user. Addressed records are queried with both the record ID and current customer ID, returning `404` for another customer's record.

| Method / URL | Browser request | Success / empty | Controlled errors |
|---|---|---|---|
| `GET /api/customer/dashboard` | None | `200` safe user + count object | `401` |
| `PATCH /api/customer/profile` | JSON: `name`, `email` | `200` updated safe user | `401`, `422`, `409` duplicate email |
| `PATCH /api/customer/settings` | JSON reserved for future settings | No fake save | Currently `503 NOT_CONFIGURED` |
| `GET /api/customer/orders` | None | `200` owned `orders: []` or records | `401` |
| `GET /api/customer/orders/<order_id>` | URL ID | `200` owned order + items | `401`, `404` |
| `GET /api/customer/downloads` | None | `200` owned `downloads: []` or records | `401` |
| `GET /api/customer/downloads/<download_id>/download` | URL ID | Real provider access only after ownership, paid order, active license, available download | `401`, `404`, `403` entitlement denied, currently `503` storage unavailable |
| `GET /api/customer/licenses` | None | `200` owned licenses; key only for the authenticated owner when vault is available | `401` |
| `GET /api/customer/saved-items` | None | `200` owned `savedItems: []` or records | `401` |
| `POST /api/customer/saved-items/<product_id>` | URL product ID | `201`/`200` saved idempotently | `401`, `404` unpublished/missing product |
| `DELETE /api/customer/saved-items/<product_id>` | URL product ID | `200` removed | `401` |
| `GET /api/customer/billing` | None | `200` owned `billing: []` or records | `401` |
| `GET /api/customer/messages` | None | `200` owned recipient `messages: []` or records | `401` |
| `GET /api/customer/messages/<message_id>` | URL ID | `200` owned message | `401`, `404` |
| `GET /api/customer/notifications` | None | `200` owned `notifications: []` or records | `401` |
| `GET /api/customer/tickets` | None | `200` owned `tickets: []` or records | `401` |
| `GET /api/customer/tickets/<ticket_id>` | URL ID | `200` owned ticket + public messages | `401`, `404` |
| `POST /api/customer/tickets` | JSON: `subject`, `message` | `201` ticket ID; internal event may be queued | `401`, `422` |

## Admin Core and CMS API

All Admin routes require a valid authenticated user. The server applies role-specific authorization; frontend state never grants access.

| Method / URL | Request | Required role | Success / empty | Controlled errors |
|---|---|---|---|---|
| `GET /api/admin/dashboard` | None | Admin role | `200` count metrics | `401`, `403` |
| `GET /api/admin/activity` | None | Admin role | `200` activity array, possibly empty | `401`, `403` |
| `GET /api/admin/products` | None | Content role | `200` product array, possibly empty | `401`, `403` |
| `POST /api/admin/products` | Product JSON | Content role | `201` product | `401`, `403`, `409`, `422` |
| `PATCH /api/admin/products/<id>` | Product JSON | Content role | `200` product | `401`, `403`, `404`, `409`, `422` |
| `DELETE /api/admin/products/<id>` | None | Content role | `200` archives product | `401`, `403`, `404` |
| `GET /api/admin/products/<id>/files` | None | Content role | `200` file metadata array | `401`, `403`, `404` |
| `POST /api/admin/products/<id>/files` | Upload boundary | Content role | No fake upload | Currently `503` storage NOT_CONFIGURED |
| `GET /api/admin/categories` | None | Content role | `200` categories array | `401`, `403` |
| `POST /api/admin/categories` | Category JSON | Content role | `201` ID | `401`, `403`, `409`, `422` |
| `PATCH /api/admin/categories/<id>` | Category JSON | Content role | `200` ID | `401`, `403`, `404`, `409`, `422` |
| `DELETE /api/admin/categories/<id>` | None | Content role | `200` archived | `401`, `403`, `404` |
| `GET /api/admin/services` | None | Content role | `200` services array | `401`, `403` |
| `POST /api/admin/services` | Service JSON | Content role | `201` ID | `401`, `403`, `409`, `422` |
| `PATCH /api/admin/services/<id>` | Service JSON | Content role | `200` ID | `401`, `403`, `404`, `409`, `422` |
| `DELETE /api/admin/services/<id>` | None | Content role | `200` archived | `401`, `403`, `404` |
| `GET /api/admin/orders` | None | Admin role | `200` orders array | `401`, `403` |
| `GET /api/admin/orders/<id>` | URL ID | Admin role | `200` order, items, license/download metadata | `401`, `403`, `404` |
| `GET /api/admin/customers` | None | Admin role | `200` customers array | `401`, `403` |
| `GET /api/admin/customers/<id>` | URL ID | Admin role | `200` customer + counts | `401`, `403`, `404` |
| `GET /api/admin/tickets` | None | Support role | `200` ticket array | `401`, `403` |
| `GET /api/admin/tickets/<id>` | URL ID | Support role | `200` ticket + messages | `401`, `403`, `404` |
| `POST /api/admin/tickets/<id>/messages` | JSON: `body` | Support role | `201` message ID | `401`, `403`, `404`, `422` |
| `GET /api/admin/payments` | None | Admin role | `200` local payment-record array; may be empty | `401`, `403` |
| `GET /api/admin/documentation` | None | Content role | `200` documentation array | `401`, `403` |
| `POST /api/admin/documentation` | Documentation JSON | Content role | `201` ID | `401`, `403`, `409`, `422` |
| `PATCH /api/admin/documentation/<id>` | Documentation JSON | Content role | `200` ID | `401`, `403`, `404`, `409`, `422` |
| `GET /api/admin/blog` | None | Content role | `200` post array | `401`, `403` |
| `POST /api/admin/blog` | Blog JSON | Content role | `201` ID | `401`, `403`, `409`, `422` |
| `PATCH /api/admin/blog/<id>` | Blog JSON | Content role | `200` ID | `401`, `403`, `404`, `409`, `422` |
| `GET /api/admin/media` | None | Content role | `200` media metadata array | `401`, `403` |
| `POST /api/admin/media` | Upload boundary | Content role | No fake upload | Currently `503` storage NOT_CONFIGURED |

## Admin Automation / Integration API

| Method / URL | Request | Required role | Success / empty | Controlled errors |
|---|---|---|---|---|
| `GET /api/admin/automations` | None | Admin role | `200` workflow summary array | `401`, `403` |
| `GET /api/admin/workflows` | None | Admin role | `200` workflow array | `401`, `403` |
| `POST /api/admin/workflows` | JSON: `name`, `status`, `nodes` | Admin role | `201` workflow ID | `401`, `403`, `422` |
| `GET /api/admin/forms` | None | Content role | `200` forms array | `401`, `403` |
| `POST /api/admin/forms` | JSON: `name`, `fields` | Content role | `201` form ID | `401`, `403`, `422` |
| `GET /api/admin/forms/submissions` | None | Content role | `200` submissions array | `401`, `403` |
| `GET /api/admin/crm/contacts` | None | Admin role | `200` local contacts array | `401`, `403` |
| `GET /api/admin/crm/contacts/<id>` | URL ID | Admin role | `200` local contact | `401`, `403`, `404` |
| `GET /api/admin/newsletter/subscribers` | None | Admin role | `200` local subscriber array | `401`, `403` |
| `PATCH /api/admin/newsletter/settings` | Future settings JSON | Admin role | No fake save | Currently `503` email NOT_CONFIGURED |
| `GET /api/admin/ai/settings` | None | Admin role | No fake AI configuration | Currently `503` AI NOT_CONFIGURED |
| `PATCH /api/admin/ai/settings` | Future settings JSON | Admin role | No fake AI save | Currently `503` AI NOT_CONFIGURED |
| `POST /api/admin/ai/respond` | JSON: `prompt`, optional instructions | Admin role | No fake AI answer | `422` missing prompt; currently `503` AI NOT_CONFIGURED |
| `GET /api/admin/integrations/status` | None | Admin role | `200` honest provider statuses | `401`, `403` |
| `POST /api/admin/integrations/configure` | No browser credentials accepted | Admin role | No fake configuration | `503` secure server-side setup required |
| `GET /api/admin/readiness` | None | Admin role | `200` boolean readiness state | `401`, `403` |

## Intentionally Absent Admin APIs

There is **no active backend API route** for Coupons, Reviews, Email Campaigns, Admin Settings, Team Members, or payment detail. Their current UI pages are static/control-state shells and do not claim a record was saved. They were not treated as broken active frontend-to-backend contracts in this audit.

## Social & Contact Link Settings API

| Method / URL | Request | Required role | Success / empty | Controlled errors |
|---|---|---|---|---|
| `GET /api/settings/social-links` | None | Public | `200` enabled safe public links only; empty `links: []` when nothing is configured | Controlled generic errors only |
| `GET /api/admin/settings/social-links` | None | Owner or Admin | `200` all six editable platform rows, including disabled/empty defaults | `401`, `403` |
| `PATCH /api/admin/settings/social-links` | JSON `links`: platform, value, enabled, displayOrder | Owner or Admin | `200` persisted canonical link configuration | `401`, `403`, `422` invalid platform/value/order/scheme |

Social platforms require HTTPS URLs. WhatsApp accepts only valid `https://wa.me/<digits>` or `https://api.whatsapp.com/send?phone=<digits>` values. Email accepts an email address and the public API generates the `mailto:` href. The server rejects `javascript:`, `data:`, `file:`, HTTP, duplicate-platform, and malformed values.
