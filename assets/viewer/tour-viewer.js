const FACE_DEFS = [
  { axis: "x", sign: 1, color: [0.85, 0.25, 0.25], pos: [0.5, 0, 0], rot: [0, 90, 0] },
  { axis: "x", sign: -1, color: [0.45, 0.12, 0.12], pos: [-0.5, 0, 0], rot: [0, -90, 0] },
  { axis: "y", sign: 1, color: [0.25, 0.75, 0.25], pos: [0, 0.5, 0], rot: [-90, 0, 0] },
  { axis: "y", sign: -1, color: [0.12, 0.4, 0.12], pos: [0, -0.5, 0], rot: [90, 0, 0] },
  { axis: "z", sign: 1, color: [0.3, 0.45, 0.85], pos: [0, 0, 0.5], rot: [0, 0, 0] },
  { axis: "z", sign: -1, color: [0.15, 0.22, 0.45], pos: [0, 0, -0.5], rot: [0, 180, 0] }
];
const GIZMO_PRESETS = {
  x1: { yaw: 90, pitch: 0 },
  "x-1": { yaw: -90, pitch: 0 },
  y1: { yaw: 0, pitch: -89.9 },
  "y-1": { yaw: 0, pitch: 89.9 },
  z1: { yaw: 0, pitch: 0 },
  "z-1": { yaw: 180, pitch: 0 }
};
function createNavCubeGizmo(pc, app) {
  const gizmoLayer = new pc.Layer({ name: "GizmoLayer" });
  app.scene.layers.push(gizmoLayer);
  const gizmoRoot = new pc.Entity("gizmoRoot");
  app.root.addChild(gizmoRoot);
  for (const f of FACE_DEFS) {
    const plane = new pc.Entity("gizmoFace_" + f.axis + f.sign);
    plane.addComponent("render", { type: "plane" });
    const mat = new pc.StandardMaterial();
    const color = new pc.Color(f.color[0], f.color[1], f.color[2]);
    mat.diffuse = color;
    mat.emissive = color;
    mat.useLighting = false;
    mat.update();
    plane.render.material = mat;
    plane.render.layers = [gizmoLayer.id];
    plane.setLocalPosition(f.pos[0] * 0.9, f.pos[1] * 0.9, f.pos[2] * 0.9);
    plane.setLocalEulerAngles(f.rot[0], f.rot[1], f.rot[2]);
    plane.setLocalScale(0.9, 1, 0.9);
    gizmoRoot.addChild(plane);
  }
  const gizmoCamera = new pc.Entity("gizmoCamera");
  gizmoCamera.addComponent("camera", {
    clearColor: new pc.Color(0, 0, 0, 0),
    clearColorBuffer: true,
    layers: [gizmoLayer.id],
    priority: 1,
    // рисуется после основной камеры — поверх неё
    rect: new pc.Vec4(0.84, 0.03, 0.14, 0.14)
  });
  app.root.addChild(gizmoCamera);
  function updateTransform(yaw, pitch) {
    const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
    const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
    const rot = yawQ.clone().mul(pitchQ);
    const offset = rot.transformVector(new pc.Vec3(0, 0, 3));
    gizmoCamera.setPosition(offset.x, offset.y, offset.z);
    gizmoCamera.lookAt(0, 0, 0);
  }
  function handlePointerDown(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const r = gizmoCamera.camera.rect;
    const vx = r.x * cw;
    const vw = r.z * cw;
    const vyTop = (1 - r.y - r.w) * ch;
    const vh = r.w * ch;
    if (px < vx || px > vx + vw || py < vyTop || py > vyTop + vh) return null;
    const cam = gizmoCamera.camera;
    const near = cam.screenToWorld(px, py, cam.nearClip, cw, ch);
    const far = cam.screenToWorld(px, py, cam.farClip, cw, ch);
    const dir = far.clone().sub(near).normalize();
    let tMin = -Infinity;
    let tMax = Infinity;
    let hitAxis = null;
    let hitSign = 0;
    for (const axis of ["x", "y", "z"]) {
      const o = near[axis];
      const d = dir[axis];
      if (Math.abs(d) < 1e-9) {
        if (o < -0.5 || o > 0.5) return null;
        continue;
      }
      let t1 = (-0.5 - o) / d;
      let t2 = (0.5 - o) / d;
      let sign = -1;
      if (t1 > t2) {
        [t1, t2] = [t2, t1];
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        hitAxis = axis;
        hitSign = sign;
      }
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return null;
    }
    if (!hitAxis) return null;
    const preset = GIZMO_PRESETS[hitAxis + hitSign];
    return preset ? { ...preset } : null;
  }
  return { updateTransform, handlePointerDown };
}
const AXIS_FIX_ROTATION = [-0.7071, 0, 0, 0.7071];
async function loadSplatFiles(pc, app, urls, target, setDistance, updateCameraTransform, isCurrent, showProgress) {
  let fileIndex = 0;
  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : "";
    showProgress(`${filePrefix}Загрузка модели...`, 0);
    await new Promise((resolve, reject) => {
      const asset = new pc.Asset("splat-" + fileIndex, "gsplat", { url, filename: url.split("/").pop() });
      app.assets.add(asset);
      asset.on("progress", (received, total) => {
        const pct = total ? received / total * 100 : 0;
        showProgress(`${filePrefix}Загрузка модели... ${Math.round(pct)}%`, pct);
      });
      asset.on("error", (err) => reject(new Error(String(err))));
      asset.on("load", () => {
        if (!isCurrent()) {
          resolve();
          return;
        }
        const resource = asset.resource;
        const entity = new pc.Entity("splat-" + fileIndex);
        entity.setLocalRotation(...AXIS_FIX_ROTATION);
        entity.addComponent("gsplat", { asset });
        app.root.addChild(entity);
        if (fileIndex === 1) {
          const aabb = resource && resource.aabb;
          if (resource && resource.gsplatData && typeof resource.gsplatData.calcFocalPoint === "function") {
            const focal = new pc.Vec3();
            resource.gsplatData.calcFocalPoint(focal);
            entity.getWorldTransform().transformPoint(focal, focal);
            target.copy(focal);
          } else if (aabb) {
            target.copy(aabb.center);
          }
          if (aabb) setDistance(Math.max(aabb.halfExtents.length() * 1.3, 0.5));
          updateCameraTransform();
        }
        resolve();
      });
      app.assets.load(asset);
    });
  }
}
function hslToRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function createPointCloudMaterial(pc, pointSizePx) {
  const material = new pc.ShaderMaterial({
    uniqueName: "GisdataLasPointCloudShader",
    attributes: { aPosition: pc.SEMANTIC_POSITION, aColor: pc.SEMANTIC_COLOR },
    vertexGLSL: `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      uniform mat4 matrix_model;
      uniform mat4 matrix_viewProjection;
      uniform float uPointSize;
      varying vec4 vColor;
      void main(void) {
        vColor = aColor;
        vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
        gl_Position = matrix_viewProjection * worldPos;
        gl_PointSize = uPointSize;
      }
    `,
    fragmentGLSL: `
      precision mediump float;
      varying vec4 vColor;
      void main(void) {
        gl_FragColor = vColor;
      }
    `
  });
  material.setParameter("uPointSize", pointSizePx);
  material.update();
  return material;
}
async function fetchWithProgress(url, onProgress) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error("HTTP " + resp.status);
  const total = Number(resp.headers.get("content-length")) || 0;
  const reader = resp.body.getReader();
  const chunks = [];
  let received = 0;
  for (; ; ) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) {
    buf.set(c, offset);
    offset += c.length;
  }
  return buf.buffer;
}
async function loadLasFiles(pc, app, urls, _target, setDistance, updateCameraTransform, isCurrent, showProgress, pointSizePx, outMaterials) {
  const { parse } = await import("@loaders.gl/core");
  const { LASLoader } = await import("@loaders.gl/las");
  let centerOffset = null;
  let extent = 1;
  let fileIndex = 0;
  for (const url of urls) {
    if (!isCurrent()) return;
    fileIndex++;
    const filePrefix = urls.length > 1 ? `Файл ${fileIndex} из ${urls.length}: ` : "";
    const buffer = await fetchWithProgress(url, (received, total) => {
      const pct = total ? received / total * 100 : 0;
      showProgress(`${filePrefix}Загрузка LAS... ${Math.round(pct)}%`, pct);
    });
    if (!isCurrent()) return;
    showProgress(`${filePrefix}Разбор LAS...`, 100);
    const data = await parse(buffer, LASLoader);
    if (!isCurrent()) return;
    const posAttr = data.attributes && data.attributes.POSITION;
    if (!posAttr) continue;
    const pos = posAttr.value;
    const count = pos.length / 3;
    if (!centerOffset) {
      let sumX = 0;
      let sumY = 0;
      let sumZ = 0;
      for (let i = 0; i < count; i++) {
        sumX += pos[i * 3];
        sumY += pos[i * 3 + 1];
        sumZ += pos[i * 3 + 2];
      }
      const meanX = sumX / count;
      const meanY = sumY / count;
      const meanZ = sumZ / count;
      let varX = 0;
      let varY = 0;
      let varZ = 0;
      for (let i = 0; i < count; i++) {
        varX += (pos[i * 3] - meanX) ** 2;
        varY += (pos[i * 3 + 1] - meanY) ** 2;
        varZ += (pos[i * 3 + 2] - meanZ) ** 2;
      }
      const stdX = Math.sqrt(varX / count);
      const stdY = Math.sqrt(varY / count);
      const stdZ = Math.sqrt(varZ / count);
      centerOffset = { x: meanX, y: meanY, z: meanZ };
      extent = Math.max(stdX, stdY, stdZ, 1) * 3;
      setDistance(Math.max(extent * 1.8, 0.5));
      updateCameraTransform();
    }
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = pos[i * 3] - centerOffset.x;
      positions[i * 3 + 1] = pos[i * 3 + 1] - centerOffset.y;
      positions[i * 3 + 2] = pos[i * 3 + 2] - centerOffset.z;
    }
    const colorAttr = data.attributes.COLOR_0 && data.attributes.COLOR_0.value;
    const colors = new Uint8Array(count * 4);
    let hasRealColor = false;
    if (colorAttr) {
      const size = data.attributes.COLOR_0.size || 4;
      let maxRGB = 0;
      for (let i = 0; i < count; i++) {
        const r = colorAttr[i * size];
        const g = colorAttr[i * size + 1];
        const b = colorAttr[i * size + 2];
        if (r > maxRGB) maxRGB = r;
        if (g > maxRGB) maxRGB = g;
        if (b > maxRGB) maxRGB = b;
      }
      hasRealColor = maxRGB > 0;
    }
    if (hasRealColor) {
      const size = data.attributes.COLOR_0.size || 4;
      for (let i = 0; i < count; i++) {
        colors[i * 4] = colorAttr[i * size];
        colors[i * 4 + 1] = colorAttr[i * size + 1];
        colors[i * 4 + 2] = colorAttr[i * size + 2];
        colors[i * 4 + 3] = 255;
      }
    } else {
      for (let i = 0; i < count; i++) {
        const t = Math.max(0, Math.min(1, (positions[i * 3 + 2] + extent) / (2 * extent)));
        const [r, g, b] = hslToRgb((1 - t) * 0.66, 0.8, 0.5);
        colors[i * 4] = Math.round(r * 255);
        colors[i * 4 + 1] = Math.round(g * 255);
        colors[i * 4 + 2] = Math.round(b * 255);
        colors[i * 4 + 3] = 255;
      }
    }
    const mesh = new pc.Mesh(app.graphicsDevice);
    mesh.setPositions(positions);
    mesh.setColors32(colors);
    mesh.update(pc.PRIMITIVE_POINTS, true);
    const material = createPointCloudMaterial(pc, pointSizePx);
    outMaterials.push(material);
    const meshInstance = new pc.MeshInstance(mesh, material);
    const entity = new pc.Entity("las-" + fileIndex);
    entity.setLocalRotation(...AXIS_FIX_ROTATION);
    entity.addComponent("render", { meshInstances: [meshInstance] });
    app.root.addChild(entity);
  }
}
const DEFAULT_CAMERA_SETTINGS = {
  fov: 45,
  nearClip: 0.05,
  farClip: 5e3,
  projection: "perspective",
  orbitSensitivity: 1,
  zoomSpeed: 1,
  moveSpeed: 5,
  pointSizePx: 2,
  edlEnabled: false
};
const STORAGE_KEY = "gisdata.tourViewer.cameraSettings.v1";
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CAMERA_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CAMERA_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_CAMERA_SETTINGS };
  }
}
const cameraSettings = loadFromStorage();
const listeners = [];
function onCameraSettingsChange(listener) {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i !== -1) listeners.splice(i, 1);
  };
}
function setCameraSettings(partial) {
  Object.assign(cameraSettings, partial);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cameraSettings));
  } catch (e) {
  }
  for (const listener of listeners) listener(cameraSettings);
  return cameraSettings;
}
function getCameraSettings() {
  return cameraSettings;
}
function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s ?? "";
  return div.innerHTML;
}
function showViewerError(message) {
  hideViewerError();
  const body = document.querySelector("#tourViewerModal .modal-body");
  if (!body) return;
  const overlay = document.createElement("div");
  overlay.id = "tourViewerError";
  overlay.className = "position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3";
  overlay.style.zIndex = "2000";
  overlay.style.background = "rgba(0,0,0,.6)";
  overlay.innerHTML = '<div class="alert alert-danger mb-0" style="max-width: 600px;">' + escapeHtml(message) + "</div>";
  body.appendChild(overlay);
}
function hideViewerError() {
  const existing = document.getElementById("tourViewerError");
  if (existing) existing.remove();
}
let currentApp = null;
let generation = 0;
function disposeTourViewer() {
  if (!currentApp) return;
  const entry = currentApp;
  currentApp = null;
  try {
    entry.unsubscribeSettings();
    entry.resizeObserver.disconnect();
    entry.app.destroy();
  } catch (e) {
  }
}
function recenterTourCamera() {
  if (!currentApp) return;
  currentApp.recenter();
}
async function loadTourScene(urls, modelType) {
  hideViewerError();
  generation++;
  const myGeneration = generation;
  const isCurrent = () => myGeneration === generation;
  disposeTourViewer();
  const container = document.getElementById("tourViewerContainer");
  if (!container) return;
  container.innerHTML = "";
  container.style.position = "relative";
  const canvas = document.createElement("canvas");
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.display = "block";
  container.appendChild(canvas);
  const progressWrap = document.createElement("div");
  progressWrap.className = "position-absolute top-50 start-50 translate-middle p-3 rounded text-center";
  progressWrap.style.zIndex = "1050";
  progressWrap.style.background = "rgba(0,0,0,.75)";
  progressWrap.style.color = "#fff";
  progressWrap.style.width = "280px";
  progressWrap.innerHTML = '<div class="mb-2" id="tourPcProgressLabel">Загрузка...</div><div class="progress" style="height:8px;"><div class="progress-bar" id="tourPcProgressBar" style="width:0%"></div></div>';
  container.appendChild(progressWrap);
  function showProgress(text, pct) {
    if (!progressWrap.isConnected) return;
    progressWrap.querySelector("#tourPcProgressLabel").textContent = text;
    progressWrap.querySelector("#tourPcProgressBar").style.width = Math.max(0, Math.min(100, pct)) + "%";
  }
  function hideProgress() {
    progressWrap.remove();
  }
  try {
    let resizeCanvasToContainer = function() {
      app.resizeCanvas(container.clientWidth || 300, container.clientHeight || 300);
    }, applyCameraSettings = function(settings) {
      const camComp = camera.camera;
      camComp.fov = settings.fov;
      camComp.nearClip = settings.nearClip;
      camComp.farClip = settings.farClip;
      camComp.projection = settings.projection === "orthographic" ? pc.PROJECTION_ORTHOGRAPHIC : pc.PROJECTION_PERSPECTIVE;
      for (const material of lasMaterials) {
        material.setParameter("uPointSize", settings.pointSizePx);
        material.update();
      }
      updateCameraTransform();
    }, updateCameraTransform = function() {
      const yawQ = new pc.Quat().setFromEulerAngles(0, yaw, 0);
      const pitchQ = new pc.Quat().setFromEulerAngles(pitch, 0, 0);
      const rot = yawQ.clone().mul(pitchQ);
      const offset = rot.transformVector(new pc.Vec3(0, 0, distance));
      camera.setPosition(target.x + offset.x, target.y + offset.y, target.z + offset.z);
      camera.lookAt(target);
      camera.camera.orthoHeight = distance * 0.5;
      gizmo.updateTransform(yaw, pitch);
    };
    const pc = await import("playcanvas");
    if (!isCurrent()) {
      hideProgress();
      return;
    }
    const app = new pc.Application(canvas, { graphicsDeviceOptions: { antialias: true } });
    app.setCanvasFillMode(pc.FILLMODE_NONE);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    resizeCanvasToContainer();
    const resizeObserver = new ResizeObserver(resizeCanvasToContainer);
    resizeObserver.observe(container);
    const worldLayer = app.scene.layers.getLayerByName("World");
    const camera = new pc.Entity("camera");
    camera.addComponent("camera", {
      clearColor: new pc.Color(0.11, 0.12, 0.15),
      layers: [
        worldLayer.id,
        app.scene.layers.getLayerByName("Skybox").id,
        app.scene.layers.getLayerByName("Immediate").id,
        app.scene.layers.getLayerByName("UI").id
      ],
      priority: 0
    });
    app.root.addChild(camera);
    const lasMaterials = [];
    const target = new pc.Vec3(0, 0, 0);
    let distance = 5;
    let yaw = 45;
    let pitch = -20;
    const gizmo = createNavCubeGizmo(pc, app);
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    canvas.addEventListener("pointerdown", (e) => {
      const hit = gizmo.handlePointerDown(e, canvas);
      if (hit) {
        yaw = hit.yaw;
        pitch = hit.pitch;
        updateCameraTransform();
        return;
      }
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener("pointerup", () => {
      dragging = false;
    });
    window.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const k = 0.3 * cameraSettings.orbitSensitivity;
      yaw -= (e.clientX - lastX) * k;
      pitch = Math.max(-89, Math.min(89, pitch - (e.clientY - lastY) * k));
      lastX = e.clientX;
      lastY = e.clientY;
      updateCameraTransform();
    });
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        distance = Math.max(0.05, distance * (1 + e.deltaY * 1e-3 * cameraSettings.zoomSpeed));
        updateCameraTransform();
      },
      { passive: false }
    );
    applyCameraSettings(cameraSettings);
    const unsubscribeSettings = onCameraSettingsChange(applyCameraSettings);
    app.start();
    currentApp = { app, resizeObserver, recenter: updateCameraTransform, unsubscribeSettings };
    if (modelType === "pointcloud") {
      await loadLasFiles(
        pc,
        app,
        urls,
        target,
        (d) => {
          distance = d;
        },
        updateCameraTransform,
        isCurrent,
        showProgress,
        cameraSettings.pointSizePx,
        lasMaterials
      );
    } else {
      await loadSplatFiles(
        pc,
        app,
        urls,
        target,
        (d) => {
          distance = d;
        },
        updateCameraTransform,
        isCurrent,
        showProgress
      );
    }
    if (isCurrent()) {
      updateCameraTransform();
    }
    hideProgress();
  } catch (e) {
    hideProgress();
    showViewerError("Не удалось загрузить просмотрщик: " + String(e));
  }
}
const api = {
  load: loadTourScene,
  dispose: disposeTourViewer,
  recenter: recenterTourCamera,
  showError: showViewerError,
  hideError: hideViewerError,
  getSettings: getCameraSettings,
  setSettings: setCameraSettings
};
window.TourViewer = api;
