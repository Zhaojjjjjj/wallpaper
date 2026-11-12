import { DEFAULT_CONFIG, DEFAULT_LYRIC_FONT, LYRIC_FONTS, LyricFont, WALLPAPER_TYPES, WallpaperConfig, WallpaperType } from "./types";

const SUPPORTED_TYPES = new Set<string>(WALLPAPER_TYPES);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
export const MAX_CANVAS_PIXELS = 8_388_608;
const WALLPAPER_QUERY_KEYS = new Set(["type", "width", "height", "bg", "accent", "text", "timeZone", "font"]);
const COMMON_WALLPAPER_QUERY_KEYS = new Set(["type", "width", "height", "bg", "accent", "text", "timeZone"]);
const TYPE_SPECIFIC_QUERY_KEYS: Record<WallpaperType, ReadonlySet<string>> = {
	month: new Set(),
	calendar: new Set(),
	minimal: new Set(),
	generative: new Set(),
	lyric: new Set(["font"]),
};

function normalizeType(value: string | null): WallpaperType {
	return value && SUPPORTED_TYPES.has(value) ? (value as WallpaperType) : DEFAULT_CONFIG.type;
}

export function normalizeWallpaperInteger(value: string | number | null, min: number, max: number, fallback: number): number {
	if (value === null || String(value).trim() === "") return fallback;

	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return fallback;

	return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

export function parseWallpaperIntegerDraft(value: string, min: number, max: number): number | undefined {
	if (value.trim() === "") return undefined;

	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < min || parsed > max) return undefined;

	return Math.trunc(parsed);
}

export function resolveWallpaperNumberDraft(value: number, draft: string, isEditing: boolean): string {
	return isEditing ? draft : String(value);
}

export function finalizeWallpaperIntegerDraft(draft: string, min: number, max: number, currentValue: number): number {
	return parseWallpaperIntegerDraft(draft, min, max) === undefined
		? normalizeWallpaperInteger(draft, min, max, currentValue)
		: currentValue;
}

export function normalizeWallpaperDimensions(width: number, height: number): { width: number; height: number } {
	if (width * height <= MAX_CANVAS_PIXELS) return { width, height };

	const scale = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
	return {
		width: Math.max(320, Math.floor(width * scale)),
		height: Math.max(320, Math.floor(height * scale)),
	};
}

function normalizeColor(value: string | null, fallback: string): string {
	const normalized = value?.trim();
	return normalized && HEX_COLOR.test(normalized) ? normalized.toLowerCase() : fallback;
}

function normalizeTimeZone(value: string | null): string | undefined {
	const normalized = value?.trim().slice(0, 64);
	if (!normalized) return undefined;

	try {
		new Intl.DateTimeFormat("en", { timeZone: normalized }).format();
		return normalized;
	} catch {
		return undefined;
	}
}

export function findWallpaperQueryIssues(searchParams: URLSearchParams): string[] {
	const issues: string[] = [];
	const seen = new Set<string>();
	const config = parseWallpaperConfig(searchParams);
	const relevantKeys = new Set([...COMMON_WALLPAPER_QUERY_KEYS, ...TYPE_SPECIFIC_QUERY_KEYS[config.type]]);
	const canonicalParams = buildWallpaperQueryParams(config);

	for (const [key, value] of searchParams) {
		if (!WALLPAPER_QUERY_KEYS.has(key)) {
			if (!issues.includes(`unknown:${key}`)) issues.push(`unknown:${key}`);
			continue;
		}
		if (seen.has(key)) {
			if (!issues.includes(`duplicate:${key}`)) issues.push(`duplicate:${key}`);
			continue;
		}
		seen.add(key);

		if (!relevantKeys.has(key)) {
			issues.push(`irrelevant:${key}`);
			continue;
		}

		if (canonicalParams.get(key) !== value) {
			issues.push(`${isWallpaperQueryValueValid(key, value) ? "noncanonical" : "invalid"}:${key}`);
		}
	}

	return issues;
}

function isWallpaperQueryValueValid(key: string, value: string): boolean {
	switch (key) {
		case "type":
			return SUPPORTED_TYPES.has(value);
		case "width": {
			const parsed = Number(value);
			return Number.isInteger(parsed) && parsed >= 320 && parsed <= 4320;
		}
		case "height": {
			const parsed = Number(value);
			return Number.isInteger(parsed) && parsed >= 320 && parsed <= 7680;
		}
		case "bg":
		case "accent":
		case "text":
			return HEX_COLOR.test(value);
		case "timeZone":
			return normalizeTimeZone(value) !== undefined;
		case "font":
			return (LYRIC_FONTS as readonly string[]).includes(value);
		default:
			return false;
	}
}

function normalizeLyricFont(value: string | null): LyricFont {
	return value && (LYRIC_FONTS as readonly string[]).includes(value) ? (value as LyricFont) : DEFAULT_LYRIC_FONT;
}

export function parseWallpaperConfig(searchParams: Pick<URLSearchParams, "get">): WallpaperConfig {
	const accent = normalizeColor(searchParams.get("accent"), DEFAULT_CONFIG.theme.accent);
	const dimensions = normalizeWallpaperDimensions(
		normalizeWallpaperInteger(searchParams.get("width"), 320, 4320, DEFAULT_CONFIG.width),
		normalizeWallpaperInteger(searchParams.get("height"), 320, 7680, DEFAULT_CONFIG.height)
	);

	const type = normalizeType(searchParams.get("type"));
	return {
		type,
		width: dimensions.width,
		height: dimensions.height,
		timeZone: normalizeTimeZone(searchParams.get("timeZone")),
		...(type === "lyric" ? { font: normalizeLyricFont(searchParams.get("font")) } : {}),
		theme: {
			bg: normalizeColor(searchParams.get("bg"), DEFAULT_CONFIG.theme.bg),
			accent,
			text: normalizeColor(searchParams.get("text"), accent),
		},
	};
}

function normalizeWallpaperConfig(config: WallpaperConfig): WallpaperConfig {
	const params = new URLSearchParams({
		type: config.type,
		width: String(config.width),
		height: String(config.height),
		bg: config.theme.bg,
		accent: config.theme.accent,
		text: config.theme.text,
	});

	if (config.timeZone !== undefined) params.set("timeZone", config.timeZone);
	if (config.type === "lyric" && config.font !== undefined) params.set("font", config.font);

	return parseWallpaperConfig(params);
}

function buildWallpaperQueryParams(input: WallpaperConfig): URLSearchParams {
	const config = normalizeWallpaperConfig(input);
	const params = new URLSearchParams({
		type: config.type,
		width: String(config.width),
		height: String(config.height),
		bg: config.theme.bg,
		accent: config.theme.accent,
		text: config.theme.text,
	});

	if (config.timeZone) params.set("timeZone", config.timeZone);
	if (config.type === "lyric") params.set("font", config.font ?? DEFAULT_LYRIC_FONT);

	return params;
}

function buildWallpaperQuery(config: WallpaperConfig): string {
	return buildWallpaperQueryParams(config).toString();
}

export function buildWallpaperPath(config: WallpaperConfig): string {
	return `/wallpaper?${buildWallpaperQuery(config)}`;
}

export function buildWallpaperImagePath(config: WallpaperConfig): string {
	return `/api/wallpaper.png?${buildWallpaperQuery(config)}`;
}

export function selectWallpaperType(config: WallpaperConfig, type: WallpaperType): WallpaperConfig {
	return { ...config, type };
}
