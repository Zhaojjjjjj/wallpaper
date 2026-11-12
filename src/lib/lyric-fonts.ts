import { DEFAULT_LYRIC_FONT, type LyricFont } from "./types";

/** Registered font-family names, shared by Satori, Canvas and SVG. */
export const LYRIC_FONT_NAMES: Record<LyricFont, string> = {
	wenkai: "LXGW WenKai",
	serif: "Noto Serif SC",
	brush: "Ma Shan Zheng",
	sans: "Noto Sans SC",
};

export function resolveLyricFont(font: LyricFont | undefined): LyricFont {
	return font ?? DEFAULT_LYRIC_FONT;
}

export function lyricFontName(font: LyricFont | undefined): string {
	return LYRIC_FONT_NAMES[resolveLyricFont(font)];
}

/** CSS font stack for Canvas/SVG rendering of lyric text. */
export function lyricFontStack(font: LyricFont | undefined): string {
	const resolved = resolveLyricFont(font);
	if (resolved === "sans") return '"Inter", "Noto Sans SC", sans-serif';
	return `"${LYRIC_FONT_NAMES[resolved]}", "Noto Sans SC", sans-serif`;
}
