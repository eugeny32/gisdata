# GISData Platform — Django Migration & Architectural Overhaul Roadmap

## Executive Summary

This roadmap defines the end-to-end migration of the existing GIS data platform to a modern Django-based ecosystem, replacing the current hybrid PHP/Python architecture with a unified, scalable, and maintainable Django application.

---

## 1. Current Architecture Assessment

### 1.1 Existing Technology Stack

| Component | Current State |
|-----------|---------------|
| **Web Framework** | PHP (custom MVC) + Python/Django hybrid |
| **Database** | PostgreSQL + PostGIS |
| **Frontend** | Vanilla JS, multiple SPAs (Vite/React) |
| **Worker/Background Jobs** | Windows Task Scheduler, PHP CLI scripts |
| **File Storage** | Local filesystem (`/uploads/`) |
| **Authentication** | Custom session-based, dual-identity (users + admins) |
| **API** | REST endpoints scattered across PHP and Python |

### 1.2 Pain Points

1. **Fragmented codebase**: PHP and Python services running in parallel
2. **Inconsistent auth**: Dual-identity system not leveraging Django auth framework
3. **No unified file management**: Uploads lack quotas, versioning, or audit trails
4. **Tight coupling**: Business logic embedded in views and controllers
5. **Difficult deployments**: Manual sync between environments
6. **Missing API layer**: No standardized REST/GraphQL interface
7. **Hardcoded configuration**: Environment-specific values scattered throughout
8. **No automated testing**: Zero test coverage
9. **Legacy schema**: Some tables inherited from PHP with unclear relationships

---

## 2. Proposed Django Architecture

### 2.1 Canonical Project Structure

```
gisdata/
├── config/                          # Django project configuration
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py                 # Shared settings
│   │   ├── local.py                # Local development overrides
│   │   ├── production.py           # Production settings
│   │   └── test.py                 # Test settings
│   ├── urls.py                     # Root URL configuration
│   ├── wsgi.py
│   └── asgi.py
├── apps/                           # Modular applications
│   ├── core/                       # Base models, middleware, utils
│   ├── users/                      # User management, profiles, invites
│   ├── stations/                   # NTRIP station registry & monitoring
│   ├── tours/                      # 3D tours, files, layers, annotations
│   ├── rinex/                      # RINEX file processing & generation
│   ├── slam/                       # SLAM pipeline & processing
│   ├── cad/                        # FacadeCAD, TopoCAD, FacadeFoto
│   ├── billing/                    # Subscriptions & payments
│   ├── documents/                  # NEW: File management system
│   ├── api/                        # DRF ViewSets & routers
│   └── workers/                    # Celery task definitions
├── templates/
│   ├── base/
│   │   ├── _layout.html
│   │   ├── _header.html
│   │   ├── _sidebar.html
│   │   └── _footer.html
│   └── [app]/...
├── static/
├── media/                          # User uploads (local fallback)
├── locale/                         # i18n translations
├── tests/                          # Global test suite
├── scripts/                        # Management scripts
├── docs/                           # Documentation
├── pyproject.toml                  # Python project metadata
├── manage.py
├── requirements.txt
└── docker-compose.yml
```

### 2.2 Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Separation of Concerns** | Each app handles a single domain; no cross-app model imports |
| **Convention over Configuration** | Follow Django defaults; explicit only when necessary |
| **Dependency Inversion** | Apps depend on abstractions (interfaces), not concretions |
| **Single Responsibility** | Views handle HTTP; services handle business logic; models handle data |
| **Explicit over Implicit** | All settings, URLs, and relationships are explicitly defined |

---

## 3. Phased Migration Plan

### Phase 0: Foundation & Infrastructure (Week 1)

**Objective**: Establish the canonical project structure, tooling, and development workflow.

#### Tasks

1. **Project Restructure**
   - [x] Create `config/settings/` package with `base.py`, `local.py`, `production.py`
   - [x] Move existing Django apps into `apps/` subpackage
   - [x] Update `INSTALLED_APPS` and `ROOT_URLCONF`
   - [x] Add `.gitignore` for `media/`, `staticfiles/`, `__pycache__/`, `.env`
   - [x] Fix all cross-app imports to use `apps.[appname]` namespace

2. **Development Tooling**
   - [x] Add `pyproject.toml` with tool configurations
   - [x] Configure `ruff` for linting, `black` for formatting, `mypy` for type checking
   - [x] Add `pre-commit` hooks for automated code quality
   - [x] Configure `pytest` with `pytest-django` and `pytest-cov`
   - [x] Add `make lint`, `make format`, `make test` commands

3. **Settings Modularization**
   - [x] Extract hardcoded paths to environment variables
   - [x] Configure `django-environ` or `python-dotenv`
   - [x] Set up `local.py` for development overrides (gitignored)
   - [x] Add `AUTH_USER_MODEL` if custom user model is adopted

4. **Storage Backends**
   - [x] Add `django-storages` to requirements
   - [x] Configure `DEFAULT_FILE_STORAGE` for S3/MinIO in production
   - [ ] Add local filesystem fallback for development

#### Deliverables

- Canonical project structure committed to repository
- All developers can run `make lint && make test` successfully
- Settings split into base/local/production with no hardcoded secrets

---

### Phase 1: Documents App — File Management System (Week 1-2)

**Objective**: Implement the requested internal file storage system with 6GB per-user quotas, categorization, versioning, and search.

#### Technical Rationale

The documents app serves as the centralized file management hub, replacing ad-hoc upload directories with a governed system. Key design decisions:

- **MPTT for Categories**: Hierarchical categorization requires tree traversal; MPTT provides efficient `get_descendants()` and `get_ancestors()` without recursive queries.
- **Dual Ownership**: Mirrors the existing `users_sync` vs `admins` pattern — documents belong to either identity, never both, enforced via `CheckConstraint`.
- **Soft Delete**: Preserves audit trail and allows recovery; `deleted_at` timestamp rather than hard delete.
- **Search Vector**: PostgreSQL `GIN` index on `SearchVectorField` enables full-text search without external dependencies.
- **Quota Tracking**: `UserStorageQuota` is denormalized for performance; recalculated via signals on document changes.

#### Tasks

1. **Models** (`apps/documents/models.py`)
   - [x] `DocumentCategory` (MPTT tree)
   - [x] `DocumentTag` (flat tags with colors)
   - [x] `UserStorageQuota` (6GB default, `BigIntegerField` for bytes)
   - [x] `Document` (owner, category, tags, file, metadata, version, soft delete)
   - [x] `DocumentVersion` (versioned file history)
   - [x] `DocumentAccessLog` (audit trail)
   - [x] Add database constraints: `chk_document_owner`, `chk_document_version_creator`, `chk_access_log_user`

2. **Admin Integration** (`apps/documents/admin.py`)
   - [x] Register all models
   - [x] MPTT admin for `DocumentCategory`
   - [x] Inline `DocumentVersion` on `Document` change form
   - [x] Read-only fields for audit fields
   - [x] List filters, search fields, bulk actions

3. **Business Logic** (`apps/documents/signals.py`, `apps/documents/services.py`)
   - [x] `post_save` on `Document` → update `search_vector`
   - [x] `post_save`/`post_delete` on `Document` → recalculate `UserStorageQuota.used_bytes`
   - [x] `pre_save` on `Document` → auto-detect `file_type` and `mime_type`
   - [x] Validation: reject upload if quota exceeded

4. **Views & URLs** (`apps/documents/views.py`, `apps/documents/urls.py`)
   - [x] `DocumentListView` (filter by category, tag, type, date; search)
   - [x] `DocumentUploadView` (with quota validation)
   - [ [x] `DocumentDetailView` (preview, version history)
   - [x] `DocumentDownloadView` (serve files)
   - [x] `CategoryListView`, `TagListView`

5. **DRF API** (`apps/api/views.py`, `apps/api/serializers.py`)
   - [x] `DocumentViewSet` (CRUD, search, filter, ordering)
   - [x] `CategoryViewSet`, `TagViewSet`
   - [x] `quota/` action (current user quota)
   - [x] `upload_version/` action
   - [x] Permissions: owner-or-admin read/write, public read for published
   - [x] Throttling: 100 req/min per user

6. **Migrations**
   - [ ] Generate initial migration for documents app
   - [ ] Verify migration applies cleanly to existing database

#### Deliverables

- Fully functional document management UI and API
- 6GB per-user quota enforcement working
- Full-text search across documents operational
- Admin interface for document management

---

### Phase 2: Unified Layout & API Foundation (Week 2-3)

**Objective**: Standardize the user interface across all apps and expose a comprehensive DRF API layer.

#### Technical Rationale

- **Unified Layout**: Eliminates template duplication, ensures consistent UX, and reduces maintenance burden. Bootstrap 5 chosen for its grid system, component library, and accessibility.
- **DRF API Layer**: Decouples frontends from server-rendered HTML. Enables SPA/mobile clients, third-party integrations, and future microservice extraction.
- **Redis Caching**: Addresses N+1 query issues identified in tours map view. Caches session data, station status, and category trees.

#### Tasks

1. **Unified Layout Templates**
   - [x] Create `templates/base/_layout.html` with Bootstrap 5 grid
   - [x] Create `templates/base/_header.html` (brand, user menu, notifications)
   - [x] Create `templates/base/_sidebar.html` (nav with entitlement-based visibility)
   - [x] Create `templates/base/_footer.html`
   - [ ] Migrate existing templates to extend `base/_layout.html`
   - [ ] Add `static/css/app.css` with custom theme

2. **DRF API Layer** (`apps/api/`)
   - [ ] `StationViewSet` — read-only for authenticated, admin write
   - [ ] `StationStatusViewSet` — read-only live status
   - [ ] `TourViewSet` — CRUD with visibility rules
   - [ ] `TourAnnotationViewSet` — nested under tours
   - [ ] `RinexRequestViewSet` — user-scoped CRUD
   - [ ] `SlamProjectViewSet`, `SlamScanViewSet` — admin-only
   - [ ] Add JWT + Session authentication
   - [ ] Global pagination (50/page), filtering, ordering

3. **Caching Infrastructure**
   - [ ] Add Redis to `docker-compose.yml` and server
   - [ ] Configure Django cache framework:
     - Session backend (replace DB sessions)
     - Station status (60s TTL)
     - Tour list for map (120s TTL)
     - Category trees

#### Deliverables

- All views use unified Bootstrap 5 layout
- Comprehensive DRF API for all major entities
- Redis caching operational for session and frequently accessed data

---

### Phase 3: Auth & User Management Hardening (Week 3)

**Objective**: Secure the authentication system, modernize password storage, and add 2FA-ready infrastructure.

#### Technical Rationale

The existing dual-identity auth (`users_sync` vs `admins`) is preserved but enhanced:

- **Password Migration**: Legacy SHA-256 hashes (from PHP) are verified during login and upgraded to Django's PBKDF2 hasher on successful authentication.
- **Session Security**: `SESSION_COOKIE_SECURE` and `CSRF_COOKIE_SECURE` ensure cookies are only transmitted over HTTPS.
- **Brute-Force Protection**: `django-axes` tracks failed login attempts and locks out attackers.

#### Tasks

1. **Password Migration**
   - [x] `users_sync.user_password`: keep plaintext for mdb compatibility, add `password_hash` column
   - [x] `admins.password_hash`: migrate legacy SHA-256 to Django hashers on login
   - [ ] Add `last_login` tracking for admins
   - [ ] Add password reset flow via email

2. **Session Security**
   - [x] Set `SESSION_COOKIE_SECURE = True` in production
   - [x] Set `CSRF_COOKIE_SECURE = True`
   - [ ] Add `SESSION_COOKIE_DOMAIN` for cross-subdomain if needed
   - [ ] Add `django-axes` for brute-force protection

3. **API Authentication**
   - [ ] Add `rest_framework_simplejwt`
   - [ ] Issue JWT on `/api/v1/token/`
   - [ ] Allow Session auth for browser, JWT for SPAs/mobile

#### Deliverables

- Legacy passwords transparently upgraded on login
- Brute-force protection active
- JWT authentication available for API clients

---

### Phase 4: Worker Modernization (Week 3-4)

**Objective**: Replace ad-hoc PHP scripts and Windows Task Scheduler jobs with Celery + Redis.

#### Technical Rationale

Celery provides:

- **Reliability**: Retries with exponential backoff handle transient failures
- **Visibility**: Task state persistence and Flower/Django Admin monitoring
- **Concurrency**: Worker pools match CPU cores; critical for SLAM/COPC processing
- **Scheduling**: Beat scheduler with timezone support replaces ad-hoc cron

#### Tasks

1. **Celery Configuration**
   - [x] Add `celery` and `celery[redis]` to requirements
   - [ ] Create `gisdata/celery.py` with autodiscovery
   - [ ] Create `apps/workers/tasks.py`:
     - `poll_stations_task` — periodic, 60s
     - `poll_stations_ftp_task` — periodic, 3600s
     - `process_rinex_requests_task` — periodic, 120s
     - `process_slam_jobs_task` — periodic, 300s
     - `process_copc_conversions_task` — event-driven
     - `process_splat_transforms_task` — event-driven
     - `sync_mdb_users_task` — periodic, 300s

2. **systemd Integration**
   - [x] Create `systemd/gisdata-celery.service`
   - [x] Create `systemd/gisdata-celery-beat.service`
   - [ ] Create `systemd/gisdata-celery-worker.service`
   - [ ] Deploy to server with `Restart=on-failure`

3. **Monitoring**
   - [ ] Add `django-celery-results` for task state persistence
   - [ ] Add Flower for real-time monitoring
   - [ ] Add task failure alerts to admin email

#### Deliverables

- All background jobs running via Celery
- Scheduled tasks visible and manageable in Flower/Django Admin
- Automatic retries for failed tasks

---

### Phase 5: Frontend Integration & PHP Removal (Week 4-5)

**Objective**: Embed existing SPAs under unified layout and eliminate PHP codebase.

#### Technical Rationale

- **Vite Workspace**: Manages multiple SPAs (viewer, facade-cad, facade-foto, topo-cad) with shared dependencies and consistent build output.
- **Template Integration**: Modals and iframes replaced with direct template inclusion; inline JS extracted to modular files.
- **PHP Removal**: Eliminates security surface, reduces deployment complexity, enables Python-only CI/CD.

#### Tasks

1. **Asset Pipeline**
   - [ ] Add `vite` to root `package.json` as workspace manager
   - [ ] Configure Vite builds:
     - `viewer/` → `static/frontend/viewer/`
     - `facade-cad/` → `static/frontend/facade-cad/`
     - `facade-foto/` → `static/frontend/facade-foto/`
     - `topo-cad/` → `static/frontend/topo-cad/`
   - [ ] Add `collectstatic` to deployment script

2. **Template Integration**
   - [ ] Replace `map.html` 58KB inline JS with modular template:
     - `templates/tours/_map_controls.html`
     - `templates/tours/_viewer_modal.html`
     - `templates/tours/_layers_panel.html`
     - `static/js/tour-map.js` (Leaflet + viewer bridge)
   - [ ] Embed viewer SPA via iframe or direct mount in unified layout
   - [ ] Ensure all modals use Bootstrap 5 exclusively

3. **PHP Removal**
   - [ ] Delete `*.php` from repo root
   - [ ] Remove `api/*.php`
   - [ ] Remove `app/views/*.php`
   - [ ] Remove `app/lib/*.php`
   - [ ] Remove `bin/*.php` and `bin/*.ps1`
   - [ ] Update nginx to remove PHP-FPM configs

#### Deliverables

- Zero PHP files in repository
- All SPAs integrated under unified Django layout
- Nginx configuration simplified (no PHP upstream)

---

### Phase 6: Testing & Documentation (Week 5-6)

**Objective**: Achieve production-ready quality and comprehensive documentation.

#### Tasks

1. **Test Suite**
   - [ ] Unit tests:
     - `core/tests/test_auth.py` — login, logout, dual-session
     - `users/tests/test_services.py` — mdb sync, manual user creation
     - `stations/tests/test_services.py` — NTRIP polling logic
     - `tours/tests/test_services.py` — file URLs, public checks, quota
     - `documents/tests/test_models.py` — quota, versioning, soft delete
     - `documents/tests/test_api.py` — CRUD, permissions, throttling
   - [ ] Integration tests:
     - `tests/integration/test_tour_upload_flow.py`
     - `tests/integration/test_document_quota.py`
   - [ ] Coverage target: 80% for `apps/`, 60% overall

2. **Documentation**
   - [ ] `docs/architecture.md` — C4 diagrams (Context, Container, Component)
   - [ ] `docs/deployment.md` — server setup, systemd, nginx, SSL
   - [ ] `docs/migration.md` — step-by-step migration from current state
   - [ ] `docs/api.md` — auto-generated from drf-spectacular
   - [ ] `docs/documents.md` — file storage, quotas, categories, tags
   - [ ] Update `README.md` with new structure

#### Deliverables

- Test suite with 80% app coverage
- Comprehensive documentation suite
- CI/CD pipeline configured to run tests and linting

---

### Phase 7: Production Hardening (Week 6)

**Objective**: Secure, monitor, and optimize for production deployment.

#### Tasks

1. **Security**
   - [ ] Rotate all default passwords (DB, SECRET_KEY, Earthdata, FTP)
   - [ ] Enable `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS`
   - [ ] Add `django-cors-headers` if cross-origin needed
   - [ ] Add rate limiting on login and upload endpoints
   - [ ] Audit SQL queries for injection (all use ORM/parameterized)

2. **Performance**
   - [ ] Add `django-debug-toolbar` for development
   - [ ] Add `nplusone` query detector
   - [ ] Optimize N+1 queries in tours map view (`select_related`/`prefetch_related`)
   - [ ] Add database connection pooling (pgBouncer or `django-db-connection-pool`)
   - [ ] Configure gunicorn workers = `2 * CPU cores + 1`

3. **Monitoring**
   - [ ] Add Sentry for error tracking
   - [ ] Add Prometheus metrics via `django-prometheus`
   - [ ] Add health check endpoint (`/healthz/`) with DB, cache, storage checks
   - [ ] Add uptime monitoring (Healthchecks.io)

#### Deliverables

- Security hardening checklist complete
- Performance benchmarks met (map < 2s, API < 200ms p95)
- Monitoring and alerting operational

---

## 4. Technical Rationale

### 4.1 Why Django + DRF?

- **Existing Schema**: Already ported to Django models with explicit `db_table` — zero-downtime migration
- **ORM Safety**: Django ORM prevents SQL injection by default
- **Rapid Development**: DRF provides serializers, viewsets, throttling, pagination out of the box
- **Admin Interface**: Free, powerful, and extensible
- **Signals/Middleware**: Clean cross-cutting concerns (quota, search, audit)

### 4.2 Why Celery over systemd timers?

- **Reliability**: Retries with exponential backoff handle transient failures
- **Visibility**: Task state persistence and Flower/Django Admin monitoring
- **Concurrency**: Worker pools match CPU cores; critical for SLAM/COPC processing
- **Scheduling**: Beat scheduler with timezone support replaces ad-hoc cron

### 4.3 Why S3/MinIO for storage?

- **Scalability**: Flat `uploads/` directory does not scale horizontally
- **CDN Ready**: Object storage enables CDN for tour files and documents
- **Lifecycle**: Automated archival and deletion policies
- **Backup**: Off-server replication via bucket policies

### 4.4 Why modular `apps/` package?

- **Namespace Clarity**: `apps.core.models.Admin` vs `apps.users.models.UserSync` — no ambiguity
- **Independent Testing**: Each app can be tested in isolation
- **Future Extraction**: Apps can become separate services if microservices are needed later

### 4.5 Why preserve existing schema?

- **Zero Downtime**: Django apps coexist with legacy data
- **Data Integrity**: Explicit `db_table` Meta preserves exact table names
- **No Migration Scripts**: Existing rows remain untouched

---

## 5. Risk Register & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Downtime during app rename | Medium | High | Stage in maintenance window; keep symlinks |
| Quota miscalculation | Medium | High | Idempotent signal handlers; DB-level checks |
| Celery task duplication | Low | Medium | `task_acks_late=True`, DB-level locks |
| Large file upload failures | Medium | Medium | Chunked upload via S3 multipart; test with 2GB+ files |
| Legacy auth breakage | Low | High | Keep dual-identity auth untouched until Phase 3 |
| Nginx config drift | Medium | Medium | Version-control config; test in CI |

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Deployment time | < 5 minutes (CI/CD) |
| Page load (map) | < 2s first paint, < 5s full |
| API response (station status) | < 200ms p95 |
| Upload throughput | 100 MB/s local, 10 MB/s remote |
| Worker success rate | > 99.5% |
| Test coverage | > 80% apps/, > 60% overall |
| Zero PHP files in production | After Phase 5 |

---

## 7. Next Immediate Steps

1. **Resolve server dependencies**
   - Option A: Vendor missing Python packages into repo
   - Option B: Simplify documents app to remove external deps (django-mptt, DRF)
   - Option C: Remove DRF temporarily; serve HTML-only until deps available

2. **Fix remaining imports**
   - Ensure all management commands use `apps.*` paths
   - Verify `apps.py` `name` attributes are correct

3. **Deploy and verify**
   - Push fixed code to server
   - Run `manage.py migrate` and `manage.py collectstatic`
   - Restart gunicorn and verify `/healthz/` returns 200

4. **Proceed with Phase 2**
   - Migrate all views to unified layout
   - Add DRF API for stations, tours, rinex, slam
