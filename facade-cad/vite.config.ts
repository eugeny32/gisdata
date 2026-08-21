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
      const file = join(tmpdir(), 'facadecad_tocad.txt');
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
 * built index.html (mirrors what ctfadmin/server.mjs does on the fly for
 * its own dev-mode app serving — our Apache serving is static, so this has
 * to happen at build time instead). Survives future `vite build` runs,
 * unlike hand-editing the built file. See ctfadmin/README.md.
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
  // Своя папка кэша: TOPO·CAD резолвит зависимости из ЭТОГО же
  // node_modules, и при одновременном запуске двух dev-серверов общий
  // кэш .vite/deps переоптимизировался туда-сюда — страница ловила
  // 504 Outdated Optimize Dep на three.js.
  cacheDir: 'node_modules/.vite-facade',
  plugins: [tailwindcss(), wasm(), topLevelAwait(), tocadBridge(), ctfAdminAgent('facade')],
  // web-e57 is ESM+wasm (must stay unbundled for vite-plugin-wasm);
  // laz-perf is CommonJS and MUST be pre-bundled or module workers break.
  optimizeDeps: { exclude: ['web-e57'] },
  worker: { format: 'es', plugins: () => [wasm(), topLevelAwait()] },
  // gisdata integration (ntrip.host): built straight into the shared
  // assets/ tree, same convention as ../viewer -> ../assets/viewer (see
  // that vite.config.ts) -- facade-cad.php loads it as a static iframe,
  // no server-side build step exists in the FTP deploy pipeline.
  build: {
    outDir: '../assets/facade-cad',
    emptyOutDir: true,
  },
});
