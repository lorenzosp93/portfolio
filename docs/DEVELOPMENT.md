# Development and validation

## Prerequisites

- Node.js 22 is used by the frontend production Docker image.
- Python 3.11 is used by the backend production Docker image.
- PostgreSQL is required only when choosing the production-style database;
  Django otherwise uses a local SQLite database by default.

Use local virtual environments and local environment-variable files as needed,
but do not commit credentials, VAPID keys, SMTP credentials, or cloud-storage
keys.

## Run locally

Backend, from `portfolio-backend/`:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DEBUG=true
export DJANGO_SECRET_KEY=development-only-secret
python manage.py migrate
python manage.py runserver 8000
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
| Django core | `DEBUG`, `DJANGO_SECRET_KEY` (or `SECRET_KEY`), `DJANGO_HOST` |
| Database | `DB_ENGINE`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` |
| Browser/API origin | `FRONTEND_HOST`, `BACKEND_HOST`, `VITE_APP_BACKEND_URL` |
| Email | `EMAIL_TO`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` |
| Push | `VITE_APP_KEY`, `WEB_PUSH_PUBLIC_KEY`, `WEB_PUSH_PRIVATE_KEY`, `WEB_PUSH_ADMIN_EMAIL` |
| Optional S3 storage | `USE_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME` |

`DEBUG` is parsed as a boolean (`1`, `true`, `yes`, or `on` are truthy). Do not
set it in production. Production also needs a real allowed host via
`DJANGO_HOST`.

## Checks

```sh
# frontend
cd portfolio-frontend
npm run build
npm run lint  # applies ESLint fixes because the script includes --fix

# backend
cd portfolio-backend
python manage.py test
python manage.py check
```

The repository has Django model and view tests, but no committed frontend test
files or CI configuration. `npm run lint` mutates source files; use it only when
such a change is acceptable and inspect its diff afterward.

## Data, migrations, and public API

- Make Django model changes with `python manage.py makemigrations`, commit the
  generated new migration, then run `python manage.py migrate`.
- Never edit old migration files to change current behavior.
- The site reads résumé and blog data through public, paginated endpoints.
  Preserve serializer compatibility where possible, and update both frontend
  types and consumers with API changes.
- Contact delivery relies on SMTP configuration. Tests and local development
  should avoid sending real mail unless explicitly configured to do so.

## Deployment notes

The backend container startup sequence assumes PostgreSQL and runs migrations
automatically. Review a migration for production safety before building or
deploying that image. Kubernetes configuration requires externally supplied
secrets; the current Helmfile has only the PostgreSQL release enabled.
