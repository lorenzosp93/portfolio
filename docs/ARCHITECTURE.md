# Architecture

## Purpose and shape

This is a public, single-page portfolio site. The Vue frontend presents hero,
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
handles cached, paginated list loading; resume and blog stores use it. Frontend
types are in `src/models/models.interface.ts`. Keep them aligned with DRF
serializer fields.

Runtime presentation settings are loaded once through `src/stores/site.store.ts`.
The hero and navbar share the configured `SiteSettings.hero_picture`; bundled
WebP assets remain the offline/error fallback.

The service worker is generated through `vite-plugin-pwa`; API GET requests
receive a NetworkFirst cache policy. Be deliberate when changing an API route
or response: users may see a cached response for up to its configured lifetime.

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
| `/api/blog/` | `post` and `comment` routers. |
| `/api/contacts/` | Unauthenticated contact POST; `get-token/` exposes a CSRF token. |
| `/api/site/` and `/api/` | Site settings and push subscription routers. |
| `/api/admin/` | Django admin. |
| `/api/health/` | `django-health-check` endpoints. |

Read-only portfolio content uses DRF `ReadOnlyModelViewSet`; list resources use
the standard `limit`/`offset` paginator. Content-bearing models inherit shared
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
Nginx. The backend image runs Gunicorn; its entrypoint collects static files and
applies migrations before starting. It waits for PostgreSQL only when
`DB_ENGINE=django.db.backends.postgresql`.

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
