// ZIP-обвязка через PowerShell (Expand-Archive/Compress-Archive) — тот же
// принцип, что уже используется в проекте для PDAL/untwine/splat-transform:
// не тащить отдельную npm-библиотеку под задачу, которую системный
// инструмент уже решает надёжно на Windows-сервере.
import { execFileSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync } from "node:fs";

export function extractZip(zipPath, destDir) {
  mkdirSync(destDir, { recursive: true });
  execFileSync("powershell.exe", [
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command",
    `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`,
  ], { stdio: "pipe" });
}

export function compressZip(srcDir, zipPath) {
  if (existsSync(zipPath)) rmSync(zipPath);
  execFileSync("powershell.exe", [
    "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command",
    `Compress-Archive -Path '${srcDir.replace(/'/g, "''")}\\*' -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`,
  ], { stdio: "pipe" });
}
