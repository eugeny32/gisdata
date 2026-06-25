export type ModelType = 'splat' | 'pointcloud';

/** Динамически импортированный модуль playcanvas — типизируем через
 * typeof import(...), не статический import: загрузка должна оставаться
 * ленивой (только когда реально открывают тур), а не на каждой загрузке
 * map.php — см. README.md в этой папке. */
export type PcModule = typeof import('playcanvas');
