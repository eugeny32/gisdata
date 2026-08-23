import * as __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__ from "../../../shared/logging/index.js";
const log = (0, __WEBPACK_EXTERNAL_MODULE__shared_logging_index_js_9b555e49__.getLoggerManager)().getLogger('gsplat:utils');
const AUTO_FALLBACK_BUDGET = 3000000;
const AUTO_MOBILE_BUDGET = 1000000;
const AUTO_WINDOWS_UNKNOWN_GPU_BUDGET = 2000000;
const AUTO_MACOS_BUDGET = 2500000;
const DEFAULT_TEXTURE_PIXELS_PER_SPLAT = 4;
const LOW_UPLOAD_BYTES = 4194304;
const DEFAULT_UPLOAD_BYTES = 31457280;
function resolveGSplatDeviceBudgetConfig(defaults, rawConfig, renderer) {
    const raw = rawConfig ?? {};
    const mergedConfig = mergeDefined(defaults, raw);
    const detectedInfo = detectGSplatDeviceBudgetDeviceInfo(renderer);
    const deviceInfo = mergeDefined(detectedInfo, raw.deviceBudget?.deviceInfo ?? {});
    const mode = raw.deviceBudget?.mode ?? 'unset';
    if ('auto' !== mode) {
        const lodConfig = {
            ...mergedConfig,
            deviceBudget: raw.deviceBudget
        };
        return {
            lodConfig,
            diagnostics: createDisabledDiagnostics(lodConfig, deviceInfo, mode)
        };
    }
    const texturePixelsPerSplat = normalizeTexturePixelsPerSplat(raw.deviceBudget?.texturePixelsPerSplat);
    const explicitBudget = hasExplicitNumber(raw, 'maxCachePoints') ? raw.maxCachePoints : null;
    const tier = resolveAutoTier(deviceInfo);
    const requestedBudget = explicitBudget ?? tier.budget;
    const hardLimit = calculateTextureHardLimit(deviceInfo.maxTextureSize, texturePixelsPerSplat);
    const effectiveBudget = null === hardLimit ? requestedBudget : Math.min(requestedBudget, hardLimit);
    const clampReason = null === hardLimit ? 'hard-limit-unavailable' : effectiveBudget < requestedBudget ? 'texture-hard-limit' : 'none';
    const budgetSource = null === explicitBudget ? tier.source : 'explicit';
    const derived = resolveAutoDerivedFields(raw, deviceInfo);
    const lodConfig = {
        ...mergedConfig,
        ...derived.appliedFields,
        maxCachePoints: Math.max(1, Math.floor(effectiveBudget)),
        deviceBudget: raw.deviceBudget
    };
    return {
        lodConfig,
        diagnostics: {
            enabled: true,
            mode: 'auto',
            deviceInfo,
            texturePixelsPerSplat,
            explicitBudget,
            tierBudget: tier.budget,
            requestedBudget,
            hardLimit,
            effectiveBudget: lodConfig.maxCachePoints,
            budgetSource,
            clampReason,
            autoBranch: tier.branch,
            appliedDerivedFields: derived.appliedFields,
            skippedDerivedFields: derived.skippedFields,
            recommendations: derived.recommendations
        }
    };
}
function detectGSplatDeviceBudgetDeviceInfo(renderer) {
    const navigatorLike = getNavigatorLike();
    const userAgent = navigatorLike?.userAgent ?? '';
    const gpuRenderer = detectGpuRenderer(renderer);
    const deviceInfo = {
        os: detectOS(userAgent),
        browser: detectBrowser(userAgent),
        isFirefox: /firefox/i.test(userAgent),
        isMobile: /iphone|ipad|ipod|android|mobile/i.test(userAgent),
        cpuCores: normalizePositiveInteger(navigatorLike?.hardwareConcurrency),
        gpuVendor: detectGpuVendor(gpuRenderer),
        gpuModel: detectGpuModel(gpuRenderer),
        gpuRenderer,
        maxTextureSize: detectMaxTextureSize(renderer)
    };
    log.debug('[GSplatDeviceBudget] 设备检测: os=' + deviceInfo.os + ', browser=' + deviceInfo.browser + ', mobile=' + deviceInfo.isMobile + ', cpuCores=' + deviceInfo.cpuCores + ', gpuVendor=' + deviceInfo.gpuVendor + ', gpuModel=' + deviceInfo.gpuModel + ', maxTextureSize=' + deviceInfo.maxTextureSize + ', gpuRenderer=' + deviceInfo.gpuRenderer);
    return deviceInfo;
}
function calculateTextureHardLimit(maxTextureSize, texturePixelsPerSplat = DEFAULT_TEXTURE_PIXELS_PER_SPLAT) {
    const textureSize = normalizePositiveInteger(maxTextureSize);
    const pixelsPerSplat = normalizeTexturePixelsPerSplat(texturePixelsPerSplat);
    if (null === textureSize) return null;
    return Math.floor(textureSize * textureSize / pixelsPerSplat);
}
function cloneGSplatDeviceBudgetDiagnostics(diagnostics) {
    return {
        ...diagnostics,
        deviceInfo: {
            ...diagnostics.deviceInfo
        },
        appliedDerivedFields: {
            ...diagnostics.appliedDerivedFields
        },
        skippedDerivedFields: [
            ...diagnostics.skippedDerivedFields
        ],
        recommendations: {
            ...diagnostics.recommendations
        }
    };
}
function createDisabledDiagnostics(lodConfig, deviceInfo, mode) {
    return {
        enabled: false,
        mode,
        deviceInfo,
        texturePixelsPerSplat: DEFAULT_TEXTURE_PIXELS_PER_SPLAT,
        explicitBudget: null,
        tierBudget: null,
        requestedBudget: lodConfig.maxCachePoints,
        hardLimit: null,
        effectiveBudget: lodConfig.maxCachePoints,
        budgetSource: 'disabled',
        clampReason: 'disabled',
        autoBranch: null,
        appliedDerivedFields: {},
        skippedDerivedFields: [],
        recommendations: {}
    };
}
function resolveAutoTier(deviceInfo) {
    if (deviceInfo.isMobile || 'ios' === deviceInfo.os || 'android' === deviceInfo.os) return {
        budget: AUTO_MOBILE_BUDGET,
        source: 'auto-tier',
        branch: 'mobile'
    };
    if ('macos' === deviceInfo.os) return {
        budget: AUTO_MACOS_BUDGET,
        source: 'auto-tier',
        branch: 'macos'
    };
    if ('windows' === deviceInfo.os) {
        if ('unknown' === deviceInfo.gpuVendor) return {
            budget: AUTO_WINDOWS_UNKNOWN_GPU_BUDGET,
            source: 'auto-tier',
            branch: 'windows-unknown-gpu'
        };
        if (deviceInfo.isFirefox) return {
            budget: AUTO_FALLBACK_BUDGET,
            source: 'auto-fallback',
            branch: 'windows-firefox-fallback'
        };
        if ('nvidia' === deviceInfo.gpuVendor && 'number' == typeof deviceInfo.gpuModel) {
            if (deviceInfo.gpuModel < 1050) return {
                budget: 1000000,
                source: 'auto-tier',
                branch: 'windows-nvidia-low'
            };
            if (deviceInfo.gpuModel < 2060) return {
                budget: 2000000,
                source: 'auto-tier',
                branch: 'windows-nvidia-mid'
            };
            return {
                budget: AUTO_FALLBACK_BUDGET,
                source: 'auto-fallback',
                branch: 'windows-nvidia-high-fallback'
            };
        }
        if ('amd' === deviceInfo.gpuVendor && 'number' == typeof deviceInfo.gpuModel) {
            if (deviceInfo.gpuModel < 560) return {
                budget: 1000000,
                source: 'auto-tier',
                branch: 'windows-amd-low'
            };
            if (deviceInfo.gpuModel < 5600) return {
                budget: 2000000,
                source: 'auto-tier',
                branch: 'windows-amd-mid'
            };
            return {
                budget: AUTO_FALLBACK_BUDGET,
                source: 'auto-fallback',
                branch: 'windows-amd-high-fallback'
            };
        }
    }
    return {
        budget: AUTO_FALLBACK_BUDGET,
        source: 'auto-fallback',
        branch: 'desktop-fallback'
    };
}
function resolveAutoDerivedFields(rawConfig, deviceInfo) {
    const appliedFields = {};
    const skippedFields = [];
    const recommendations = {};
    const isMobile = deviceInfo.isMobile || 'ios' === deviceInfo.os || 'android' === deviceInfo.os;
    const isLowEnd = !isMobile && ('number' == typeof deviceInfo.cpuCores && deviceInfo.cpuCores < 9 || 'unknown' === deviceInfo.gpuVendor);
    if (isMobile) {
        recommendations.MaxLodDistance = 30;
        recommendations.LodLevelUpSpatsInNode = 500000;
        recommendations.CpuSortThreadNum = 2;
        recommendations.MinLodUsed = 1;
        recommendations.MaxDistaneLimit = 100;
        recommendations.GpuMaxUploadBytes = LOW_UPLOAD_BYTES;
        recommendations.GpuMaxUploadCount = 30;
        applyDerivedField(rawConfig, appliedFields, skippedFields, 'maxConcurrentLoads', 2);
        applyDerivedField(rawConfig, appliedFields, skippedFields, 'maxRenderDistance', 100);
    } else if (isLowEnd) {
        recommendations.LodLevelUpSpatsInNode = 900000;
        recommendations.GpuMaxUploadBytes = LOW_UPLOAD_BYTES;
        recommendations.GpuMaxUploadCount = 30;
    } else {
        recommendations.LodLevelUpSpatsInNode = 2000000;
        recommendations.GpuMaxUploadBytes = DEFAULT_UPLOAD_BYTES;
        recommendations.GpuMaxUploadCount = 100;
    }
    if (rawConfig.deviceBudget?.applyUploadTuning === false) {
        skippedFields.push('maxImmediateOrderUploadBytes', 'maxOrderUploadBytesPerFrame', 'maxOrderUploadChunksPerFrame');
        return {
            appliedFields,
            skippedFields,
            recommendations
        };
    }
    applyDerivedField(rawConfig, appliedFields, skippedFields, 'maxImmediateOrderUploadBytes', recommendations.GpuMaxUploadBytes);
    applyDerivedField(rawConfig, appliedFields, skippedFields, 'maxOrderUploadBytesPerFrame', recommendations.GpuMaxUploadBytes);
    applyDerivedField(rawConfig, appliedFields, skippedFields, 'maxOrderUploadChunksPerFrame', recommendations.GpuMaxUploadCount);
    return {
        appliedFields,
        skippedFields,
        recommendations
    };
}
function applyDerivedField(rawConfig, target, skippedFields, key, value) {
    if (void 0 === value) return;
    if (hasExplicitField(rawConfig, key)) {
        skippedFields.push(key);
        return;
    }
    target[key] = value;
}
function mergeDefined(base, patch) {
    const result = {
        ...base
    };
    for (const [key, value] of Object.entries(patch))if (void 0 !== value) result[key] = value;
    return result;
}
function hasExplicitField(obj, key) {
    return Object.hasOwn(obj, key) && void 0 !== obj[key];
}
function hasExplicitNumber(obj, key) {
    return hasExplicitField(obj, key) && 'number' == typeof obj[key];
}
function normalizeTexturePixelsPerSplat(value) {
    const normalized = normalizePositiveInteger(value);
    return normalized ?? DEFAULT_TEXTURE_PIXELS_PER_SPLAT;
}
function normalizePositiveInteger(value) {
    return 'number' == typeof value && Number.isFinite(value) && value > 0 ? Math.floor(value) : null;
}
function getNavigatorLike() {
    return 'undefined' != typeof navigator ? navigator : null;
}
function detectOS(userAgent) {
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios';
    if (/android/i.test(userAgent)) return 'android';
    if (/cros/i.test(userAgent)) return 'chromeos';
    if (/windows/i.test(userAgent)) return 'windows';
    if (/mac os|macintosh/i.test(userAgent)) return 'macos';
    if (/linux/i.test(userAgent)) return 'linux';
    return userAgent ? 'other' : 'unknown';
}
function detectBrowser(userAgent) {
    if (/firefox/i.test(userAgent)) return 'firefox';
    if (/edg\//i.test(userAgent)) return 'edge';
    if (/chrome|chromium|crios/i.test(userAgent)) return 'chrome';
    if (/safari/i.test(userAgent)) return 'safari';
    return userAgent ? 'other' : 'unknown';
}
function detectGpuVendor(renderer) {
    if (!renderer) return 'unknown';
    if (/nvidia|geforce|rtx|gtx/i.test(renderer)) return 'nvidia';
    if (/amd|radeon|rx \d/i.test(renderer)) return 'amd';
    if (/intel/i.test(renderer)) return 'intel';
    if (/apple/i.test(renderer)) return 'apple';
    return 'other';
}
function detectGpuModel(renderer) {
    if (!renderer) return null;
    const match = renderer.match(/(?:rtx|gtx|geforce|nvidia|rx|radeon|amd)[^\d]*(\d{3,4})/i);
    if (!match) return null;
    return Number.parseInt(match[1], 10);
}
function detectMaxTextureSize(renderer) {
    const gl = getRendererContext(renderer);
    if (!gl) return null;
    const maxTextureSizeKey = gl.MAX_TEXTURE_SIZE ?? 0x0d33;
    return normalizePositiveInteger(gl.getParameter(maxTextureSizeKey));
}
function detectGpuRenderer(renderer) {
    const gl = getRendererContext(renderer);
    if (!gl) return null;
    const debugInfo = gl.getExtension?.('WEBGL_debug_renderer_info');
    if (debugInfo?.UNMASKED_RENDERER_WEBGL) {
        const unmasked = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        if ('string' == typeof unmasked && unmasked.length > 0) return unmasked;
    }
    const rendererValue = gl.getParameter(gl.RENDERER ?? 0x1f01);
    return 'string' == typeof rendererValue && rendererValue.length > 0 ? rendererValue : null;
}
function getRendererContext(renderer) {
    const maybeRenderer = renderer;
    if ('function' != typeof maybeRenderer?.getContext) return null;
    return maybeRenderer.getContext();
}
export { calculateTextureHardLimit, cloneGSplatDeviceBudgetDiagnostics, detectGSplatDeviceBudgetDeviceInfo, resolveGSplatDeviceBudgetConfig };
