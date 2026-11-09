export const WALLPAPER_TYPES = ["month", "calendar", "minimal"] as const;

export type WallpaperType = (typeof WALLPAPER_TYPES)[number];

export interface WallpaperConfig {
	type: WallpaperType;
	width: number;
	height: number;
	timeZone?: string;
	// Visuals
	theme: {
		bg: string;
		accent: string;
		text: string;
	};
}

export const DEFAULT_CONFIG: WallpaperConfig = {
	type: "calendar",
	width: 1179,
	height: 2556, // Common modern iPhone portrait resolution
	theme: {
		bg: "#000000",
		accent: "#ffffff",
		text: "#ffffff",
	},
};
