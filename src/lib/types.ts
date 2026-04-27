export type WallpaperType = "year" | "goal" | "month" | "week" | "minimal";

export interface WallpaperConfig {
	type: WallpaperType;
	width: number;
	height: number;
	// Specific config
	birthDate?: string; // YYYY-MM-DD
	lifespan?: number;
	targetDate?: string; // YYYY-MM-DD
	goalName?: string;
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
	height: 2556, // iPhone 16 Pro default
	lifespan: 80,
	theme: {
		bg: "#000000",
		accent: "#ffffff",
		text: "#ffffff",
	},
};
