import assert from "node:assert/strict";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
	buildWallpaperPath,
	buildWallpaperImagePath,
	finalizeWallpaperIntegerDraft,
	findWallpaperQueryIssues,
	normalizeWallpaperInteger,
	parseWallpaperIntegerDraft,
	parseWallpaperConfig,
	resolveWallpaperNumberDraft,
	selectWallpaperType,
} from "./wallpaper-config";
import {
	calculateMonthProgress,
	calculateYearProgress,
	toWallClockDate,
} from "./wallpaper-progress";
import {
	getWallpaperCacheSeconds,
	millisecondsUntilNextDay,
	millisecondsUntilWallpaperUpdate,
} from "./wallpaper-time";
import { getWallpaperTextLayers, renderWallpaperSvg, svgToDataUrl } from "./wallpaper-svg";
import { WallpaperEngine } from "./wallpaper-engine";
import { DEVICE_PRESETS, getDeviceCategory, resolveDevicePresetId } from "./wallpaper-devices";

test("invalid public parameters fall back to safe wallpaper defaults", () => {
	const config = parseWallpaperConfig(
		new URLSearchParams({
			type: "not-a-style",
			width: "NaN",
			height: "0",
			bg: "red",
			accent: "#12",
			text: "javascript:alert(1)",
		})
	);

	assert.equal(config.type, "calendar");
	assert.equal(config.width, 1179);
	assert.equal(config.height, 320);
	assert.deepEqual(config.theme, {
		bg: "#000000",
		accent: "#ffffff",
		text: "#ffffff",
	});
});

test("numeric and text parameters are bounded before rendering", () => {
	const config = parseWallpaperConfig(
		new URLSearchParams({
			type: "month",
			width: "99999",
			height: "99999",
		})
	);

	assert.ok(config.width * config.height <= 8_388_608);
	assert.ok(Math.abs(config.width / config.height - 4320 / 7680) < 0.001);
});

test("temporary empty form values keep the previous valid number", () => {
	assert.equal(normalizeWallpaperInteger("", 320, 4320, 1179), 1179);
	assert.equal(normalizeWallpaperInteger("5000", 320, 4320, 1179), 4320);
});

test("number fields preserve partial drafts until they form a valid integer", () => {
	assert.equal(parseWallpaperIntegerDraft("", 320, 4320), undefined);
	assert.equal(parseWallpaperIntegerDraft("1", 320, 4320), undefined);
	assert.equal(parseWallpaperIntegerDraft("120", 320, 4320), undefined);
	assert.equal(parseWallpaperIntegerDraft("1207", 320, 4320), 1207);
	assert.equal(parseWallpaperIntegerDraft("5000", 320, 4320), undefined);
});

test("number inputs preserve the active draft while parent configuration updates", () => {
	assert.equal(resolveWallpaperNumberDraft(1207, "1207", true), "1207");
	assert.equal(resolveWallpaperNumberDraft(1290, "1207", false), "1290");
});

test("blurring an already-applied number draft does not normalize dimensions twice", () => {
	assert.equal(finalizeWallpaperIntegerDraft("4320", 320, 4320, 3765), 3765);
	assert.equal(finalizeWallpaperIntegerDraft("120", 320, 4320, 1179), 320);
	assert.equal(finalizeWallpaperIntegerDraft("", 320, 4320, 1179), 1179);
});

test("wallpaper paths round-trip normalized configuration", () => {
	const original = parseWallpaperConfig(
		new URLSearchParams({
			type: "goal",
			width: "1290",
			height: "2796",
			bg: "#101820",
			accent: "#FEE715",
			text: "#ffffff",
			targetDate: "2027-01-31",
			goalStartDate: "2027-01-01",
			goalName: "Ship v1",
		})
	);

	const path = buildWallpaperPath(original);
	const roundTripped = parseWallpaperConfig(new URLSearchParams(path.split("?")[1]));

	assert.deepEqual(roundTripped, original);
});

test("wallpaper paths omit parameters that cannot affect the selected type", () => {
	const config = {
		...parseWallpaperConfig(new URLSearchParams({
			type: "month",
			birthDate: "1990-01-01",
			lifespan: "80",
			goalName: "ignored",
			targetDate: "2027-01-31",
		})),
	};
	const path = buildWallpaperImagePath(config);

	assert.doesNotMatch(path, /birthDate|lifespan|goalName|targetDate/);
});

test("image paths round-trip normalized configuration", () => {
	const original = {
		...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), "month"),
		timeZone: "Asia/Shanghai",
	};
	const path = buildWallpaperImagePath(original);
	const roundTripped = parseWallpaperConfig(new URLSearchParams(path.split("?")[1]));

	assert.match(path, /^\/api\/wallpaper\.png\?/);
	assert.deepEqual(roundTripped, original);
});

test("image paths canonicalize direct UI configuration before publishing", () => {
	const config = {
		...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), "calendar"),
		theme: { bg: "#000000", accent: "#FFFFFF", text: "#FFFFFF" },
	};
	const path = buildWallpaperImagePath(config);
	const searchParams = new URLSearchParams(path.split("?")[1]);
	const roundTripped = parseWallpaperConfig(searchParams);

	assert.deepEqual(findWallpaperQueryIssues(searchParams), []);
	assert.equal(roundTripped.theme.accent, "#ffffff");
});

test("invalid time zones are removed at the public URL boundary", () => {
	assert.equal(parseWallpaperConfig(new URLSearchParams({ timeZone: "Not/AZone" })).timeZone, undefined);
	assert.equal(parseWallpaperConfig(new URLSearchParams({ timeZone: "Asia/Shanghai" })).timeZone, "Asia/Shanghai");
});

test("PNG requests reject unknown and duplicate cache-busting parameters", () => {
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&nonce=1")), ["unknown:nonce"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&type=minimal")), ["duplicate:type"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&goalName=cache-bypass")), ["unknown:goalName"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&width=NaN")), ["invalid:width"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&bg=%23FFFFFF")), ["noncanonical:bg"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=month&width=600")), []);
});

test("every supported wallpaper type renders finite standalone SVG", () => {
	for (const type of ["month", "calendar", "minimal"] as const) {
		const config = selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), type);
		const svg = renderWallpaperSvg(config, new Date(2026, 6, 20, 15, 30));

		assert.match(svg, /^<svg /);
		assert.match(svg, new RegExp(`width="${config.width}"`));
		assert.match(svg, new RegExp(`height="${config.height}"`));
		assert.doesNotMatch(svg, /NaN|Infinity/);
		assert.match(svg, /<\/svg>$/);
	}
});

test("SVG preserves the calendar seal and motif line styling", () => {
	const base = parseWallpaperConfig(new URLSearchParams());
	const calendarSvg = renderWallpaperSvg({ ...base, type: "calendar" }, new Date(2026, 6, 20));
	const monthSvg = renderWallpaperSvg({ ...base, type: "month" }, new Date(2026, 6, 20));

	assert.match(calendarSvg, />日</);
	assert.match(calendarSvg, /stroke-linecap="round"/);
	assert.doesNotMatch(calendarSvg, /<filter/);
	assert.doesNotMatch(monthSvg, /<filter/);
});
test("calendar SVG uses bounded nodes for its daily motif", () => {
	const config = parseWallpaperConfig(new URLSearchParams({ type: "calendar" }));
	const svg = renderWallpaperSvg(config, new Date(2026, 6, 18));

	assert.ok((svg.match(/<circle\b/g) || []).length <= 40, "motif circles stay bounded");
	assert.ok((svg.match(/<path\b/g) || []).length <= 2);
});
test("SVG data URLs preserve non-ASCII wallpaper text", () => {
	const dataUrl = svgToDataUrl('<svg xmlns="http://www.w3.org/2000/svg"><text>剩余天数</text></svg>');
	const decoded = Buffer.from(dataUrl.split(",")[1], "base64").toString("utf8");

	assert.match(dataUrl, /^data:image\/svg\+xml;base64,/);
	assert.match(decoded, /剩余天数/);
});

test("PNG text layers cover every wallpaper type", () => {
	const now = new Date(2026, 6, 20, 15, 30);
	for (const type of ["month", "calendar", "minimal"] as const) {
		const config = selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), type);
		const layers = getWallpaperTextLayers(config, now);

		assert.ok(layers.length > 0, `${type} should have visible text`);
		assert.ok(layers.every((layer) => Number.isFinite(layer.x) && Number.isFinite(layer.y) && layer.text.length > 0));
	}
});

test("date-based progress advances only at the daily refresh boundary", () => {
	assert.equal(calculateYearProgress(new Date(2026, 0, 1, 23, 59, 59)), 0);
	assert.equal(calculateMonthProgress(new Date(2026, 6, 1, 23, 59, 59)), 0);
	assert.ok(calculateMonthProgress(new Date(2026, 6, 31, 12, 0, 0)) < 1);
});

test("year and month progress are invariant across host DST time zones", () => {
	const modulePath = path.join(__dirname, "wallpaper-progress.js");
	const script = `const p=require(${JSON.stringify(modulePath)});const d=new Date(2026,2,11,8,24,0);process.stdout.write(JSON.stringify([p.calculateYearProgress(d),p.calculateMonthProgress(d)]));`;
	const run = (timeZone: string) => spawnSync(process.execPath, ["-e", script], {
		env: { ...process.env, TZ: timeZone },
		encoding: "utf8",
	});
	const utc = run("UTC");
	const newYork = run("America/New_York");

	assert.equal(utc.status, 0, utc.stderr);
	assert.equal(newYork.status, 0, newYork.stderr);
	assert.equal(newYork.stdout, utc.stdout);
});

test("Canvas minimal uses calendar progress across DST transitions", () => {
	const enginePath = path.join(__dirname, "wallpaper-engine.js");
	const configPath = path.join(__dirname, "wallpaper-config.js");
	const script = `
		const { WallpaperEngine } = require(${JSON.stringify(enginePath)});
		const { parseWallpaperConfig } = require(${JSON.stringify(configPath)});
		const render = (type) => {
			const text = [];
			const context = {
				fillStyle: "", font: "", globalAlpha: 1, globalCompositeOperation: "source-over",
				lineCap: "butt", lineJoin: "miter", shadowBlur: 0, shadowColor: "transparent",
				textAlign: "center", textBaseline: "middle",
				arc() {}, arcTo() {},
		roundRect() {}, beginPath() {}, clearRect() {}, closePath() {}, fill() {}, fillRect() {},
				fillText(value) { text.push(value); }, lineTo() {}, moveTo() {}, restore() {}, rotate() {}, save() {}, setTransform() {}, stroke() {}, translate() {},
			};
			const config = { ...parseWallpaperConfig(new URLSearchParams()), type };
			new WallpaperEngine(context, config, new Date(2026, 2, 11, 8, 24)).render();
			return text.find((value) => value.endsWith("%"));
		};
		process.stdout.write(JSON.stringify([render("minimal")]));
	`;
	const result = spawnSync(process.execPath, ["-e", script], {
		env: { ...process.env, TZ: "America/New_York" },
		encoding: "utf8",
	});

	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(JSON.parse(result.stdout), ["18%"]);
});

test("server rendering uses the requested wall-clock time zone", () => {
	const instant = new Date("2026-07-17T16:30:00.000Z");
	const shanghai = toWallClockDate(instant, "Asia/Shanghai");
	const newYork = toWallClockDate(instant, "America/New_York");

	assert.deepEqual([shanghai.getFullYear(), shanghai.getMonth(), shanghai.getDate(), shanghai.getHours()], [2026, 6, 18, 0]);
	assert.deepEqual([newYork.getFullYear(), newYork.getMonth(), newYork.getDate(), newYork.getHours()], [2026, 6, 17, 12]);
});

test("date-based wallpapers schedule their next render at local midnight", () => {
	assert.equal(millisecondsUntilNextDay(new Date(2026, 6, 17, 23, 59, 59, 750)), 250);
	assert.equal(millisecondsUntilNextDay(new Date(2026, 6, 17, 0, 0, 0, 0)), 86_400_000);
});

test("PNG cache lifetime never crosses the next visual update", () => {
	assert.equal(getWallpaperCacheSeconds(new Date(2026, 6, 17, 23, 59, 30)), 30);
	assert.equal(
		getWallpaperCacheSeconds(new Date("2026-03-08T05:00:00.000Z"), "America/New_York"),
		23 * 60 * 60
	);
});

test("Canvas scheduling follows the configured time-zone boundary", () => {
	const instant = new Date("2026-07-18T04:00:00.000Z");
	assert.equal(millisecondsUntilWallpaperUpdate(instant, "Asia/Shanghai"), 12 * 60 * 60 * 1000);
	assert.equal(millisecondsUntilWallpaperUpdate(instant, "America/New_York"), 24 * 60 * 60 * 1000);
});

test("each canvas render resets inherited drawing state and leaves no glow state", () => {
	let transformReset = false;
	let cleared = false;
	const savedStates: Record<string, unknown>[] = [];
	const context = {
		fillStyle: "magenta",
		font: "",
		globalAlpha: 0.4,
		globalCompositeOperation: "multiply",
		lineCap: "round",
		lineJoin: "round",
		lineWidth: 99,
		shadowBlur: 99,
		shadowColor: "magenta",
		strokeStyle: "magenta",
		textAlign: "start",
		textBaseline: "alphabetic",
		arc() {},
		arcTo() {},
		roundRect() {},
		beginPath() {},
		closePath() {},
		lineTo() {},
		moveTo() {},
		restore() {
			const state = savedStates.pop();
			if (state) Object.assign(context, state);
		},
		rotate() {},
		save() {
			savedStates.push({
				fillStyle: context.fillStyle,
				font: context.font,
				globalAlpha: context.globalAlpha,
				globalCompositeOperation: context.globalCompositeOperation,
				lineCap: context.lineCap,
				lineJoin: context.lineJoin,
				lineWidth: context.lineWidth,
				shadowBlur: context.shadowBlur,
				shadowColor: context.shadowColor,
				strokeStyle: context.strokeStyle,
				textAlign: context.textAlign,
				textBaseline: context.textBaseline,
			});
		},
		stroke() {},
		translate() {},
		clearRect() { cleared = true; },
		fill() {},
		fillRect() {},
		fillText() {},
		setTransform() { transformReset = true; },
	} as unknown as CanvasRenderingContext2D;
	const config = { ...parseWallpaperConfig(new URLSearchParams()), type: "calendar" as const };

	new WallpaperEngine(context, config, new Date(2026, 6, 18, 12)).render();

	assert.equal(transformReset, true);
	assert.equal(cleared, true);
	assert.equal(context.globalCompositeOperation, "source-over");
	assert.equal(context.lineCap, "butt");
	assert.equal(context.shadowBlur, 0);
	assert.equal(context.shadowColor, "transparent");
});

test("device presets include the iPhone 18 range and iPhone Duo", () => {
	const byId = new Map(DEVICE_PRESETS.map((device) => [device.id, device]));

	assert.deepEqual(byId.get("iphone-18-pro-max"), { id: "iphone-18-pro-max", name: "iPhone 18 Pro Max", width: 1320, height: 2868 });
	assert.deepEqual(byId.get("iphone-18-pro"), { id: "iphone-18-pro", name: "iPhone 18 Pro", width: 1206, height: 2622 });
	assert.deepEqual(byId.get("iphone-duo-unfolded"), { id: "iphone-duo-unfolded", name: "iPhone Duo（展开）", width: 1878, height: 2670 });
	assert.deepEqual(byId.get("iphone-duo-cover"), { id: "iphone-duo-cover", name: "iPhone Duo（外屏）", width: 1398, height: 2034 });
	assert.deepEqual(byId.get("iphone-air"), { id: "iphone-air", name: "iPhone Air", width: 1260, height: 2736 });
	assert.equal(getDeviceCategory("iphone-duo-unfolded"), "iphone");
});

test("device presets use calibrated dimensions and preserve duplicate-resolution identity", () => {
	const iphone16Pro = DEVICE_PRESETS.find((device) => device.id === "iphone-16-pro");

	assert.deepEqual(iphone16Pro && [iphone16Pro.width, iphone16Pro.height], [1206, 2622]);
	assert.equal(resolveDevicePresetId(1179, 2556, "iphone-16"), "iphone-16");
	assert.equal(resolveDevicePresetId(1179, 2556, "iphone-15"), "iphone-15");
	assert.equal(resolveDevicePresetId(1000, 1000), "custom");
});

import { calculateGenerativeLayout } from "./wallpaper-layout";

const sampleTheme = { bg: "#000000", accent: "#FFFFFF", text: "#FFFFFF" };

test("generative study is deterministic per day and rotates algorithms", () => {
	const make = (date: Date) => calculateGenerativeLayout({ type: "generative", width: 1179, height: 2556, theme: sampleTheme }, date);
	const a = make(new Date(2026, 10, 9, 12));
	const b = make(new Date(2026, 10, 9, 18));
	assert.deepEqual(a.paths.map((p) => p.d), b.paths.map((p) => p.d));
	assert.equal(a.seedLabel, b.seedLabel);
	const algos = new Set([0, 1, 2, 3].map((offset) => make(new Date(2026, 10, 9 + offset, 12)).algoEn));
	assert.equal(algos.size, 4);
	for (const path of a.paths) assert.ok(!path.d.includes("NaN"), path.d);
});


import { getDailyLyric, LYRICS } from "./lyrics";

test("daily lyric is deterministic within a day and changes the next day", () => {
	const day = new Date(2026, 10, 10, 8, 0, 0);
	const sameDay = new Date(2026, 10, 10, 23, 59, 0);
	const nextDay = new Date(2026, 10, 11, 0, 1, 0);
	assert.equal(getDailyLyric(day), getDailyLyric(sameDay));
	assert.notEqual(getDailyLyric(day), getDailyLyric(nextDay));
});

test("lyric cycle covers every passage exactly once, artists are the three named", () => {
	assert.deepEqual([...new Set(LYRICS.map((l) => l.artist))].sort(), ["周杰伦", "赵雷", "陈奕迅"].sort());
	const seen = new Set<string>();
	// Align the window to a shuffle-cycle boundary (epochDay % count === 0).
	const start = new Date(2026, 0, 1);
	while (Math.floor(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()) / 86400000) % LYRICS.length !== 0) {
		start.setDate(start.getDate() + 1);
	}
	for (let i = 0; i < LYRICS.length; i += 1) {
		const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
		const lyric = getDailyLyric(d);
		seen.add(`${lyric.artist}|${lyric.song}|${lyric.lines.join("/")}`);
	}
	assert.equal(seen.size, LYRICS.length);
	// The day after a full cycle must not repeat the cycle's last passage.
	const lastDay = new Date(start.getFullYear(), start.getMonth(), start.getDate() + LYRICS.length - 1);
	const after = new Date(start.getFullYear(), start.getMonth(), start.getDate() + LYRICS.length);
	assert.notEqual(getDailyLyric(after), getDailyLyric(lastDay));
});

import { calculateLyricLayout } from "./wallpaper-layout";
import { DEFAULT_CONFIG } from "./types";

test("lyric layout carries the day's singer portrait, distinct per artist", () => {
	const byArtist = new Map<string, string>();
	const start = new Date(2026, 0, 1);
	for (let i = 0; i < LYRICS.length && byArtist.size < 3; i += 1) {
		const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
		const layout = calculateLyricLayout({ ...DEFAULT_CONFIG, type: "lyric", width: 1179, height: 2556 }, d);
		assert.ok(layout.portrait.length >= 5);
		byArtist.set(layout.excerpt.artist, layout.portrait.map((p) => p.d).join("|"));
	}
	assert.equal(byArtist.size, 3);
	assert.equal(new Set(byArtist.values()).size, 3);
});

import { PORTRAITS } from "./portraits";

test("each singer has three portrait styles and the layout rotates through them", () => {
	for (const artist of ["周杰伦", "陈奕迅", "赵雷"]) assert.equal(PORTRAITS[artist].length, 3);
	const seen = new Map<string, Set<string>>();
	const start = new Date(2026, 0, 1);
	for (let i = 0; i < LYRICS.length; i += 1) {
		const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
		const layout = calculateLyricLayout({ ...DEFAULT_CONFIG, type: "lyric", width: 1179, height: 2556 }, d);
		if (!seen.has(layout.excerpt.artist)) seen.set(layout.excerpt.artist, new Set());
		seen.get(layout.excerpt.artist)!.add(layout.portrait.map((p) => p.d).join("|"));
	}
	for (const artist of ["周杰伦", "陈奕迅", "赵雷"]) assert.ok((seen.get(artist)?.size ?? 0) >= 2, artist);
});
