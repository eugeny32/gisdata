/**
 * @loaders.gl/* не установлены как devDependency (не нужны для сборки —
 * они external, см. vite.config.ts, и резолвятся в браузере через
 * importmap) — поэтому у TS нет их типов. Минимальные ambient-декларации
 * только чтобы typecheck проходил; реальная форма данных (`data.attributes...`)
 * и так обрабатывается как `any` в lasLoader.ts.
 */
declare module '@loaders.gl/core' {
  export function parse(data: ArrayBuffer, loader: unknown): Promise<any>;
}

declare module '@loaders.gl/las' {
  export const LASLoader: unknown;
}
