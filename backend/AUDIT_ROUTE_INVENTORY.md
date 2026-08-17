# Nibrexo Route Inventory — Audit Snapshot

Verified against the active Flask URL map and static files. Static private pages are browser shells; server-side protection is enforced by their API calls.

Local Flask continues to serve these files directly. In production, Vercel serves the same allowlisted paths while `NIBREXO_API_ONLY=true` limits the Flask Function to API responses. The Vercel mapping is code-tested but not live-deployed.

## Public static routes

| Route | Purpose | Status | Backend connection | Authentication | Authorization |
|---|---|---|---|---|---|
| `/404.html` | Not-found page | Verified static route | Static/public API where applicable | None | Public |
| `/about.html` | Public about page | Verified static route | Static/public API where applicable | None | Public |
| `/blog-post.html` | Public blog detail | Verified static route | Static/public API where applicable | None | Public |
| `/blog.html` | Public blog index | Verified static route | Static/public API where applicable | None | Public |
| `/docs-detail.html` | Public documentation detail | Verified static route | Static/public API where applicable | None | Public |
| `/docs.html` | Public documentation index | Verified static route | Static/public API where applicable | None | Public |
| `/` | Public marketing home | Verified static route | Static/public API where applicable | None | Public |
| `/resources.html` | Public resources | Verified static route | Static/public API where applicable | None | Public |
| `/service-detail.html` | Public service detail | Verified static route | Static/public API where applicable | None | Public |
| `/services.html` | Public services index | Verified static route | Static/public API where applicable | None | Public |
| `/store/cart.html` | Public cart | Verified static route | Static/public API where applicable | None | Public |
| `/store/checkout.html` | Public checkout | Verified static route | Static/public API where applicable | None | Public |
| `/store/index.html` | Public index | Verified static route | Static/public API where applicable | None | Public |
| `/store/product.html` | Public product | Verified static route | Static/public API where applicable | None | Public |
| `/legal/cookie-policy.html` | Public cookie policy | Verified static route | Static/public API where applicable | None | Public |
| `/legal/copyright-and-trademark-policy.html` | Public copyright and trademark policy | Verified static route | Static/public API where applicable | None | Public |
| `/legal/digital-product-license-agreement.html` | Public digital product license agreement | Verified static route | Static/public API where applicable | None | Public |
| `/legal/disclaimer.html` | Public disclaimer | Verified static route | Static/public API where applicable | None | Public |
| `/legal/index.html` | Public index | Verified static route | Static/public API where applicable | None | Public |
| `/legal/privacy-policy.html` | Public privacy policy | Verified static route | Static/public API where applicable | None | Public |
| `/legal/refund-policy.html` | Public refund policy | Verified static route | Static/public API where applicable | None | Public |
| `/legal/terms-and-conditions.html` | Public terms and conditions | Verified static route | Static/public API where applicable | None | Public |

## Customer static routes

| Route | Purpose | Status | Backend connection | Authentication | Authorization |
|---|---|---|---|---|---|
| `/account/billing.html` | Customer billing | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/dashboard.html` | Customer dashboard | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/downloads.html` | Customer downloads | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/forgot-password.html` | Customer forgot password | Verified static route | `account-api.js` / `account.js` | Public auth form | Public |
| `/account/licenses.html` | Customer licenses | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/login.html` | Customer login | Verified static route | `account-api.js` / `account.js` | Public auth form | Public |
| `/account/message-detail.html` | Customer message detail | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/messages.html` | Customer messages | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/notifications.html` | Customer notifications | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/order-detail.html` | Customer order detail | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/orders.html` | Customer orders | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/profile.html` | Customer profile | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/register.html` | Customer register | Verified static route | `account-api.js` / `account.js` | Public auth form | Public |
| `/account/saved-items.html` | Customer saved items | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/settings.html` | Customer settings | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/support.html` | Customer support | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |
| `/account/ticket-detail.html` | Customer ticket detail | Verified static route | `account-api.js` / `account.js` | Session guard + server API | Authenticated customer ownership |

## Admin static routes

| Route | Purpose | Status | Backend connection | Authentication | Authorization |
|---|---|---|---|---|---|
| `/admin/activity.html` | Admin activity | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/ai-agent.html` | Admin ai agent | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/analytics.html` | Admin analytics | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/automation-editor.html` | Admin automation editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/blog-editor.html` | Admin blog editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/blog.html` | Admin blog | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/campaign-editor.html` | Admin campaign editor | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/categories.html` | Admin categories | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/category-editor.html` | Admin category editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/coupon-editor.html` | Admin coupon editor | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/coupons.html` | Admin coupons | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/crm-contact.html` | Admin crm contact | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/crm.html` | Admin crm | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/customer-detail.html` | Admin customer detail | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/customers.html` | Admin customers | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/documentation-editor.html` | Admin documentation editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/documentation.html` | Admin documentation | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/email-automation.html` | Admin email automation | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/email-campaigns.html` | Admin email campaigns | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/form-builder.html` | Admin form builder | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/form-submissions.html` | Admin form submissions | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/forms.html` | Admin forms | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/index.html` | Admin index | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/integrations.html` | Admin integrations | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/media-detail.html` | Admin media detail | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/media.html` | Admin media | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/newsletter.html` | Admin newsletter | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/order-detail.html` | Admin order detail | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/orders.html` | Admin orders | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/payment-detail.html` | Admin payment detail | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/payments.html` | Admin payments | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/product-editor.html` | Admin product editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/products.html` | Admin products | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/reviews.html` | Admin reviews | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/service-editor.html` | Admin service editor | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/services.html` | Admin services | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/settings.html` | Admin settings | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/support-tickets.html` | Admin support tickets | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/team-invite.html` | Admin team invite | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/team.html` | Admin team | Verified static route | Controlled static/unavailable module | Session guard + server API | Authorized Admin role |
| `/admin/ticket-detail.html` | Admin ticket detail | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |
| `/admin/workflow-builder.html` | Admin workflow builder | Verified static route | `admin-api.js` and/or `automation-api.js` | Session guard + server API | Authorized Admin role |

## Auth API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| POST | `/api/auth/forgot-password` | forgot password | Controlled NOT_CONFIGURED when email absent | None | Public |
| POST | `/api/auth/login` | login | Active auth boundary; database limiter returns 429 after five failures in 15 minutes | None | Public |
| POST | `/api/auth/logout` | logout | Active auth boundary | None | Public |
| GET | `/api/auth/me` | me | Active auth boundary | None | Public |
| POST | `/api/auth/register` | register | Active auth boundary | None | Public |
| POST | `/api/auth/reset-password` | reset password | Active auth boundary | None | Public |

## System / health API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| GET | `/api/health` | health | Active system health | None | Public |

## Public API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| GET | `/api/blog` | public blog | Active | None | Public |
| GET | `/api/blog/<slug>` | public blog detail | Active | None | Public |
| GET | `/api/categories` | public categories | Active | None | Public |
| POST | `/api/checkout` | create checkout | Active pending checkout only; payment NOT_CONFIGURED | Required | Authenticated customer |
| GET | `/api/docs` | public documentation | Active | None | Public |
| GET | `/api/docs/<slug>` | public documentation detail | Active | None | Public |
| GET | `/api/products` | public products | Active | None | Public |
| GET | `/api/products/<slug>` | public product | Active | None | Public |
| GET | `/api/services` | public services | Active | None | Public |
| GET | `/api/services/<slug>` | public service | Active | None | Public |
| GET | `/api/settings/social-links` | public social links settings | Active | None | Public |

## Customer API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| GET | `/api/customer/billing` | customer billing | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/dashboard` | customer dashboard | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/downloads` | customer downloads | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/downloads/<download_id>/download` | secure download | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/licenses` | customer licenses | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/messages` | customer messages | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/messages/<message_id>` | customer message detail | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/notifications` | customer notifications | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/orders` | customer orders | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/orders/<order_id>` | customer order detail | Active | Required | Authenticated customer; owned record where addressed |
| PATCH | `/api/customer/profile` | update customer profile | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/saved-items` | customer saved items | Active | Required | Authenticated customer; owned record where addressed |
| POST | `/api/customer/saved-items/<product_id>` | save item | Active | Required | Authenticated customer; owned record where addressed |
| DELETE | `/api/customer/saved-items/<product_id>` | remove saved item | Active | Required | Authenticated customer; owned record where addressed |
| PATCH | `/api/customer/settings` | update customer settings | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/tickets` | customer tickets | Active | Required | Authenticated customer; owned record where addressed |
| POST | `/api/customer/tickets` | create ticket | Active | Required | Authenticated customer; owned record where addressed |
| GET | `/api/customer/tickets/<ticket_id>` | customer ticket detail | Active | Required | Authenticated customer; owned record where addressed |

## Admin API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| GET | `/api/admin/activity` | admin activity | Active | Required | Authorized Admin role |
| POST | `/api/admin/ai/respond` | ai response | Controlled NOT_CONFIGURED when provider absent | Required | Authorized Admin role |
| GET | `/api/admin/ai/settings` | admin ai settings | Controlled NOT_CONFIGURED when provider absent | Required | Authorized Admin role |
| PATCH | `/api/admin/ai/settings` | update ai settings | Controlled NOT_CONFIGURED when provider absent | Required | Authorized Admin role |
| GET | `/api/admin/automations` | admin automations | Active | Required | Authorized Admin role |
| GET | `/api/admin/blog` | admin blog | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/blog` | create blog post | Active | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/blog/<post_id>` | update blog post | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/categories` | admin categories | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/categories` | create category | Active | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/categories/<category_id>` | update category | Active | Required | Content role (owner/admin/manager/editor) |
| DELETE | `/api/admin/categories/<category_id>` | archive category | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/crm/contacts` | admin crm contacts | Active | Required | Authorized Admin role |
| GET | `/api/admin/crm/contacts/<contact_id>` | admin crm contact | Active | Required | Authorized Admin role |
| GET | `/api/admin/customers` | admin customers | Active | Required | Authorized Admin role |
| GET | `/api/admin/customers/<customer_id>` | admin customer detail | Active | Required | Authorized Admin role |
| GET | `/api/admin/dashboard` | admin dashboard | Active | Required | Authorized Admin role |
| GET | `/api/admin/documentation` | admin documentation | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/documentation` | create documentation | Active | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/documentation/<entry_id>` | update documentation | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/forms` | admin forms | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/forms` | create form | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/forms/submissions` | admin form submissions | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/integrations/configure` | integration configuration | Controlled NOT_CONFIGURED when provider absent | Required | Authorized Admin role |
| GET | `/api/admin/integrations/status` | integration status | Active | Required | Authorized Admin role |
| GET | `/api/admin/media` | admin media | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/media` | create media metadata | GET active metadata; POST storage NOT_CONFIGURED | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/newsletter/settings` | admin newsletter settings | Controlled NOT_CONFIGURED when provider absent | Required | Authorized Admin role |
| GET | `/api/admin/newsletter/subscribers` | admin newsletter subscribers | Active | Required | Authorized Admin role |
| GET | `/api/admin/orders` | admin orders | Active | Required | Authorized Admin role |
| GET | `/api/admin/orders/<order_id>` | admin order detail | Active | Required | Authorized Admin role |
| GET | `/api/admin/payments` | admin payments | Active | Required | Authorized Admin role |
| GET | `/api/admin/products` | admin products | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/products` | create product | Active | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/products/<product_id>` | update product | Active | Required | Content role (owner/admin/manager/editor) |
| DELETE | `/api/admin/products/<product_id>` | archive product | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/products/<product_id>/files` | admin product files | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/products/<product_id>/files` | add product file | GET active metadata; POST storage NOT_CONFIGURED | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/readiness` | admin readiness | Active | Required | Authorized Admin role |
| GET | `/api/admin/services` | admin services | Active | Required | Content role (owner/admin/manager/editor) |
| POST | `/api/admin/services` | create service | Active | Required | Content role (owner/admin/manager/editor) |
| PATCH | `/api/admin/services/<service_id>` | update service | Active | Required | Content role (owner/admin/manager/editor) |
| DELETE | `/api/admin/services/<service_id>` | archive service | Active | Required | Content role (owner/admin/manager/editor) |
| GET | `/api/admin/settings/social-links` | admin social links settings | Active | Required | Owner or Admin only |
| PATCH | `/api/admin/settings/social-links` | update admin social links settings | Active | Required | Owner or Admin only |
| GET | `/api/admin/tickets` | admin tickets | Active | Required | Support role (owner/admin/manager/support) |
| GET | `/api/admin/tickets/<ticket_id>` | admin ticket detail | Active | Required | Support role (owner/admin/manager/support) |
| POST | `/api/admin/tickets/<ticket_id>/messages` | admin ticket reply | Active | Required | Support role (owner/admin/manager/support) |
| GET | `/api/admin/workflows` | admin workflows | Active | Required | Authorized Admin role |
| POST | `/api/admin/workflows` | create workflow | Active | Required | Authorized Admin role |

## Provider-boundary API routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| POST | `/api/analytics/events` | analytics event | Local event record; external analytics NOT_CONFIGURED | None | Public |
| POST | `/api/newsletter/subscribe` | newsletter subscribe | Controlled NOT_CONFIGURED | None | Public |
| POST | `/api/webhooks/payment/<provider>` | payment webhook | Controlled NOT_CONFIGURED | Provider verification required | Server-only provider boundary |

## System/static delivery routes

| Methods | Route | Purpose | Status | Authentication | Authorization |
|---|---|---|---|---|---|
| GET | `/` | Root public index | Verified | None | Public |
| GET | `/<path:requested_path>` | Static frontend delivery with source/secret path denial | Verified | None | Public content only |
| GET | `/static/<path:filename>` | Flask static namespace | Unreferenced by project frontend; missing assets return 404 | None | Public static assets |

