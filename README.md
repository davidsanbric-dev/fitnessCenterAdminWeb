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

The app also accepts `FIREBASE_*` and `VITE_FIREBASE_*` names as fallbacks.
After updating env vars, restart `npm run dev`.

## Run

```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

## Build

```bash
npm run build
npm run preview
```

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
