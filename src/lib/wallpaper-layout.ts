import { WallpaperConfig } from "./types";
import { getDailyQuote } from "./calendar-quotes";
import {
	calculateGoalProgress,
	calculateLifeState,
	calculateLifeWeeks,
	getDayOfYearInfo,
	getDayProgress,
	getMonthInfo,
	getWeekInfo,
} from "./wallpaper-progress";

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

export interface YearLayout {
	frame: PosterFrame;
	heroY: number;
	heroSize: number;
	gridStartX: number;
	gridTop: number;
	pitch: number;
	dotRadius: number;
	statsX: number;
	statNumberSize: number;
	statLabelSize: number;
	stat1Y: number;
	stat2Y: number;
	percent: number;
	daysPassed: number;
	daysLeft: number;
	todayIndex: number;
	totalDays: number;
	year: number;
}

export function calculateYearLayout(config: WallpaperConfig, now: Date): YearLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const progress = getDayProgressYear(now);
	const { index, total } = getDayOfYearInfo(now);
	const gridTop = height * 0.395;
	const pitch = Math.min(((height * 0.845 - gridTop) / 52) * 1, frame.contentWidth * 0.028);
	return {
		frame,
		heroY: height * 0.265,
		heroSize: width * 0.225,
		gridStartX: frame.marginX,
		gridTop,
		pitch,
		dotRadius: pitch * 0.3,
		statsX: frame.marginX + 7 * pitch + width * 0.075,
		statNumberSize: width * 0.098,
		statLabelSize: Math.min(width * 0.028, height * 0.018),
		stat1Y: height * 0.5,
		stat2Y: height * 0.665,
		percent: Math.floor(progress * 100),
		daysPassed: index,
		daysLeft: total - index,
		todayIndex: index,
		totalDays: total,
		year: now.getFullYear(),
	};
}

function getDayProgressYear(now: Date): number {
	const { index, total } = getDayOfYearInfo(now);
	return total > 0 ? index / total : 0;
}

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

export interface WeekLayout {
	frame: PosterFrame;
	titleY: number;
	titleSize: number;
	percentSize: number;
	stripTop: number;
	stripBottom: number;
	colWidth: number;
	letterY: number;
	dateY: number;
	letterSize: number;
	dateSize: number;
	percent: number;
	todayIndex: number;
	weekNumber: number;
	days: { dayOfMonth: number; month: number }[];
	rangeLabel: string;
}

export function calculateWeekLayout(config: WallpaperConfig, now: Date): WeekLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const info = getWeekInfo(now);
	const first = info.days[0];
	const last = info.days[6];
	return {
		frame,
		titleY: height * 0.272,
		titleSize: width * 0.155,
		percentSize: width * 0.066,
		stripTop: height * 0.398,
		stripBottom: height * 0.568,
		colWidth: frame.contentWidth / 7,
		letterY: height * 0.452,
		dateY: height * 0.524,
		letterSize: Math.min(width * 0.033, height * 0.021),
		dateSize: width * 0.05,
		percent: Math.floor(((info.todayIndex + 1) / 7) * 100),
		todayIndex: info.todayIndex,
		weekNumber: info.weekNumber,
		days: info.days,
		rangeLabel: `${first.month}.${String(first.dayOfMonth).padStart(2, "0")} — ${last.month}.${String(last.dayOfMonth).padStart(2, "0")}`,
	};
}

export interface TodayLayout {
	frame: PosterFrame;
	timeY: number;
	timeSize: number;
	subY: number;
	subSize: number;
	tickY: number;
	tickBase: number;
	tickSix: number;
	tickCurrent: number;
	numbersY: number;
	numberSize: number;
	percent: number;
	hoursLeft: number;
	timeLabel: string;
	dateLabel: string;
	fullDateLabel: string;
}

export function calculateTodayLayout(config: WallpaperConfig, now: Date): TodayLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const progress = getDayProgress(now);
	const pad = (value: number) => String(value).padStart(2, "0");
	return {
		frame,
		timeY: height * 0.302,
		timeSize: width * 0.2,
		subY: height * 0.378,
		subSize: Math.min(width * 0.033, height * 0.021),
		tickY: height * 0.525,
		tickBase: height * 0.02,
		tickSix: height * 0.031,
		tickCurrent: height * 0.044,
		numbersY: height * 0.578,
		numberSize: Math.min(width * 0.026, height * 0.017),
		percent: Math.floor(progress * 100),
		hoursLeft: Math.max(0, Math.ceil(24 - (now.getHours() + now.getMinutes() / 60))),
		timeLabel: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
		dateLabel: `${now.getMonth() + 1}月${now.getDate()}日`,
		fullDateLabel: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`,
	};
}

export interface GoalLayout {
	frame: PosterFrame;
	nameY: number;
	nameSize: number;
	heroY: number;
	heroSize: number;
	heroLabelY: number;
	labelSize: number;
	lineY: number;
	dateLabelY: number;
	dateSize: number;
	errorY: number;
	isValid: boolean;
	goalName: string;
	daysLeft: number;
	progress: number;
	elapsedDays: number;
	totalDays: number;
	startLabel: string;
	targetLabel: string;
}

function formatDotDate(value: string | undefined): string {
	if (!value) return "";
	const parts = value.split("-");
	return parts.length === 3 ? `${parts[0]}.${parts[1]}.${parts[2]}` : value;
}

export function calculateGoalLayout(config: WallpaperConfig, now: Date): GoalLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const result = calculateGoalProgress(config.goalStartDate, config.targetDate, now);
	return {
		frame,
		nameY: height * 0.222,
		nameSize: width * 0.066,
		heroY: height * 0.368,
		heroSize: width * 0.29,
		heroLabelY: height * 0.442,
		labelSize: Math.min(width * 0.028, height * 0.018),
		lineY: height * 0.578,
		dateLabelY: height * 0.618,
		dateSize: Math.min(width * 0.03, height * 0.019),
		errorY: height * 0.5,
		isValid: result !== null,
		goalName: config.goalName?.trim() || "我的目标",
		daysLeft: result?.daysLeft ?? 0,
		progress: result?.progress ?? 0,
		elapsedDays: result?.elapsedDays ?? 0,
		totalDays: result?.totalDays ?? 0,
		startLabel: formatDotDate(config.goalStartDate),
		targetLabel: formatDotDate(config.targetDate),
	};
}

export interface LifeLayout {
	frame: PosterFrame;
	heroY: number;
	heroSize: number;
	gridStartX: number;
	gridTop: number;
	pitch: number;
	rowPitch: number;
	dotRadius: number;
	cols: number;
	rows: number;
	errorY: number;
	isValid: boolean;
	percent: number;
	weeksLived: number;
	totalWeeks: number;
	currentWeekIndex: number;
}

export function calculateLifeLayout(config: WallpaperConfig, now: Date): LifeLayout {
	const { width, height } = config;
	const frame = posterFrame(width, height);
	const lifespan = config.lifespan ?? 80;
	const totalWeeks = lifespan * 52;
	const state = calculateLifeState(config.birthDate, now, totalWeeks);
	const weeksLived = calculateLifeWeeks(config.birthDate, now, totalWeeks);
	const cols = 52;
	const rows = Math.ceil(totalWeeks / cols);
	const gridTop = height * 0.318;
	const pitch = frame.contentWidth / (cols - 1);
	const rowPitch = Math.min(pitch, (height * 0.828 - gridTop) / Math.max(1, rows - 1));
	return {
		frame,
		heroY: height * 0.232,
		heroSize: width * 0.148,
		gridStartX: frame.marginX,
		gridTop,
		pitch,
		rowPitch,
		dotRadius: Math.min(pitch, rowPitch) * 0.3,
		cols,
		rows,
		errorY: height * 0.5,
		isValid: state.hasStarted,
		percent: totalWeeks > 0 ? (weeksLived / totalWeeks) * 100 : 0,
		weeksLived,
		totalWeeks,
		currentWeekIndex: weeksLived,
	};
}

export interface DayLayout {
	centerX: number;
	centerY: number;
	radius: number;
	numeralSize: number;
	digitalY: number;
	timeSize: number;
	dateY: number;
	dateSize: number;
}

export function calculateDayLayout(config: WallpaperConfig): DayLayout {
	const { width, height } = config;
	const shortSide = Math.min(width, height);
	const radius = shortSide * 0.335;
	const centerY = height * 0.432;
	return {
		centerX: width / 2,
		centerY,
		radius,
		numeralSize: radius * 0.17,
		digitalY: centerY + radius + height * 0.088,
		timeSize: width * 0.082,
		dateY: centerY + radius + height * 0.142,
		dateSize: Math.min(width * 0.032, height * 0.02),
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
}

export interface MotifCircle {
	cx: number;
	cy: number;
	r: number;
	width: number;
	accent?: boolean;
	filled?: boolean;
	bgFilled?: boolean;
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
