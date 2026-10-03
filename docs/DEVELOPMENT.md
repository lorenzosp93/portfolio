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
| Frontend content | Hero introduction, highlights heading, navigation label, eyebrow, and published highlight cards are edited in Django admin; Show Skills controls both website and printed CV (off by default). |
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
python3 manage.py makemigrations --check --dry-run
python3 manage.py migrate --noinput
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

### Contact submission limits

Admission is serialized in the database across API replicas, on both PostgreSQL
and SQLite. Apply the new contacts migration before deploying the API change.
Accepted requests keep the existing HTTP 202 response. A submission exceeding a
budget, the backlog cap, or the duplicate window returns HTTP 429 with a readable
`message` and `Retry-After`; database contention/unavailability returns HTTP 503.
Both leave the browser form available for retry without creating a submission.

| Variable | Default | Meaning |
| --- | --- | --- |
| `CONTACT_SOURCE_HOURLY_LIMIT` | 3 | Accepted submissions per direct peer in a rolling hour |
| `CONTACT_GLOBAL_HOURLY_LIMIT` | 20 | Accepted submissions across all sources in a rolling hour |
| `CONTACT_GLOBAL_DAILY_LIMIT` | 100 | Accepted submissions across all sources in a rolling day |
| `CONTACT_MAX_PENDING` | 100 | Maximum pending plus processing rows, including old backlog |
| `CONTACT_DUPLICATE_SECONDS` | 600 | Suppress the same validated payload across sources |

All values must be positive integers. Sent and failed submissions still count
against admission budgets until their submission timestamps leave the window.
The source is a keyed hash of `REMOTE_ADDR` (IPv6 addresses grouped by /64;
IPv4-mapped addresses normalized); no raw address is added to contact records.
Forwarding headers are not trusted. Behind a reverse proxy, callers sharing the
same direct peer share its source budget. Configure trusted client-address
restoration at the ingress/application-server boundary if needed; do not simply
pass through client-supplied forwarding headers. Global budgets remain enforced.
The worker's existing bounded retries and privileged admin requeue behavior are
unchanged; these are admission budgets, not an SMTP send-rate limiter.

## Container notes

The backend container entrypoint currently runs migrations automatically and
waits for PostgreSQL when that database engine is configured. This only happens
when the runtime preserves the image entrypoint: Kubernetes `command` replaces
`ENTRYPOINT`, while Kubernetes `args` replaces only the image command.

For production, review migrations and apply them exactly once with a Kubernetes
Job using the new release image before rolling out the HA API and worker
Deployments. Running migrations independently in every application replica can
race during rollout and couples application readiness to schema changes. Never
run `makemigrations` in a container or deployment; generate and review migration
files during development. CI checks that none are missing and applies all
committed migrations to temporary PostgreSQL before running tests.

Application infrastructure configuration is maintained outside this repository.
The deployment runner setup in [deploy/github-runner](../deploy/github-runner/README.md)
creates a migration Job from the live backend configuration before each backend
rollout; it does not replace the authoritative application manifests.

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

### Manual frontend releases

For authorized production releases, build the frontend locally, publish directly
to DockerHub, and restart the frontend rollout rather than waiting for GitHub
Actions. Run the relevant local build, lint, unit and browser checks first.
The ignored `portfolio-frontend/.env.production` provides browser configuration.
Use an immutable release tag and record the registry digest:

```sh
docker buildx build --platform linux/amd64,linux/arm64 --push \
  --tag docker.io/lorenzosp93/portfolio-frontend:<release-tag> \
  --metadata-file /tmp/portfolio-frontend-image.json ./portfolio-frontend
```

Production pins the frontend by digest. Update the image to the published digest
and the `kubectl.kubernetes.io/restartedAt` pod-template annotation together in
one scoped Deployment patch, then wait for the rollout and verify the public
site. A restart without an image update would keep running the old digest.
Use explicit context `home-k3s` and namespace `portfolio`. Keep the previous
digest for rollback. For a manually published release, use `[skip ci]` on the
GitHub merge commit so the automatic pipeline cannot later replace that image.
Backend releases still require migration review and application before rollout.

### Leadership and canonical articles

Apply the new shared migrations to seed the approved hero and leadership copy.
The content migration intentionally replaces `SiteSettings.about_text`, preserves
existing pictures/CV settings, and inserts three leadership cards. Edit wording,
icons, publication status, and order in Django admin afterward. The icon selector
contains the full Heroicons outline collection; existing layers/globe/users
selections remain compatible. The backend catalogue in shared/highlight_icons.json
tracks the installed frontend library, and icons are loaded as a separate chunk. The printable CV
reuses the published leadership cards and hero introduction in its summary;
`cv_summary` remains the fallback when no leadership cards are published.

Published articles are served by Django at `/writing/<slug>/`; `/sitemap.xml` lists
them. JavaScript-free readers get the full article and specific social metadata.
Django loads the Vite `asset-manifest.json` from `FRONTEND_ASSET_ORIGIN` (defaults
to `FRONTEND_HOST`, two-second timeout, one-minute process cache). The Vue bundle
then replaces the fallback with the homepage and existing article modal. Manifest
failures leave the readable HTML intact. Keep that origin accessible from the API.

For full-stack development, set `FRONTEND_DEV_SERVER=http://localhost:8080` on the
backend; Vite proxies `/writing/` and `/sitemap.xml` to `VITE_APP_BACKEND_URL`.
Production ignores `FRONTEND_DEV_SERVER`.

At deployment, route `/writing/` and `/sitemap.xml` to Django alongside `/api/`,
or set `WRITING_BACKEND_ORIGIN` on the frontend container to the reachable Django
HTTP origin. The container then proxies those paths without an SPA fallback.
Without either routing choice they intentionally return 503 rather than generic
homepage HTML. Keep assets, the manifest, and normal homepage requests on the
frontend. Apply migrations and roll out the backend before the frontend.

### Résumé timeline and phone preview

Apply the resume/shared migrations before running the new frontend. Django admin
has a **Timeline presentation** fieldset on Experience, Education, and Site settings.
The section heading, introduction, and closing copy live in Site settings. Each
entry can set a Markdown `timeline_summary`, a chapter heading/body, and a
transition before the entry: automatic flowing path, detour, or breakthrough.
Blank summaries fall back to the existing description (then achievements).
Migration `resume.0014` seeds the approved copy for known public entry UUIDs only;
it preserves any already edited timeline fields. The original CV fields are unchanged.

To test from an iPhone on the same network, run Django on `127.0.0.1:8000` and Vite:

```sh
VITE_APP_BACKEND_URL='' BACKEND_PROXY_TARGET=http://127.0.0.1:8000 npm run dev -- --host 0.0.0.0
```

Open the Network URL Vite prints. The browser uses the same origin for API, CV,
and media requests; Vite proxies `/api/`, `/media/`, and `/mediafiles/` to Django.
A blank browser API base is important: `localhost` on the phone points to the phone.
`BACKEND_PROXY_TARGET` is a development-server setting, never bundled for browsers.
The preview server is for local development; no production deployment is implied.

### Local production-content preview

The current timeline preview uses `/tmp/portfolio-production-preview.sqlite3`.
It contains production site settings, résumé records, skills, blog content, and
referenced media copied to the ignored `portfolio-backend/mediafiles/` directory.
Approved timeline-only editorial copy is retained because those fields have not
been deployed yet. Account credentials, privileges, contact submissions, sessions,
and push subscriptions are excluded; author records only preserve attribution.
The previous preview database and the original local database remain available.

From `portfolio-backend/`, run the snapshot:

```sh
DEBUG=true DATABASE_NAME=/tmp/portfolio-production-preview.sqlite3 .venv/bin/python manage.py runserver 127.0.0.1:8000 --noreload
```

From `portfolio-frontend/`, expose the preview to the LAN:

```sh
VITE_APP_BACKEND_URL='' BACKEND_PROXY_TARGET=http://127.0.0.1:8000 npm run dev -- --host 0.0.0.0
```

The proxy preserves the browser's Host, so media
URLs work over the LAN. Development builds reload paginated content on each
page load so browser caches cannot hide a refreshed local database. Temporary
preview files under `/tmp` are not persistent backups.
