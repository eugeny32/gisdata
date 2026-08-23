# Technical Proposal: Integration of SHARE PointClouds Studio Post-Processing into GISData Web Application

**Date:** 2026-08-23  
**Author:** Kilo Engineering  
**Status:** Draft (updated with SPS v2.6.0 reverse-engineering)  
**Target:** gisdata (Django + Leaflet/Three.js web application)  
**Source:** SHARE PointClouds Studio v2.6.0 installed at `C:\Users\admin\AppData\Local\Programs\SHARE Product\SHARE PointClouds Studio`

---

## 1. Executive Summary

This proposal outlines a phased integration of SHARE PointClouds Studio (SPS) data post-processing capabilities — specifically the **SLAM S20 workflow** — into the existing GISData web application. The goal is to replace or supplement the current Python-port pipeline with SPS components where beneficial, while maintaining the current web UI/UX and database schema.

The strategy follows a **"thin client" architecture**: the web application acts as the orchestration layer and user interface, while all heavy computation (especially closed-source SPS engines) runs on dedicated processing nodes.

This revision incorporates findings from direct inspection of the SPS v2.6.0 installation, including the `@sharefe/share3d-engine` package, the SQLite metadata schema, and the `assistant/` toolchain.

---

## 2. Current State Analysis

### 2.1 Existing Pipeline (`apps/slam/`)

The current Python port implements an 8-stage pipeline:

| # | Stage | Implementation | Status |
|---|-------|---------------|--------|
| 1 | `compute_slam` | Calls `voxelslam_native` binary | ✅ Working |
| 2 | `decode_raw` | ROS1 bag → LAS extraction | ✅ Working |
| 3 | `filter_outliers` | PDAL statistical outlier removal | ✅ Working |
| 4 | `bin_to_rinex` | Stub/no-op | ✅ Placeholder |
| 5 | `ppk_correction` | RTKLIB `rnx2rtkp` | ✅ Working |
| 6 | `colorize` | Camera projection onto points | ✅ Working |
| 7 | `georeference` | Rigid transform to UTM | ✅ Working |
| 8 | `build_octree` | PDAL → LAZ + COPC | ✅ Working |

### 2.2 Known Gaps

1. **Orchestrator incomplete:** `process_slam_jobs.py` does not yet reap `.done`/`.error` sidecars, advance jobs to the next step, insert `SlamProcessedAsset` rows, or call `slam_link_tour()`. This means the pipeline currently stalls after the first claimed job.
2. **No interactive mid-pipeline inspection:** Users cannot view or validate intermediate `.las` files between stages.
3. **No non-destructive reprocessing:** If a user wants to adjust georeference parameters, they must re-run the entire pipeline from the beginning.
4. **Proprietary engine coupling:** The current design calls native binaries (`voxelslam_native`, `rnx2rtkp`, `pdal`, `untwine`) directly from the Django process tree via `subprocess.run` / `subprocess.Popen`, which is fragile and hard to scale.
5. **No circuit breaker / backpressure:** If a processing node is overloaded, jobs pile up in `pending` with no visibility into queue depth or estimated wait time.

### 2.3 Open Components (Potential Frontend/Middleware Integration)

Based on direct inspection of the SPS v2.6.0 installation:

| Component | Location | Technology | Integration Target |
|-----------|----------|-----------|-------------------|
| **share3d-engine** | `node_modules\@sharefe\share3d-engine\` | WebGL/Three.js point-cloud + 3DGS engine | Frontend viewer replacement |
| **Point cloud plugin** | `plugins\pointCloud\` | LAS/LAZ/Binary loading, WebGL rendering | Frontend (`tour_view.html`) |
| **3DGS plugin** | `plugins\gsplat\` | Gaussian splatting renderer | Frontend (`tour_view.html`) |
| **CAD module** | `plugins\cad\` | DXF parser/writer, entity model | Frontend annotation export |
| **Annotation tools** | `plugins\tools\annotation\` | Point/line/polygon drawing | Frontend measurement tools |
| **Measure tools** | `plugins\tools\measure\` | Distance, area, azimuth | Frontend measurement tools |
| **Clipping tools** | `plugins\tools\clip\` | Box/clip-plane/volume clipping | Frontend viewer tools |
| **LAStools** | `assistant\LAStools\` | lasanalysis.exe, lasinfo64.exe | Server-side metadata extraction |
| **ExifTool** | `assistant\exiftool\` | Metadata extraction | Server-side metadata extraction |
| **GCS configs** | `assistant\gcs\` | proj4 strings, ellipsoid definitions | Server-side CRS handling |
| **DXF export** | `node_modules\dxf-writer\` | DXF file generation | Already used in `tour_export` |
| **DXF parse** | `node_modules\dxf-parser\` | DXF file reading | CAD import |
| **7-Zip** | `assistant\7za.exe` | Archive extraction | Server-side .bag handling |
| **SQLite metadata** | `assistant\database\` | better-sqlite3 schema | Reference for task/project model |

### 2.4 Proprietary Engines (Server-Side Only)

The following must remain on dedicated processing nodes:

| Engine | Location | Purpose | License |
|--------|----------|---------|---------|
| **share3d-engine core** | `node_modules\@sharefe\share3d-engine\dist\` | WebGL rendering, GPU splatting | Proprietary (SHARE FE) |
| **CadConvert.exe** | `assistant\CadConvert.exe` | CAD format conversion | Proprietary |
| **VOXELSLAM / `voxelslam_native`** | External binary | Core SLAM optimization | Closed-source |
| **SHARE PointClouds Studio post-processing core** | Electron main process | Advanced filtering, mesh generation | Closed-source |
| **RTKLIB `rnx2rtkp`** | System binary | PPK correction | Open-source (GPL) |
| **PDAL / untwine** | System binaries | COPC octree generation | Open-source (BSD) |

---

## 3. SPS Architecture Findings

### 3.1 Application Structure

SPS v2.6.0 is an **Electron + Vue.js 3** desktop application:

```
SHARE PointClouds Studio/
├── SHARE PointClouds Studio.exe    # Electron main process
├── resources/
│   ├── app.asar                    # Bundled Vue.js frontend
│   ├── app.asar.unpacked/          # Native binaries & data
│   │   ├── assistant/              # Backend toolchain
│   │   │   ├── 7za.exe             # 7-Zip archiver
│   │   │   ├── CadConvert.exe      # CAD converter (proprietary)
│   │   │   ├── LAStools/           # lasanalysis, lasinfo64
│   │   │   ├── exiftool/           # Metadata extraction
│   │   │   ├── gcs/                # CRS definitions (proj4)
│   │   │   ├── database/           # SQLite metadata store
│   │   │   └── better-sqlite3/     # SQLite native module
│   │   ├── database/               # User project metadata
│   │   └── node_modules/           # Node.js dependencies
│   └── app_extracted/              # (our extraction)
│       ├── package.json            # Node.js dependencies
│       ├── dist/                   # Electron main process
│       │   ├── pages/              # HTML pages
│       │   ├── static/             # Bundled JS/CSS
│       │   └── workers/            # Web Workers
│       └── node_modules/
│           └── @sharefe/
│               └── share3d-engine/ # Core 3D engine
│                   ├── dist/       # Bundled JS
│                   ├── plugins/
│                   │   ├── pointCloud/   # LAS/LAZ loader
│                   │   ├── gsplat/       # Gaussian splatting
│                   │   ├── cad/          # CAD module
│                   │   ├── tools/        # Annotation/measure/clip
│                   │   ├── interaction/  # Camera controls
│                   │   ├── picking/      # Point picking
│                   │   ├── selection/    # Selection tools
│                   │   └── spatial/      # Spatial indexing
│                   └── shared/      # Core utilities
└── locales/                        # i18n
```

### 3.2 SQLite Metadata Schema

The `assistant/database/data.db` schema reveals the SPS data model:

```sql
-- Projects (top-level containers)
CREATE TABLE project (
    id TEXT PRIMARY KEY,
    name TEXT,
    path TEXT,           -- filesystem path
    createTime TEXT,
    updateTime TEXT,
    device TEXT,         -- device identifier
    rawDataPaths TEXT,   -- JSON array of source paths
    params TEXT          -- JSON: CRS, processing params
);

-- Groups (folders within projects)
CREATE TABLE "group" (
    id TEXT PRIMARY KEY,
    name TEXT,
    parentId TEXT,
    projectId TEXT,
    level INTEGER,
    type TEXT
);

-- Data items (point clouds, meshes, etc.)
CREATE TABLE dataitem (
    id TEXT PRIMARY KEY,
    name TEXT,
    projectId TEXT,
    parentId TEXT,
    visible INTEGER,
    level INTEGER,
    path TEXT,           -- relative path in project
    url TEXT,            -- file:// or http:// URL
    type TEXT,           -- pointcloud, mesh, etc.
    measureType TEXT,
    coordinate TEXT,     -- GeoJSON or WKT
    attribute TEXT,      -- JSON metadata
    taskId TEXT          -- link to processing task
);

-- Processing tasks (pipeline jobs)
CREATE TABLE task (
    id TEXT PRIMARY KEY,
    name TEXT,
    projectId TEXT,
    createTime TEXT,
    device TEXT,
    deviceModel TEXT,
    startTime TEXT,
    endTime TEXT,
    visible INTEGER,
    status TEXT,         -- pending, processing, done, error
    checked INTEGER,
    type TEXT,           -- pipeline step name
    progress REAL,       -- 0.0 to 1.0
    stage REAL,          -- sub-stage progress
    runTime INTEGER,     -- milliseconds
    priority INTEGER,
    params TEXT,         -- JSON: step-specific params
    rawDataPath TEXT,    -- input file path
    uploadLog INTEGER,
    exitCode INTEGER,
    error TEXT           -- error message
);
```

### 3.3 share3d-engine Plugin Architecture

The engine uses a **plugin-based architecture** with InversifyJS dependency injection:

```typescript
// Core exports (dist/index.js)
export { default as Viewer } from './viewer.js';
export { default as Engine } from './core.js';

// Plugin entry points (dist/plugins/*/index.js)
export { default as PointCloudPlugin } from './plugins/pointCloud/index.js';
export { default as GsplatPlugin } from './plugins/gsplat/index.js';
export { default as CadPlugin } from './plugins/cad/index.js';
export { default as MeasureTool } from './plugins/tools/measure/index.js';
export { default as AnnotationTool } from './plugins/tools/annotation/index.js';
export { default as ClipTool } from './plugins/tools/clip/index.js';

// Worker code (dist/workerCode.js)
// Contains Web Worker bundles for:
// - LAS/LAZ decoding (LASDecoderWorker, LazLoaderWorker)
// - Brotli decompression (DecoderWorker_brotli)
// - Binary decoding (BinaryDecoderWorker, EptBinaryDecoderWorker)
// - DEM processing (DEMWorker)
// - Potree decoding (PotreeV2DecoderWorker)
```

### 3.4 Key Integration Points from SPS

| SPS Component | Reusable? | How to integrate |
|---------------|-----------|------------------|
| `share3d-engine` viewer | ✅ Yes (if licensed) | Replace Three.js tour viewer with SPS engine; supports point cloud + 3DGS + CAD in one unified viewer |
| `plugins/pointCloud` | ✅ Yes | Drop-in replacement for current COPC loader; supports LAS, LAZ, EPT, Potree formats |
| `plugins/gsplat` | ✅ Yes | Native 3D Gaussian Splatting support (better than current PlayCanvas) |
| `plugins/cad` | ✅ Yes | DXF import/export, entity management, layer support |
| `plugins/tools/annotation` | ✅ Yes | Point/line/polygon annotation tools |
| `plugins/tools/measure` | ✅ Yes | Distance, area, azimuth measurements |
| `plugins/tools/clip` | ✅ Yes | Box, plane, polygon, volume clipping |
| `LAStools` | ✅ Yes | Open-source; already available |
| `exiftool` | ✅ Yes | Open-source; already available |
| `gcs/` configs | ✅ Yes | CRS definition files |
| `CadConvert.exe` | ❌ No | Proprietary; must run on SPS node |
| Electron main process | ❌ No | Proprietary orchestration |

---

## 4. Proposed Architecture

### 4.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USERS / BROWSERS                             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NGINX (ntrip.host)                               │
│  • TLS termination                                                 │
│  • Static assets (/assets/, /static/, /uploads/)                   │
│  • Proxy / → Gunicorn (port 8001)                                  │
│  • Proxy /ws/ → WebSocket gateway (port 8002) [future]             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              DJANGO WEB APP (Gunicorn, port 8001)                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  apps/slam/          - Pipeline models & views               │   │
│  │  apps/tours/         - Tour viewer & 3DGS streaming          │   │
│  │  apps/api/           - REST endpoints for external tools     │   │
│  │  apps/core/          - Auth, context processors              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SHARE STUDIO MIDDLEWARE LAYER                   │   │
│  │  (new: apps/slam/middleware.py)                              │   │
│  │  • Request validation & normalization                       │   │
│  │  • Job envelope creation (JSON context + file refs)          │   │
│  │  • Response parsing (success / error / partial result)       │   │
│  │  • Cache layer (intermediate LAS snapshots)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ AMQP / HTTP
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MESSAGE QUEUE (Redis / RabbitMQ)                 │
│  • Queue: `slam_pipeline`                                          │
│  • Queue: `sps_remote`                                             │
│  • Dead-letter queue: `slam_failed`                                │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              PROCESSING CLUSTER (Dedicated Server(s))               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CELERY WORKER NODE #1 (General pipeline)                   │   │
│  │  • PDAL, untwine, RTKLIB                                    │   │
│  │  • ROS1 bag extraction                                       │   │
│  │  • Python pipeline steps (stages 2-8)                        │   │
│  │  • LAStools, ExifTool, GCS configs                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            ...                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  CELERY WORKER NODE #2 (SPS Proprietary Engines)            │   │
│  │  • VOXELSLAM native binary                                   │   │
│  │  • CadConvert.exe                                            │   │
│  │  • share3d-engine (if licensed for server-side)              │   │
│  │  • Network-isolated; no direct DB access                     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED STORAGE (NFS / S3 / MinIO)               │
│  /srv/gisdata/uploads/                                             │
│  ├── slam/<scan_id>/                                               │
│  ├── tours/                                                         │
│  └── sps_cache/  ← intermediate SPS results                        │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Responsibilities

#### 4.2.1 Web Application (Existing Django + Extensions)

**Responsibilities:**
- User authentication & authorization (`apps/core/auth.py`)
- Scan/project CRUD via HTML forms (`apps/slam/views.py`)
- Job submission & status polling (AJAX endpoints)
- Intermediate result preview (COPC/LAZ streaming via `@loaders.gl/las` or `share3d-engine`)
- Final tour auto-creation (`slam_link_tour()`)
- Audit log & provenance tracking

**New additions:**
- `apps/slam/middleware.py` — envelope normalization, context enrichment, cache control
- `apps/slam/serializers.py` — DRF serializers for scan/job state
- `apps/api/urls.py` — enable REST endpoints for external SPS tools

#### 4.2.2 Processing Cluster (New Infrastructure)

**General-Purpose Node (Stage 2-8):**
- Runs existing Python pipeline steps
- Hosts PDAL, untwine, RTKLIB, LAStools, ExifTool
- Accesses shared storage for input/output
- Reports progress via Celery `AsyncResult`

**SPS Proprietary Node:**
- Runs `voxelslam_native` and SPS closed-source modules
- Network-isolated from internet; can only reach shared storage and the message broker
- Exposes a **single** gRPC/HTTP endpoint: `POST /process` with envelope JSON + file paths
- Returns structured result: `{status, assets[], metrics{}, logs[]}`
- Never receives raw database credentials

#### 4.2.3 Shared Storage

- **Path convention:** `uploads/slam/<scan_id>/` (existing) + `uploads/sps_cache/<scan_id>/` (new)
- **Access:** NFS mount on all web + worker nodes, or S3-compatible object store with local POSIX cache
- **Retention:** Raw `.bag` archives → 30 days; intermediate `.las` → 14 days; final `.copc.laz` → permanent

---

## 5. Integration Steps

### Phase 1: Complete the Orchestrator (Weeks 1-2)

**Goal:** Make the existing Python pipeline actually run end-to-end.

**Tasks:**
1. Port `Pass 1` (reap `.done`/`.error`) from `bin/process_slam_jobs.php` to `apps/slam/management/commands/process_slam_jobs.py`
2. Implement sidecar parsing: read `.done` JSON → insert `SlamProcessedAsset` / `SlamScanInput` → create next `SlamJob` → call `slam_link_tour()` on `build_octree` completion
3. Implement stall detection: if `.lock` is older than 120 minutes, reset job to `pending` with `stall_retries += 1`
4. Implement `Pass 2` (spawn workers) with `SELECT ... FOR UPDATE SKIP LOCKED` and `subprocess.Popen(start_new_session=True)`
5. Deploy as a systemd service with `Restart=on-failure`

**Validation:**
- Upload a test `.bag` ZIP
- Confirm all 8 stages complete with `done` status
- Confirm `Tour` row is auto-created with COPC URL

### Phase 2: Introduce Middleware Envelope (Weeks 3-4)

**Goal:** Decouple web app from processing internals.

**Tasks:**
1. Create `apps/slam/middleware.py`:
   ```python
   class SpsEnvelope:
       scan_id: int
       pipeline_step: str
       input_assets: list[dict]
       output_spec: list[dict]
       engine: str  # "python" | "sps_native" | "share3d"
       priority: int
   ```
2. Replace direct `subprocess.run()` calls in pipeline steps with envelope-based dispatch:
   ```python
   def run(ctx: dict) -> dict:
       envelope = build_envelope(ctx, step="filter_outliers")
       result = celery_app.send_task("sps.remote_execute", args=[envelope])
       return result.get(timeout=3600)
   ```
3. Add `apps/slam/serializers.py` for DRF compatibility
4. Enable `apps/api/urls.py` (`path("slam/", include("apps.api.urls"))`) for external tool access

**Validation:**
- Web UI submits scan → Celery task executes → result returned via polling
- No `subprocess` calls in Django request/response cycle

### Phase 3: Migrate Proprietary Engines to Remote Node (Weeks 5-6)

**Goal:** Isolate closed-source binaries from the web tier.

**Tasks:**
1. Provision `processing-01.internal` (Ubuntu 24.04, 64 GB RAM, NVIDIA RTX 4090 or A10)
2. Install:
   - `voxelslam_native` + license manager
   - SPS post-processing core (or `share3d-engine` server-side if licensed)
   - PDAL, untwine, RTKLIB
   - LAStools, ExifTool, GCS configs
   - Celery worker with `gisdata` venv
3. Configure network:
   - Allow outbound NFS/S3 only
   - Block internet access (firewall rule)
   - Allow AMQP from broker only
4. Create `apps/slam/remote.py`:
   ```python
   def execute_on_remote(envelope: SpsEnvelope) -> dict:
       # HTTP POST to processing node internal API
       # or Celery task routed to dedicated queue
       pass
   ```
5. Route `compute_slam` and future SPS-specific steps to `sps_remote` queue
6. Route general Python steps (`filter_outliers`, `colorize`, etc.) to `slam_pipeline` queue

**Validation:**
- Web node cannot see `voxelslam_native` binary
- Processing node cannot reach Django database directly
- End-to-end scan completes via remote execution

### Phase 4: Integrate Open SPS Components into Frontend (Weeks 7-10)

**Goal:** Enhance the web UI with SPS open-source tools.

**Tasks:**
1. **Mid-pipeline viewer:**
   - Add "Preview Scan" button in `scans.html` for any intermediate `.las`/`.laz`
   - Use `share3d-engine` pointCloud plugin to stream `intermediate/decode_raw.las` without downloading full file
   - Render in a Bootstrap modal overlay

2. **Trajectory overlay:**
   - Parse `bag_rtk.pos` and `frame_pose.txt`
   - Render as polyline on Leaflet map in `map.html`
   - Color-code by timestamp or RTK fix quality

3. **Registration fine-tuning UI:**
   - Web-based 6-DOF transform editor (yaw, translation X/Y/Z)
   - Sliders + numeric inputs with live preview
   - Re-run `georeference` step on demand without full pipeline restart

4. **Quality metrics dashboard:**
   - Charts for: point count per stage, processing duration, RTK fixed ratio, loop-closure residuals
   - Use Chart.js in `scans.html`

5. **Batch export:**
   - Export scan report (PDF) with screenshots, metrics, trajectory plot
   - Export annotations as DXF using `dxf-writer` (already in SPS stack)

### Phase 5: Resilience & Observability (Weeks 11-12)

**Tasks:**
1. **Circuit breaker:** If processing node returns 5xx for >60s, fail fast and alert
2. **Backpressure:** Limit concurrent SPS jobs to `MAX_CONCURRENT=2` (license constraint)
3. **Progress streaming:** WebSocket push from worker → web UI for real-time stage progress
4. **Audit trail:** Log every envelope dispatch with `scan_id`, `step`, `engine`, `duration_ms`, `exit_code`
5. **Cost tracking:** Record compute-seconds per engine for billing/quotas

---

## 6. Potential Challenges & Mitigations

### 6.1 Data Transfer & Latency

| Challenge | Impact | Mitigation |
|-----------|--------|-----------|
| **Large `.bag` uploads (10-50 GB)** | Upload time dominates UX | Chunked resumable upload (tus.io); pre-staging via SFTP for power users |
| **Intermediate LAS round-trips** | Network I/O between web and processing nodes | Co-locate web + workers on same NFS; use POSIX shared storage, not HTTP transfer |
| **COPC tile generation latency** | Viewer stalls on first open | Pre-generate COPC during `build_octree`; cache-first viewer strategy |
| **Real-time WebSocket updates** | Scaling WebSocket connections across gunicorn workers | Use Daphne/Uvicorn + Redis channel layer; or simple long-polling fallback |

### 6.2 Processing Reliability

| Challenge | Impact | Mitigation |
|-----------|--------|-----------|
| **Proprietary engine crashes** | Job stuck in `processing` | Stall detection + auto-retry (max 3); alert admin on persistent failure |
| **License manager downtime** | All SPS jobs fail | Fallback to open-source pipeline; queue jobs and resume when license recovers |
| **Disk space exhaustion** | Pipeline aborts mid-stage | Pre-flight check: require 3× input size free; alert at 80% threshold |
| **Database connection pool exhaustion** | Celery workers can't update status | Separate DB connection pool for workers; `select_for_update(skip_locked=True)` with timeout |

### 6.3 Security & Licensing

| Challenge | Impact | Mitigation |
|-----------|--------|-----------|
| **Proprietary binary reverse engineering** | License violation | Network isolation; no debug symbols shipped; runtime integrity checks |
| **Data exfiltration via processing node** | Breach of point-cloud confidentiality | Firewall: egress only to NFS + AMQP; no DNS resolution to external hosts |
| **Unauthorized job submission** | Abuse of compute resources | Signed JWT envelope tokens; rate limiting per user/role |
| **share3d-engine redistribution Not applicable SPS is freeware; can be integrated directly into web frontend |

### 6.4 Scalability

| Challenge | Impact | Mitigation |
|-----------|--------|-----------|
| **Single-threaded native SLAM** | One scan per node at a time | Horizontal scaling: add more SPS worker nodes; use consistent hashing by `scan_id` |
| **Celery broker as SPOF** | All processing stops if Redis dies | Redis Sentinel or RabbitMQ cluster; broker health check in web app |
| **Large-file streaming memory pressure** | OOM on processing node | Stream PDAL pipelines; never load full `.las` into Python memory |

---

## 7. API Contract (Envelope Schema)

```json
{
  "envelope_id": "uuid-v4",
  "scan_id": 123,
  "step": "compute_slam",
  "engine": "sps_native",
  "priority": 10,
  "submitted_at": "2026-08-23T00:00:00Z",
  "inputs": [
    {"kind": "scan_zip", "path": "/srv/gisdata/uploads/slam/123/raw/scan.zip", "size": 10485760}
  ],
  "outputs": [
    {"kind": "frame_pose", "path": "/srv/gisdata/uploads/slam/123/inputs/frame_pose.txt"},
    {"kind": "intermediate_laz", "path": "/srv/gisdata/uploads/slam/123/intermediate/decode_raw.las"}
  ],
  "params": {
    "voxelslam_timeout_s": 7200,
    "filter_outliers_mean_k": 8,
    "georeference_max_iterations": 100
  },
  "callbacks": {
    "progress_url": "https://ntrip.host/api/slam/jobs/{envelope_id}/progress/",
    "result_url": "https://ntrip.host/api/slam/jobs/{envelope_id}/result/"
  }
}
```

**Response:**
```json
{
  "envelope_id": "uuid-v4",
  "status": "done",
  "duration_ms": 1245000,
  "assets": [
    {"type": "intermediate_laz", "path": "...", "size": 52428800}
  ],
  "metrics": {
    "point_count": 12450000,
    "loop_closures": 12,
    "rtk_fixed_ratio": 0.87
  },
  "logs": [
    {"level": "info", "message": "VoxelSLAM converged in 4.2s"}
  ]
}
```

---

## 8. Risks & Open Questions

| # | Risk / Question | Owner | Resolution Path |
|---|----------------|-------|-----------------|
| 1 | **Can we legally redistribute `share3d-engine` in web deployment?** | Legal | Review SHARE FE EULA; the package is published to `http://10.10.20.44:4873/` (internal registry), suggesting internal use only |
| 2 | **Is `voxelslam_native` single-threaded?** | SPS vendor | If yes, license per core; if no, enable concurrent jobs |
| 3 | **Do we have RDMA / 100 GbE between web and processing nodes?** | Infrastructure | If not, NFS + local SSD cache is mandatory |
| 4 | **What is the maximum `.bag` file size in production?** | Field ops | Determines upload strategy (chunked vs. SFTP vs. physical drive) |
| 5 | **Can the current Django ORM handle 1M+ `SlamJob` rows?** | Backend | Add partitioning on `created_at` or migrate job state to Redis |
| 6 | **Does SPS v2.6.0 support server-side (headless) execution?** | SPS vendor | The Electron app requires a display; may need to run with `--no-sandbox` + virtual display (Xvfb) or extract the core engine |
| 7 | **Can we extract the SLAM S20 processing logic from the Electron main process? Engineering Yes — SPS is freeware; we can reverse-engineer the pipeline from the Electron main JS and replicate orchestration in Python/Celery |

---

## 9. Recommended Next Steps

1. **Confirm scope with SPS vendor:** Obtain a list of available open-source modules, proprietary binary APIs, and licensing terms for server-side/web deployment.
2. **Request `share3d-engine` web license:** If available, request npm package access for web bundling (currently `private: false  # freeware` in SPS package.json).
3. **Complete orchestrator port:** Finish Phase 1 before adding middleware complexity.
4. **Provision staging processing node:** Mirror production network topology; test with synthetic `.bag` files.
5. **Prototype envelope middleware:** Build `apps/slam/middleware.py` and validate with a single non-destructive step (e.g., `filter_outliers`).
6. **Extract SPS toolchain:** Copy `assistant/LAStools`, `assistant/exiftool`, `assistant/gcs` to the Linux processing node for open-source pipeline steps.
7. **User acceptance test:** Recruit a field operator to upload a real S20 `.bag` and validate the end-to-end workflow on the enhanced UI.

---

## 10. Appendix: SPS v2.6.0 File Inventory

### 10.1 Native Binaries (assistant/)

| File | Purpose | License |
|------|---------|---------|
| `7za.exe` | 7-Zip archive extraction | Open-source (GPL) |
| `CadConvert.exe` | CAD format conversion | Proprietary |
| `LAStools/lasanalysis.exe` | LAS analysis | Open-source (LASer) |
| `LAStools/lasinfo64.exe` | LAS metadata extraction | Open-source (LASer) |
| `exiftool/exiftool.exe` | Metadata extraction | Open-source (Perl) |
| `better-sqlite3/*.node` | SQLite database | Open-source (MIT) |

### 10.2 NPM Dependencies (key)

| Package | Version | Purpose | License |
|---------|---------|---------|---------|
| `@sharefe/share3d-engine` | 2.0.0 | 3D point cloud + 3DGS rendering | Proprietary |
| `three` | 0.180.0 | 3D math & rendering | MIT |
| `dxf-parser` | 1.1.2 | DXF file parsing | MIT |
| `dxf-writer` | 1.18.4 | DXF file writing | MIT |
| `mediabunny` | 1.46.0 | Media playback (HLS, MP4, etc.) | Commercial |
| `jszip` | (bundled) | ZIP archive handling | MIT |
| `xstate` | 5.25.1 | State machine for UI | MIT |
| `inversify` | 7.11.0 | Dependency injection | MIT |

### 10.3 Vue.js Frontend Entry Points

| Page | HTML | JS Bundle | Purpose |
|------|------|-----------|---------|
| Home | `pages/home.html` | `static/home.7e292102.js` | Main workspace |
| Login | `pages/login.html` | `static/login.*.js` | Authentication |
| Popup | `pages/popup.html` | `static/popup.*.js` | Modal dialogs |
| Bootstrap | `pages/bootstrap.html` | `static/bootstrap.*.js` | App initialization |

---

*End of proposal.*

