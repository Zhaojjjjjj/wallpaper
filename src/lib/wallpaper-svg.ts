import { WallpaperConfig } from "./types";
import {
	FUTURE_OPACITY,
	TRACK_OPACITY,
	calculateCalendarLayout,
	calculateDayLayout,
	calculateGoalLayout,
	calculateLifeLayout,
	calculateMinimalLayout,
	calculateMonthLayout,
	calculateTodayLayout,
	calculateWeekLayout,
	calculateYearLayout,
} from "./wallpaper-layout";
import { toWallClockDate } from "./wallpaper-progress";

export interface WallpaperTextLayer {
	text: string;
	x: number;
	y: number;
	size: number;
	weight: number;
	opacity: number;
	/** Defaults to the theme text color. */
	color?: string;
	/** Defaults to centered text. */
	align?: "left" | "right";
	/** Letter tracking in px. */
	tracking?: number;
}

const WEEKDAY_LETTERS = ["一", "二", "三", "四", "五", "六", "日"];

function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&apos;",
	})[character] ?? character);
}

export function svgToDataUrl(svg: string): string {
	const bytes = new TextEncoder().encode(svg);
	let binary = "";

	for (let offset = 0; offset < bytes.length; offset += 8192) {
		binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
	}

	return `data:image/svg+xml;base64,${btoa(binary)}`;
}

function textElement(layer: WallpaperTextLayer, defaultColor: string): string {
	const anchor = layer.align === "left" ? "start" : layer.align === "right" ? "end" : "middle";
	const tracking = layer.tracking ? ` letter-spacing="${layer.tracking}"` : "";
	return `<text x="${layer.x}" y="${layer.y}" fill="${layer.color ?? defaultColor}" font-family="Arial, sans-serif" font-size="${layer.size}" font-weight="${layer.weight}" opacity="${layer.opacity}" text-anchor="${anchor}" dominant-baseline="middle"${tracking}>${escapeXml(layer.text)}</text>`;
}

function circlePath(cx: number, cy: number, r: number): string {
	return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0 `;
}

function lineElement(x1: number, y1: number, x2: number, y2: number, color: string, opacity: number, width: number, round = false): string {
	return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-opacity="${opacity}" stroke-width="${width}"${round ? ' stroke-linecap="round"' : ""}/>`;
}

interface Parts {
	layers: WallpaperTextLayer[];
	shapes: string;
}

function eyebrowLayer(text: string, x: number, y: number, size: number, align?: "left" | "right", opacity = 0.55): WallpaperTextLayer {
	return { text, x, y, size, weight: 600, opacity, align, tracking: size * 0.22 };
}

function footerLayers(left: string, right: string, frame: { marginX: number; rightX: number; footerY: number; footerSize: number }): WallpaperTextLayer[] {
	return [
		{ text: left, x: frame.marginX, y: frame.footerY, size: frame.footerSize, weight: 500, opacity: 0.5, align: "left", tracking: frame.footerSize * 0.14 },
		{ text: right, x: frame.rightX, y: frame.footerY, size: frame.footerSize, weight: 500, opacity: 0.5, align: "right", tracking: frame.footerSize * 0.14 },
	];
}

function yearParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateYearLayout(config, now);
	const { accent } = config.theme;
	const frame = layout.frame;
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer(`${layout.year} · 年度进度`, frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left"),
		{ text: `${layout.percent}%`, x: frame.marginX, y: layout.heroY, size: layout.heroSize, weight: 300, opacity: 1, align: "left" },
		{ text: String(layout.daysPassed), x: layout.statsX, y: layout.stat1Y, size: layout.statNumberSize, weight: 300, opacity: 1, align: "left" },
		{ text: "DAYS PASSED · 已度过", x: layout.statsX, y: layout.stat1Y + layout.statNumberSize * 0.62, size: layout.statLabelSize, weight: 500, opacity: 0.5, align: "left", tracking: layout.statLabelSize * 0.14 },
		{ text: String(layout.daysLeft), x: layout.statsX, y: layout.stat2Y, size: layout.statNumberSize, weight: 300, opacity: 1, align: "left" },
		{ text: "DAYS LEFT · 还剩", x: layout.statsX, y: layout.stat2Y + layout.statNumberSize * 0.62, size: layout.statLabelSize, weight: 500, opacity: 0.5, align: "left", tracking: layout.statLabelSize * 0.14 },
		...footerLayers(`DAY ${layout.todayIndex + 1} OF ${layout.totalDays}`, `${layout.year} · ${layout.percent}%`, frame),
	];

	let elapsed = "";
	let future = "";
	for (let i = 0; i < layout.totalDays; i++) {
		const x = layout.gridStartX + (i % 7) * layout.pitch;
		const y = layout.gridTop + Math.floor(i / 7) * layout.pitch;
		if (i < layout.todayIndex) elapsed += circlePath(x, y, layout.dotRadius);
		else if (i > layout.todayIndex) future += circlePath(x, y, layout.dotRadius);
	}
	const todayX = layout.gridStartX + (layout.todayIndex % 7) * layout.pitch;
	const todayY = layout.gridTop + Math.floor(layout.todayIndex / 7) * layout.pitch;
	const shapes =
		`<path d="${elapsed}" fill="${accent}" fill-opacity="0.92"/>` +
		`<path d="${future}" fill="${accent}" fill-opacity="${FUTURE_OPACITY}"/>` +
		`<circle cx="${todayX}" cy="${todayY}" r="${layout.dotRadius}" fill="${accent}"/>` +
		`<circle class="today-ring" cx="${todayX}" cy="${todayY}" r="${layout.dotRadius * 2.1}" fill="none" stroke="${accent}" stroke-width="${Math.max(1.2, layout.pitch * 0.11)}"/>`;
	return { layers, shapes };
}

function monthParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateMonthLayout(config, now);
	const { accent, bg } = config.theme;
	const frame = layout.frame;
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer(`${layout.monthEn} · ${layout.year}`, config.width / 2, frame.eyebrowY, frame.eyebrowSize, undefined, 0.5),
		{ text: layout.monthName, x: config.width / 2, y: layout.titleY, size: layout.titleSize, weight: 600, opacity: 1 },
		...footerLayers(`DAY ${layout.today} OF ${layout.daysInMonth}`, `${layout.daysLeft} DAYS LEFT`, frame),
	];
	for (let col = 0; col < 7; col++) {
		layers.push({ text: WEEKDAY_LETTERS[col], x: layout.startX + col * layout.pitch, y: layout.weekdayY, size: layout.pitch * 0.23, weight: 500, opacity: 0.42 });
	}
	let todayDisc = "";
	for (let day = 1; day <= layout.daysInMonth; day++) {
		const position = layout.firstDayOffset + day - 1;
		const x = layout.startX + (position % 7) * layout.pitch;
		const y = layout.firstRowY + Math.floor(position / 7) * layout.rowPitch;
		if (day === layout.today) {
			todayDisc = `<circle cx="${x}" cy="${y}" r="${layout.discRadius}" fill="${accent}"/>`;
			layers.push({ text: String(day), x, y, size: layout.numberSize, weight: 600, opacity: 1, color: bg });
		} else {
			layers.push({ text: String(day), x, y, size: layout.numberSize, weight: 400, opacity: day < layout.today ? 0.88 : 0.34 });
		}
	}
	const shapes =
		`<rect x="${config.width / 2 - layout.ruleWidth / 2}" y="${layout.ruleY}" width="${layout.ruleWidth}" height="3" fill="${accent}"/>` +
		lineElement(frame.marginX, layout.weekdayY + layout.pitch * 0.34, frame.rightX, layout.weekdayY + layout.pitch * 0.34, accent, TRACK_OPACITY, 1) +
		todayDisc +
		lineElement(frame.marginX, layout.progressY, frame.rightX, layout.progressY, accent, TRACK_OPACITY, 2) +
		lineElement(frame.marginX, layout.progressY, frame.marginX + frame.contentWidth * (layout.today / layout.daysInMonth), layout.progressY, accent, 1, 2);
	return { layers, shapes };
}

function weekParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateWeekLayout(config, now);
	const { accent, bg } = config.theme;
	const frame = layout.frame;
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer(`本周 · 第 ${layout.weekNumber} 周`, frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left"),
		eyebrowLayer(layout.rangeLabel, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.4),
		{ text: `周${WEEKDAY_LETTERS[layout.todayIndex]}`, x: frame.marginX, y: layout.titleY, size: layout.titleSize, weight: 300, opacity: 1, align: "left" },
		{ text: `${layout.percent}%`, x: frame.rightX, y: layout.titleY, size: layout.percentSize, weight: 300, opacity: 0.85, align: "right" },
		...footerLayers(`WEEK ${layout.weekNumber}`, `${layout.todayIndex + 1} OF 7 DAYS`, frame),
	];

	const todayLeft = frame.marginX + layout.todayIndex * layout.colWidth;
	let shapes = `<rect class="today-column" x="${todayLeft + 3}" y="${layout.stripTop}" width="${layout.colWidth - 6}" height="${layout.stripBottom - layout.stripTop}" rx="${Math.min(14, layout.colWidth * 0.16)}" fill="${accent}"/>`;
	for (let i = 0; i < 6; i++) {
		const x = frame.marginX + (i + 1) * layout.colWidth;
		const span = layout.stripBottom - layout.stripTop;
		shapes += lineElement(x, layout.stripTop + span * 0.14, x, layout.stripBottom - span * 0.14, accent, TRACK_OPACITY, 1);
	}
	layout.days.forEach((day, index) => {
		const x = frame.marginX + (index + 0.5) * layout.colWidth;
		const isToday = index === layout.todayIndex;
		const state = isToday ? 1 : index < layout.todayIndex ? 0.85 : 0.38;
		layers.push({ text: WEEKDAY_LETTERS[index], x, y: layout.letterY, size: layout.letterSize, weight: isToday ? 600 : 500, opacity: state, color: isToday ? bg : undefined });
		layers.push({ text: String(day.dayOfMonth), x, y: layout.dateY, size: layout.dateSize, weight: isToday ? 600 : 500, opacity: state, color: isToday ? bg : undefined });
	});
	return { layers, shapes };
}

function todayParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateTodayLayout(config, now);
	const { accent } = config.theme;
	const frame = layout.frame;
	const currentHour = now.getHours();
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer(`今日 · ${layout.dateLabel}`, config.width / 2, frame.eyebrowY, frame.eyebrowSize, undefined, 0.55),
		{ text: layout.timeLabel, x: config.width / 2, y: layout.timeY, size: layout.timeSize, weight: 200, opacity: 1 },
		{ text: `今日已过 ${layout.percent}%`, x: config.width / 2, y: layout.subY, size: layout.subSize, weight: 500, opacity: 0.6, tracking: layout.subSize * 0.1 },
		...footerLayers(layout.fullDateLabel, `还剩约 ${layout.hoursLeft} 小时`, frame),
	];
	let elapsed = "";
	let future = "";
	let current = "";
	for (let hour = 0; hour <= 24; hour++) {
		const x = frame.marginX + (frame.contentWidth / 24) * hour;
		const isCurrent = hour === currentHour;
		const half = isCurrent ? layout.tickCurrent : hour % 6 === 0 ? layout.tickSix : layout.tickBase;
		const segment = `M ${x} ${layout.tickY - half} L ${x} ${layout.tickY + half} `;
		if (isCurrent) current = lineElement(x, layout.tickY - half, x, layout.tickY + half, accent, 1, 3);
		else if (hour < currentHour) elapsed += segment;
		else future += segment;
		if (hour % 6 === 0) {
			layers.push({ text: String(hour), x, y: layout.numbersY, size: layout.numberSize, weight: 500, opacity: 0.45 });
		}
	}
	const shapes =
		`<path d="${elapsed}" stroke="${accent}" stroke-opacity="0.9" stroke-width="2"/>` +
		`<path d="${future}" stroke="${accent}" stroke-opacity="0.18" stroke-width="2"/>` +
		current;
	return { layers, shapes };
}

function goalParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateGoalLayout(config, now);
	const { accent, bg } = config.theme;
	const frame = layout.frame;
	if (!layout.isValid) {
		return { layers: [{ text: "请设置目标日期", x: config.width / 2, y: layout.errorY, size: Math.min(config.width, config.height) / 18, weight: 500, opacity: 0.7 }], shapes: "" };
	}
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer("目标倒计时 · COUNTDOWN", frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left"),
		{ text: layout.goalName, x: frame.marginX, y: layout.nameY, size: layout.nameSize, weight: 600, opacity: 1, align: "left" },
		{ text: String(layout.daysLeft), x: frame.marginX, y: layout.heroY, size: layout.heroSize, weight: 300, opacity: 1, align: "left" },
		{ text: "剩余天数 · DAYS LEFT", x: frame.marginX, y: layout.heroLabelY, size: layout.labelSize, weight: 500, opacity: 0.5, align: "left", tracking: layout.labelSize * 0.14 },
		{ text: layout.startLabel, x: frame.marginX, y: layout.dateLabelY, size: layout.dateSize, weight: 500, opacity: 0.55, align: "left" },
		{ text: layout.targetLabel, x: frame.rightX, y: layout.dateLabelY, size: layout.dateSize, weight: 500, opacity: 0.55, align: "right" },
		...footerLayers(`已完成 ${Math.floor(layout.progress * 100)}%`, `${layout.elapsedDays} / ${layout.totalDays} DAYS`, frame),
	];
	const progressX = frame.marginX + frame.contentWidth * layout.progress;
	let shapes = lineElement(frame.marginX, layout.lineY, frame.rightX, layout.lineY, accent, TRACK_OPACITY, 2);
	if (layout.progress > 0) shapes += lineElement(frame.marginX, layout.lineY, progressX, layout.lineY, accent, 1, 2.5);
	shapes += `<circle cx="${frame.marginX}" cy="${layout.lineY}" r="4" fill="${accent}"/>`;
	shapes += `<circle cx="${frame.rightX}" cy="${layout.lineY}" r="6.5" fill="none" stroke="${accent}" stroke-width="2"/>`;
	if (layout.progress > 0 && layout.progress < 1) {
		shapes += `<circle cx="${progressX}" cy="${layout.lineY}" r="5.5" fill="${accent}" stroke="${bg}" stroke-width="2"/>`;
	}
	return { layers, shapes };
}

function lifeParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateLifeLayout(config, now);
	const { accent } = config.theme;
	const frame = layout.frame;
	if (!layout.isValid) {
		return { layers: [{ text: "请设置出生日期", x: config.width / 2, y: layout.errorY, size: Math.min(config.width, config.height) / 18, weight: 500, opacity: 0.7 }], shapes: "" };
	}
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer("生命日历", frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left"),
		eyebrowLayer("LIFE IN WEEKS", frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.4),
		{ text: `${layout.percent.toFixed(1)}%`, x: frame.marginX, y: layout.heroY, size: layout.heroSize, weight: 300, opacity: 1, align: "left" },
		...footerLayers(`已度过 ${layout.weeksLived.toLocaleString("en-US")} 周`, `共 ${layout.totalWeeks.toLocaleString("en-US")} 周`, frame),
	];
	let elapsed = "";
	let future = "";
	for (let i = 0; i < layout.totalWeeks; i++) {
		const x = layout.gridStartX + (i % layout.cols) * layout.pitch;
		const y = layout.gridTop + Math.floor(i / layout.cols) * layout.rowPitch;
		if (i < layout.currentWeekIndex) elapsed += circlePath(x, y, layout.dotRadius);
		else if (i > layout.currentWeekIndex) future += circlePath(x, y, layout.dotRadius);
	}
	const currentX = layout.gridStartX + (layout.currentWeekIndex % layout.cols) * layout.pitch;
	const currentY = layout.gridTop + Math.floor(layout.currentWeekIndex / layout.cols) * layout.rowPitch;
	const shapes =
		`<path d="${elapsed}" fill="${accent}" fill-opacity="0.92"/>` +
		`<path d="${future}" fill="${accent}" fill-opacity="${FUTURE_OPACITY}"/>` +
		`<circle cx="${currentX}" cy="${currentY}" r="${layout.dotRadius}" fill="${accent}"/>` +
		`<circle class="today-ring" cx="${currentX}" cy="${currentY}" r="${layout.dotRadius * 2.1}" fill="none" stroke="${accent}" stroke-width="${Math.max(1.1, layout.pitch * 0.1)}"/>`;
	return { layers, shapes };
}

function dayParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateDayLayout(config);
	const { accent, text, bg } = config.theme;
	const { centerX, centerY, radius } = layout;
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const seconds = now.getSeconds() + now.getMilliseconds() / 1000;
	const pad = (value: number) => String(value).padStart(2, "0");
	const weekday = WEEKDAY_LETTERS[(now.getDay() + 6) % 7];
	const layers: WallpaperTextLayer[] = [
		{ text: `${pad(hours)}:${pad(minutes)}`, x: centerX, y: layout.digitalY, size: layout.timeSize, weight: 300, opacity: 1 },
		{ text: `${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekday}`, x: centerX, y: layout.dateY, size: layout.dateSize, weight: 500, opacity: 0.55 },
	];
	const point = (angle: number, r: number) => `${centerX + Math.cos(angle) * r} ${centerY + Math.sin(angle) * r}`;
	let shapes = "";
	for (let i = 0; i < 60; i++) {
		const angle = (i / 60) * Math.PI * 2;
		const isHour = i % 5 === 0;
		const [x1, y1] = point(angle, radius - (isHour ? radius * 0.11 : radius * 0.05)).split(" ");
		const [x2, y2] = point(angle, radius).split(" ");
		shapes += lineElement(Number(x1), Number(y1), Number(x2), Number(y2), text, isHour ? 0.9 : 0.25, isHour ? 3 : 1.5);
	}
	const numerals: [string, number][] = [["12", -Math.PI / 2], ["3", 0], ["6", Math.PI / 2], ["9", Math.PI]];
	for (const [label, angle] of numerals) {
		const [x, y] = point(angle, radius * 0.76).split(" ");
		layers.push({ text: label, x: Number(x), y: Number(y), size: layout.numeralSize, weight: 500, opacity: 0.85 });
	}
	const hand = (angle: number, length: number, width: number, color: string, tail = 0) => {
		const [x1, y1] = point(angle + Math.PI, tail).split(" ");
		const [x2, y2] = point(angle, length).split(" ");
		return lineElement(Number(x1), Number(y1), Number(x2), Number(y2), color, 1, width, true);
	};
	shapes += hand(((hours % 12) + minutes / 60) / 12 * Math.PI * 2 - Math.PI / 2, radius * 0.52, radius * 0.048, text);
	shapes += hand((minutes + seconds / 60) / 60 * Math.PI * 2 - Math.PI / 2, radius * 0.78, radius * 0.03, text);
	shapes += hand(seconds / 60 * Math.PI * 2 - Math.PI / 2, radius * 0.86, radius * 0.013, accent, radius * 0.2);
	shapes += `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.038}" fill="${accent}"/><circle cx="${centerX}" cy="${centerY}" r="${radius * 0.016}" fill="${bg}"/>`;
	return { layers, shapes };
}

function minimalParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateMinimalLayout(config, now);
	const { accent } = config.theme;
	const frame = layout.frame;
	const layers: WallpaperTextLayer[] = [
		{ text: String(layout.year), x: frame.marginX, y: frame.eyebrowY, size: Math.min(config.width * 0.034, config.height * 0.022), weight: 600, opacity: 0.9, align: "left", tracking: Math.min(config.width * 0.034, config.height * 0.022) * 0.22 },
		eyebrowLayer(`DAY ${layout.todayIndex + 1} / ${layout.totalDays}`, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.5),
		{ text: `${layout.percent}%`, x: frame.marginX, y: layout.heroY, size: layout.heroSize, weight: 200, opacity: 1, align: "left" },
		{ text: `还剩 ${layout.daysLeft} 天`, x: frame.marginX, y: layout.captionY, size: layout.captionSize, weight: 500, opacity: 0.65, align: "left" },
	];
	const shapes = `<rect x="${frame.marginX}" y="${layout.ruleY}" width="${layout.ruleWidth}" height="${layout.ruleHeight}" fill="${accent}"/>`;
	return { layers, shapes };
}

function calendarParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateCalendarLayout(config, now);
	const { accent, text, bg } = config.theme;
	const frame = layout.frame;
	const layers: WallpaperTextLayer[] = [
		eyebrowLayer(`${layout.monthEn} · ${layout.monthName}`, frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left", 0.6),
		eyebrowLayer(`${String(layout.dayOfYear).padStart(3, "0")} / ${layout.totalDays}`, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.45),
		{ text: String(layout.dayOfMonth), x: frame.marginX - layout.dateSize * 0.03, y: layout.dateY, size: layout.dateSize, weight: 300, opacity: 1, align: "left" },
		{ text: layout.weekdayCn, x: frame.marginX, y: layout.weekdayY, size: layout.weekdaySize, weight: 500, opacity: 0.95, align: "left" },
		{ text: layout.weekdayEn, x: frame.rightX, y: layout.weekdayY, size: layout.weekdaySize * 0.48, weight: 600, opacity: 0.45, align: "right", tracking: layout.weekdaySize * 0.18 },
		{ text: layout.motifName, x: config.width / 2, y: layout.motifCaptionY, size: layout.motifCaptionSize, weight: 500, opacity: 0.5, tracking: layout.motifCaptionSize * 0.5 },
		...layout.quoteLines.map((line, i) => ({ text: line, x: frame.marginX, y: layout.quoteFirstY + i * layout.quoteLineHeight, size: layout.quoteSize, weight: 500, opacity: 0.95, align: "left" as const })),
		{ text: "日", x: layout.sealX + layout.sealSize / 2, y: layout.sealY + layout.sealSize / 2, size: layout.sealSize * 0.58, weight: 700, opacity: 1, color: bg },
		{ text: "ONE PAGE A DAY", x: frame.marginX, y: frame.footerY, size: frame.footerSize, weight: 600, opacity: 0.45, align: "left", tracking: frame.footerSize * 0.22 },
	];
	let shapes = lineElement(frame.marginX, layout.headerRuleY, frame.rightX, layout.headerRuleY, accent, TRACK_OPACITY, 1);
	if (layout.isWeekend) {
		shapes += `<circle cx="${layout.weekendDotX}" cy="${layout.weekendDotY}" r="${Math.max(3, layout.weekdaySize * 0.14)}" fill="${accent}"/>`;
	}
	for (const stroke of layout.motifLines) {
		shapes += `<line x1="${stroke.x1}" y1="${stroke.y1}" x2="${stroke.x2}" y2="${stroke.y2}" stroke="${stroke.accent ? accent : text}" stroke-opacity="0.85" stroke-width="${stroke.width}" stroke-linecap="round"/>`;
	}
	for (const circle of layout.motifCircles) {
		shapes += circle.filled
			? `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${circle.accent ? accent : text}" fill-opacity="0.9"/>`
			: `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${circle.accent ? accent : text}" stroke-opacity="0.85" stroke-width="${circle.width}"/>`;
	}
	shapes += `<rect x="${frame.marginX}" y="${layout.dashY}" width="${layout.dashWidth}" height="${Math.max(3, config.width * 0.006)}" fill="${accent}"/>`;
	shapes += `<rect x="${layout.sealX}" y="${layout.sealY}" width="${layout.sealSize}" height="${layout.sealSize}" fill="${accent}"/>`;
	shapes += lineElement(frame.marginX, layout.footerRuleY, frame.rightX, layout.footerRuleY, accent, TRACK_OPACITY, 1);
	shapes += lineElement(layout.progressX0, frame.footerY, layout.progressX1, frame.footerY, accent, TRACK_OPACITY, 2);
	shapes += `<circle cx="${layout.progressDotX}" cy="${frame.footerY}" r="${Math.max(3, config.width * 0.006)}" fill="${accent}"/>`;
	return { layers, shapes };
}

function partsFor(config: WallpaperConfig, now: Date): Parts {
	switch (config.type) {
		case "year": return yearParts(config, now);
		case "month": return monthParts(config, now);
		case "week": return weekParts(config, now);
		case "today": return todayParts(config, now);
		case "calendar": return calendarParts(config, now);
		case "goal": return goalParts(config, now);
		case "life": return lifeParts(config, now);
		case "day": return dayParts(config, now);
		case "minimal": return minimalParts(config, now);
	}
}

export function getWallpaperTextLayers(config: WallpaperConfig, now = new Date()): WallpaperTextLayer[] {
	return partsFor(config, toWallClockDate(now, config.timeZone)).layers;
}

export function renderWallpaperSvg(config: WallpaperConfig, now = new Date(), includeText = true): string {
	const wallNow = toWallClockDate(now, config.timeZone);
	const { layers, shapes } = partsFor(config, wallNow);
	const text = includeText ? layers.map((layer) => textElement(layer, config.theme.text)).join("") : "";
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}"><rect width="100%" height="100%" fill="${config.theme.bg}"/>${shapes}${text}</svg>`;
}
