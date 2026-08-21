// Общая обвязка для скриптов slam/steps/*.mjs: чтение контекста (JSON,
// путь передаёт bin/slam_step_worker.ps1 первым аргументом) и запись
// результата (второй аргумент). Ошибки просто выбрасываются — .ps1 сам
// ловит ненулевой код выхода и пишет ErrorFile (см. bin/slam_step_worker.ps1),
// здесь дополнительный try/catch не нужен.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * @param {(ctx: object) => (object|undefined|Promise<object|undefined>)} fn
 */
export async function runStep(fn) {
  const [, , contextFile, doneFile] = process.argv;
  if (!contextFile || !doneFile) {
    throw new Error("usage: node <step>.mjs <contextFile> <doneFile>");
  }
  const ctx = JSON.parse(readFileSync(contextFile, "utf8"));
  const result = (await fn(ctx)) || {};
  mkdirSync(dirname(doneFile), { recursive: true });
  writeFileSync(doneFile, JSON.stringify(result));
}
