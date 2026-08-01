# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev          # AdonisJS server + Vite HMR (port 5173, HMR port 24678)
npm run build        # Production build
npm start            # Start production server
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run typecheck    # tsc --noEmit + vue-tsc --noEmit
npm test             # Run all tests (Japa)
node ace test --files tests/unit/foo.spec.ts  # Run a single test file
```

### Make targets (Docker-based workflow)
```bash
make start     # Full local setup: install, rm containers, up, fresh DB
make up        # Stop, clear cache, install hooks, build Docker services
make stop      # Stop Docker services
make db        # Fresh DB migration + seed + cache flush
make db-fresh  # Fresh migration + seed only
make db-migrate
make db-seed
make cache     # Flush Redis cache
make deploy    # Full production deployment
```

### Ace CLI (AdonisJS)
```bash
node ace make:controller Foo
node ace make:model Foo
node ace make:migration create_foo_table
node ace migration:run
node ace migration:rollback
```

## Architecture

**Stack:** AdonisJS 7 (backend) + Vue 3 + Inertia.js (frontend) + PostgreSQL + Redis

### Request flow
```
HTTP request → start/routes.ts → middleware (start/kernel.ts) → controller → model/repository → transformer → Inertia renders Vue page
```

### Key patterns

**Repository pattern:** Controllers do not query models directly. All database access goes through repositories in `app/repositories/`, which extend `app/repositories/base/base_repository.ts`.

**Transformers:** API responses are serialized via `app/transformers/`. The `ApiSerializer` provider (`providers/api_provider.ts`) wraps all API responses in `{ data: ... }`.

**Inertia:** Server renders Vue pages from `inertia/pages/` via controllers calling `inertia.render('page/path', props)`. The default layout is `inertia/layouts/default.vue`.

**Path aliases:** Import backend code with `#controllers/foo`, `#models/foo`, `#repositories/foo`, etc. (defined in `package.json` imports field).

**Validation:** Use Vine validators from `app/validators/`. Validators are registered globally in `start/validator.ts`.

**i18n:** Default locale is French (`fr`). Translation files live in `resources/lang/{en,fr}/`. The `LanguageMiddleware` detects the request locale. Use `@adonisjs/i18n` ICU formatter.

### Frontend (`inertia/`)
- `inertia/pages/` — Page components (mapped 1:1 to controller render calls)
- `inertia/components/ui/` — Shadcn/ui components (Tailwind CSS v4)
- `inertia/layouts/default.vue` — Root layout wrapping all pages
- `inertia/app.ts` — Inertia initialization; `inertia/ssr.ts` — SSR entry

### Auth
- Uses `@adonisjs/auth` with session-based auth
- `app/middleware/guest_middleware.ts` — Redirect authenticated users
- User roles defined in `app/types/enum/user_role_enum.ts`

### Code style
- 4-space indentation, 200-char line width, trailing commas, semicolons (see `.prettierrc`)
- Pre-commit hook runs `lint-staged` (prettier on staged files)

## Directories to ignore

**Never read, search, or grep inside the following directories** — they contain generated, vendored, or IDE-specific files that pollute context and waste tokens:

- `node_modules/` — npm dependencies
- `.idea/` — JetBrains IDE config
- `.adonisjs/` — AdonisJS build/cache artifacts

**If you need information about a third-party package** (AdonisJS, Inertia, Vue, Vine, etc.), do **not** explore its source in `node_modules/`. Instead, fetch the official documentation via **Context7** (`use context7` in your reasoning, or call the `resolve-library-id` / `get-library-docs` tools directly).

Preferred Context7 library IDs for this project:

- AdonisJS: `/adonisjs/docs` (fallback: https://docs.adonisjs.com)
- Inertia.js: `/inertiajs/inertia` (fallback: https://inertiajs.com/)
- Vue 3: `/vuejs/docs` (fallback: https://vuejs.org/)
- VineJS: `/vinejs/vine` (fallback: https://vinejs.dev/)
- Japa: `/japa/docs` (fallback: https://japa.dev/)
- Shadcn/ui (Vue): `/unovue/shadcn-vue` (fallback: https://www.shadcn-vue.com/)
- Tailwind CSS: `/tailwindlabs/tailwindcss.com` (fallback: https://tailwindcss.com/)

For any other library, **always query Context7 first** via `resolve-library-id` to fetch up-to-date, version-specific documentation. Only fall back to a web search if Context7 has no matching entry. Never read installed source from `node_modules/`.
