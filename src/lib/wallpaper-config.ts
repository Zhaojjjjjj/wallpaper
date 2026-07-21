import { DEFAULT_CONFIG, WALLPAPER_TYPES, WallpaperConfig, WallpaperType } from "./types";
import { formatDateOnly } from "./wallpaper-progress";

const SUPPORTED_TYPES = new Set<string>(WALLPAPER_TYPES);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
export const MAX_CANVAS_PIXELS = 8_388_608;
const WALLPAPER_QUERY_KEYS = new Set([
	"type",
	"width",
	"height",
	"bg",
	"accent",
	"text",
	"birthDate",
	"lifespan",
	"targetDate",
	"goalStartDate",
	"goalName",
	"timeZone",
]);
const COMMON_WALLPAPER_QUERY_KEYS = new Set(["type", "width", "height", "bg", "accent", "text", "timeZone"]);
const TYPE_SPECIFIC_QUERY_KEYS: Record<WallpaperType, ReadonlySet<string>> = {
	year: new Set(),
	goal: new Set(["targetDate", "goalStartDate", "goalName"]),
	month: new Set(),
	week: new Set(),
	minimal: new Set(),
	life: new Set(["birthDate", "lifespan"]),
	day: new Set(),
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

function normalizeDate(value: string | null): string | undefined {
	const match = value?.trim().match(DATE_ONLY);
	if (!match) return undefined;

	const [, yearText, monthText, dayText] = match;
	const year = Number(yearText);
	const month = Number(monthText);
	const day = Number(dayText);
	const date = new Date(Date.UTC(year, month - 1, day));

	if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
		return undefined;
	}

	return `${yearText}-${monthText}-${dayText}`;
}

function normalizeGoalName(value: string | null): string | undefined {
	const normalized = value?.trim().slice(0, 40);
	return normalized || undefined;
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
		case "lifespan": {
			const parsed = Number(value);
			return Number.isInteger(parsed) && parsed >= 1 && parsed <= 120;
		}
		case "bg":
		case "accent":
		case "text":
			return HEX_COLOR.test(value);
		case "birthDate":
		case "targetDate":
		case "goalStartDate":
			return normalizeDate(value) !== undefined;
		case "goalName":
			return value.trim().length > 0 && value.trim().length <= 40;
		case "timeZone":
			return normalizeTimeZone(value) !== undefined;
		default:
			return false;
	}
}

export function parseWallpaperConfig(searchParams: Pick<URLSearchParams, "get">): WallpaperConfig {
	const accent = normalizeColor(searchParams.get("accent"), DEFAULT_CONFIG.theme.accent);
	const targetDate = normalizeDate(searchParams.get("targetDate"));
	const requestedGoalStartDate = normalizeDate(searchParams.get("goalStartDate"));
	const goalStartDate = targetDate && requestedGoalStartDate && requestedGoalStartDate > targetDate
		? undefined
		: requestedGoalStartDate;
	const dimensions = normalizeWallpaperDimensions(
		normalizeWallpaperInteger(searchParams.get("width"), 320, 4320, DEFAULT_CONFIG.width),
		normalizeWallpaperInteger(searchParams.get("height"), 320, 7680, DEFAULT_CONFIG.height)
	);

	return {
		type: normalizeType(searchParams.get("type")),
		width: dimensions.width,
		height: dimensions.height,
		birthDate: normalizeDate(searchParams.get("birthDate")),
		lifespan: normalizeWallpaperInteger(searchParams.get("lifespan"), 1, 120, DEFAULT_CONFIG.lifespan ?? 80),
		targetDate,
		goalStartDate,
		goalName: normalizeGoalName(searchParams.get("goalName")),
		timeZone: normalizeTimeZone(searchParams.get("timeZone")),
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

	if (config.birthDate !== undefined) params.set("birthDate", config.birthDate);
	if (config.lifespan !== undefined) params.set("lifespan", String(config.lifespan));
	if (config.targetDate !== undefined) params.set("targetDate", config.targetDate);
	if (config.goalStartDate !== undefined) params.set("goalStartDate", config.goalStartDate);
	if (config.goalName !== undefined) params.set("goalName", config.goalName);
	if (config.timeZone !== undefined) params.set("timeZone", config.timeZone);

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

	if (config.type === "life") {
		if (config.birthDate) params.set("birthDate", config.birthDate);
		if (config.lifespan) params.set("lifespan", String(config.lifespan));
	}
	if (config.type === "goal") {
		if (config.targetDate) params.set("targetDate", config.targetDate);
		if (config.goalStartDate) params.set("goalStartDate", config.goalStartDate);
		if (config.goalName) params.set("goalName", config.goalName);
	}
	if (config.timeZone) params.set("timeZone", config.timeZone);

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

export function selectWallpaperType(config: WallpaperConfig, type: WallpaperType, now = new Date()): WallpaperConfig {
	if (type !== "goal") return { ...config, type };

	const targetDate = new Date(now);
	targetDate.setDate(targetDate.getDate() + 7);

	return {
		...config,
		type,
		goalStartDate: config.goalStartDate || formatDateOnly(now),
		targetDate: config.targetDate || formatDateOnly(targetDate),
	};
}
