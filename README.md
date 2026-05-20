# Fitness Admin Web App (Nuxt)

Admin web frontend for the gym scheduling domain.

## Implemented architecture

- Right-positioned SaaS sidebar layout
- Feature pages under `/admin/*`
- Firebase-first auth flow with backend role lookup (`/auth/firebase-login`)
- Reusable CRUD page template + reusable shared data table component
- Config-driven filters and row actions through shared CRUD resource registry
- Config-driven create/edit form actions with shared dialog workflow
- Configured to work with existing `project_api` endpoints and additive admin endpoints

## Environment

Copy `.env.example` to `.env` and set Firebase web credentials:

```bash
cp .env.example .env
```

Required values:

- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_APP_ID`

Optional:

- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`

After updating env vars, restart `bun run dev`.

## Run

```bash
bun install
bun run dev
```

App URL: `http://localhost:3000`

## Build

```bash
bun run build
bun run preview
```

## Docker (Dokploy)

```bash
docker build -t fitness-admin-web .
docker run -p 3000:3000 \
	-e NUXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1 \
	-e NUXT_PUBLIC_FIREBASE_API_KEY=... \
	-e NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... \
	-e NUXT_PUBLIC_FIREBASE_PROJECT_ID=... \
	-e NUXT_PUBLIC_FIREBASE_APP_ID=... \
	-e NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... \
	fitness-admin-web
```

## Dokploy deployment notes

- Service port: `3000`
- Start command (already in Dockerfile): `node .output/server/index.mjs`
- Required env vars:
	- `NUXT_PUBLIC_API_BASE_URL`
	- `NUXT_PUBLIC_FIREBASE_API_KEY`
	- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
	- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
	- `NUXT_PUBLIC_FIREBASE_APP_ID`
- Optional env vars:
	- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- Health endpoint: `GET /api/health`
- After updating env vars, redeploy the service to pick up changes

## Key routes

- `/login`
- `/admin/home`
- `/admin/bookings`
- `/admin/trainers`
- `/admin/disciplines`
- `/admin/memberships`
- `/admin/notifications`

## Reuse pattern

- Shared resource registry: `app/config/adminCrudResources.ts`
- Generic page renderer: `components/crud/ResourceCrudPage.vue`
- Shared template/table: `components/crud/CrudPageTemplate.vue`, `components/crud/DataTable.vue`
- Shared form dialogs: `components/crud/ActionFormDialog.vue`, `components/crud/ConfirmDialog.vue`
