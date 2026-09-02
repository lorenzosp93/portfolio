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

## Environment reference

| Area | Variables |
| --- | --- |
| Django core | `DEBUG`, `DJANGO_SECRET_KEY` (or `SECRET_KEY`), `DJANGO_ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`; legacy: `DJANGO_HOST` |
| Database | `DB_ENGINE`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` |
| Browser/API origin | `FRONTEND_HOST`, `BACKEND_HOST`, `VITE_APP_BACKEND_URL` |
| Frontend content | `VITE_HERO_COPY` (trusted Markdown hero copy; separate paragraphs with a blank line) |
| Email | `EMAIL_TO`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` |
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
npm run build
npm run lint:check

# backend
cd portfolio-backend
python3 manage.py test
python3 manage.py check
```

Frontend tests use Vitest, Vue Test Utils, and JSDOM. Run `npm test` once in
CI or `npm run test:watch` while developing. Browser smoke tests use Playwright
and Chromium; install the browser once with `npm run test:e2e:install`, then run
them with `npm run test:e2e`. GitHub Actions runs unit/component and browser
tests, lint/build checks, Django checks/tests, and both container builds.
`npm run lint` still mutates source files; use it only when such a change is
acceptable and inspect its diff afterward.

## Data, migrations, and public API

- Make Django model changes with `python manage.py makemigrations`, commit the
  generated new migration, then run `python manage.py migrate`.
- Never edit old migration files to change current behavior.
- The site reads résumé and blog data through public, paginated endpoints.
  Preserve serializer compatibility where possible, and update both frontend
  types and consumers with API changes.
- Contact delivery relies on SMTP configuration. Tests and local development
  should avoid sending real mail unless explicitly configured to do so.

## Container notes

The backend container startup runs migrations automatically and waits for
PostgreSQL only when that database engine is configured. Review a migration for
production safety before deploying the image. Infrastructure configuration is
maintained outside this repository.
