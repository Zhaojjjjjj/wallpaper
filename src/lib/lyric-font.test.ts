import assert from "node:assert/strict";
import test from "node:test";
import { buildWallpaperImagePath, findWallpaperQueryIssues, parseWallpaperConfig } from "./wallpaper-config";
import { DEFAULT_CONFIG } from "./types";
import { getWallpaperTextLayers } from "./wallpaper-svg";
import { lyricFontName, lyricFontStack } from "./lyric-fonts";

const lyricParams = (extra: Record<string, string> = {}) =>
	new URLSearchParams({ type: "lyric", width: "1179", height: "2556", bg: "#fdfcf8", accent: "#c03926", text: "#1a1a18", ...extra });

test("lyric font defaults to wenkai in the canonical URL", () => {
	const config = parseWallpaperConfig(lyricParams());
	assert.equal(config.font, "wenkai");
	assert.ok(buildWallpaperImagePath(config).includes("font=wenkai"));
	assert.deepEqual(findWallpaperQueryIssues(lyricParams({ font: "wenkai" })), []);
});

test("non-default lyric font round-trips through the URL", () => {
	const config = parseWallpaperConfig(lyricParams({ font: "serif" }));
	assert.equal(config.font, "serif");
	const path = buildWallpaperImagePath(config);
	assert.ok(path.includes("font=serif"));
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams(path.split("?")[1])), []);
});

test("font is rejected for other types and invalid values", () => {
	const monthParams = new URLSearchParams({ type: "month", width: "1179", height: "2556", bg: "#000000", accent: "#ffffff", text: "#ffffff", font: "serif" });
	assert.ok(findWallpaperQueryIssues(monthParams).includes("irrelevant:font"));
	assert.ok(findWallpaperQueryIssues(lyricParams({ font: "comic" })).includes("invalid:font"));
});

test("lyric text layers carry the selected font; other types carry none", () => {
	const now = new Date(2026, 10, 10, 12);
	const brush = parseWallpaperConfig(lyricParams({ font: "brush" }));
	for (const layer of getWallpaperTextLayers(brush, now)) assert.equal(layer.font, "brush");
	const month = parseWallpaperConfig(new URLSearchParams({ type: "month", width: "1179", height: "2556", bg: "#000000", accent: "#ffffff", text: "#ffffff" }));
	for (const layer of getWallpaperTextLayers(month, now)) assert.equal(layer.font, undefined);
	assert.equal(lyricFontName("wenkai"), "LXGW WenKai");
	assert.ok(lyricFontStack("serif").includes("Noto Serif SC"));
	assert.ok(DEFAULT_CONFIG.font === undefined);
});
