const SUPPORTED_TYPES = new Set([
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

const DEFAULTS = {
    type: 'year',
    bg: '#000000',
    accent: '#FFFFFF',
    lang: 'zh',
    width: 1179,
    height: 2556,
    goalName: '',
    goalNameMaxLength: 40
};

function isHexColor(value) {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function clampInt(input, min, max, fallback) {
    const value = Number.parseInt(input, 10);
    if (Number.isNaN(value)) {
        return fallback;
    }

    if (value < min) {
        return min;
    }

    if (value > max) {
        return max;
    }

    return value;
}

function getDefaultTargetDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
}

function normalizeType(type) {
    return SUPPORTED_TYPES.has(type) ? type : DEFAULTS.type;
}

function normalizeLang(lang) {
    return lang === 'en' ? 'en' : DEFAULTS.lang;
}

function normalizeHexColor(input, fallback) {
    if (!input) {
        return fallback;
    }

    const value = input.trim();
    return isHexColor(value) ? value : fallback;
}

function normalizeTargetDate(input) {
    if (typeof input !== 'string') {
        return getDefaultTargetDate();
    }

    const value = input.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return getDefaultTargetDate();
    }

    return value;
}

function normalizeGoalName(input) {
    if (typeof input !== 'string') {
        return DEFAULTS.goalName;
    }

    return input.trim().slice(0, DEFAULTS.goalNameMaxLength);
}

function normalizeWallpaperParams(searchParams) {
    const type = normalizeType(searchParams.get('type'));
    const result = {
        type,
        bg: normalizeHexColor(searchParams.get('bg'), DEFAULTS.bg),
        accent: normalizeHexColor(searchParams.get('accent'), DEFAULTS.accent),
        lang: normalizeLang(searchParams.get('lang')),
        width: clampInt(searchParams.get('w'), 320, 4320, DEFAULTS.width),
        height: clampInt(searchParams.get('h'), 320, 7680, DEFAULTS.height),
        target: normalizeTargetDate(searchParams.get('target')),
        name: normalizeGoalName(searchParams.get('name'))
    };

    return result;
}

function toWallpaperQuery(params) {
    const query = new URLSearchParams({
        type: params.type,
        bg: params.bg,
        accent: params.accent,
        lang: params.lang,
        w: String(params.width),
        h: String(params.height)
    });

    if (params.type === 'goal') {
        query.set('target', params.target);
        if (params.name) {
            query.set('name', params.name);
        }
    }

    return query.toString();
}

module.exports = {
    DEFAULTS,
    SUPPORTED_TYPES,
    clampInt,
    normalizeWallpaperParams,
    toWallpaperQuery
};
