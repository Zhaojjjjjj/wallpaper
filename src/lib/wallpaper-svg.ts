import { WallpaperConfig } from "./types";
import {
	TRACK_OPACITY,
	calculateCalendarLayout,
				calculateGenerativeLayout,
	calculateLyricLayout,
		calculateMinimalLayout,
	calculateMonthLayout,
			} from "./wallpaper-layout";
import type { MotifCircle, MotifLine } from "./wallpaper-layout";
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

function motifLineElement(stroke: MotifLine, accent: string, text: string): string {
	return `<line x1="${stroke.x1}" y1="${stroke.y1}" x2="${stroke.x2}" y2="${stroke.y2}" stroke="${stroke.color ?? (stroke.accent ? accent : text)}" stroke-opacity="0.85" stroke-width="${stroke.width}" stroke-linecap="round"/>`;
}

function motifCircleElement(circle: MotifCircle, accent: string, text: string, bg: string): string {
	if (circle.bgFilled) return `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${bg}"/>`;
	if (circle.filled) return `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${circle.fill ?? (circle.accent ? accent : text)}" fill-opacity="${circle.opacity ?? 0.9}"/>`;
	return `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="${circle.color ?? (circle.accent ? accent : text)}" stroke-opacity="${circle.opacity ?? 0.85}" stroke-width="${circle.width}"/>`;
}

function pathElement(d: string, fill: string | null, opacity: number, stroke?: string, width?: number): string {
	return fill !== null
		? `<path d="${d}" fill="${fill}" fill-opacity="${opacity}"/>`
		: `<path d="${d}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
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
	for (const stroke of layout.motifLines) shapes += motifLineElement(stroke, accent, text);
	for (const circle of layout.motifCircles) shapes += motifCircleElement(circle, accent, text, bg);
	shapes += `<rect x="${frame.marginX}" y="${layout.dashY}" width="${layout.dashWidth}" height="${Math.max(3, config.width * 0.006)}" fill="${accent}"/>`;
	shapes += `<rect x="${layout.sealX}" y="${layout.sealY}" width="${layout.sealSize}" height="${layout.sealSize}" fill="${accent}"/>`;
	shapes += lineElement(frame.marginX, layout.footerRuleY, frame.rightX, layout.footerRuleY, accent, TRACK_OPACITY, 1);
	shapes += lineElement(layout.progressX0, frame.footerY, layout.progressX1, frame.footerY, accent, TRACK_OPACITY, 2);
	shapes += `<circle cx="${layout.progressDotX}" cy="${frame.footerY}" r="${Math.max(3, config.width * 0.006)}" fill="${accent}"/>`;
	return { layers, shapes };
}


function generativeParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateGenerativeLayout(config, now);
	const { accent, text, bg } = config.theme;
	const frame = layout.frame;
	// No text at all: the study stands on its own, without eyebrow or footer.
	const layers: WallpaperTextLayer[] = [];
	let shapes = "";
	for (const path of layout.paths) {
		shapes += path.filled
			? pathElement(path.d, path.fill ?? (path.accent ? accent : text), path.opacity ?? 0.92)
			: pathElement(path.d, null, path.opacity ?? 0.9, path.accent ? accent : text, path.width);
	}
	for (const dot of layout.dots) shapes += motifCircleElement(dot, accent, text, bg);
	return { layers, shapes };
}

function lyricParts(config: WallpaperConfig, now: Date): Parts {
	const layout = calculateLyricLayout(config, now);
	const { accent } = config.theme;
	const frame = layout.frame;
	const { excerpt } = layout;
	// No eyebrow, no footer: the passage and its credit stand alone.
	const layers: WallpaperTextLayer[] = [];
	excerpt.lines.forEach((line, i) => {
		layers.push({ text: line, x: frame.marginX, y: layout.firstLineY + i * layout.lineGap, size: layout.heroSize, weight: 500, opacity: 1, align: "left" });
	});
	layers.push({ text: `《${excerpt.song}》`, x: frame.marginX, y: layout.creditY, size: frame.footerSize * 1.4, weight: 500, opacity: 0.72, align: "left" });
	const dash = layout.dash;
	const shapes = lineElement(dash.x1, dash.y1, dash.x2, dash.y2, accent, 1, dash.width ?? 3, true);
	return { layers, shapes };
}

function partsFor(config: WallpaperConfig, now: Date): Parts {
	switch (config.type) {
		case "month": return monthParts(config, now);
		case "calendar": return calendarParts(config, now);
		case "minimal": return minimalParts(config, now);
		case "generative": return generativeParts(config, now);
		case "lyric": return lyricParts(config, now);
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
