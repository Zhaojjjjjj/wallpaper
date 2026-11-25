export const WALLPAPER_TYPES = ["month", "calendar", "minimal", "generative", "lyric"] as const;

export type WallpaperType = (typeof WALLPAPER_TYPES)[number];

export const LYRIC_FONTS = ["wenkai", "serif", "brush", "sans"] as const;

export type LyricFont = (typeof LYRIC_FONTS)[number];

export const DEFAULT_LYRIC_FONT: LyricFont = "wenkai";

/** Output encoding of the PNG endpoint; "jpg" is opt-in per link. */
export type WallpaperFormat = "png" | "jpg";

export interface WallpaperConfig {
	type: WallpaperType;
	width: number;
	height: number;
	timeZone?: string;
	/** Output encoding for the image endpoint; absent means PNG. */
	format?: WallpaperFormat;
	/** Lyric type only: typeface for the passage and credits. */
	font?: LyricFont;
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
