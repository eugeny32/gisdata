/** Vite's `?url` asset-import suffix — собственных типов из vite/client не
 * подключаем (избыточно для одного случая использования, см. copcWorker.ts). */
declare module '*.wasm?url' {
  const url: string;
  export default url;
}
