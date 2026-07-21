export const WALLPAPER_TYPES = ["year", "goal", "month", "week", "minimal", "life", "day"] as const;

export type WallpaperType = (typeof WALLPAPER_TYPES)[number];

export interface WallpaperConfig {
	type: WallpaperType;
	width: number;
	height: number;
	// Specific config
	birthDate?: string; // YYYY-MM-DD
	lifespan?: number;
	targetDate?: string; // YYYY-MM-DD
	goalStartDate?: string; // YYYY-MM-DD
	goalName?: string;
	timeZone?: string;
	// Visuals
	theme: {
		bg: string;
		accent: string;
		text: string;
	};
}

export const DEFAULT_CONFIG: WallpaperConfig = {
	type: "year",
	width: 1179,
	height: 2556, // Common modern iPhone portrait resolution
	lifespan: 80,
	theme: {
		bg: "#000000",
		accent: "#ffffff",
		text: "#ffffff",
	},
};
