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
import { calculateDayLayout, calculateLifeGrid } from "./wallpaper-layout";
import {
	calculateGoalProgress,
	calculateLifeState,
	calculateLifeWeeks,
	calculateMonthProgress,
	calculateYearProgress,
	parseDateOnly,
	toWallClockDate,
} from "./wallpaper-progress";
import {
	getWallpaperCacheSeconds,
	millisecondsUntilNextDay,
	millisecondsUntilNextMinute,
	millisecondsUntilWallpaperUpdate,
} from "./wallpaper-time";
import { getWallpaperTextLayers, renderWallpaperSvg, svgToDataUrl } from "./wallpaper-svg";
import { WallpaperEngine } from "./wallpaper-engine";
import { DEVICE_PRESETS, resolveDevicePresetId } from "./wallpaper-devices";

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

	assert.equal(config.type, "year");
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
			type: "life",
			width: "99999",
			height: "99999",
			lifespan: "500",
			birthDate: "2024-02-30",
			goalName: `  ${"x".repeat(50)}  `,
		})
	);

	assert.ok(config.width * config.height <= 8_388_608);
	assert.ok(Math.abs(config.width / config.height - 4320 / 7680) < 0.001);
	assert.equal(config.lifespan, 120);
	assert.equal(config.birthDate, undefined);
	assert.equal(config.goalName, "x".repeat(40));
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
			type: "year",
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
		...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), "goal", new Date(2026, 6, 17)),
		timeZone: "Asia/Shanghai",
	};
	const path = buildWallpaperImagePath(original);
	const roundTripped = parseWallpaperConfig(new URLSearchParams(path.split("?")[1]));

	assert.match(path, /^\/api\/wallpaper\.png\?/);
	assert.deepEqual(roundTripped, original);
});

test("image paths canonicalize direct UI configuration before publishing", () => {
	const config = {
		...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), "goal", new Date(2026, 6, 17)),
		goalName: "x".repeat(50),
		theme: { bg: "#000000", accent: "#FFFFFF", text: "#FFFFFF" },
	};
	const path = buildWallpaperImagePath(config);
	const searchParams = new URLSearchParams(path.split("?")[1]);
	const roundTripped = parseWallpaperConfig(searchParams);

	assert.deepEqual(findWallpaperQueryIssues(searchParams), []);
	assert.equal(roundTripped.goalName, "x".repeat(40));
	assert.equal(roundTripped.theme.accent, "#ffffff");
});

test("invalid time zones are removed at the public URL boundary", () => {
	assert.equal(parseWallpaperConfig(new URLSearchParams({ timeZone: "Not/AZone" })).timeZone, undefined);
	assert.equal(parseWallpaperConfig(new URLSearchParams({ timeZone: "Asia/Shanghai" })).timeZone, "Asia/Shanghai");
});

test("goal start dates after the target are discarded at the URL boundary", () => {
	const config = parseWallpaperConfig(new URLSearchParams({
		goalStartDate: "2026-07-25",
		targetDate: "2026-07-24",
	}));

	assert.equal(config.goalStartDate, undefined);
	assert.equal(config.targetDate, "2026-07-24");
});

test("PNG requests reject unknown and duplicate cache-busting parameters", () => {
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&nonce=1")), ["unknown:nonce"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&type=day")), ["duplicate:type"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&goalName=cache-bypass")), ["irrelevant:goalName"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&width=NaN")), ["invalid:width"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&bg=%23FFFFFF")), ["noncanonical:bg"]);
	assert.deepEqual(findWallpaperQueryIssues(new URLSearchParams("type=year&width=600")), []);
});

test("every supported wallpaper type renders finite standalone SVG", () => {
	for (const type of ["year", "goal", "month", "week", "minimal", "life", "day"] as const) {
		const config = {
			...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), type, new Date(2026, 6, 17, 15, 30)),
			birthDate: "1990-01-01",
			goalName: "Ship <v1>",
		};
		const svg = renderWallpaperSvg(config, new Date(2026, 6, 20, 15, 30));

		assert.match(svg, /^<svg /);
		assert.match(svg, new RegExp(`width="${config.width}"`));
		assert.match(svg, new RegExp(`height="${config.height}"`));
		assert.doesNotMatch(svg, /NaN|Infinity|<v1>/);
		assert.match(svg, /<\/svg>$/);
	}
});

test("SVG preserves Canvas glow and rounded clock-hand styling", () => {
	const base = parseWallpaperConfig(new URLSearchParams());
	const weekSvg = renderWallpaperSvg({ ...base, type: "week" }, new Date(2026, 6, 20));
	const lifeSvg = renderWallpaperSvg({ ...base, type: "life", birthDate: "1990-01-01" }, new Date(2026, 6, 20));
	const daySvg = renderWallpaperSvg({ ...base, type: "day" }, new Date(2026, 6, 20));

	assert.match(weekSvg, /filter="url\(#current-week-glow\)"/);
	assert.match(lifeSvg, /filter="url\(#current-life-week-glow\)"/);
	assert.match(daySvg, /stroke-linecap="round"/);
});

test("life SVG uses bounded path nodes instead of thousands of circle elements", () => {
	const config = {
		...parseWallpaperConfig(new URLSearchParams({ type: "life", birthDate: "1990-01-01", lifespan: "120" })),
	};
	const svg = renderWallpaperSvg(config, new Date(2026, 6, 18));

	assert.equal((svg.match(/<circle\b/g) || []).length, 0);
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
	for (const type of ["year", "goal", "month", "week", "minimal", "life", "day"] as const) {
		const config = {
			...selectWallpaperType(parseWallpaperConfig(new URLSearchParams()), type, new Date(2026, 6, 17)),
			birthDate: "1990-01-01",
			goalName: "Ship v1",
		};
		const layers = getWallpaperTextLayers(config, now);

		assert.ok(layers.length > 0, `${type} should have visible text`);
		assert.ok(layers.every((layer) => Number.isFinite(layer.x) && Number.isFinite(layer.y) && layer.text.length > 0));
	}
});

test("date-only values preserve their calendar date in the local timezone", () => {
	const date = parseDateOnly("2026-07-17");

	assert.ok(date);
	assert.equal(date.getFullYear(), 2026);
	assert.equal(date.getMonth(), 6);
	assert.equal(date.getDate(), 17);
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

test("Canvas year variants use calendar progress across DST transitions", () => {
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
				arcTo() {}, beginPath() {}, clearRect() {}, closePath() {}, fill() {}, fillRect() {},
				fillText(value) { text.push(value); }, moveTo() {}, setTransform() {},
			};
			const config = { ...parseWallpaperConfig(new URLSearchParams()), type };
			new WallpaperEngine(context, config, new Date(2026, 2, 11, 8, 24)).render();
			return text[0];
		};
		process.stdout.write(JSON.stringify([render("year"), render("minimal")]));
	`;
	const result = spawnSync(process.execPath, ["-e", script], {
		env: { ...process.env, TZ: "America/New_York" },
		encoding: "utf8",
	});

	assert.equal(result.status, 0, result.stderr);
	assert.deepEqual(JSON.parse(result.stdout), ["18%", "18%"]);
});

test("goal progress uses the configured start and target dates", () => {
	const state = calculateGoalProgress("2026-01-01", "2026-01-11", new Date(2026, 0, 6, 12));

	assert.deepEqual(state, { daysLeft: 5, progress: 0.5 });
	assert.deepEqual(calculateGoalProgress(undefined, "2026-01-11", new Date(2026, 0, 6, 12)), {
		daysLeft: 5,
		progress: 0,
	});
});

test("selecting the goal style creates a stable seven-day countdown", () => {
	const config = selectWallpaperType(
		parseWallpaperConfig(new URLSearchParams()),
		"goal",
		new Date(2026, 6, 17, 15, 30)
	);

	assert.equal(config.goalStartDate, "2026-07-17");
	assert.equal(config.targetDate, "2026-07-24");
	assert.match(buildWallpaperPath(config), /goalStartDate=2026-07-17/);
	assert.match(buildWallpaperPath(config), /targetDate=2026-07-24/);
});

test("life progress clamps future births and dates beyond the configured lifespan", () => {
	assert.equal(calculateLifeWeeks("2030-01-01", new Date(2026, 0, 1), 80 * 52), 0);
	assert.equal(calculateLifeWeeks("1900-01-01", new Date(2026, 0, 1), 80 * 52), 80 * 52);
});

test("future births do not mark a current life-calendar week", () => {
	assert.deepEqual(calculateLifeState("2030-01-01", new Date(2026, 0, 1), 80 * 52), {
		hasStarted: false,
		weeksLived: 0,
	});
	assert.deepEqual(calculateLifeState("2026-01-01", new Date(2026, 0, 1), 80 * 52), {
		hasStarted: true,
		weeksLived: 0,
	});
});

test("server rendering uses the requested wall-clock time zone", () => {
	const instant = new Date("2026-07-17T16:30:00.000Z");
	const shanghai = toWallClockDate(instant, "Asia/Shanghai");
	const newYork = toWallClockDate(instant, "America/New_York");

	assert.deepEqual([shanghai.getFullYear(), shanghai.getMonth(), shanghai.getDate(), shanghai.getHours()], [2026, 6, 18, 0]);
	assert.deepEqual([newYork.getFullYear(), newYork.getMonth(), newYork.getDate(), newYork.getHours()], [2026, 6, 17, 12]);
});

test("day wallpapers schedule their next render on the next minute boundary", () => {
	assert.equal(millisecondsUntilNextMinute(new Date("2026-07-17T10:20:00.000Z")), 60_000);
	assert.equal(millisecondsUntilNextMinute(new Date("2026-07-17T10:20:59.750Z")), 250);
});

test("date-based wallpapers schedule their next render at local midnight", () => {
	assert.equal(millisecondsUntilNextDay(new Date(2026, 6, 17, 23, 59, 59, 750)), 250);
	assert.equal(millisecondsUntilNextDay(new Date(2026, 6, 17, 0, 0, 0, 0)), 86_400_000);
});

test("PNG cache lifetime never crosses the next visual update", () => {
	assert.equal(getWallpaperCacheSeconds("day", new Date(2026, 6, 17, 10, 20, 59, 250)), 0);
	assert.equal(getWallpaperCacheSeconds("year", new Date(2026, 6, 17, 23, 59, 30)), 30);
	assert.equal(
		getWallpaperCacheSeconds("year", new Date("2026-03-08T05:00:00.000Z"), "America/New_York"),
		23 * 60 * 60
	);
});

test("Canvas scheduling follows the configured time-zone boundary", () => {
	const instant = new Date("2026-07-18T04:00:00.000Z");
	assert.equal(millisecondsUntilWallpaperUpdate("year", instant, "Asia/Shanghai"), 12 * 60 * 60 * 1000);
	assert.equal(millisecondsUntilWallpaperUpdate("year", instant, "America/New_York"), 24 * 60 * 60 * 1000);
});

test("day wallpaper geometry stays inside portrait and landscape canvases", () => {
	for (const [width, height] of [[1179, 2556], [3840, 2160]] as const) {
		const layout = calculateDayLayout(width, height);

		assert.ok(layout.centerY - layout.radius >= 0);
		assert.ok(layout.centerY + layout.radius <= height);
		assert.ok(layout.timeY + layout.timeFontSize / 2 <= height);
	}
});

test("default life grid reserves canvas space for every week and its stats", () => {
	const layout = calculateLifeGrid(1179, 2556, 80 * 52);

	assert.ok(layout.startX >= 0);
	assert.ok(layout.startY >= 0);
	assert.ok(layout.startX + layout.gridWidth <= 1179);
	assert.ok(layout.startY + layout.gridHeight < layout.statsY);
	assert.ok(layout.statsY <= 2556);
});

test("each canvas render resets inherited drawing state and sets the week glow color", () => {
	let transformReset = false;
	let cleared = false;
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
		beginPath() {},
		clearRect() { cleared = true; },
		fill() {},
		fillRect() {},
		fillText() {},
		setTransform() { transformReset = true; },
	} as unknown as CanvasRenderingContext2D;
	const config = { ...parseWallpaperConfig(new URLSearchParams()), type: "week" as const };

	new WallpaperEngine(context, config, new Date(2026, 6, 18, 12)).render();

	assert.equal(transformReset, true);
	assert.equal(cleared, true);
	assert.equal(context.globalCompositeOperation, "source-over");
	assert.equal(context.lineCap, "butt");
	assert.equal(context.shadowBlur, 0);
	assert.equal(context.shadowColor, config.theme.accent);
});

test("device presets use calibrated dimensions and preserve duplicate-resolution identity", () => {
	const iphone16Pro = DEVICE_PRESETS.find((device) => device.id === "iphone-16-pro");

	assert.deepEqual(iphone16Pro && [iphone16Pro.width, iphone16Pro.height], [1206, 2622]);
	assert.equal(resolveDevicePresetId(1179, 2556, "iphone-16"), "iphone-16");
	assert.equal(resolveDevicePresetId(1179, 2556, "iphone-15"), "iphone-15");
	assert.equal(resolveDevicePresetId(1000, 1000), "custom");
});
