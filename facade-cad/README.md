# FACADE·CAD

Web-CAD prototype for drafting building facades directly over heavy point
clouds. Vanilla TypeScript + Three.js + Tailwind — no CAD libraries; all
vector math, snapping and transforms are hand-rolled on Three.js math
classes.

**Пользователям:** полное руководство на русском — [РУКОВОДСТВО.md](РУКОВОДСТВО.md).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production bundle
```

## Ship

Два способа отдать программу людям — одно и то же приложение, разная
оболочка вокруг него.

```bash
node build-kits.mjs      # «собрать-пакеты.cmd»  → Фасады-пакет / Сервер-пакет / Удалённый-сервер
node build-desktop.mjs   # «собрать-десктоп.cmd» → Фасады-Десктоп (нужен .NET SDK 8)
```

| | Фасады-пакет | Фасады-Десктоп |
|---|---|---|
| Чем открывается | браузер + сервер на Node | своё окно (`FACADE-CAD.exe`) |
| Что нужно на машине | Node.js | ничего (WebView2 есть в Windows 10/11) |
| Недавние сканы | нет — вкладка не знает путей к файлам | есть, на экране запуска |
| Файл в окно | нет | перетаскиванием |
| ToCad | только через буфер обмена | прямо в запущенный AutoCAD (COM) |
| DXF | в папку загрузок | обычное «Сохранить как…» |

Исходники оболочки — [desktop/](desktop/): WPF + WebView2, ~700 строк.
Кода приложения она не касается: файл кладётся в тот же
`<input id="import-file">`, что и при выборе мышью, а раздача, поток
скана и мост в AutoCAD живут в обработчике `WebResourceRequested`.

## Workflow

1. **Isolate** — in the TOP view, click a lasso fence around one wall,
   `Enter`/RMB to apply. The 400k-point demo cloud is clipped on the GPU
   (polygon uniforms + vertex-stage cull), never filtered on the CPU.
2. **Level** — the pane flips to a SIDE view of the isolated wall and a
   horizontal slab (level + thickness, world height) is set there: click a
   height or drag the sliders, the green band shows what will survive.
   A plan view of a whole wall is roof, ground and vegetation on top of
   each other; a 20 cm slab is a line you can actually click along.
3. **UCS** — back in the TOP view, now showing only that slab, two clicks
   along the wall line define the local frame: X along the wall, Y = global
   up, Z = wall normal. Picking is restricted to the slab too, so the UCS
   cannot land on a bush in front of the facade. The main viewport realigns
   to the true front elevation; the profile viewport looks along the wall
   with a live section-depth slab (uniform clip box).
4. **Draft** — polyline / rectangle / circle / text on the wall plane.
   Everything is stored in UCS-local coordinates with z = 0 (flat,
   DXF-ready) and reaches world space only through the UCS group matrix.

## Controls

| Input | Action |
| --- | --- |
| LMB | draw / select |
| RMB or `Enter` | finish gesture |
| `C` | close polyline |
| `Esc` | cancel / clear |
| MMB drag | pan (ortho views) |
| Wheel | zoom at cursor |
| `S` | snap to cloud points (15 px, green marker; result is flattened onto the UCS plane) |
| `F8` / hold `Shift` | ortho lock to local X/Y |
| `Del` | erase selection |

## Architecture

| Module | Responsibility |
| --- | --- |
| `Engine.ts` | app root, input wiring, per-viewport uniform flips, ToolHost |
| `ViewportManager.ts` | one renderer, three scissored viewports, ortho nav, framing |
| `UCSManager.ts` | wall UCS matrix, drafting plane, entity parent group |
| `ShaderFactory.ts` | point material: GPU lasso + section clipping via uniforms |
| `CADTools.ts` | tool state machine, snapping/ortho pipeline, rubber bands |
| `SnapEngine.ts` | uniform hash grid over UCS-local XY for 15 px snapping |
| `Entities.ts` | polyline / circle / text entities + store (local, z = 0) |
| `PointCloudFactory.ts` | deterministic synthetic facade scan (demo data) |
| `UI.ts` | thin DOM layer over the glassmorphism panels |
