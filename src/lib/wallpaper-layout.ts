import { getDayOfYearInfo, getMonthInfo } from "./wallpaper-progress";

/**
 * Shared geometry for every wallpaper style.
 *
 * The Canvas engine, the standalone SVG renderer and the PNG text layers all
 * read their positions from this module, so the three render paths cannot
 * drift apart. Design language: elapsed = accent at full strength, today =
 * accent with a ring, future = accent at TRACK_OPACITY; text follows the
 * type scale below with generous negative space.
 */
export const TRACK_OPACITY = 0.14;

export interface DayLayout {
	centerX: number;
	centerY: number;
	radius: number;
	timeY: number;
	timeFontSize: number;
	dateY: number;
}

export interface LifeGridLayout {
	cols: number;
	rows: number;
	cellSize: number;
	gap: number;
	gridWidth: number;
	gridHeight: number;
	startX: number;
	startY: number;
	headerY: number;
	statsY: number;
}

export interface YearLayout {
	cols: number;
	rows: number;
	pitch: number;
	dotRadius: number;
	startX: number;
	firstRowY: number;
	dayIndex: number;
	daysInYear: number;
	eyebrowY: number;
	percentY: number;
	percentSize: number;
	ruleY: number;
	captionY: number;
}

export interface MonthLayout {
	cols: number;
	rows: number;
	pitch: number;
	startX: number;
	firstRowY: number;
	weekdayY: number;
	numberSize: number;
	today: number;
	daysInMonth: number;
	firstDayOffset: number;
	titleY: number;
	subtitleY: number;
	titleSize: number;
	lineX: number;
	lineWidth: number;
	lineY: number;
	captionY: number;
}

export interface WeekLayout {
	pitch: number;
	startX: number;
	circleY: number;
	circleRadius: number;
	letterY: number;
	letterSize: number;
	eyebrowY: number;
	titleY: number;
	titleSize: number;
	todayIndex: number; // 0 = Monday
}

export interface GoalLayout {
	centerX: number;
	centerY: number;
	radius: number;
	strokeWidth: number;
	nameY: number;
	numberY: number;
	labelY: number;
	datesY: number;
	percentY: number;
}

export interface TodayLayout {
	eyebrowY: number;
	percentY: number;
	percentSize: number;
	ticksY: number;
	tickStartX: number;
	tickEndX: number;
	tickWidth: number;
	tickBaseHeight: number;
	tickTallHeight: number;
	captionY: number;
	hoursElapsed: number;
}

export interface MinimalLayout {
	marginX: number;
	eyebrowY: number;
	percentY: number;
	percentSize: number;
	ruleY: number;
	ruleWidth: number;
	ruleHeight: number;
	captionY: number;
}

export function calculateDayLayout(width: number, height: number): DayLayout {
	const shortSide = Math.min(width, height);
	const radius = shortSide * 0.3;
	const centerY = height * 0.44;
	const timeFontSize = shortSide / 14;
	const timeY = centerY + radius + shortSide * 0.07;

	return {
		centerX: width / 2,
		centerY,
		radius,
		timeY,
		timeFontSize,
		dateY: timeY + timeFontSize * 1.1,
	};
}

export function calculateLifeGrid(width: number, height: number, totalCells: number): LifeGridLayout {
	const cols = 52;
	const rows = Math.max(1, Math.ceil(totalCells / cols));
	const gapRatio = 0.2;
	const horizontalPadding = width * 0.06;
	const gridTop = height * 0.16;
	const gridBottom = height * 0.845;
	const availableWidth = width - horizontalPadding * 2;
	const availableHeight = gridBottom - gridTop;
	const widthUnits = cols + (cols - 1) * gapRatio;
	const heightUnits = rows + (rows - 1) * gapRatio;
	const cellSize = Math.min(availableWidth / widthUnits, availableHeight / heightUnits);
	const gap = cellSize * gapRatio;
	const gridWidth = cols * cellSize + (cols - 1) * gap;
	const gridHeight = rows * cellSize + (rows - 1) * gap;

	return {
		cols,
		rows,
		cellSize,
		gap,
		gridWidth,
		gridHeight,
		startX: (width - gridWidth) / 2,
		startY: gridTop + (availableHeight - gridHeight) / 2,
		headerY: height * 0.1,
		statsY: height * 0.905,
	};
}

export function calculateYearLayout(width: number, height: number, now: Date): YearLayout {
	const { index, total } = getDayOfYearInfo(now);
	const cols = 53;
	const rows = 7;
	const pitch = (width * 0.86) / cols;
	const gridWidth = cols * pitch;
	const firstRowY = height * 0.445;

	return {
		cols,
		rows,
		pitch,
		dotRadius: pitch * 0.3,
		startX: (width - gridWidth) / 2 + pitch / 2,
		firstRowY,
		dayIndex: index,
		daysInYear: total,
		eyebrowY: height * 0.278,
		percentY: height * 0.345,
		percentSize: Math.min(width, height) * 0.17,
		ruleY: height * 0.408,
		captionY: firstRowY + (rows - 1) * pitch + height * 0.052,
	};
}

export function calculateMonthLayout(width: number, height: number, now: Date): MonthLayout {
	const info = getMonthInfo(now);
	const cols = 7;
	const rows = Math.ceil((info.firstDayOffset + info.daysInMonth) / cols);
	const pitch = (width * 0.8) / cols;
	const gridWidth = cols * pitch;
	const startX = (width - gridWidth) / 2 + pitch / 2;
	const firstRowY = height * 0.452;

	return {
		cols,
		rows,
		pitch,
		startX,
		firstRowY,
		weekdayY: firstRowY - pitch * 0.68,
		numberSize: pitch * 0.32,
		today: info.today,
		daysInMonth: info.daysInMonth,
		firstDayOffset: info.firstDayOffset,
		titleY: height * 0.3,
		subtitleY: height * 0.352,
		titleSize: Math.min(width, height) * 0.115,
		lineX: startX - pitch / 2,
		lineWidth: gridWidth,
		lineY: firstRowY + (rows - 1) * pitch + pitch * 0.72,
		captionY: firstRowY + (rows - 1) * pitch + pitch * 0.72 + height * 0.042,
	};
}

export function calculateWeekLayout(width: number, height: number, now: Date): WeekLayout {
	const pitch = (width * 0.84) / 7;
	const gridWidth = 7 * pitch;

	return {
		pitch,
		startX: (width - gridWidth) / 2 + pitch / 2,
		circleY: height * 0.55,
		circleRadius: pitch * 0.3,
		letterY: height * 0.55 + pitch * 0.3 + height * 0.04,
		letterSize: Math.min(width, height) / 21,
		eyebrowY: height * 0.378,
		titleY: height * 0.445,
		titleSize: Math.min(width, height) * 0.105,
		todayIndex: (now.getDay() + 6) % 7,
	};
}

export function calculateGoalLayout(width: number, height: number): GoalLayout {
	const shortSide = Math.min(width, height);
	const radius = shortSide / 5.2;
	const centerY = height * 0.52;

	return {
		centerX: width / 2,
		centerY,
		radius,
		strokeWidth: radius * 0.055,
		nameY: height * 0.315,
		numberY: centerY - radius * 0.08,
		labelY: centerY + radius * 0.52,
		datesY: height * 0.685,
		percentY: height * 0.728,
	};
}

export function calculateTodayLayout(width: number, height: number, now: Date): TodayLayout {
	const shortSide = Math.min(width, height);

	return {
		eyebrowY: height * 0.332,
		percentY: height * 0.415,
		percentSize: shortSide * 0.17,
		ticksY: height * 0.545,
		tickStartX: width * 0.1,
		tickEndX: width * 0.9,
		tickWidth: Math.max(2, shortSide * 0.005),
		tickBaseHeight: shortSide * 0.05,
		tickTallHeight: shortSide * 0.09,
		captionY: height * 0.64,
		hoursElapsed: now.getHours(),
	};
}

export function calculateMinimalLayout(width: number, height: number): MinimalLayout {
	return {
		marginX: width * 0.1,
		eyebrowY: height * 0.432,
		percentY: height * 0.505,
		percentSize: width * 0.315,
		ruleY: height * 0.605,
		ruleWidth: width * 0.26,
		ruleHeight: Math.max(2, Math.min(width, height) * 0.007),
		captionY: height * 0.652,
	};
}
