import { WallpaperConfig } from "./types";
import { getDailyQuote } from "./calendar-quotes";
import { getDayOfYearInfo, getMonthInfo } from "./wallpaper-progress";
import { getDailyLyric, type LyricExcerpt } from "./lyrics";
import { getPortrait, transformPath } from "./portraits";

/**
 * Poster system shared by the Canvas engine, the SVG renderer and the PNG
 * text layers. Every style is composed on the same frame: a tracked small
 * eyebrow near the top, one hero element, and a split footer baseline.
 * Elapsed time is the accent at full strength, today wears a ring or a
 * filled marker, and the future sits at low opacity.
 */
export interface PosterFrame {
	marginX: number;
	rightX: number;
	contentWidth: number;
	eyebrowY: number;
	eyebrowSize: number;
	footerY: number;
	footerSize: number;
}

function posterFrame(width: number, height: number): PosterFrame {
	const marginX = width * 0.09;
	return {
		marginX,
		rightX: width - marginX,
		contentWidth: width - marginX * 2,
		eyebrowY: height * 0.148,
		eyebrowSize: Math.min(width * 0.031, height * 0.02),
		footerY: height * 0.888,
		footerSize: Math.min(width * 0.029, height * 0.019),
	};
}

export const FUTURE_OPACITY = 0.22;
export const TRACK_OPACITY = 0.16;

export interface MonthLayout {
	frame: PosterFrame;
	titleY: number;
	titleSize: number;
	ruleY: number;
	ruleWidth: number;
	pitch: number;
	rowPitch: number;
	startX: number;
	weekdayY: number;
	firstRowY: number;
	numberSize: number;
	discRadius: number;
	progressY: number;
	daysInMonth: number;
	firstDayOffset: number;
	today: number;
	percent: number;
	daysLeft: number;
	month: number;
	year: number;
	monthName: string;
	monthEn: string;
}

const MONTH_NAMES = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const MONTH_EN = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

export function calculateMonthLayout(config: WallpaperConfig, now: Date): MonthLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const info = getMonthInfo(now);
	const pitch = frame.contentWidth / 7;
	const rowPitch = pitch * 0.92;
	const firstRowY = height * 0.462;
	return {
		frame,
		titleY: height * 0.248,
		titleSize: width * 0.104,
		ruleY: height * 0.308,
		ruleWidth: width * 0.09,
		pitch,
		rowPitch,
		startX: frame.marginX + pitch / 2,
		weekdayY: height * 0.402,
		firstRowY,
		numberSize: pitch * 0.3,
		discRadius: pitch * 0.4,
		progressY: firstRowY + 5 * rowPitch + pitch * 0.68,
		daysInMonth: info.daysInMonth,
		firstDayOffset: info.firstDayOffset,
		today: info.today,
		percent: Math.floor((info.today / info.daysInMonth) * 100),
		daysLeft: info.daysInMonth - info.today,
		month: now.getMonth() + 1,
		year: now.getFullYear(),
		monthName: MONTH_NAMES[now.getMonth()],
		monthEn: MONTH_EN[now.getMonth()],
	};
}

export interface MinimalLayout {
	frame: PosterFrame;
	heroY: number;
	heroSize: number;
	ruleY: number;
	ruleWidth: number;
	ruleHeight: number;
	captionY: number;
	captionSize: number;
	percent: number;
	daysLeft: number;
	todayIndex: number;
	totalDays: number;
	year: number;
}

export function calculateMinimalLayout(config: WallpaperConfig, now: Date): MinimalLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const { index, total } = getDayOfYearInfo(now);
	return {
		frame,
		heroY: height * 0.462,
		heroSize: width * 0.325,
		ruleY: height * 0.552,
		ruleWidth: width * 0.155,
		ruleHeight: Math.max(3, Math.min(width, height) * 0.006),
		captionY: height * 0.608,
		captionSize: Math.min(width * 0.036, height * 0.023),
		percent: Math.floor((index / total) * 100),
		daysLeft: total - index,
		todayIndex: index,
		totalDays: total,
		year: now.getFullYear(),
	};
}
export interface MotifLine {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	width: number;
	accent?: boolean;
	/** Explicit stroke color; wins over accent/theme. */
	color?: string;
}

export interface MotifCircle {
	cx: number;
	cy: number;
	r: number;
	width: number;
	accent?: boolean;
	filled?: boolean;
	bgFilled?: boolean;
	/** Explicit fill color for filled circles; wins over accent/theme. */
	fill?: string;
	/** Explicit stroke color; wins over accent/theme. */
	color?: string;
	/** Fill/stroke opacity override. */
	opacity?: number;
}

/** A freeform SVG path, drawn identically by SVG and Canvas (Path2D). */
export interface GenPath {
	d: string;
	width: number;
	accent?: boolean;
	filled?: boolean;
	/** Explicit fill color; wins over accent/theme. */
	fill?: string;
	opacity?: number;
}

export interface CalendarLayout {
	frame: PosterFrame;
	headerRuleY: number;
	dateY: number;
	dateSize: number;
	weekdayY: number;
	weekdaySize: number;
	weekendDotX: number;
	weekendDotY: number;
	motifCaptionY: number;
	motifCaptionSize: number;
	motifLines: MotifLine[];
	motifCircles: MotifCircle[];
	dashY: number;
	dashWidth: number;
	quoteSize: number;
	quoteLineHeight: number;
	quoteLines: string[];
	quoteFirstY: number;
	sealX: number;
	sealY: number;
	sealSize: number;
	footerRuleY: number;
	progressX0: number;
	progressX1: number;
	progressDotX: number;
	dayOfYear: number;
	totalDays: number;
	dayOfMonth: number;
	weekdayCn: string;
	weekdayEn: string;
	isWeekend: boolean;
	monthEn: string;
	monthName: string;
	motifName: string;
	quote: string;
}

const WEEKDAY_CN = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const WEEKDAY_EN = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MOTIF_NAMES = ["寒梅", "春雨", "新芽", "落花", "青叶", "荷风", "烈日", "海浪", "秋月", "柿子", "枯枝", "落雪"];

function wrapQuote(quote: string, maxChars: number): string[] {
	const lines: string[] = [];
	let current = "";
	for (const char of quote) {
		if (current.length >= maxChars) {
			// Prefer breaking right after punctuation.
			const punct = Math.max(current.lastIndexOf("，"), current.lastIndexOf("。"), current.lastIndexOf("；"), current.lastIndexOf("、"));
			if (punct >= Math.floor(maxChars * 0.5)) {
				lines.push(current.slice(0, punct + 1));
				current = current.slice(punct + 1) + char;
				continue;
			}
			lines.push(current);
			current = char;
		} else {
			current += char;
		}
	}
	if (current) lines.push(current);
	// Never leave a single orphan character on the last line.
	if (lines.length >= 2 && lines[lines.length - 1].length === 1) {
		const prev = lines[lines.length - 2];
		lines[lines.length - 2] = prev.slice(0, -1);
		lines[lines.length - 1] = prev.slice(-1) + lines[lines.length - 1];
	}
	return lines.slice(0, 3);
}

function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * The month's motif family, generated fresh for each day: a seeded RNG
 * (day of year) drives element counts, positions, angles, mirroring and
 * satellite marks, so no two days share a composition while the family's
 * identity stays recognisable all month.
 */
function calendarMotif(month: number, cx: number, cy: number, u: number, seed: number): { lines: MotifLine[]; circles: MotifCircle[] } {
	const rng = mulberry32(seed * 2654435761 + month * 97 + 13);
	const range = (a: number, b: number) => a + rng() * (b - a);
	const flip = rng() < 0.5 ? -1 : 1;
	const rot = (x: number, y: number, rad: number): [number, number] => [x * Math.cos(rad) - y * Math.sin(rad), x * Math.sin(rad) + y * Math.cos(rad)];
	const line = (x1: number, y1: number, x2: number, y2: number, width = 2.5, accent = false): MotifLine => ({ x1: cx + x1 * flip * u, y1: cy + y1 * u, x2: cx + x2 * flip * u, y2: cy + y2 * u, width, accent });
	const rline = (x1: number, y1: number, x2: number, y2: number, rad: number, width = 2.5, accent = false): MotifLine => {
		const [ax, ay] = rot(x1, y1, rad);
		const [bx, by] = rot(x2, y2, rad);
		return { x1: cx + ax * u, y1: cy + ay * u, x2: cx + bx * u, y2: cy + by * u, width, accent };
	};
	const circle = (x: number, y: number, r: number, width = 2.5, accent = false, filled = false, bgFilled = false): MotifCircle => ({ cx: cx + x * flip * u, cy: cy + y * u, r: r * u, width, accent, filled, bgFilled });
	const lines: MotifLine[] = [];
	const circles: MotifCircle[] = [];

	switch (month) {
		case 1: { // 寒梅: branch bends differently, blossom count/placement daily
			const bend = range(-0.15, 0.15);
			lines.push(line(-0.75, 0.8, bend, 0.05, 3), line(bend, 0.05, 0.6, -0.72, 3), line(bend + 0.05, 0.12, range(0.55, 0.85), range(-0.05, 0.3), 2));
			const blossoms = 3 + Math.floor(rng() * 4);
			for (let i = 0; i < blossoms; i += 1) {
				const t = rng();
				circles.push(circle(-0.75 + (0.6 + 0.75) * t + range(-0.1, 0.1), 0.8 - 1.52 * t + range(-0.12, 0.12), range(0.09, 0.17), 2.5, i === 0));
			}
			break;
		}
		case 2: { // 春雨: stroke count, slant and length all daily
			lines.push(line(-0.85, -0.62, range(-0.2, 0.2), -0.62, 2.5), line(range(0.3, 0.55), -0.62, 0.9, -0.62, 2.5));
			const strokes = 4 + Math.floor(rng() * 5);
			const slant = range(-0.28, 0.05);
			for (let i = 0; i < strokes; i += 1) {
				const x = -0.75 + (1.5 * i) / Math.max(strokes - 1, 1) + range(-0.06, 0.06);
				const len = range(0.35, 0.8);
				lines.push(line(x, -0.3, x + slant * len, -0.3 + len, 2));
			}
			break;
		}
		case 3: { // 新芽: one or two sprouts, leaf angles daily
			const sprout = (ox: number, scale: number) => {
				lines.push(line(ox, 0.8, ox, 0.8 - 1.1 * scale, 3));
				lines.push(line(ox, 0.8 - 0.55 * scale, ox - 0.5 * scale * range(0.8, 1.3), 0.8 - 1.05 * scale, 2.5));
				lines.push(line(ox, 0.8 - 0.8 * scale, ox + 0.5 * scale * range(0.8, 1.3), 0.8 - 1.3 * scale, 2.5));
			};
			if (rng() < 0.5) { sprout(range(-0.15, 0.15), range(0.95, 1.15)); } else { sprout(-0.38, range(0.65, 0.85)); sprout(0.35, range(0.9, 1.1)); }
			lines.push(line(-0.75, 0.8, 0.75, 0.8, 2));
			break;
		}
		case 4: { // 落花: petals scatter along a daily fall path
			const drift = range(-0.4, 0.4);
			const petals = 4 + Math.floor(rng() * 4);
			for (let i = 0; i < petals; i += 1) {
				const t = i / Math.max(petals - 1, 1);
				circles.push(circle(-0.55 + drift * t + range(-0.15, 0.15) + 0.9 * t * (drift >= 0 ? 1 : 0.4), -0.7 + 1.45 * t, range(0.08, 0.16), 2.5, i === petals - 2));
			}
			lines.push(line(-0.7, -0.85, -0.7 + drift * 0.4, -0.45, 2), line(0.55, 0.5, 0.62, 0.85, 2));
			break;
		}
		case 5: { // 青叶: leaf rotates and breathes daily, sometimes a pair
			const leaf = (ox: number, rad: number, scale: number) => {
				lines.push(rline(ox, 0.85, ox, -0.8, rad, 2.5));
				lines.push(rline(ox, -0.8, ox - 0.55, 0.1, rad, 2.5), rline(ox - 0.55, 0.1, ox, 0.85, rad, 2.5));
				lines.push(rline(ox, 0.85, ox + 0.55, 0.1, rad, 2.5), rline(ox + 0.55, 0.1, ox, -0.8, rad, 2.5));
				void scale;
			};
			leaf(0, range(-0.45, 0.45), 1);
			if (rng() < 0.35) leaf(range(-0.75, -0.55), range(-0.7, -0.3), 0.6);
			break;
		}
		case 6: { // 荷风: lotus breath + water rows + optional bud
			const spread = range(0.45, 0.65);
			lines.push(line(0, -0.78, -spread, 0.22, 2.5), line(-spread, 0.22, 0, 0.42, 2.5), line(0, 0.42, spread, 0.22, 2.5), line(spread, 0.22, 0, -0.78, 2.5));
			const rows = 1 + Math.floor(rng() * 3);
			for (let i = 0; i < rows; i += 1) lines.push(line(-0.85 + i * 0.12, 0.66 + i * 0.14, 0.85 - i * 0.12, 0.66 + i * 0.14, 2));
			if (rng() < 0.5) { const bx = range(0.55, 0.8); lines.push(line(bx, 0.35, bx - 0.14, 0.02, 2), line(bx - 0.14, 0.02, bx, -0.18, 2), line(bx, -0.18, bx + 0.14, 0.02, 2), line(bx + 0.14, 0.02, bx, 0.35, 2)); }
			break;
		}
		case 7: { // 烈日: ray count, length and rotation daily
			const rays = 6 + Math.floor(rng() * 7);
			const offset = rng() * Math.PI;
			const r = range(0.34, 0.46);
			for (let i = 0; i < rays; i += 1) {
				const a = offset + (i / rays) * Math.PI * 2;
				const len = range(0.16, 0.34);
				lines.push(line(Math.cos(a) * (r + 0.14), Math.sin(a) * (r + 0.14), Math.cos(a) * (r + 0.14 + len), Math.sin(a) * (r + 0.14 + len), 2.5));
			}
			circles.push(circle(0, 0, r, 3));
			break;
		}
		case 8: { // 海浪: rows, peaks and phase daily
			const rows = 2 + Math.floor(rng() * 2);
			for (let r = 0; r < rows; r += 1) {
				const y = -0.45 + r * 0.42;
				const peaks = 3 + Math.floor(rng() * 2);
				const phase = range(-0.2, 0.2);
				for (let i = 0; i < peaks; i += 1) {
					const x0 = -0.9 + (1.8 * i) / peaks + phase;
					const x1 = -0.9 + (1.8 * (i + 0.5)) / peaks + phase;
					const x2 = -0.9 + (1.8 * (i + 1)) / peaks + phase;
					lines.push(line(x0, y + 0.16, x1, y - 0.18, 2.5), line(x1, y - 0.18, x2, y + 0.16, 2.5));
				}
			}
			break;
		}
		case 9: { // 秋月: the phase follows a ~29.5-day cycle; stars scatter daily
			const phase = ((seed % 295) / 295) * Math.PI * 2;
			const offset = Math.cos(phase) * 0.95;
			circles.push(circle(0, 0, 0.55, 3));
			if (Math.abs(offset) < 0.88) circles.push(circle(offset * 0.55, range(-0.05, 0.05), 0.52, 1, false, true, true));
			const stars = 1 + Math.floor(rng() * 4);
			for (let i = 0; i < stars; i += 1) circles.push(circle(range(0.45, 0.95), range(-0.85, -0.3), range(0.03, 0.06), 2, i === 0, true));
			break;
		}
		case 10: { // 柿子: a cluster of one to three fruits
			const fruits = 1 + Math.floor(rng() * 3);
			const spots: Array<[number, number, number]> = [[0, 0.1, 0.6], [-0.5, 0.42, 0.42], [0.52, 0.38, 0.46]];
			for (let i = 0; i < fruits; i += 1) {
				const [x, y, r] = spots[i];
				circles.push(circle(x, y, r, 3));
				lines.push(line(x, y - r - 0.04, x, y - r - 0.24, 3), line(x - 0.2, y - r + 0.03, x + 0.2, y - r + 0.03, 2.5));
			}
			lines.push(line(-0.85, -0.72, 0.85, -0.72, 2));
			break;
		}
		case 11: { // 枯枝: twig count, attach points and angles daily
			lines.push(line(-0.1, 0.85, -0.02, 0.1, 3.5), line(-0.02, 0.1, 0.06, -0.8, 3.5));
			const twigs = 3 + Math.floor(rng() * 4);
			for (let i = 0; i < twigs; i += 1) {
				const t = rng();
				const y = 0.55 - t * 1.15;
				const side = rng() < 0.5 ? -1 : 1;
				lines.push(line(0, y, side * range(0.35, 0.8), y - range(0.15, 0.5), 2));
			}
			if (rng() < 0.55) circles.push(circle(range(-0.8, 0.8), range(-0.85, -0.4), 0.055, 2, true, true));
			break;
		}
		default: { // 落雪: main flake rotates; satellite flakes drift daily
			const flake = (ox: number, oy: number, scale: number, rad: number) => {
				const axes = 3 + Math.floor(rng() * 2);
				for (let i = 0; i < axes; i += 1) {
					const a = rad + (i / axes) * Math.PI;
					lines.push(rline(ox - Math.cos(a) * 0.68 * scale, oy - Math.sin(a) * 0.68 * scale, ox + Math.cos(a) * 0.68 * scale, oy + Math.sin(a) * 0.68 * scale, 0, 2.5));
				}
				circles.push(circle(ox, oy, 0.09 * scale, 2.5));
			};
			flake(0, 0, range(0.9, 1.1), rng() * Math.PI);
			const sats = 1 + Math.floor(rng() * 3);
			for (let i = 0; i < sats; i += 1) flake(range(-0.95, 0.95), range(-0.9, 0.75), range(0.3, 0.45), rng() * Math.PI);
			break;
		}
	}

	// Satellites: a few quiet marks in seeded slots; count and accent vary daily.
	const sats = Math.floor(rng() * 4);
	for (let i = 0; i < sats; i += 1) {
		const a = rng() * Math.PI * 2;
		const dist = range(1.05, 1.3);
		circles.push(circle(Math.cos(a) * dist, Math.sin(a) * dist * 0.8, range(0.028, 0.05), 2, i === 0 && rng() < 0.5, true));
	}
	return { lines, circles };
}

export function calculateCalendarLayout(config: WallpaperConfig, now: Date): CalendarLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const { index, total } = getDayOfYearInfo(now);
	const quote = getDailyQuote(index);
	const month = now.getMonth();
	const weekdayIndex = (now.getDay() + 6) % 7;
	const motifCenterX = width / 2;
	const motifCenterY = height * 0.572;
	const motif = calendarMotif(month + 1, motifCenterX, motifCenterY, width * 0.16, index);
	const quoteSize = Math.min(width * 0.04, height * 0.026);
	// The seal stamps the quote block's top-right corner; keep lines clear of it.
	const maxChars = Math.max(8, Math.floor((frame.contentWidth - width * 0.062 - width * 0.035) / (quoteSize * 1.04)));
	const quoteLines = wrapQuote(quote, maxChars);
	const sealSize = width * 0.062;
	return {
		frame,
		headerRuleY: height * 0.188,
		dateY: height * 0.298,
		dateSize: width * 0.42,
		weekdayY: height * 0.428,
		weekdaySize: Math.min(width * 0.05, height * 0.032),
		weekendDotX: frame.marginX + Math.min(width * 0.05, height * 0.032) * 3.45,
		weekendDotY: height * 0.428,
		motifCaptionY: height * 0.668,
		motifCaptionSize: Math.min(width * 0.03, height * 0.019),
		motifLines: motif.lines,
		motifCircles: motif.circles,
		dashY: height * 0.742,
		dashWidth: width * 0.075,
		quoteSize,
		quoteLineHeight: quoteSize * 1.8,
		quoteLines,
		quoteFirstY: height * 0.742 + quoteSize * 1.55,
		sealX: frame.rightX - sealSize,
		sealY: height * 0.742 - sealSize * 0.32,
		sealSize,
		footerRuleY: height * 0.862,
		progressX0: frame.rightX - width * 0.3,
		progressX1: frame.rightX,
		progressDotX: frame.rightX - width * 0.3 + width * 0.3 * (total > 1 ? index / (total - 1) : 0),
		dayOfYear: index + 1,
		totalDays: total,
		dayOfMonth: now.getDate(),
		weekdayCn: WEEKDAY_CN[weekdayIndex],
		weekdayEn: WEEKDAY_EN[weekdayIndex],
		isWeekend: weekdayIndex >= 5,
		monthEn: MONTH_EN[month],
		monthName: MONTH_NAMES[month],
		motifName: MOTIF_NAMES[month],
		quote,
	};
}

// ---------------------------------------------------------------------------
// Shared helpers for the daily, date-free styles.
// ---------------------------------------------------------------------------

const r1 = (n: number) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------
// generative — 每日生成: a seeded procedural study, four algorithms in turn.
// ---------------------------------------------------------------------------

export interface GenerativeLayout {
	frame: PosterFrame;
	algoName: string;
	algoEn: string;
	seedLabel: string;
	paths: GenPath[];
	dots: MotifCircle[];
}

const GEN_ALGOS = [
	{ name: "弧线", en: "QUARTER ARCS" },
	{ name: "等高线", en: "CONTOURS" },
	{ name: "点阵", en: "DOT FIELD" },
	{ name: "圆片", en: "QUARTER DISCS" },
];

export function calculateGenerativeLayout(config: WallpaperConfig, now: Date): GenerativeLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const { index } = getDayOfYearInfo(now);
	const epochDays = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
	const rng = mulberry32(epochDays * 2654435761 + 97);
	const range = (a: number, b: number) => a + rng() * (b - a);
	const algoIndex = ((index % 4) + 4) % 4;
	const algo = GEN_ALGOS[algoIndex];
	const seedLabel = ((epochDays * 2654435761) >>> 0) % 0x10000;
	const paths: GenPath[] = [];
	const dots: MotifCircle[] = [];
	const ax0 = frame.marginX;
	const ax1 = frame.rightX;
	const ay0 = height * 0.225;
	const ay1 = height * 0.825;
	const aw = ax1 - ax0;
	const ah = ay1 - ay0;

	if (algoIndex === 0) {
		const cols = 4;
		const cell = aw / cols;
		const rows = Math.max(2, Math.floor(ah / cell));
		const top = ay0 + (ah - rows * cell) / 2;
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				const x = ax0 + col * cell;
				const y = top + row * cell;
				const corner = Math.floor(rng() * 4);
				const rad = cell * 0.5;
				const accent = rng() < 0.12;
				const arcs: Array<[number, number, number, number]> = [
					[x + rad, y, x, y + rad],
					[x + cell, y + rad, x + cell - rad, y],
					[x + cell - rad, y + cell, x + cell, y + cell - rad],
					[x, y + cell - rad, x + rad, y + cell],
				];
				const centers: Array<[number, number]> = [[x, y], [x + cell, y], [x + cell, y + cell], [x, y + cell]];
				const [sx, sy, ex, ey] = arcs[corner];
				void centers;
				paths.push({ d: `M ${r1(sx)} ${r1(sy)} A ${r1(rad)} ${r1(rad)} 0 0 1 ${r1(ex)} ${r1(ey)}`, width: Math.max(1.5, width * 0.0026), accent });
				if (rng() < 0.22) {
					const rad2 = cell * 0.27;
					const off = rad - rad2;
					const [sx2, sy2, ex2, ey2] = arcs[corner];
					const cx0 = centers[corner][0];
					const cy0 = centers[corner][1];
					const shrink = (px: number, py: number) => [cx0 + (px - cx0) * (rad2 / rad) + (px === cx0 ? 0 : 0), cy0 + (py - cy0) * (rad2 / rad)];
					void off;
					const [ax, ay] = shrink(sx2, sy2);
					const [bx, by] = shrink(ex2, ey2);
					paths.push({ d: `M ${r1(ax)} ${r1(ay)} A ${r1(rad2)} ${r1(rad2)} 0 0 1 ${r1(bx)} ${r1(by)}`, width: Math.max(1.5, width * 0.0026), accent });
				}
			}
		}
	} else if (algoIndex === 1) {
		const cx = width / 2 + range(-0.03, 0.03) * width;
		const cy = (ay0 + ay1) / 2;
		const baseR = Math.min(aw, ah) * 0.082;
		const phase1 = rng() * Math.PI * 2;
		const phase2 = rng() * Math.PI * 2;
		const rings = 6;
		for (let i = 1; i <= rings; i += 1) {
			const R = baseR * i * range(0.94, 1.04);
			const points: string[] = [];
			const steps = 30;
			for (let sIdx = 0; sIdx <= steps; sIdx += 1) {
				const theta = (sIdx / steps) * Math.PI * 2;
				const rr = R * (1 + 0.12 * Math.sin(3 * theta + phase1) + 0.06 * Math.sin(6 * theta - phase2));
				points.push(`${sIdx === 0 ? "M" : "L"} ${r1(cx + Math.cos(theta) * rr)} ${r1(cy + Math.sin(theta) * rr * 0.98)}`);
			}
			paths.push({ d: points.join(" ") + " Z", width: Math.max(1.5, width * 0.0024), accent: i === 4 });
		}
		dots.push({ cx, cy, r: Math.max(2.5, width * 0.006), width: 0, filled: true, accent: true, opacity: 1 });
	} else if (algoIndex === 2) {
		const cols = 10;
		const cell = aw / cols;
		const rows = Math.max(3, Math.floor(ah / cell));
		const top = ay0 + (ah - rows * cell) / 2;
		const phase1 = rng() * Math.PI * 2;
		const phase2 = rng() * Math.PI * 2;
		const fx = range(0.6, 1.1);
		const fy = range(0.5, 0.9);
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				const v = 0.5 + 0.5 * Math.sin(col * fx + phase1) * Math.cos(row * fy + phase2);
				const rr = Math.max(cell * 0.05, cell * 0.37 * Math.pow(v, 1.6));
				dots.push({ cx: ax0 + (col + 0.5) * cell, cy: top + (row + 0.5) * cell, r: rr, width: 0, filled: true, accent: v > 0.88, opacity: 0.95 });
			}
		}
	} else {
		const cols = 4;
		const cell = aw / cols;
		const rows = Math.max(2, Math.floor(ah / cell));
		const top = ay0 + (ah - rows * cell) / 2;
		for (let row = 0; row < rows; row += 1) {
			for (let col = 0; col < cols; col += 1) {
				const cx = ax0 + (col + 0.5) * cell;
				const cy = top + (row + 0.5) * cell;
				const rad = cell * 0.46;
				const quad = Math.floor(rng() * 4);
				const accent = rng() < 0.16;
				const ends: Array<[number, number, number, number, number]> = [
					[cx + rad, cy, cx, cy + rad, 1],
					[cx, cy + rad, cx - rad, cy, 1],
					[cx - rad, cy, cx, cy - rad, 1],
					[cx, cy - rad, cx + rad, cy, 1],
				];
				const [sx, sy, ex, ey] = ends[quad];
				paths.push({ d: `M ${r1(cx)} ${r1(cy)} L ${r1(sx)} ${r1(sy)} A ${r1(rad)} ${r1(rad)} 0 0 1 ${r1(ex)} ${r1(ey)} Z`, width: 0, filled: true, accent, opacity: 0.92 });
			}
		}
	}

	return {
		frame,
		algoName: algo.name,
		algoEn: algo.en,
		seedLabel: seedLabel.toString(16).toUpperCase().padStart(4, "0"),
		paths,
		dots,
	};
}

// ---------------------------------------------------------------------------
// lyric — 每日歌词：陈奕迅 / 赵雷 / 周杰伦的歌里，每天随机一段，全周期不重复。
// Poster frame: eyebrow, an accent dash, the passage set large, the song
// credited underneath, artist in the footer.

export interface LyricLayout {
	frame: PosterFrame;
	excerpt: LyricExcerpt;
	portrait: GenPath[];
	heroSize: number;
	firstLineY: number;
	lineGap: number;
	dash: MotifLine;
	creditY: number;
}

function visualLength(line: string): number {
	let total = 0;
	for (const ch of line) total += (ch.codePointAt(0) ?? 0) > 0xff ? 1 : 0.55;
	return total;
}

export function calculateLyricLayout(config: WallpaperConfig, now: Date): LyricLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const excerpt = getDailyLyric(now);
	const longest = Math.max(...excerpt.lines.map(visualLength));
	const cap = Math.min(width * 0.084, height * 0.05);
	const heroSize = Math.min(cap, frame.contentWidth / (longest * 1.02));
	const lineGap = heroSize * 1.62;
	// Portrait on top, then the dash + passage + credit centred as one block
	// in the space that remains underneath it.
	const portraitSize = Math.min(frame.contentWidth * 0.64, height * 0.285);
	const portraitX = frame.marginX;
	const portraitY = height * 0.125;
	const scale = portraitSize / 240;
	const strokeWidth = Math.max(1.6, portraitSize * 0.0142);
	const epochDays = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
	const source = getPortrait(excerpt.artist, epochDays);
	const portrait: GenPath[] = [
		...source.lines.map((d) => ({ d: transformPath(d, scale, portraitX, portraitY), width: strokeWidth })),
		...source.accents.map((d) => ({ d: transformPath(d, scale, portraitX, portraitY), width: strokeWidth, accent: true })),
	];
	const creditSize = frame.footerSize * 1.4;
	const span = heroSize * 1.2 + (excerpt.lines.length - 1) * lineGap + heroSize * 1.45 + creditSize * 0.5;
	const blockCenter = (portraitY + portraitSize + height * 0.955) / 2;
	const firstLineY = blockCenter - span / 2 + heroSize * 1.2;
	const dash: MotifLine = {
		x1: frame.marginX,
		y1: firstLineY - heroSize * 1.2,
		x2: frame.marginX + width * 0.055,
		y2: firstLineY - heroSize * 1.2,
		accent: true,
		width: Math.max(2, heroSize * 0.075),
	};
	const creditY = firstLineY + (excerpt.lines.length - 1) * lineGap + heroSize * 1.45;
	return { frame, excerpt, portrait, heroSize, firstLineY, lineGap, dash, creditY };
}
