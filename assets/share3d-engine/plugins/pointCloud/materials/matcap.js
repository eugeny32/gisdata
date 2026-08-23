const MATCAP_NAMES = [
    'basic_1',
    'basic_2',
    'basic_dark',
    'basic_side',
    'ceramic_dark',
    'ceramic_lightbulb',
    'check_normal+y',
    'check_rim_dark',
    'check_rim_light',
    'clay_brown',
    'clay_muddy',
    'clay_studio',
    'contours_1',
    'contours_2',
    'contours_3',
    'jade',
    'matcap',
    'metal_anisotropic',
    'metal_carpaint',
    'metal_lead',
    'metal_shiny',
    'pearl',
    'reflection_check_horizontal',
    'reflection_check_vertical',
    'resin',
    'skin',
    'toon'
];
const DEFAULT_MATCAP = 'matcap';
function resolveMatcapUrl(basePath, name) {
    const base = basePath.replace(/\/+$/, '');
    const fileName = name.endsWith('.jpg') ? name : `${name}.jpg`;
    return `${base}/assets/matcap/${fileName}`;
}
export { DEFAULT_MATCAP, MATCAP_NAMES, resolveMatcapUrl };
