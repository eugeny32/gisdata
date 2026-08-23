const VIDEO_RENDER_DEFAULT_PLUGIN_NAMES = [
    'ViewPlugin',
    'CameraPlugin',
    'RenderPlugin',
    'AnimationPlugin',
    'GaussianSplatPlugin',
    'VideoRenderPlugin'
];
const VIDEO_RENDER_EXCLUDED_PLUGIN_NAMES = [
    'InputPlugin',
    'ControlPlugin',
    'MeasurePlugin',
    'SelectionPlugin',
    'ScreenBoxSelectPlugin',
    'MeasureOverlayPlugin',
    'ClipOverlayPlugin',
    'VolumeOverlayPlugin',
    'ProfileOverlayPlugin',
    'ScreenBoxSelectOverlayPlugin',
    'BoundingBoxOverlayPlugin',
    'StatsPlugin'
];
function getPluginDiagnosticName(plugin) {
    const ctorName = plugin.constructor?.name;
    return ctorName && 'Object' !== ctorName ? ctorName : plugin.name;
}
function createVideoRenderPresetDiagnostics(additionalPlugins = []) {
    return {
        name: 'videoRender',
        defaultPluginNames: [
            ...VIDEO_RENDER_DEFAULT_PLUGIN_NAMES
        ],
        additionalPluginNames: additionalPlugins.map(getPluginDiagnosticName),
        excludedPluginNames: [
            ...VIDEO_RENDER_EXCLUDED_PLUGIN_NAMES
        ]
    };
}
function sanitizeVideoRenderDiagnostics(diagnostics) {
    return sanitizeValue(diagnostics);
}
function sanitizeValue(value) {
    if ('string' == typeof value) return sanitizeDiagnosticString(value);
    if (Array.isArray(value)) return value.map(sanitizeValue);
    if (value && 'object' == typeof value) return Object.fromEntries(Object.entries(value).map(([key, child])=>[
            key,
            sanitizeValue(child)
        ]));
    return value;
}
function sanitizeDiagnosticString(value) {
    return redactLocalPaths(redactSensitiveAssignments(redactSensitiveUrlQueries(value)));
}
function redactSensitiveUrlQueries(value) {
    return value.replace(/\bhttps?:\/\/[^\s"'<>]+/gi, (rawUrl)=>{
        try {
            const url = new URL(rawUrl);
            url.search = '';
            url.hash = '';
            return url.toString();
        } catch  {
            return rawUrl.replace(/\?[^#\s"'<>]*/g, '?[redacted]');
        }
    });
}
function redactSensitiveAssignments(value) {
    return value.replace(/\b(token|access_token|signature|sig|cookie|authorization)=([^&\s]+)/gi, '$1=[redacted]');
}
function redactLocalPaths(value) {
    return value.replace(/\b[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)+([^\\/:*?"<>|\r\n]+)/g, '[local-path]\\$1').replace(/(^|\s)\/(?:[^/\s]+\/)+([^/\s]+)/g, '$1[local-path]/$2');
}
export { VIDEO_RENDER_DEFAULT_PLUGIN_NAMES, VIDEO_RENDER_EXCLUDED_PLUGIN_NAMES, createVideoRenderPresetDiagnostics, getPluginDiagnosticName, sanitizeVideoRenderDiagnostics };
