# TOPO·CAD

Web-CAD prototype for drafting **topography** directly over heavy point
clouds — the FACADE·CAD core (see the repository root) retargeted from
vertical surfaces to the ground. Vanilla TypeScript + Three.js +
Tailwind — no CAD libraries; all vector math, snapping and transforms are
hand-rolled on Three.js math classes.

**Пользователям:** полное руководство на русском — [РУКОВОДСТВО.md](РУКОВОДСТВО.md).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle
```

The app lives inside the FACADE·CAD repository, so `npm install` is
optional during development: Node resolves `three`, `vite` and the rest
from the parent `node_modules`.

## Layout

```
┌─────────────────────┬──────────────┐
│                     │ РЕЗ          │  ПОПЕРЕЧНИК ⇄ ПРОДОЛЬНИК at the cursor
│  ПЛАН (drafting)    ├──────────────┤
│  ortho, top-down    │ 3D ИЗО       │  perspective + OrbitControls
└─────────────────────┴──────────────┘
```

Three cameras over ONE scene and ONE point buffer; each pass flips
uniforms instead of touching geometry, so the cut is live while the plan
is being drafted.

**Tracking and freezing.** The cut and the 3D view follow the drafting
cursor through per-pane ANCHORS. Touching a pane (click, wheel, pan, or
keys `2`/`3`) freezes its anchor — camera *and* clip slab stop together,
so mousing over the plan can no longer slide the picture away. Key `1`
resumes tracking; a frozen pane says **ФИКС** in its caption.

## Workflow

1. **Участок** — in the plan view, click a lasso fence around the working
   strip, `Enter`/RMB to apply. The cloud is clipped on the GPU (polygon
   uniforms + vertex-stage cull), never filtered on the CPU.
2. **Ось** — two clicks along the trace define the local frame:
   X = station along the axis, Y = horizontal offset (positive to the
   left), Z = elevation. The origin drops to the cloud datum, so local z
   IS the elevation. The plan realigns to the axis and both cuts stand up
   in it.
3. **Черчение** — polyline / rectangle / circle / text / points on the
   horizontal plane. Everything is stored in UCS-local coordinates with
   z = 0 (flat, DXF-ready) and reaches world space only through the UCS
   group matrix.

## Section controls

| Control | Meaning |
| --- | --- |
| **ПОПЕР / ПРОД** | cut orientation; each one remembers its own three numbers |
| **Т** | slab thickness across the cut (clip box uniform) |
| **О** | window: how much ground the cut spans on screen |
| **В** | vertical exaggeration (asymmetric ortho frustum) |
| **ОБЛАСТЬ** | size of the cloud window the 3D view keeps around the cursor |

Плюс **СРЕЗ** over the plan: a horizontal slab at a chosen elevation —
both the rendering and the snapping honour it, which is how bare ground
is read out from under vegetation.

## Controls

| Input | Action |
| --- | --- |
| LMB | draw / select |
| RMB or `Enter` | finish gesture |
| `C` | close polyline |
| `Esc` | cancel / clear |
| MMB drag | pan (ortho panes), orbit in 3D |
| Wheel | zoom at cursor |
| `1` / `2` / `3` | focus plan / cut / 3D — `2` and `3` freeze that pane |
| `S` | snap to cloud points (15 px, green marker; result is flattened onto the plan) |
| `F8` / hold `Shift` | ortho lock to the axis directions |
| `Del` | erase selection |

## Architecture

| Module | Responsibility |
| --- | --- |
| `Engine.ts` | app root, input wiring, per-viewport uniform flips, ToolHost |
| `ViewportManager.ts` | one renderer, three scissored viewports (2 ortho + 1 perspective), exaggeration, nav |
| `UCSManager.ts` | axis UCS matrix (station/offset/elevation), drafting plane |
| `ShaderFactory.ts` | point material: GPU lasso, section slab and height slice via uniforms |
| `CADTools.ts` | tool state machine, snapping/ortho pipeline, rubber bands |
| `SnapEngine.ts` | uniform hash grid over UCS-local XY for 15 px snapping |
| `Entities.ts` | polyline / circle / text / point entities + store (local, z = 0) |
| `PointCloudFactory.ts` | deterministic synthetic terrain scan with a road corridor |
| `UI.ts` | thin DOM layer over the glassmorphism panels |
