# Architecture

## Purpose and shape

This is a public, single-page portfolio site. The Vue frontend presents hero, leadership,
résumé, blog, and contact sections; Django supplies content and receives the
contact and browser-push submissions. Django's admin is mounted under the API
prefix and is the likely content-management surface.

```text
Browser
  ├─ Vue/Vite SPA (portfolio-frontend)
  │    ├─ Pinia stores and composables
  │    └─ Axios service using VITE_APP_BACKEND_URL
  └─ Django REST API (portfolio-backend/api/)
       ├─ resume: experience, education, projects, skills
       ├─ blog: posts and comments
       ├─ contacts: durable contact outbox, email worker, and CSRF token
       └─ shared: site settings and push subscriptions

```

## Frontend

`portfolio-frontend/src/App.vue` composes the page sections and owns the
hero-to-navbar GSAP animation and PWA registration. Components live under
`src/components/`, grouped by feature (`resume/`, `blog/`, and `UI/`).

Data travels through this path:

```text
component → Pinia store → composable/service → Axios → /api/... endpoint
```

`src/services/api.service.ts` is the API boundary. `src/composables/LimitOffset.ts`
handles cached, paginated legacy résumé lists and blog loading. The timeline store
loads one fresh, complete snapshot from `/api/resume/timeline/` per visit. Frontend
types are in `src/models/models.interface.ts`. Keep them aligned with DRF
serializer fields.

Runtime presentation settings are loaded once through `src/stores/site.store.ts`.
The hero and navbar share the configured `SiteSettings.hero_picture`; bundled
WebP assets remain the offline/error fallback.

The service worker is generated through `vite-plugin-pwa`; API responses are not
cached. Offline navigation retains the shell and shows the normal API error UI.

Required build-time browser variables:

| Variable | Purpose |
| --- | --- |
| `VITE_APP_BACKEND_URL` | Base URL used by Axios for the Django API. |
| `VITE_APP_KEY` | Browser-visible VAPID public key for push subscription. |

## Backend

The Django project is `portfolio-backend/portfolio`. Its apps separate public
content and cross-cutting models:

| App | Responsibility |
| --- | --- |
| `resume` | Experience, education, projects, entities, keywords, and skills. |
| `blog` | Published posts and comments; posts can trigger push notifications. |
| `contacts` | Validates and stores contact submissions; a separate worker delivers email. |
| `shared` | Reusable abstract models, media attachments, site settings, subscriptions, and logging. |

`SiteSettings` is a singleton edited through Django admin. Use it for small,
site-wide runtime content such as the hero picture instead of adding hard-coded
asset references to multiple frontend components.

Routes are rooted at `portfolio/urls.py`:

| Route | Notes |
| --- | --- |
| `/api/resume/` | DRF routers for résumé resources. |
| `/api/resume/timeline/` | Read-only, unpaginated `{copy, entries}`; full education/experience data, sorted by `(start_date, kind, uuid)` ascending. |
| `/api/blog/` | `post` and `comment` routers. |
| `/api/contacts/` | Unauthenticated contact POST; `get-token/` exposes a CSRF token. |
| `/api/site/` and `/api/` | Site settings and push subscription routers. |
| `/api/admin/` | Django admin. |
| `/api/health/` | `django-health-check` endpoints. |

Read-only portfolio content uses DRF `ReadOnlyModelViewSet`; list resources use
the standard `limit`/`offset` paginator, except the complete timeline feed. Content-bearing models inherit shared
mixins (for names/slugs, timestamps, media, attachments, authors, etc.), so
model changes can affect several serializers and admin behavior.

The backend defaults to SQLite when `DB_ENGINE` is unset and accepts PostgreSQL
settings through environment variables. In non-debug mode it requires
`DJANGO_SECRET_KEY` (or `SECRET_KEY`) and restricts CORS to `FRONTEND_HOST`.

Contact delivery uses `ContactSubmission` as a transactional outbox. The API
only persists a `pending` row and returns HTTP 202. A separate
`process_contact_submissions` worker claims rows with a short database lease,
sends SMTP outside the transaction, and records delivery or schedules bounded
exponential retries. A stale `processing` lease can be reclaimed after a worker
crash. This provides at-least-once processing; SMTP itself cannot make the final
send and database update atomic.

## Containers

The frontend Docker image builds static Vite assets and serves them through
Nginx. The backend image runs Gunicorn; its entrypoint waits for PostgreSQL,
collects static files, and currently applies migrations before starting. A
Kubernetes `command` overrides the image `ENTRYPOINT`, so a deployment using
one bypasses all three initialization steps.

For HA production, prefer one explicit migration Job using the release image,
wait for it to succeed, and then roll out API and worker Deployments. Do not run
`makemigrations` in CI or production: migrations are reviewed schema history.
CI instead uses `makemigrations --check --dry-run` to fail when model changes do
not have a committed migration, then applies those committed migrations to its
temporary PostgreSQL database.

Deployment infrastructure is intentionally maintained outside this repository.
Do not add or infer an authoritative Kubernetes configuration here without an
explicit decision to bring infrastructure ownership back into the repository.

## High-impact change checklist

When adding or modifying a public content field:

1. Update the Django model and generate a migration.
2. Update the serializer and any relevant admin configuration.
3. Update frontend interfaces, API usage, stores, and rendering components.
4. Add or update backend tests; add frontend tests when a frontend test setup is
   introduced or affected tests exist.
5. Consider existing PWA/API-cache behavior and backward compatibility.

## Security and delivery notes

- **Markdown** from the CMS is rendered only through
  `src/composables/markdown.ts`: raw HTML is escaped, link/image URLs are
  limited to safe schemes, and KaTeX is lazy-loaded when content contains math.
- **Headers**: nginx adds CSP, HSTS, nosniff, referrer and permissions policy
  via `security-headers.conf`, included in every `location` (nginx drops
  server-level `add_header` inside locations that declare their own).
- **Client IP**: `shared/client_ip.py` honours `X-Forwarded-For` only when the
  direct peer is in `TRUSTED_PROXY_CIDRS`; set it to the ingress pod CIDR or
  per-visitor contact limits apply to the ingress address.
- **Push**: subscriptions must use `https` endpoints on known push services
  (`WEB_PUSH_ALLOWED_HOST_SUFFIXES`) and are throttled; sends have a timeout.
- **Admin**: sign-in lockout (`ADMIN_LOGIN_*`), optional `ADMIN_URL_PATH`, DB
  cache table created by the entrypoint.
- **Article discovery**: `/writing/<slug>/` serves full Django-rendered article HTML
  with specific metadata, then mounts the Vite homepage with its article modal.
  `/?post=<slug>` remains supported. Share/RSS use canonical article URLs;
  `/sitemap.xml` lists published articles. The frontend manifest stays uncached.
- **Leadership**: site settings carry the hero introduction and generic highlights heading,
  navigation label, and eyebrow;
  ordered, published `HighlightCard` records are nested in the settings API.
  The frontend owns icons, animation, and the shared background.
  `SiteSettings.show_skills` controls Skills on both the website and printed CV.
  Generic `highlight_cards` and `highlights_heading` are preferred; legacy
  `leadership_cards` and `leadership_heading` fields remain compatible.

## Résumé journey

`TheResume` replaces the separate education/experience carousel with `ResumeTimeline`.
`journeyPath.ts` lays out an SVG route from measured card boxes. The compact
alternating layout remains through 1023px; desktop uses wider alternating columns.
The path uses quintic approaches that match loop tangents and curvature, sampled
as cubics. Advancing alpha loops get extra vertical space and unequal approach
speeds to avoid counter-turns before the lobe. Detours remain deliberately tighter. CMS motifs describe the
transition before an entry; loop variation is deterministic from its UUID.

Scroll maps between dated stations to SVG arc length, so upward-turning loops
cannot reveal later cards early. The marker appears first and the corresponding
card enters from its side after 100ms. Resize/font changes recompute the path;
no pagination or scroll pinning can change the chronology. Reduced motion shows
a static, readable journey. Keyboard focus reveals its card immediately. Detail
Cards retain their focus trap, scroll isolation, and full entry data.

Timeline editorial fields are separate from original résumé descriptions and
achievements. The printable CV continues to use its original queries and ordering.

Timeline cards use tinted headers (teal for experience, warm for education), faded
previews, and a full-card accessible ellipsis control. Background years reveal
along the path and move more slowly than cards. Each year appears once at its first entry; the
current year appears beside Today only when no entry has already used it. Colored haze uses small radial-gradient surfaces
whose parallax stays within the section, avoiding filtered, document-height
compositing layers and hard clipping edges in Safari. The floating CV button is
the only CV link in the résumé section. Logos retain production's fully rounded
mask in cards and details. The straight dotted future starts at Today. The explicit jump
animates for 1.8–12 seconds based on distance and yields to touch, wheel, pointer,
or scrolling keys. Reduced motion skips animation. Shared Detail Card IDs use
Vue instance IDs so dialogs also work on insecure HTTP LAN previews.

Reading copy across the hero, highlights, timeline and blog uses the shared 16px
body style. Card titles use 20px, detail titles 24px, supporting text 14px, and
metadata 12px. Decorative timeline years retain their display scale. Blog cards
render without a staggered entrance; horizontal browsing, pagination and Detail
Cards remain interactive as soon as content is available.
