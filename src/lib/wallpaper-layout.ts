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
	return lines.slice(0, 3);
}

function calendarMotif(month: number, cx: number, cy: number, u: number): { lines: MotifLine[]; circles: MotifCircle[] } {
	const line = (x1: number, y1: number, x2: number, y2: number, width = 2.5, accent = false): MotifLine => ({ x1: cx + x1 * u, y1: cy + y1 * u, x2: cx + x2 * u, y2: cy + y2 * u, width, accent });
	const circle = (x: number, y: number, r: number, width = 2.5, accent = false, filled = false): MotifCircle => ({ cx: cx + x * u, cy: cy + y * u, r: r * u, width, accent, filled });
	switch (month) {
		case 1: // 寒梅: bare branch with three blossoms, one in vermilion
			return { lines: [line(-0.7, 0.75, 0.55, -0.7, 3), line(0.05, 0.05, 0.75, 0.15, 2)], circles: [circle(-0.28, 0.28, 0.13), circle(0.22, -0.3, 0.16, 2.5, true), circle(0.52, -0.62, 0.11)] };
		case 2: // 春雨: cloud edge and three rain strokes
			return { lines: [line(-0.8, -0.55, 0.8, -0.55, 2.5), line(-0.5, -0.2, -0.62, 0.5, 2), line(0, -0.2, -0.12, 0.62, 2), line(0.5, -0.2, 0.38, 0.5, 2)], circles: [] };
		case 3: // 新芽: stem with two leaves
			return { lines: [line(0, 0.8, 0, -0.5, 3), line(0, -0.1, -0.55, -0.55, 2.5), line(0, -0.3, 0.55, -0.75, 2.5), line(-0.6, 0.8, 0.6, 0.8, 2)], circles: [] };
		case 4: // 落花: petals drifting down
			return { lines: [], circles: [circle(-0.45, -0.6, 0.14), circle(0.05, -0.15, 0.11), circle(0.42, 0.35, 0.14, 2.5, true), circle(-0.1, 0.68, 0.09)] };
		case 5: // 青叶: one leaf, stem and vein
			return { lines: [line(0, 0.85, 0, -0.8, 2.5), line(0, -0.8, -0.55, 0.1, 2.5), line(-0.55, 0.1, 0, 0.85, 2.5), line(0, 0.85, 0.55, 0.1, 2.5), line(0.55, 0.1, 0, -0.8, 2.5)], circles: [] };
		case 6: // 荷风: lotus over a water line
			return { lines: [line(0, -0.75, -0.55, 0.25, 2.5), line(-0.55, 0.25, 0, 0.45, 2.5), line(0, 0.45, 0.55, 0.25, 2.5), line(0.55, 0.25, 0, -0.75, 2.5), line(-0.85, 0.72, 0.85, 0.72, 2)], circles: [] };
		case 7: // 烈日: sun with eight rays
			return {
				lines: Array.from({ length: 8 }, (_, i) => {
					const a = (i / 8) * Math.PI * 2;
					return line(Math.cos(a) * 0.62, Math.sin(a) * 0.62, Math.cos(a) * 0.85, Math.sin(a) * 0.85, 2.5);
				}),
				circles: [circle(0, 0, 0.42, 3)],
			};
		case 8: // 海浪: two scalloped rows as zigzag
			return {
				lines: [
					line(-0.9, -0.15, -0.45, -0.5, 2.5), line(-0.45, -0.5, 0, -0.15, 2.5), line(0, -0.15, 0.45, -0.5, 2.5), line(0.45, -0.5, 0.9, -0.15, 2.5),
					line(-0.68, 0.45, -0.23, 0.1, 2.5), line(-0.23, 0.1, 0.22, 0.45, 2.5), line(0.22, 0.45, 0.67, 0.1, 2.5),
				],
				circles: [],
			};
		case 9: // 秋月: full moon and one accent star
			return { lines: [], circles: [circle(-0.15, 0, 0.55, 3), circle(0.68, -0.5, 0.05, 2, true, true)] };
		case 10: // 柿子: fruit with calyx cross
			return { lines: [line(0, -0.62, 0, -0.85, 3), line(-0.3, -0.55, 0.3, -0.55, 2.5)], circles: [circle(0, 0.15, 0.62, 3)] };
		case 11: // 枯枝: main branch and twigs
			return { lines: [line(-0.08, 0.85, 0.05, -0.8, 3.5), line(0.02, -0.15, 0.7, -0.6, 2.5), line(0, 0.25, -0.68, -0.25, 2.5), line(0.04, -0.42, 0.8, -0.45, 2)], circles: [] };
		default: // 落雪: six-spoke snowflake
			return {
				lines: Array.from({ length: 3 }, (_, i) => {
					const a = (i / 3) * Math.PI;
					return line(-Math.cos(a) * 0.7, -Math.sin(a) * 0.7, Math.cos(a) * 0.7, Math.sin(a) * 0.7, 2.5);
				}),
				circles: [circle(0, 0, 0.1, 2.5)],
			};
	}
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
	const motif = calendarMotif(month + 1, motifCenterX, motifCenterY, width * 0.16);
	const quoteSize = Math.min(width * 0.04, height * 0.026);
	const maxChars = Math.max(8, Math.floor(frame.contentWidth / (quoteSize * 1.04)));
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
