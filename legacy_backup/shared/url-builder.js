const URL_BUILDER_SUPPORTED_TYPES = new Set([
    'year',
    'goal',
    'month',
    'week',
    'minimal',
    'gradient',
    'cyberpunk',
    'nature',
    'retro',
    'glass',
    'digital',
    'quote',
    'stats',
    'season',
    'binary',
    'moon'
]);

function resolveRenderableType(type) {
    return URL_BUILDER_SUPPORTED_TYPES.has(type) ? type : 'year';
}

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return '/';
    }

    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

function buildWallpaperImageUrl({
    currentType,
    config,
    deviceResolution,
    baseUrl
}) {
    const renderType = resolveRenderableType(currentType);
    const params = new URLSearchParams({
        type: renderType,
        bg: config.bgColor,
        accent: config.accentColor,
        lang: config.language,
        w: String(deviceResolution.width),
        h: String(deviceResolution.height)
    });

    if (renderType === 'goal') {
        params.set('target', config.targetDate);
        if (config.goalName) {
            params.set('name', config.goalName);
        }
    }

    return `${normalizeBaseUrl(baseUrl)}api/wallpaper.png?${params.toString()}`;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPPORTED_WALLPAPER_TYPES: URL_BUILDER_SUPPORTED_TYPES,
        buildWallpaperImageUrl,
        resolveRenderableType
    };
}

if (typeof window !== 'undefined') {
    window.wallpaperUrlBuilder = {
        SUPPORTED_WALLPAPER_TYPES: URL_BUILDER_SUPPORTED_TYPES,
        buildWallpaperImageUrl,
        resolveRenderableType
    };
}
