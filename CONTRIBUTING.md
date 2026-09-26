# Contributing to cluster-app

This guide covers how to run the project locally and how the code is organized. It also sets out the conventions a change should follow before it's merged.

## Stack at a glance

| Concern                    | Tool                                                                     |
| -------------------------- | ------------------------------------------------------------------------ |
| Runtime                    | Node.js **20** (≥ 20.9, required by Next 16)                             |
| Framework                  | Next.js 16 (App Router, React 19, React Compiler)                        |
| Database                   | PostgreSQL 18, accessed through Drizzle ORM 1.0 (`node-postgres` driver) |
| Cache / sessions           | Redis 8 (refresh tokens)                                                 |
| Auth                       | Google SSO → our own JWTs in `httpOnly` cookies (`jose`)                 |
| Validation                 | `yup`                                                                    |
| Logging                    | `winston` (console + daily rotated files in `logs/`)                     |
| Lint / format              | Biome 2                                                                  |
| UI                         | MUI 9 + Tailwind 4                                                       |
| Production process manager | PM2                                                                      |

> **Next.js 16 is not the Next.js you may know.** APIs and conventions have changed (for example, route handler `params` is now a `Promise`). Before touching anything Next-specific, check the bundled docs in `node_modules/next/dist/docs/` rather than relying on memory or older tutorials.

## Local setup

1. **Use Node 20.** With `nvm`: `nvm install 20 && nvm use 20`. Use `npm`, since the repo ships a `package-lock.json`.
2. **Create your env file:**
    ```bash
    cp .env.example .env
    ```
    Fill in `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `JWT_SECRET`, and add `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:3000/api`), which the frontend API client needs but `.env.example` doesn't list yet. `.env` is git-ignored; never commit it.
3. **Start Postgres and Redis:**
    ```bash
    docker compose up -d
    ```
    This starts `cluster-db` (port 5432) and `cluster-redis` (port 6379). The Postgres container reads its credentials from the same `.env`.
4. **Install dependencies and apply migrations:**
    ```bash
    npm install
    npm run db:migrate
    ```
5. **Install the pre-commit hook (required):**
    ```bash
    bash scripts/install-hooks.sh
    ```
    See [Pre-commit hook](#pre-commit-hook) for what it does.
6. **Run the app:**
    ```bash
    npm run dev
    ```
    `GET /api/health` should return `{"status":"ok","dbStatus":"ok"}`.

**Logging in locally:** login only succeeds if your Google email belongs to an existing `ACTIVE` user in `core.users`. The migrations seed only `admin@cluster.com` (with the `ADMIN` role). To log in as yourself, insert your own user into your **local** database and give it a role in `core.user_roles`.

## npm scripts

| Script                        | What it does                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`                 | Next dev server                                                                     |
| `npm run build` / `npm start` | Production build / serve                                                            |
| `npm run lint`                | `biome check` (lint + format check + import ordering)                               |
| `npm run format`              | `biome format --write`                                                              |
| `npm run db:generate`         | Create a new, empty SQL migration (see below)                                       |
| `npm run db:migrate`          | Apply pending migrations (`scripts/migrate.ts`)                                     |
| `npm run db:flush`            | Regenerate `schema.ts` / `relations.ts` from the live database (`drizzle-kit pull`) |

## Project structure

```
src/
├── app/                  # Next.js App Router: routing only (pages, layouts, route handlers)
│   ├── (pages)/…/page.tsx    # Thin pages → compose frontend features
│   └── api/<path>/route.ts   # Thin HTTP entry points → backend controller methods
├── web/                  # Frontend, organized by feature (see "Frontend architecture")
│   ├── features/
│   └── shared/
├── api/                  # Backend, organized by feature module
│   ├── auth/
│   ├── roles/
│   ├── teams/
│   ├── users/
│   └── shared/           # Cross-cutting: db, redis, logger, context, middlewares, exceptions
└── db/migrations/        # SQL migrations + generated Drizzle schema
scripts/                  # migrate.ts, deploy/destroy shell scripts, git hook installer
```

## Backend architecture (`src/api/`)

### Onion layers (`src/api/<module>/`)

Each feature module is an **onion**. The domain sits at the center, and every outer ring may depend only on rings closer to the center, never the other way around:

```
        ┌────────────────────────────────────────────┐
        │ Presentation          Infrastructure       │  outer ring: frameworks, HTTP, DB
        │   ┌────────────────────────────────────┐   │
        │   │ Application                        │   │  use cases, DTOs
        │   │   ┌────────────────────────────┐   │   │
        │   │   │ Domain                     │   │   │  models, repository interfaces
        │   │   └────────────────────────────┘   │   │
        │   └────────────────────────────────────┘   │
        └────────────────────────────────────────────┘
```

| Ring | Folder | Contains | May depend on |
| --- | --- | --- | --- |
| **Domain** (core) | `domain/models`, `domain/repositories` | Plain domain models (`User`, `DataScope`, …) and repository **interfaces** (ports) | Nothing framework-specific. Repository interfaces may reference application DTOs as input types |
| **Application** | `application/usecases/<verb>/`, `dtos`, `exceptions` | One class per use case (`FindAllUsersUseCase`), application DTOs, business exceptions | Domain |
| **Infrastructure** (outer) | `infrastructure/adapters`, `repositories`, `entities` | `*RepositoryImpl` (implements the domain interface), `*DrizzleRepository` (raw Drizzle queries), DB entities, entity→model mappers | Domain, application, `shared/infrastructure` |
| **Presentation** (outer) | `presentation/controllers`, `dtos/requests`, `dtos/responses`, `mappers` | Controllers, `yup` request schemas, response shapes, request→DTO and model→response mappers | Application, domain |

Presentation and infrastructure are both outer rings, so **they never import each other**. The one exception is the composition root: a controller's or use case's default `deps` instantiate `*RepositoryImpl`. Use cases talk to the repository **interface** only.

### Data flow

Data changes shape once per layer boundary and always moves **in one direction**:

```
request ──► DTO ──► entity ──► model ──► response
(presentation) (application) (infrastructure) (domain) (presentation)
```

| Step | Where | Mapper |
| --- | --- | --- |
| request → DTO | Controller validates the body with `yup`, then maps it | `presentation/mappers/<x>-request.mapper.ts` |
| DTO → entity | Use case passes the DTO to the repository interface; the Drizzle repository writes/reads rows | inside `*DrizzleRepository` |
| entity → model | `*RepositoryImpl` converts rows before returning to the use case | `infrastructure/adapters/mappers/<x>-entity.mapper.ts` |
| model → response | Controller maps the use case's result | `presentation/mappers/<x>-response.mapper.ts` |

Rules:

- **Repositories take DTOs or primitives as input and return models** (e.g. `create(dto: UpsertUserDTO): Promise<User>`, `findShallowByUuidAndState(uuid, state)`).
- **Never do `model → entity → model`.** Don't convert a domain model back into an entity to write it; build the write from the DTO. If a use case needs to persist something, it needs a DTO that describes the change.
- **Entities never leave infrastructure**, and requests/responses never leave presentation.
- **Models are the only thing presentation receives** from a use case.

### Conventions

**Naming.** Files are kebab-case with a role suffix: `find-all-users.usecase.ts`, `user.repository.ts`, `user.repository-impl.ts`, `user.drizzle.repository.ts`, `user.entity.ts`, `upsert-user.request.ts`, `user-response.mapper.ts`, `user-not-found.exception.ts`. Use cases are grouped by verb (`find/`, `upsert/`, `replace/`, `create/`, `generate/`, `validate/`).

**Dependency injection.** Classes take an optional `deps` object in the constructor and fall back to the default implementation:

```ts
constructor(deps?: FindAllUsersUseCaseDependencies) {
  this.userRepository = deps?.userRepository ?? new UserRepositoryImpl();
}
```

Keep this pattern so dependencies can be swapped for fakes in tests.

**Imports.** Use the `@/` alias (maps to `src/`) for anything outside the current module. Short relative imports inside a module are fine.

### How a request flows

```
src/app/api/users/route.ts           export const GET = controller.findAllUsers.bind(controller)
  └─ UserController.findAllUsers     @Endpoint({ module, permission })
       ├─ withErrorHandler            maps any thrown error to an RFC 7807-style JSON body
       ├─ withAuthentication          reads the accessToken cookie, loads the user into the request context
       ├─ withLogging                 logs start/end, sets the x-trace-id header
       └─ withAuthorization           checks the user has <module>:<permission>
            └─ validate body (yup) → map to DTO → use case → map to response
                 └─ FindAllUsersUseCase → UserRepository (interface)
                      └─ UserRepositoryImpl → UserDrizzleRepository → Postgres
```

- **`@Endpoint()`** (`shared/infrastructure/handlers`) wraps controller methods with the middlewares above. Auth is **on by default**. Opt out with `@Endpoint({ auth: false })` (only login/refresh do this). Pass `module` + `permission` to enforce a permission check.
- **Route files stay thin.** A `route.ts` only instantiates the controller and binds methods to HTTP verbs. Dynamic segments arrive as `{ params: Promise<{ uuid: string }> }`, so `await params` before using them.
- **Request context.** `shared/infrastructure/config/store.ts` wraps `AsyncLocalStorage`. Anywhere in a request you can read `context.store.user` (current user with roles, permissions and teams) and `context.store.traceId`. The logger adds both to every line automatically.

### Authorization model

- **Permissions** are `<SCOPE>_<ACTION>` per **module**:
    - scopes are `GLOBAL`, `OWN` or `TEAM`
    - actions are `READ`, `ADD`, `EDIT` or `DELETE`
    - modules are `USERS`, `TEAMS` or `HELYX`
- **Roles** (`ADMIN`, `MANAGER`, `GUEST`, `FRT`) are bundles of `(permission, module)` pairs, defined in migrations.
- **Endpoint-level:** `@Endpoint({ module, permission: PermissionSuffixEnum.READ })` passes if the user has that action at **any** scope.
- **Row-level:** for reads, a use case calls `GenerateDataScopeUseCase` to build a `DataScope` (`isGlobal`, `ownerUuid`, `teamUuids`). The repository turns it into SQL with `DrizzleRepository.toDataScopeClause(scope, { createdBy, inTeams })`:
    - `createdBy` is the resource's creator column, which covers the `OWN_*` scope.
    - `inTeams` builds this resource's "belongs to one of these teams" condition, which covers `TEAM_*`.
    - If the user has no applicable scope, the clause matches **nothing**.

    Every new list or read query on scoped data must go through this helper.

### Errors

Throw subclasses of `ApiException` (`BadRequestException`, `NotFoundException`, `ForbiddenException`, `UnauthorizedException`, …). Module-specific errors live in `<module>/application/exceptions/`.

The error middleware serializes them into JSON with `title`, `detail`, `status`, `instance`, and `extensions.{code, args, timestamp, traceId}`. `yup` validation errors become a `400` with per-field messages. Anything else becomes a generic `500`, and the real cause is only logged.

### Logging

Import `logger` from `@/api/shared/infrastructure/config/logger`. Use cases log `started` / `completed successfully`, and repository adapters log what they're looking up. Never log tokens or secrets.

## Database and migrations

### Schemas and table conventions

- **`core`**: application tables.
- **`aud`**: audit tables. Every mutable `core.<table>` has an `aud.<table>_aud` copy, filled by an `AFTER INSERT OR UPDATE OR DELETE` trigger (`aud.fn_audit_<table>`). When you add a mutable table, add its audit table, function and trigger **in the same migration**.
- **Identifiers.** Tables have an internal `id SERIAL` (used for foreign keys) and a public `uuid UUID DEFAULT gen_random_uuid()`. **Only expose `uuid` through the API**; `id` never leaves the backend.
- **Audit columns** on mutable tables: `state` (`'ACTIVE'` / `'INACTIVE'`), `created_at/by`, `updated_at/by`, `deactivated_at/by`. `*_by` columns reference `core.users(id)`.
- **Soft delete.** Deactivate records by setting `state = 'INACTIVE'` rather than deleting rows.
- **Catalog tables** (`permissions`, `roles`, `modules`, `role_permissions`) have no audit fields and are only changed through migrations.

### Migrations are hand-written SQL

We don't generate SQL from TypeScript. The SQL migration is the source of truth, and the Drizzle schema is **pulled back** from the database afterwards.

1. **Create an empty migration:**
    ```bash
    NAME=add-projects-table npm run db:generate
    ```
    This creates `src/db/migrations/<timestamp>_add-projects-table/migration.sql` (plus a `snapshot.json`).
2. **Write the SQL.** Follow the existing files:

    ```sql
    CREATE SCHEMA IF NOT EXISTS core;
    SET search_path TO core;

    CREATE TABLE IF NOT EXISTS projects ( ... );

    CREATE SCHEMA IF NOT EXISTS aud;
    SET search_path TO aud;
    -- projects_aud table, fn_audit_projects(), trg_audit_projects
    ```

    Put seed data for catalog tables in the same migration. Look up foreign keys by natural key (`(SELECT id FROM roles WHERE name = 'ADMIN')`), never by hard-coded ids.

3. **Apply it:**
    ```bash
    npm run db:migrate
    ```
    Drizzle records applied migrations in its own tracking table and runs only the pending ones, in timestamp order.
4. **Regenerate the Drizzle schema:**

    ```bash
    npm run db:flush
    ```

    This rewrites `src/db/migrations/schema.ts` and `relations.ts` from the live database, limited to the `core` schema. **Never edit those two files by hand**, because the next pull will overwrite them. Tables are exported as `<table>InCore` (e.g. `usersInCore`).

    The script uses `source .env`, which fails when npm's shell is `dash` (the default `/bin/sh` on Debian/Ubuntu). If that happens, run it directly from bash:

    ```bash
    set -a && . ./.env && set +a && npx drizzle-kit pull
    ```

5. **Commit** the migration folder together with the regenerated `schema.ts` / `relations.ts`.

**Rules:**

- **Never modify a migration that has been merged.** It has already run somewhere. Write a new migration instead.
- **Keep migrations idempotent** where Postgres allows it (`IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`).
- **One logical change per migration**, with a descriptive kebab-case name.

### Writing queries

- Raw Drizzle queries live **only** in `*DrizzleRepository` classes, which extend `shared/infrastructure/repositories/drizzle.repository.ts`. That base class provides:
    - `toOrderByClause(dto, table)` for sorting from a `PaginatedSortedDTO`
    - `toDataScopeClause(scope, columns)` for row-level permissions
    - `escapeLikePattern(value)`: always escape user input before `ilike`
- For "any related row matches" filters, prefer `EXISTS` subqueries over joining one-to-many tables. Joins duplicate rows and break pagination and counts.
- Paginated queries return `Paginated<T>` (`data`, `page`, `limit`, `total`). Run the page query and `db.$count(table, where)` in parallel with `Promise.all`, sharing the same `where`.
- For multi-step writes, use `db.transaction(async (trx) => …)` and run every statement on `trx`.
- Drizzle repositories take **DTOs or primitives** and return **entities**. `*RepositoryImpl` maps them to domain models with the module's `*EntityMapper`. Entities never leak past infrastructure (see [Data flow](#data-flow)).

## Adding a backend feature: checklist

1. **Migration** for any schema change, then `db:migrate` + `db:flush`.
2. **Domain:** model(s) and the repository interface method, with a JSDoc comment like the existing ones.
3. **Infrastructure:**
    - an entity, if needed
    - a Drizzle query in `*DrizzleRepository`
    - an entity mapper
    - the `*RepositoryImpl` method
4. **Application:**
    - a DTO
    - a use case in the right verb folder, logging start/end
    - a `DataScope` for scoped reads
5. **Presentation:**
    - a `yup` request schema and its inferred type
    - a request→DTO mapper
    - a response DTO and model→response mapper
    - a controller method decorated with `@Endpoint({ module, permission })`
6. **Route:** `src/app/api/<path>/route.ts` exporting the bound controller method.
7. **`npm run lint` and `npm run build`** both pass.

## Frontend architecture (`src/web/`)

The frontend follows the same ideas as the backend: code is grouped **by feature**, split **by responsibility** inside each feature, and dependencies point inwards. `src/app/` is only the router. Pages and layouts compose features and contain no logic of their own.

### Structure

```
src/
├── app/                          # Routing only
│   ├── layout.tsx                # Mounts global providers
│   ├── page.tsx
│   └── users/page.tsx            # Thin: reads params, renders feature components
└── web/
    ├── features/
    │   └── users/                # One folder per feature, mirroring backend modules
    │       ├── api/              # HTTP calls + backend response/request types
    │       │   ├── users.api.ts
    │       │   └── users.types.ts
    │       ├── model/            # View models, mappers, pure functions
    │       │   ├── user.model.ts
    │       │   └── user.mapper.ts
    │       ├── hooks/            # State + orchestration (loading, errors, actions)
    │       │   └── use-users.ts
    │       ├── components/       # Feature UI
    │       │   └── UsersTable/
    │       └── index.ts          # Public API of the feature
    └── shared/                   # Feature-agnostic building blocks
        ├── ui/                   # Design-system components (Button, …); no business logic
        ├── lib/http/             # axios instance + token-refresh interceptor
        ├── hooks/                # Generic hooks (useDebounce, usePagination, …)
        ├── providers/            # App-wide React providers
        └── utils/
```

### Layers inside a feature

| Folder | Role | Backend equivalent | May import from |
| --- | --- | --- | --- |
| `model/` | View models the UI works with, plus pure mapping/formatting logic. No React, no HTTP | Domain | `shared/utils` |
| `api/` | Functions that call the backend through the shared HTTP client, and the raw request/response types that mirror backend DTOs | Infrastructure | `model/`, `shared/lib` |
| `hooks/` | Use-case-like hooks: fetch, hold state, expose actions (`useUsers()`, `useUpsertUser()`) | Application | `api/`, `model/`, `shared/` |
| `components/` | Rendering and user interaction only | Presentation | `hooks/`, `model/`, `shared/ui`, `shared/hooks` |

### Data flow

```
backend response ──► api type ──► view model ──► hook state ──► component props
    (api/)            (api/)      (model/ mapper)   (hooks/)      (components/)

user action ──► component ──► hook action ──► api call (request type) ──► backend
```

Rules:

- **Components never call `api/` or axios directly.** They go through a hook.
- **Raw API types stop at the mapper.** Components and hooks work with view models, e.g. ISO date strings are parsed into `Date` and the backend's `uuid` becomes the model's `id`. Don't pass backend response shapes straight into props.
- **`app/` is thin.** A page reads route params / search params and renders feature components. Data fetching, permission checks and formatting belong in the feature.
- **Features don't reach into each other.** Import another feature only through its `index.ts`, and prefer composing features side by side in a page over nesting them. `shared/` never imports from `features/`.

### Server and client components

- **Components are Server Components by default.** Add `"use client"` only to the smallest component that needs state, effects, event handlers or browser APIs. Don't mark an entire page as client just because one child is interactive.
- **Authenticated data is fetched client-side for now.** The session lives in `httpOnly` cookies and the shared axios client handles token refresh, so hooks in `hooks/` fetch the data. Don't add server-side fetching of authenticated data without discussing how cookies are forwarded.

### Components and styling

- **One folder per component,** named in PascalCase: `Button/Button.tsx`, `Button/types.ts` (props), and `Button/index.ts` (re-export).
- **MUI for widgets, Tailwind for layout and spacing.**
  - Components reused across features go in `shared/ui/`, wrapping MUI where needed.
  - Features should consume `shared/ui` rather than restyling MUI ad hoc.
- **Non-component files are kebab-case** with a role suffix, like the backend: `users.api.ts`, `user.mapper.ts`, `use-users.ts` (which exports `useUsers`).

### State

1. **Local UI state** (open/closed, form inputs) stays in the component.
2. **Feature data state** lives in that feature's hooks.
3. **App-wide state** (current user from `/me`, auth) is exposed through a provider in `shared/providers/` or the owning feature (e.g. `features/auth`).

Don't introduce a global state or data-fetching library without agreeing on it first.

### Adding a frontend feature: checklist

1. `model/`: the view model and a mapper from the API type.
2. `api/`: request/response types matching the backend DTOs, plus the call functions.
3. `hooks/`: a hook exposing data, `loading`, `error` and actions.
4. `components/`: the UI, consuming only the hook and view models.
5. `index.ts`: export what pages need.
6. A page in `src/app/` that renders it.
7. `npm run lint` and `npm run build` both pass.

## Pre-commit hook

Git doesn't install hooks automatically. The hook's source is embedded (as a heredoc) in `scripts/install-hooks.sh`, which writes it to `.git/hooks/pre-commit` and makes it executable. **Every contributor must run the installer once per clone:**

```bash
bash scripts/install-hooks.sh
```

The installer is safe to re-run: it overwrites the installed hook with the current version. Re-run it whenever `scripts/install-hooks.sh` changes. To change the hook, edit the heredoc in the installer, never `.git/hooks/pre-commit` directly (it isn't tracked and gets overwritten).

> **AI agents:** if you are an agent working on this repository, you **must** install the hook before making your first commit. Run `bash scripts/install-hooks.sh` at the start of your session; it's idempotent, so running it when the hook is already installed is harmless and keeps it up to date. Never bypass it with `git commit --no-verify`.

On every commit, the hook runs `biome check --write` on the **staged** files. That lints them, formats them and organizes imports. What happens next:

- **Safe fixes and formatting** are applied and re-staged automatically, so they're part of the commit.
- **Errors Biome can't fix** abort the commit. Fix them and commit again. Warnings don't block the commit.
- **Partially staged files** (some changes staged, some not) are not re-staged, because that would commit your unstaged changes too. If Biome modified one of them, the commit is aborted so you can review and stage the fixes yourself.

## Code style

- **Biome is the formatter and linter.** The [pre-commit hook](#pre-commit-hook) enforces it on staged files. You can also run `npm run lint` (whole project) and `npm run format`, or use your editor's Biome integration. Imports are auto-organized.
- **Constants over enums.** Enumerations are `as const` objects plus a derived union type (`ModuleEnum` / `Module`, `PermissionEnum` / `Permission`), not TypeScript `enum`s.
- **UUIDs.** Type them as `UUID` from `crypto`.
- **Comments.** Public repository-interface methods and use case `execute` methods get a short JSDoc comment.

## Git workflow

- **Branches:** create feature branches from `dev` named `feat/<topic>` (or `fix/<topic>`, `refactor/<topic>`). Open PRs into `dev`; `main` is what gets deployed.
- **Commits:** follow [Conventional Commits](https://www.conventionalcommits.org/): `feat: …`, `fix: …`, `refactor: …`, `chore: …`, in lowercase imperative. Keep each commit focused.
- **Merging:** PRs are squash-merged, so the PR title becomes the commit on `dev`. Write it in the same format.

## Deployment

Production runs on a single host:

- **Deploy:** `scripts/deploy.sh` does the following:
    1. pulls `main`
    2. runs `npm install` and `npm run build`
    3. starts the Docker services and waits for Postgres and Redis to be ready
    4. (re)starts the app with PM2 (`ecosystem.config.js`, process name `cluster-app`)
- **Migrations:** the deploy script **does not run migrations**. Run `npm run db:migrate` on the host when a release includes new ones.
- **Teardown:** `scripts/destroy.sh` stops the containers (volumes are kept) and removes the PM2 process. `scripts/destroy-all.sh` also deletes `.next/`, `node_modules/` and PM2 state.
- **Logs:** application logs go to `logs/YYYY-MM-DD.log` and are kept for 14 days. PM2 errors go to `logs/pm2-error.log`.
