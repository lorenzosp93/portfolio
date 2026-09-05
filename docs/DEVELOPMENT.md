# Development and validation

## Prerequisites

- Node.js 22 is used by the frontend production Docker image.
- Python 3.11 is used by the backend production Docker image.
- PostgreSQL is required only when choosing the production-style database;
  Django otherwise uses a local SQLite database by default.

Copy `portfolio-backend/.env.example` and `portfolio-frontend/.env.example` to
local, ignored environment files as needed. The templates contain only safe
development defaults; do not commit credentials, VAPID keys, SMTP credentials,
or cloud-storage keys.

## Run locally

Backend, from `portfolio-backend/`:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DEBUG=true
export DJANGO_SECRET_KEY=development-only-secret
python3 manage.py migrate
python3 manage.py runserver 8000
```

Frontend, from `portfolio-frontend/`:

```sh
npm ci
export VITE_APP_BACKEND_URL=http://localhost:8000
npm run dev
```

The Vite dev server uses port `8080`. When the backend is in `DEBUG` mode it
allows all CORS origins. The browser-facing push feature also needs
`VITE_APP_KEY`, while server-side push delivery needs the `WEB_PUSH_*`
variables; it can be left unconfigured for work unrelated to push notifications.

### Run and debug in VS Code

After creating `portfolio-backend/.venv` and installing both applications'
dependencies, open the repository root in VS Code and choose one of these from
the **Run and Debug** panel:

- **Backend: Django** starts Django under the Python debugger on port 8000.
- **Backend: Contact email worker** processes queued contact submissions and
  prints emails to its terminal instead of contacting SMTP.
- **Frontend: Vite + Chrome** starts Vite on port 8080 and opens a browser debug
  session with Vue/TypeScript source maps.
- **Full stack: Django + Vite** starts Django, the console-email worker, and
  Vite, then stops all three when the compound debug session ends.

The configurations provide safe development defaults. Optional local settings
are loaded through the ignored backend and frontend `.env` files described
above. Useful migration and test commands are also available under
**Tasks: Run Task**.

To test contact delivery locally, run the migration once and launch **Full
stack: Django + Vite**. Submitting the browser form returns HTTP 202 immediately;
within about one second the formatted multipart email appears in the **Backend:
Contact email worker** terminal. The matching Contact submission moves from
`pending` to `sent` in Django admin. No external email is sent.

## Environment reference

| Area | Variables |
| --- | --- |
| Django core | `DEBUG`, `DJANGO_SECRET_KEY` (or `SECRET_KEY`), `DJANGO_ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`; legacy: `DJANGO_HOST` |
| Database | `DB_ENGINE`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` |
| Browser/API origin | `FRONTEND_HOST`, `BACKEND_HOST`, `VITE_APP_BACKEND_URL` |
| Frontend content | `VITE_HERO_COPY` (trusted Markdown hero copy; separate paragraphs with a blank line) |
| Email | `EMAIL_TO`, `EMAIL_FROM`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS`, `EMAIL_TIMEOUT`, `CONTACT_EMAIL_MAX_ATTEMPTS`, `CONTACT_EMAIL_RETRY_BASE_SECONDS`, `CONTACT_EMAIL_LEASE_SECONDS`, `CONTACT_EMAIL_POLL_SECONDS` |
| Push | `VITE_APP_KEY`, `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_ADMIN_EMAIL` |
| Optional S3 storage | `USE_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_CUSTOM_DOMAIN` |

`DEBUG` is parsed as a boolean (`1`, `true`, `yes`, or `on` are truthy). Do not
set it in production. Production needs comma-separated allowed hosts in
`DJANGO_ALLOWED_HOSTS` and full origins (including scheme) in
`CSRF_TRUSTED_ORIGINS`. `DJANGO_HOST` remains supported for older deployments.

## Checks

```sh
# frontend
cd portfolio-frontend
npm test
npm run test:e2e:install # first run only
npm run test:e2e
npm run test:pwa # two production builds; tests real worker upgrade/offline behavior
npm run build
npm run lint:check

# backend
cd portfolio-backend
python3 manage.py test
python3 manage.py check
```

Frontend tests use Vitest, Vue Test Utils, and JSDOM. Run `npm test` once in
CI or `npm run test:watch` while developing. Browser smoke tests use Playwright
with Chromium and WebKit; install the browsers once with `npm run test:e2e:install`, then run
them with `npm run test:e2e`. GitHub Actions runs unit/component and browser
tests, lint/build checks, Django checks/tests, and both container builds.
`npm run lint` still mutates source files; use it only when such a change is
acceptable and inspect its diff afterward.

### Service worker updates

The worker precaches the versioned application shell, but does not intercept or
cache API/admin responses. Offline navigation can load the shell; API content
requires a connection and uses the existing error/fallback UI when unavailable.
Activation deletes only the obsolete `api-cache`, leaving unrelated caches and
push subscriptions untouched.

Production registration checks for updates on startup, every five minutes while
visible, and on returning to the tab or reconnecting (throttled to 30 seconds).
The new worker activates immediately; existing tabs show a Refresh notice rather
than automatically reloading and losing unsent text. First installation is silent.
An old tab running the previous auto-reload implementation may reload once during
the transition to this version. Development mode does not register a worker.

`npm run test:pwa` builds two releases in a temporary directory and serves them on
an isolated local port. It checks real browser update activation, explicit page
refresh, API freshness, legacy-cache cleanup, and offline-shell behavior.

The nginx config serves stable worker URLs with `Cache-Control: no-store` and
does not fall back to HTML for missing worker scripts. In CloudFront, the behavior
covering `/sw.js` and `/push-sw.js` must use a zero minimum TTL (or disabled caching)
to honor origin headers. Frontend changes cannot override a CDN minimum TTL.

## Data, migrations, and public API

- Make Django model changes with `python manage.py makemigrations`, commit the
  generated new migration, then run `python manage.py migrate`.
- Never edit old migration files to change current behavior.
- The site reads résumé and blog data through public, paginated endpoints.
  Preserve serializer compatibility where possible, and update both frontend
  types and consumers with API changes.
- Contact delivery relies on SMTP configuration. Tests and local development
  should avoid sending real mail unless explicitly configured to do so.
- Valid contact submissions are stored as `pending`; the API returns HTTP 202
  without waiting for SMTP. Run `python manage.py process_contact_submissions`
  as a separate long-lived process to deliver them, or add `--once` to drain the
  currently eligible queue and exit.
- Delivery uses bounded exponential retries and short leases so multiple worker
  replicas cannot claim the same row concurrently. Terminal failures remain in
  Django admin and can be requeued with the **Retry delivery** action.

## Container notes

The backend container startup runs migrations automatically and waits for
PostgreSQL only when that database engine is configured. Review a migration for
production safety before deploying the image. Infrastructure configuration is
maintained outside this repository.

The image supports two process types:

```sh
docker/start.sh server
docker/start.sh worker
```

Production must run at least one worker process alongside the API deployment.
One replica is sufficient for this site's volume; additional replicas are safe
because PostgreSQL row locking and delivery leases coordinate claims.

For the current iCloud SMTP deployment, configure or rotate credentials with:

```sh
scripts/configure-production-email.sh <icloud-login-address> [recipient] [sender]
scripts/verify-production-email.sh
scripts/verify-production-email.sh --send
```

The first command prompts for the app-specific password without echoing it,
stores the values in the `portfolio-email` Kubernetes Secret, injects them into
`portfolio-backend`, and waits for rollout completion. Verification authenticates
without sending by default; `--send` sends one message to `EMAIL_TO`.
`KUBE_NAMESPACE`, `KUBE_DEPLOYMENT`, and `KUBE_EMAIL_SECRET` override their
defaults. These are operational helpers, not authoritative cluster manifests.
