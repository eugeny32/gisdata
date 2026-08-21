/**
 * CtF·ADMIN — надзорный сервер для FACADE·CAD и TOPO·CAD.
 *
 * ГЛАВНОЕ ПРАВИЛО: приложения не знают о нём ничего. Сервер раздаёт их
 * СОБРАННЫЕ файлы (../dist и ../CtFT/dist) и на лету вставляет в index.html
 * один тег <script src="/_agent.js">. Ни строки в коде CAD-приложений не
 * меняется — вся телеметрия, живой экран и перехват управления живут в
 * агенте, который работает снаружи, через DOM и события.
 *
 * Зависимостей нет вообще: только стандартная библиотека Node.
 *   агент → сервер: обычные POST (присутствие, кадры, события);
 *   сервер → агент/админ: SSE (text/event-stream) — держит соединение,
 *   переживает прокси и не требует WebSocket-рукопожатия.
 *
 * Запуск:  node server.mjs            (порт 8080, пароль admin)
 *          PORT=9000 ADMIN_PASS=xxx node server.mjs
 */
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
/** Общий пароль на вход. Пусто = свободный вход (так и надо в локальной
 *  сети). Заполнен — сервер закрыт, и это ОБЯЗАТЕЛЬНО, если он смотрит в
 *  интернет: иначе работать и подглядывать сможет любой, кто знает адрес. */
const ACCESS_PASS = process.env.ACCESS_PASS || '';
const LOG_DIR = path.join(HERE, 'log');

const tokenFor = (s) => crypto.createHash('sha256').update('ctf.' + s).digest('hex').slice(0, 32);
const ACCESS_TOKEN = ACCESS_PASS ? tokenFor(ACCESS_PASS) : '';
const ADMIN_TOKEN = tokenFor(ADMIN_PASS);

function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

/** Пускать ли вообще на сервер. */
const hasAccess = (req) => !ACCESS_PASS || cookies(req).ctf_access === ACCESS_TOKEN;

/** Куда смонтированы собранные приложения.
 *
 *  Две раскладки, одна и та же программа:
 *    • ПАКЕТ на сервере — приложения лежат рядом, в ./apps/<имя>;
 *    • разработка — берём свежие сборки из репозитория (../dist).
 *  Приложение, которого нет, просто не показывается на входе. */
const PACKED = fs.existsSync(path.join(HERE, 'apps'));

function appRoot(name, ...devPath) {
  // В пакете решает только папка apps: чего там нет — то не установлено.
  return PACKED ? path.join(HERE, 'apps', name) : path.resolve(HERE, ...devPath);
}

const APPS = {
  facade: { title: 'FACADE·CAD — фасады', root: appRoot('facade', '..', 'dist') },
  topo: { title: 'TOPO·CAD — топография', root: appRoot('topo', '..', 'CtFT', 'dist') },
};

const appReady = (key) => fs.existsSync(path.join(APPS[key].root, 'index.html'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

// ─────────────────────────────────────────────────────────── состояние ──

/** id → сеанс пользователя. Живёт в памяти: 3–5 человек, перезапуск сервера
 *  просто заставит агентов представиться заново. */
const sessions = new Map();
/** Открытые SSE-каналы админов. */
const admins = new Set();
let nextId = 1;

const now = () => Date.now();

function publicSession(s) {
  return {
    id: s.id,
    user: s.user,
    app: s.app,
    since: s.since,
    last: s.last,
    online: now() - s.last < 12_000,
    watched: s.watched,
    controlled: s.controlled,
    state: s.state,
    hasFrame: Boolean(s.frame),
  };
}

function broadcastAdmins(type, data) {
  const chunk = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of admins) {
    try {
      res.write(chunk);
    } catch {
      admins.delete(res);
    }
  }
}

/** Пока пульт закрыт, превью никому не нужны — и агенты их не шлют.
 *  На локальной сети это мелочь, на удалённом сервере — разница между
 *  «тихо» и десятками мегабайт в час на каждого работающего. */
let adminsOnline = false;
function syncAdminsOnline() {
  const now = admins.size > 0;
  if (now === adminsOnline) return;
  adminsOnline = now;
  for (const s of sessions.values()) sendToAgent(s, 'admins', { on: adminsOnline });
}

function pushSessions() {
  broadcastAdmins('sessions', [...sessions.values()].map(publicSession));
}

/** Команда конкретному агенту (смотрим / перехватываем / ввод). */
function sendToAgent(session, type, data) {
  if (!session?.control) return false;
  try {
    session.control.write(`event: ${type}\ndata: ${JSON.stringify(data ?? {})}\n\n`);
    return true;
  } catch {
    session.control = null;
    return false;
  }
}

/** Журнал: одна строка JSON на событие, файл на сутки. Нужен для разбора
 *  «кто что делал», когда никто не смотрел вживую. */
function logEvent(kind, session, extra) {
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const line = JSON.stringify({ t: new Date().toISOString(), kind, id: session?.id, user: session?.user, app: session?.app, ...extra });
    fs.appendFile(path.join(LOG_DIR, `${day}.jsonl`), line + '\n', () => {});
  } catch {
    /* журнал не критичен — надзор важнее */
  }
}

// ───────────────────────────────────────────────────────────── помощь ──

function send(res, code, body, type = 'application/json; charset=utf-8') {
  res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

function readJson(req, limitMb = 12) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const parts = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limitMb * 1024 * 1024) {
        reject(new Error('too big'));
        req.destroy();
        return;
      }
      parts.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(parts).toString('utf8') || '{}'));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function openSse(req, res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-store',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });
  res.write(': ok\n\n');
  req.socket.setNoDelay(true);
  req.socket.setTimeout(0);
}

/** Пароль пульта: из ссылки (удобно в локальной сети) или из куки, которую
 *  ставит форма входа (в интернете пароль в адресе оставлять нельзя — он
 *  оседает в логах прокси и в истории браузера). */
function adminOk(req, url) {
  return url.searchParams.get('pass') === ADMIN_PASS || cookies(req).ctf_admin === ADMIN_TOKEN;
}

function setCookie(res, name, value, days = 30) {
  res.setHeader('set-cookie', `${name}=${value}; Path=/; Max-Age=${days * 86400}; HttpOnly; SameSite=Lax`);
}

// ──────────────────────────────────────────────────────────── статика ──

/** Отдаём файл приложения; в index.html вставляем агент.
 *  Именно здесь проходит граница «мы не трогаем их код»: файл на диске
 *  остаётся нетронутым, тег добавляется в поток ответа. */
function serveApp(appKey, rest, res) {
  const app = APPS[appKey];
  if (!app) return send(res, 404, 'no such app', 'text/plain');
  const rel = rest === '' || rest === '/' ? 'index.html' : decodeURIComponent(rest.replace(/^\//, ''));
  const file = path.resolve(app.root, rel);
  if (!file.startsWith(app.root)) return send(res, 403, 'nope', 'text/plain');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return send(res, 404, `не найдено: ${rel}. Соберите приложение: npx vite build`, 'text/plain; charset=utf-8');
  }
  const ext = path.extname(file).toLowerCase();
  if (ext === '.html') {
    const html = fs
      .readFileSync(file, 'utf8')
      .replace(/<head([^>]*)>/i, `<head$1>\n    <script src="/_agent.js" data-app="${appKey}"></script>`);
    return send(res, 200, html, MIME['.html']);
  }
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-cache' });
  fs.createReadStream(file).pipe(res);
}

function servePublic(name, res) {
  const file = path.resolve(HERE, 'public', name);
  if (!file.startsWith(path.resolve(HERE, 'public')) || !fs.existsSync(file)) return send(res, 404, 'not found', 'text/plain');
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}

// ─────────────────────────────────────────────────────────────── роуты ──

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  try {
    // --- вход (когда сервер закрыт паролем) ----------------------------
    if (p === '/login') return servePublic('login.html', res);
    if (p === '/landing.css') return servePublic('landing.css', res); // нужен странице входа
    if (p === '/api/login' && req.method === 'POST') {
      const body = await readJson(req);
      const pass = String(body.pass || '');
      if (ACCESS_PASS && pass === ACCESS_PASS) {
        setCookie(res, 'ctf_access', ACCESS_TOKEN);
        return send(res, 200, JSON.stringify({ ok: true, admin: false }));
      }
      if (pass === ADMIN_PASS) {
        // Пароль администратора открывает и сервер, и пульт.
        res.setHeader('set-cookie', [
          `ctf_admin=${ADMIN_TOKEN}; Path=/; Max-Age=${30 * 86400}; HttpOnly; SameSite=Lax`,
          `ctf_access=${ACCESS_TOKEN || tokenFor('open')}; Path=/; Max-Age=${30 * 86400}; HttpOnly; SameSite=Lax`,
        ]);
        return send(res, 200, JSON.stringify({ ok: true, admin: true }));
      }
      return send(res, 401, JSON.stringify({ ok: false }));
    }

    // Всё остальное — только для тех, кто вошёл (если вход включён).
    if (!hasAccess(req)) {
      if (p.startsWith('/api/')) return send(res, 401, JSON.stringify({ error: 'login' }));
      res.writeHead(302, { location: '/login', 'cache-control': 'no-store' });
      return res.end();
    }

    // --- агент и админка (статика самой админки) -----------------------
    if (p === '/_agent.js') return servePublic('agent.js', res);
    if (p === '/admin' || p === '/admin/') return servePublic('admin.html', res);
    if (p === '/admin.js') return servePublic('admin.js', res);
    if (p === '/admin.css') return servePublic('admin.css', res);
    if (p === '/' ) return servePublic('index.html', res);
    if (p === '/landing.css') return servePublic('landing.css', res);
    // Вход показывает только то, что реально собрано и лежит рядом.
    if (p === '/api/apps') {
      return send(res, 200, JSON.stringify(Object.entries(APPS).map(([key, a]) => ({ key, title: a.title, ready: appReady(key) }))));
    }

    // --- API агента ----------------------------------------------------
    if (p === '/api/hello' && req.method === 'POST') {
      const body = await readJson(req);
      const s = {
        id: String(nextId++),
        user: String(body.user || 'без имени').slice(0, 40),
        app: APPS[body.app] ? body.app : 'facade',
        since: now(),
        last: now(),
        state: body.state || {},
        frame: null,
        control: null,
        watched: false,
        controlled: false,
        ua: String(req.headers['user-agent'] || '').slice(0, 120),
      };
      sessions.set(s.id, s);
      logEvent('join', s, {});
      pushSessions();
      return send(res, 200, JSON.stringify({ id: s.id }));
    }

    if (p === '/api/presence' && req.method === 'POST') {
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (!s) return send(res, 410, JSON.stringify({ gone: true }));
      s.last = now();
      const prevStep = s.state?.step;
      s.state = body.state || {};
      if (body.state?.step && body.state.step !== prevStep) logEvent('step', s, { step: body.state.step, tool: body.state.tool });
      pushSessions();
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/frame' && req.method === 'POST') {
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (!s) return send(res, 410, JSON.stringify({ gone: true }));
      s.last = now();
      s.frame = String(body.frame || '');
      broadcastAdmins('frame', { id: s.id, frame: s.frame, w: body.w, h: body.h });
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/event' && req.method === 'POST') {
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (s) {
        s.last = now();
        logEvent(String(body.kind || 'event'), s, { info: body.info });
        broadcastAdmins('event', { id: s.id, user: s.user, kind: body.kind, info: body.info, t: now() });
      }
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    // Пользователь забирает управление обратно. Пароль админа здесь НЕ
    // нужен: право прекратить чужое управление своим сеансом — за тем, кто
    // за компьютером сидит.
    if (p === '/api/release' && req.method === 'POST') {
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (s) {
        s.controlled = false;
        sendToAgent(s, 'takeover', { on: false });
        logEvent('release-by-user', s, {});
        pushSessions();
      }
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/bye' && req.method === 'POST') {
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (s) {
        logEvent('leave', s, {});
        sessions.delete(s.id);
        pushSessions();
      }
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    // Канал команд агенту (смотреть / перехватить / ввод).
    if (p === '/api/control') {
      const s = sessions.get(String(url.searchParams.get('id')));
      if (!s) return send(res, 404, 'no session', 'text/plain');
      openSse(req, res);
      s.control = res;
      sendToAgent(s, 'hello', { watched: s.watched, controlled: s.controlled, admins: adminsOnline });
      req.on('close', () => {
        if (s.control === res) s.control = null;
      });
      return;
    }

    // --- API админа ----------------------------------------------------
    if (p === '/api/stream') {
      if (!adminOk(req, url)) return send(res, 401, 'no', 'text/plain');
      openSse(req, res);
      admins.add(res);
      syncAdminsOnline();
      res.write(`event: sessions\ndata: ${JSON.stringify([...sessions.values()].map(publicSession))}\n\n`);
      for (const s of sessions.values()) {
        if (s.frame) res.write(`event: frame\ndata: ${JSON.stringify({ id: s.id, frame: s.frame })}\n\n`);
      }
      req.on('close', () => {
        admins.delete(res);
        syncAdminsOnline();
      });
      return;
    }

    if (p === '/api/watch' && req.method === 'POST') {
      if (!adminOk(req, url)) return send(res, 401, JSON.stringify({ error: 'auth' }));
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (!s) return send(res, 404, JSON.stringify({ error: 'gone' }));
      s.watched = Boolean(body.on);
      sendToAgent(s, 'watch', { on: s.watched });
      // Не заставляем админа ждать следующий кадр — отдаём последний сразу.
      if (s.watched && s.frame) broadcastAdmins('frame', { id: s.id, frame: s.frame });
      logEvent(s.watched ? 'watch-on' : 'watch-off', s, {});
      pushSessions();
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/takeover' && req.method === 'POST') {
      if (!adminOk(req, url)) return send(res, 401, JSON.stringify({ error: 'auth' }));
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (!s) return send(res, 404, JSON.stringify({ error: 'gone' }));
      s.controlled = Boolean(body.on);
      if (s.controlled) s.watched = true;
      sendToAgent(s, 'takeover', { on: s.controlled, admin: String(body.admin || 'админ').slice(0, 40) });
      logEvent(s.controlled ? 'takeover-on' : 'takeover-off', s, {});
      pushSessions();
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/input' && req.method === 'POST') {
      if (!adminOk(req, url)) return send(res, 401, JSON.stringify({ error: 'auth' }));
      const body = await readJson(req);
      const s = sessions.get(String(body.id));
      if (!s || !s.controlled) return send(res, 409, JSON.stringify({ error: 'not controlled' }));
      sendToAgent(s, 'input', body.input);
      return send(res, 200, JSON.stringify({ ok: true }));
    }

    if (p === '/api/log') {
      if (!adminOk(req, url)) return send(res, 401, 'no', 'text/plain');
      const day = url.searchParams.get('day') || new Date().toISOString().slice(0, 10);
      const file = path.join(LOG_DIR, `${day}.jsonl`);
      if (!fs.existsSync(file)) return send(res, 200, '[]');
      const rows = fs
        .readFileSync(file, 'utf8')
        .split('\n')
        .filter(Boolean)
        .slice(-500)
        .map((l) => {
          try {
            return JSON.parse(l);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      return send(res, 200, JSON.stringify(rows));
    }

    // --- приложения ----------------------------------------------------
    for (const key of Object.keys(APPS)) {
      if (p === `/${key}` || p.startsWith(`/${key}/`)) return serveApp(key, p.slice(key.length + 1), res);
    }

    send(res, 404, 'not found', 'text/plain');
  } catch (e) {
    send(res, 500, JSON.stringify({ error: String(e && e.message) }));
  }
});

// Уборка мёртвых сеансов + пинг живых SSE, чтобы прокси не рвали канал.
setInterval(() => {
  let dirty = false;
  for (const s of sessions.values()) {
    if (now() - s.last > 90_000) {
      logEvent('timeout', s, {});
      sessions.delete(s.id);
      dirty = true;
    }
  }
  for (const res of admins) {
    try {
      res.write(': ping\n\n');
    } catch {
      admins.delete(res);
    }
  }
  for (const s of sessions.values()) {
    if (s.control) {
      try {
        s.control.write(': ping\n\n');
      } catch {
        s.control = null;
      }
    }
  }
  if (dirty) pushSessions();
  else broadcastAdmins('tick', { t: now() });
}, 5000);

/** Адреса машины в локальной сети — их и раздают сотрудникам. */
function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) {
      if (i.family === 'IPv4' && !i.internal) out.push(i.address);
    }
  }
  return out;
}

// HOST=127.0.0.1 — слушать только локально: так делают за обратным
// прокси (Caddy/nginx), чтобы наружу торчал только HTTPS.
server.listen(PORT, process.env.HOST || undefined, () => {
  const line = (s) => console.log('  ' + s);
  console.log('');
  console.log('  ============================================================');
  line('CtF ADMIN — сервер запущен. Не закрывайте это окно.');
  console.log('  ============================================================');
  console.log('');
  line('ПУЛЬТ АДМИНИСТРАТОРА:');
  line(`    http://localhost:${PORT}/admin?pass=${ADMIN_PASS}`);
  console.log('');
  line('СОТРУДНИКАМ дайте один из адресов:');
  const lan = lanAddresses();
  if (lan.length) for (const ip of lan) line(`    http://${ip}:${PORT}`);
  else line(`    http://localhost:${PORT}   (сеть не найдена)`);
  console.log('');
  line('Приложения:');
  for (const [k, a] of Object.entries(APPS)) line(`    ${a.title} — ${appReady(k) ? 'готово' : 'НЕ УСТАНОВЛЕНО (папки apps/' + k + ' нет)'}`);
  console.log('');
});
