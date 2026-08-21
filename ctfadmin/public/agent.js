/**
 * Агент надзора — вставляется сервером в <head> собранного CAD-приложения.
 *
 * Всё, что он умеет, он умеет СНАРУЖИ: приложение о нём не знает и не
 * содержит ни строчки под него.
 *   • состояние — читается из DOM (у панелей уже есть стабильные id);
 *   • картинка — снимается с <canvas id="gl">;
 *   • перехват управления — синтетические PointerEvent/WheelEvent/
 *     KeyboardEvent в те же элементы, что слушает приложение.
 *
 * Честность по умолчанию: пользователь всегда видит плашку «сеанс под
 * наблюдением», при перехвате — кто именно управляет, и может забрать
 * управление обратно одной кнопкой.
 */
(() => {
  'use strict';
  // Одна вкладка — один сеанс, что бы ни случилось с порядком загрузки.
  if (window.__ctfAgent) return;
  window.__ctfAgent = true;
  const APP = document.currentScript?.dataset?.app || 'facade';
  // gisdata integration: FACADE·CAD/TOPO·CAD are served by Apache
  // (location.origin), not by this server directly — data-server carries
  // the reverse-proxy mount path (/ctfadmin, see httpd-ssl.conf) so every
  // API/SSE call below still lands on this Node process. Falls back to
  // location.origin for CtFAdmin's own dev-mode app serving (unchanged).
  const ORIGIN = document.currentScript?.dataset?.server || location.origin;
  // Which <canvas> the live-screen/takeover feature watches — FACADE·CAD
  // and TOPO·CAD share one WebGL canvas (id="gl"), FACADE·FOTO is a plain
  // 2D-canvas tool with three panes (drawing/photo/result) — the result
  // pane (cvR, the actual rectified overlay) is the one worth watching.
  const CANVAS_ID = { 'facade-foto': 'cvR' }[APP] || 'gl';
  const SYNTH_ID = 9001; // pointerId наших событий

  // ── 1. ДО старта приложения: сохранять кадр в буфере, иначе с WebGL
  //    нечего будет снять (буфер очищается после каждого кадра).
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === 'webgl2' || type === 'webgl' || type === 'experimental-webgl') {
      attrs = Object.assign({}, attrs, { preserveDrawingBuffer: true });
    }
    return getContext.call(this, type, attrs);
  };

  // Захват указателя с синтетическим id бросает исключение — гасим его,
  // чтобы панорама средней кнопкой работала и под управлением админа.
  const setCap = Element.prototype.setPointerCapture;
  const relCap = Element.prototype.releasePointerCapture;
  Element.prototype.setPointerCapture = function (id) {
    if (id === SYNTH_ID) return;
    try {
      return setCap.call(this, id);
    } catch {
      /* ignore */
    }
  };
  Element.prototype.releasePointerCapture = function (id) {
    if (id === SYNTH_ID) return;
    try {
      return relCap.call(this, id);
    } catch {
      /* ignore */
    }
  };

  // ─────────────────────────────────────────────────────── имя и сеанс ──

  const params = new URLSearchParams(location.search);
  let user = params.get('u') || localStorage.getItem('ctfadmin.user') || '';
  if (!user) user = (window.prompt('Ваше имя для журнала работ:', '') || 'без имени').trim();
  localStorage.setItem('ctfadmin.user', user);

  let sid = null;
  let watched = false;
  let controlled = false;
  /** Открыт ли хоть один пульт. Пока нет — превью не отправляем вовсе. */
  let adminsOnline = false;

  /** keepalive живёт только для «прощания» на выгрузке страницы: он режет
   *  тело на 64 КБ, а кадр экрана заметно больше и молча не уходит. */
  const post = (path, body, keepalive = false) =>
    fetch(ORIGIN + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive,
    }).catch(() => null);

  // ────────────────────────────────────────────────── чтение состояния ──

  const text = (sel) => document.querySelector(sel)?.textContent?.trim() || '';

  /** FACADE·FOTO has no tool ribbon/layers/UCS at all — a control-point
   *  homography fit instead. Reuse the same state shape (admin.js's
   *  renderState renders it generically) with the fields that actually
   *  mean something here: control-point count as both `pts` and `objects`,
   *  fit accuracy (RMS) as `step`, overlay display mode as `tool`, loaded
   *  drawing/photo file names as `pane`/`pane2`. */
  function readStateFacadeFoto() {
    const nPts = text('#nPts');
    return {
      app: APP,
      title: document.title,
      step: `точек: ${nPts || 0} · СКО невязки: ${text('#rms') || '—'}`,
      tool: document.querySelector('#mode')?.selectedOptions?.[0]?.textContent?.trim() || '—',
      pane: text('#nameT'),
      pane2: text('#nameS'),
      ucs: '',
      layer: '',
      coords: '',
      fps: '',
      pts: nPts,
      objects: Number(nPts) || 0,
      start: false,
    };
  }

  function readState() {
    if (APP === 'facade-foto') return readStateFacadeFoto();
    const activeBtn = document.querySelector('[data-tool][data-active="true"]');
    let objects = 0;
    for (const c of document.querySelectorAll('.lr-count')) objects += Number(c.textContent) || 0;
    return {
      app: APP,
      title: document.title,
      step: text('#hint').slice(0, 160),
      tool: activeBtn?.querySelector('span')?.textContent?.trim() || '—',
      pane: text('#lbl-main'),
      pane2: text('#lbl-profile') || text('#lbl-section'),
      ucs: document.querySelector('#ucs-select')?.value || '',
      layer: document.querySelector('#layer-select')?.value || '',
      coords: text('#coords'),
      fps: text('#fps'),
      pts: text('#pts'),
      objects,
      start: !document.getElementById('start-overlay')?.classList.contains('hidden'),
    };
  }

  // ───────────────────────────────────────────────────────────── кадры ──

  const scratch = document.createElement('canvas');
  const sctx = scratch.getContext('2d');

  function grabFrame(maxW) {
    const gl = document.getElementById(CANVAS_ID);
    if (!gl || !gl.width) return null;
    const k = Math.min(1, maxW / gl.width);
    scratch.width = Math.max(2, Math.round(gl.width * k));
    scratch.height = Math.max(2, Math.round(gl.height * k));
    try {
      sctx.drawImage(gl, 0, 0, scratch.width, scratch.height);
      return scratch.toDataURL('image/jpeg', watched ? 0.55 : 0.4);
    } catch {
      return null;
    }
  }

  // ─────────────────────────────────────────────────── плашки и баннер ──

  const style = document.createElement('style');
  style.textContent = `
    .ctfa-chip{position:fixed;z-index:2147483000;right:8px;bottom:8px;display:flex;align-items:center;gap:6px;
      padding:3px 9px;border-radius:999px;font:600 9px/1.4 "Segoe UI",system-ui,sans-serif;letter-spacing:.14em;
      text-transform:uppercase;color:#cbd5e1;background:rgba(12,14,17,.78);border:1px solid rgba(255,255,255,.14);
      backdrop-filter:blur(8px);pointer-events:none}
    .ctfa-chip i{width:6px;height:6px;border-radius:50%;background:#64748b;box-shadow:0 0 8px currentColor}
    .ctfa-chip[data-live="true"] i{background:#38bdf8}
    .ctfa-chip[data-ctl="true"]{color:#fff;border-color:rgba(255,80,120,.7);background:rgba(120,10,40,.7)}
    .ctfa-chip[data-ctl="true"] i{background:#ff3d71}
    .ctfa-bar{position:fixed;z-index:2147483001;left:50%;top:0;transform:translateX(-50%);display:flex;align-items:center;gap:12px;
      padding:7px 14px;border-radius:0 0 12px 12px;font:600 12px/1.2 "Segoe UI",system-ui,sans-serif;color:#fff;
      background:linear-gradient(180deg,rgba(200,20,70,.95),rgba(150,10,50,.92));box-shadow:0 6px 24px rgba(0,0,0,.5)}
    .ctfa-bar button{cursor:pointer;border-radius:8px;border:1px solid rgba(255,255,255,.5);background:rgba(255,255,255,.14);
      color:#fff;padding:3px 10px;font:600 11px "Segoe UI",system-ui,sans-serif}
    .ctfa-block{position:fixed;inset:0;z-index:2147482999;cursor:not-allowed;background:transparent}
  `;
  document.documentElement.appendChild(style);

  const chip = document.createElement('div');
  chip.className = 'ctfa-chip';
  chip.innerHTML = '<i></i><span>под наблюдением</span>';
  let bar = null;
  let blocker = null;

  function paintChip() {
    chip.dataset.live = String(watched);
    chip.dataset.ctl = String(controlled);
    chip.querySelector('span').textContent = controlled ? 'управляет админ' : watched ? 'админ смотрит' : 'под наблюдением';
  }

  function setControlled(on, admin) {
    controlled = on;
    if (on) {
      if (!bar) {
        bar = document.createElement('div');
        bar.className = 'ctfa-bar';
        bar.innerHTML = `<span>Управление у администратора${admin ? ' · ' + admin : ''}</span>`;
        const btn = document.createElement('button');
        btn.textContent = 'Вернуть управление';
        btn.addEventListener('click', () => {
          // Пользователь всегда может забрать сеанс обратно.
          post('/api/release', { id: sid });
          setControlled(false);
        });
        bar.appendChild(btn);
        document.body.appendChild(bar);
      }
      if (!blocker) {
        // Гасим ЖИВОЙ ввод, чтобы двое не тянули мышь одновременно.
        blocker = document.createElement('div');
        blocker.className = 'ctfa-block';
        document.body.appendChild(blocker);
      }
    } else {
      bar?.remove();
      blocker?.remove();
      bar = null;
      blocker = null;
    }
    paintChip();
  }

  // ────────────────────────────────────────────── воспроизведение ввода ──

  function targetAt(x, y) {
    // Блокировщик перекрывает всё — на миг убираем его из попаданий.
    const prev = blocker ? blocker.style.pointerEvents : null;
    if (blocker) blocker.style.pointerEvents = 'none';
    const el = document.elementFromPoint(x, y) || document.getElementById(CANVAS_ID);
    if (blocker) blocker.style.pointerEvents = prev;
    return el;
  }

  function applyInput(inp) {
    if (!controlled || !inp) return;
    const x = Math.round((inp.x ?? 0.5) * window.innerWidth);
    const y = Math.round((inp.y ?? 0.5) * window.innerHeight);
    const base = { clientX: x, clientY: y, bubbles: true, cancelable: true, composed: true, view: window };
    const ptr = Object.assign({}, base, { pointerId: SYNTH_ID, pointerType: 'mouse', isPrimary: true, button: inp.button ?? 0, buttons: inp.buttons ?? 0 });
    const el = targetAt(x, y);
    if (!el) return;
    switch (inp.type) {
      case 'move':
        el.dispatchEvent(new PointerEvent('pointermove', ptr));
        break;
      case 'down':
        el.dispatchEvent(new PointerEvent('pointerdown', ptr));
        break;
      case 'up':
        el.dispatchEvent(new PointerEvent('pointerup', ptr));
        break;
      case 'click':
        el.dispatchEvent(new PointerEvent('pointerdown', Object.assign({}, ptr, { buttons: 1 })));
        el.dispatchEvent(new PointerEvent('pointerup', ptr));
        el.dispatchEvent(new MouseEvent('click', base));
        break;
      case 'context':
        el.dispatchEvent(new MouseEvent('contextmenu', Object.assign({}, base, { button: 2 })));
        break;
      case 'wheel':
        el.dispatchEvent(new WheelEvent('wheel', Object.assign({}, base, { deltaY: inp.deltaY || 0 })));
        break;
      case 'key':
        window.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: inp.key,
            code: inp.code || '',
            ctrlKey: !!inp.ctrl,
            shiftKey: !!inp.shift,
            altKey: !!inp.alt,
            bubbles: true,
            cancelable: true,
          }),
        );
        window.dispatchEvent(new KeyboardEvent('keyup', { key: inp.key, code: inp.code || '', bubbles: true }));
        break;
      default:
        break;
    }
  }

  // ─────────────────────────────────────────────────────── жизненный цикл ──

  function openControlChannel() {
    const es = new EventSource(`${ORIGIN}/api/control?id=${encodeURIComponent(sid)}`);
    es.addEventListener('hello', (e) => {
      const d = JSON.parse(e.data);
      adminsOnline = !!d.admins;
      watched = !!d.watched;
      paintChip();
    });
    es.addEventListener('admins', (e) => {
      adminsOnline = JSON.parse(e.data).on;
      if (adminsOnline) pushFrame(); // пульт открыли — сразу дать превью
    });
    es.addEventListener('watch', (e) => {
      watched = JSON.parse(e.data).on;
      paintChip();
      pushFrame();
    });
    es.addEventListener('takeover', (e) => {
      const d = JSON.parse(e.data);
      setControlled(d.on, d.admin);
      if (d.on) {
        watched = true;
        pushFrame();
      }
    });
    es.addEventListener('input', (e) => {
      try {
        applyInput(JSON.parse(e.data));
      } catch {
        /* битая команда — молча пропускаем */
      }
    });
    es.onerror = () => {
      /* EventSource переподключится сам */
    };
  }

  let framing = false;
  async function pushFrame() {
    if (framing || !sid) return;
    framing = true;
    const frame = grabFrame(watched ? 900 : 420);
    if (frame) await post('/api/frame', { id: sid, frame, w: scratch.width, h: scratch.height });
    framing = false;
  }

  async function start() {
    const r = await post('/api/hello', { user, app: APP, state: readState() });
    if (!r || !r.ok) {
      setTimeout(start, 5000);
      return;
    }
    sid = (await r.json()).id;
    document.body.appendChild(chip);
    paintChip();
    openControlChannel();

    setInterval(() => post('/api/presence', { id: sid, state: readState() }), 2500);
    // Кадры: 2–3 в секунду, когда смотрят или управляют, иначе раз в 3 с
    // на превью в списке.
    let tick = 0;
    pushFrame();
    setInterval(() => {
      tick++;
      // Пульт закрыт — не шлём ничего: на удалённом сервере это экономит
      // десятки мегабайт в час на каждом работающем.
      if (watched || controlled || (adminsOnline && tick % 8 === 0)) pushFrame();
    }, 400);

    // Заметные вехи — в журнал.
    const seen = { step: '', tool: '' };
    setInterval(() => {
      const s = readState();
      if (s.tool !== seen.tool) {
        seen.tool = s.tool;
        post('/api/event', { id: sid, kind: 'tool', info: s.tool });
      }
      if (s.step !== seen.step) {
        seen.step = s.step;
        post('/api/event', { id: sid, kind: 'hint', info: s.step });
      }
    }, 1500);

    window.addEventListener('beforeunload', () => post('/api/bye', { id: sid }, true));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
