/**
 * Пульт администратора: список сеансов, живая картинка и перехват
 * управления. Сюда не приходит ни одного объекта из CAD-приложения —
 * только то, что агент прочитал из DOM и снял с канвы.
 */
(() => {
  'use strict';
  // gisdata integration: served behind an Apache reverse proxy at
  // /ctfadmin/ (see httpd-ssl.conf), so every server-relative reference
  // below needs this prefix — absolute root paths would resolve against
  // the gisdata site root instead.
  const BASE = '/ctfadmin';
  const $ = (id) => document.getElementById(id);
  const state = { pass: localStorage.getItem('ctfadmin.pass') || 'admin', admin: localStorage.getItem('ctfadmin.admin') || 'админ', sel: null, sessions: [], es: null, watching: false, controlling: false };

  $('pass').value = state.pass;
  $('admin-name').value = state.admin;

  /** Пароль уходит в куку через /api/login и больше в адресах не светится
   *  — на сервере, смотрящем в интернет, ссылка с паролем осела бы в логах
   *  прокси и в истории браузера. */
  const api = (path, body) =>
    fetch(BASE + path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null);

  // ─────────────────────────────────────────────────────────── поток ──

  async function connect() {
    state.pass = $('pass').value || 'admin';
    state.admin = $('admin-name').value || 'админ';
    localStorage.setItem('ctfadmin.pass', state.pass);
    localStorage.setItem('ctfadmin.admin', state.admin);
    // Меняем пароль на куку — дальше все запросы идут без него в адресе.
    await fetch(BASE + '/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pass: state.pass }),
    }).catch(() => null);
    state.es?.close();
    const es = new EventSource(BASE + '/api/stream');
    state.es = es;
    es.onopen = () => setConn(true);
    es.onerror = () => setConn(false);
    es.addEventListener('sessions', (e) => {
      state.sessions = JSON.parse(e.data);
      renderSessions();
      renderState();
    });
    es.addEventListener('frame', (e) => {
      const d = JSON.parse(e.data);
      const thumb = document.querySelector(`.card[data-id="${d.id}"] img`);
      if (thumb) thumb.src = d.frame;
      if (state.sel === d.id) $('frame').src = d.frame;
    });
    es.addEventListener('event', (e) => addEvent(JSON.parse(e.data)));
  }

  function setConn(on) {
    $('conn').dataset.on = String(on);
    $('conn').textContent = on ? 'связь есть' : 'нет связи';
  }

  // ───────────────────────────────────────────────────────── отрисовка ──

  const fmtAgo = (t) => {
    const s = Math.max(0, Math.round((Date.now() - t) / 1000));
    return s < 60 ? `${s} с` : `${Math.round(s / 60)} мин`;
  };

  function renderSessions() {
    const host = $('sessions');
    host.innerHTML = '';
    if (!state.sessions.length) {
      const empty = document.createElement('div');
      empty.className = 'step';
      empty.style.color = 'var(--faint)';
      empty.textContent = 'Никто не работает. Пользователи заходят через главную страницу сервера.';
      host.appendChild(empty);
    }
    for (const s of state.sessions) {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.id = s.id;
      card.dataset.online = String(s.online);
      card.dataset.ctl = String(s.controlled);
      card.dataset.sel = String(state.sel === s.id);
      const img = document.createElement('img');
      img.alt = '';
      const info = document.createElement('div');
      info.innerHTML = `
        <div class="who"><span class="dot"></span>${escape(s.user)}</div>
        <div class="meta">${{ topo: 'TOPO', 'facade-foto': 'FOTO' }[s.app] || 'FACADE'} · ${escape(s.state?.tool || '—')} · ${s.online ? 'в сети' : 'нет ' + fmtAgo(s.last)}</div>
        <div class="step">${escape(s.state?.step || '')}</div>`;
      card.append(img, info);
      card.addEventListener('click', () => select(s.id));
      host.appendChild(card);
    }
  }

  function renderState() {
    const s = state.sessions.find((x) => x.id === state.sel);
    $('btn-watch').disabled = !s;
    $('btn-take').disabled = !s;
    $('btn-watch').dataset.on = String(Boolean(s?.watched));
    $('btn-take').dataset.on = String(Boolean(s?.controlled));
    $('btn-watch').textContent = s?.watched ? 'Смотрю' : 'Смотреть';
    $('btn-take').textContent = s?.controlled ? 'Вернуть управление' : 'Перехватить управление';
    $('stage').dataset.ctl = String(Boolean(s?.controlled));
    $('stage-hint').style.display = s?.watched ? 'none' : '';
    state.watching = Boolean(s?.watched);
    state.controlling = Boolean(s?.controlled);
    $('view-title').textContent = s ? `${s.user} · ${s.app === 'topo' ? 'TOPO·CAD' : 'FACADE·CAD'}` : 'Выберите сеанс';
    const st = s?.state || {};
    $('state').innerHTML = s
      ? `<span>шаг: <b>${escape(st.step || '—')}</b></span><span>инструмент: <b>${escape(st.tool || '—')}</b></span>
         <span>ПСК: <b>${escape(st.ucs || '—')}</b></span><span>слой: <b>${escape(st.layer || '—')}</b></span>
         <span>объектов: <b>${st.objects ?? 0}</b></span><span>${escape(st.coords || '')}</span>
         <span>FPS <b>${escape(st.fps || '—')}</b> · PTS <b>${escape(st.pts || '—')}</b></span>
         <span>в работе: <b>${fmtAgo(s.since)}</b></span>`
      : '';
  }

  function addEvent(ev) {
    const host = $('events');
    const row = document.createElement('div');
    const time = new Date(ev.t || Date.now()).toLocaleTimeString('ru-RU');
    row.innerHTML = `<i>${time}</i> <b>${escape(ev.user || '')}</b> ${escape(ev.kind || '')} — ${escape(String(ev.info || '')).slice(0, 90)}`;
    host.prepend(row);
    while (host.childElementCount > 200) host.lastElementChild.remove();
  }

  const escape = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);

  function select(id) {
    state.sel = id;
    $('frame').src = '';
    renderSessions();
    renderState();
  }

  // ──────────────────────────────────────────────── смотреть / перехват ──

  $('btn-watch').addEventListener('click', async () => {
    const s = state.sessions.find((x) => x.id === state.sel);
    if (!s) return;
    await api('/api/watch', { id: s.id, on: !s.watched });
  });

  $('btn-take').addEventListener('click', async () => {
    const s = state.sessions.find((x) => x.id === state.sel);
    if (!s) return;
    await api('/api/takeover', { id: s.id, on: !s.controlled, admin: state.admin });
    if (!s.controlled) $('stage').focus();
  });

  // ───────────────────────────────────────────── ввод в чужой сеанс ──

  const stage = $('stage');
  const img = $('frame');

  /** Экран пользователя показан «вписанным» в рамку: пересчитываем клик в
   *  долю от его окна, чтобы разрешения не совпадали безболезненно. */
  function norm(e) {
    const r = img.getBoundingClientRect();
    const iw = img.naturalWidth || 16;
    const ih = img.naturalHeight || 9;
    const scale = Math.min(r.width / iw, r.height / ih);
    const w = iw * scale;
    const h = ih * scale;
    const x0 = r.left + (r.width - w) / 2;
    const y0 = r.top + (r.height - h) / 2;
    return { x: Math.min(1, Math.max(0, (e.clientX - x0) / w)), y: Math.min(1, Math.max(0, (e.clientY - y0) / h)) };
  }

  const sendInput = (input) => {
    if (!state.controlling || !state.sel) return;
    api('/api/input', { id: state.sel, input });
  };

  let lastMove = 0;
  stage.addEventListener('pointermove', (e) => {
    if (!state.controlling) return;
    const t = performance.now();
    if (t - lastMove < 33) return; // ~30 к/с хватает и не топит канал
    lastMove = t;
    sendInput(Object.assign({ type: 'move', buttons: e.buttons }, norm(e)));
  });
  stage.addEventListener('pointerdown', (e) => {
    if (!state.controlling) return;
    e.preventDefault();
    stage.focus();
    sendInput(Object.assign({ type: 'down', button: e.button, buttons: e.buttons }, norm(e)));
  });
  stage.addEventListener('pointerup', (e) => {
    if (!state.controlling) return;
    sendInput(Object.assign({ type: 'up', button: e.button, buttons: e.buttons }, norm(e)));
  });
  stage.addEventListener('contextmenu', (e) => {
    if (!state.controlling) return;
    e.preventDefault();
    sendInput(Object.assign({ type: 'context' }, norm(e)));
  });
  stage.addEventListener(
    'wheel',
    (e) => {
      if (!state.controlling) return;
      e.preventDefault();
      sendInput(Object.assign({ type: 'wheel', deltaY: e.deltaY }, norm(e)));
    },
    { passive: false },
  );
  stage.addEventListener('keydown', (e) => {
    if (!state.controlling) return;
    e.preventDefault();
    sendInput({ type: 'key', key: e.key, code: e.code, ctrl: e.ctrlKey, shift: e.shiftKey, alt: e.altKey });
  });

  $('reconnect').addEventListener('click', connect);
  setInterval(renderState, 1000); // «в работе N мин» должен идти сам
  connect();
})();
