# Working in this repository

This repository contains the code for a personal portfolio website. It has two
independently runnable applications:

- `portfolio-frontend/`: Vue 3 + TypeScript single-page application, built with
  Vite and styled with Tailwind.
- `portfolio-backend/`: Django 5 + Django REST Framework API.

Read [the architecture guide](docs/ARCHITECTURE.md) before changing a boundary
between the frontend and API. Read
[the development guide](docs/DEVELOPMENT.md) before running or validating work.

## Guardrails

- Preserve unrelated working-tree changes. The repository can be dirty when a
  task begins.
- Do not commit secrets or real environment values. Use environment variables;
  no example environment file is currently committed.
- Treat Django migrations as schema history: generate a new migration for model
  changes and do not edit an existing applied migration.
- Keep public API changes coordinated: update the Django serializer/viewset,
  frontend model/service/store consumers, and tests in the same change.
- Prefer small, scoped changes. Do not modernize dependencies, infrastructure,
  or formatting incidentally.

## Project conventions

- Frontend imports use the `@` alias for `portfolio-frontend/src`.
- Frontend state and API access live in Pinia stores and `src/services/`;
  components should use those rather than call Axios directly.
- Public résumé and blog endpoints are read-only DRF viewsets. Contact and push
  subscription endpoints intentionally accept unauthenticated POSTs.
- The frontend is a section-based single page; it has no client-side router.
- API responses for list endpoints use DRF limit/offset pagination.

## Validation baseline

Run the narrowest relevant checks first, then report what was run and what was
not. The currently committed checks are:

```sh
cd portfolio-frontend && npm run build
cd portfolio-frontend && npm run lint:check
cd portfolio-backend && python3 manage.py test
```

`npm run lint` applies fixes (`--fix`); use `npm run lint:check` for validation.
CI checks builds, linting, Django checks/tests, and both container builds. There
is no committed container-compose development stack; do not imply that one
exists.
