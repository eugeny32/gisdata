import { defineConfig, type Plugin } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import { execFile } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Dev-server bridge: POST /api/tocad receives an AutoCAD command script
 * and pushes it into the RUNNING AutoCAD instance via COM
 * (AutoCAD.Application → ActiveDocument.SendCommand). Windows-only.
 */
function tocadBridge(): Plugin {
  const handler = (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end();
      return;
    }
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const file = join(tmpdir(), 'topocad_tocad.txt');
      // SendCommand treats \r as Enter.
      writeFileSync(file, body.replace(/\r?\n/g, '\r') + '\r', 'utf8');
      const ps = `$ErrorActionPreference='Stop'; $s=[IO.File]::ReadAllText('${file.replace(/'/g, "''")}',[Text.Encoding]::UTF8); $acad=[Runtime.InteropServices.Marshal]::GetActiveObject('AutoCAD.Application'); $acad.ActiveDocument.SendCommand($s)`;
      execFile('powershell.exe', ['-NoProfile', '-STA', '-Command', ps], (err) => {
        res.statusCode = err ? 500 : 200;
        res.end(err ? 'AutoCAD is not running' : 'OK');
      });
    });
  };
  return {
    name: 'tocad-bridge',
    configureServer(s) {
      s.middlewares.use('/api/tocad', handler);
    },
    configurePreviewServer(s) {
      s.middlewares.use('/api/tocad', handler);
    },
  };
}

/**
 * gisdata integration: inserts the CtF·ADMIN oversight agent tag into the
 * built index.html — see the identical plugin in ../vite.config.ts for the
 * full rationale (ctfadmin/server.mjs does this on the fly for its own
 * dev-mode serving; ours is static, so it happens at build time).
 */
function ctfAdminAgent(appKey: 'facade' | 'topo'): Plugin {
  return {
    name: 'ctfadmin-agent-inject',
    transformIndexHtml(html) {
      return html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n    <script src="/ctfadmin/_agent.js" data-app="${appKey}" data-server="/ctfadmin"></script>`,
      );
    },
  };
}

export default defineConfig({
  base: './',
  // Своя папка кэша: FACADE·CAD лежит уровнем выше и резолвит те же
  // зависимости, а общий кэш .vite/deps два dev-сервера перетирали друг у
  // друга — страница ловила 504 Outdated Optimize Dep на three.js.
  cacheDir: 'node_modules/.vite-topo',
  plugins: [tailwindcss(), wasm(), topLevelAwait(), tocadBridge(), ctfAdminAgent('topo')],
  // web-e57 is ESM+wasm (must stay unbundled for vite-plugin-wasm);
  // laz-perf is CommonJS and MUST be pre-bundled or module workers break.
  optimizeDeps: { exclude: ['web-e57'] },
  worker: { format: 'es', plugins: () => [wasm(), topLevelAwait()] },
  // gisdata integration (ntrip.host): built straight into the shared
  // assets/ tree, same convention as facade-cad's own vite.config.ts.
  build: {
    outDir: '../../assets/topo-cad',
    emptyOutDir: true,
  },
});
