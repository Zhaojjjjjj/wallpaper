import { WallpaperConfig } from "./types";
import { calculateDayLayout, calculateLifeGrid } from "./wallpaper-layout";
import {
	calculateGoalProgress,
	calculateLifeState,
	calculateLifeWeeks,
	calculateMonthProgress,
	calculateYearProgress,
	formatDateOnly,
} from "./wallpaper-progress";

export interface WallpaperTextLayer {
	text: string;
	x: number;
	y: number;
	size: number;
	weight: number;
	opacity: number;
}

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

function textElement(text: string, x: number, y: number, size: number, color: string, weight = 400, opacity = 1): string {
	return `<text x="${x}" y="${y}" fill="${color}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" opacity="${opacity}" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>`;
}

export function getWallpaperTextLayers(config: WallpaperConfig, now = new Date()): WallpaperTextLayer[] {
	const shortSide = Math.min(config.width, config.height);

	switch (config.type) {
		case "year": {
			const rows = 10;
			const cellSize = shortSide / 28;
			const gap = cellSize * 0.25;
			const gridHeight = rows * cellSize + (rows - 1) * gap;
			const startY = (config.height - gridHeight) / 2 - config.height * 0.05;
			const textY = startY + gridHeight + config.height * 0.12;
			return [
				{ text: `${Math.floor(calculateYearProgress(now) * 100)}%`, x: config.width / 2, y: textY, size: shortSide / 10, weight: 700, opacity: 1 },
				{ text: String(now.getFullYear()), x: config.width / 2, y: textY + config.height * 0.08, size: shortSide / 22, weight: 500, opacity: 0.6 },
			];
		}
		case "goal": {
			const fallbackTarget = new Date(now);
			fallbackTarget.setDate(fallbackTarget.getDate() + 7);
			const state = calculateGoalProgress(config.goalStartDate, config.targetDate || formatDateOnly(fallbackTarget), now);
			if (!state) return [{ text: "Invalid target date", x: config.width / 2, y: config.height / 2, size: 40, weight: 400, opacity: 1 }];
			const radius = shortSide / 6;
			return [
				{ text: String(state.daysLeft), x: config.width / 2, y: config.height / 2 - radius * 0.1, size: radius * 0.9, weight: 700, opacity: 1 },
				{ text: "剩余天数", x: config.width / 2, y: config.height / 2 + radius * 0.5, size: radius * 0.18, weight: 500, opacity: 0.7 },
				{ text: config.goalName || "我的目标", x: config.width / 2, y: config.height * 0.68, size: Math.min(config.width * 0.06, 60), weight: 600, opacity: 1 },
			];
		}
		case "month": {
			const progress = calculateMonthProgress(now);
			const y = config.height / 2;
			return [
				{ text: `${Math.floor(progress * 100)}%`, x: config.width / 2, y: y - config.height * 0.08, size: Math.min(config.width * 0.12, 100), weight: 700, opacity: 1 },
				{ text: now.toLocaleString("zh-CN", { month: "long" }), x: config.width / 2, y: y + config.height * 0.1, size: Math.min(config.width * 0.06, 50), weight: 500, opacity: 0.7 },
			];
		}
		case "week": {
			const dotSize = Math.min(config.width / 12, config.height / 20);
			return [{ text: "本周", x: config.width / 2, y: config.height / 2 + dotSize + config.height * 0.06, size: Math.min(config.width * 0.06, 50), weight: 500, opacity: 0.8 }];
		}
		case "minimal":
			return [
				{ text: `${Math.floor(calculateYearProgress(now) * 100)}%`, x: config.width / 2, y: config.height * 0.48, size: config.width * 0.3, weight: 800, opacity: 1 },
				{ text: String(now.getFullYear()), x: config.width / 2, y: config.height * 0.62, size: Math.min(config.width * 0.06, 60), weight: 300, opacity: 0.5 },
			];
		case "life": {
			if (!config.birthDate) return [{ text: "Please set birth date", x: config.width / 2, y: config.height / 2, size: 40, weight: 400, opacity: 1 }];
			const lifespanWeeks = Math.min(120, Math.max(1, config.lifespan || 80)) * 52;
			const weeksLived = calculateLifeWeeks(config.birthDate, now, lifespanWeeks);
			const layout = calculateLifeGrid(config.width, config.height, lifespanWeeks);
			return [{ text: `${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} Weeks`, x: config.width / 2, y: layout.statsY, size: shortSide / 40, weight: 500, opacity: 0.6 }];
		}
		case "day": {
			const layout = calculateDayLayout(config.width, config.height);
			return [{ text: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, x: layout.centerX, y: layout.timeY, size: layout.timeFontSize, weight: 700, opacity: 1 }];
		}
	}
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number, fill: string, opacity = 1): string {
	return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" opacity="${opacity}"/>`;
}

function glowFilter(id: string, blur: number): string {
	return `<defs><filter id="${id}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${blur}" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
}

function renderYear(config: WallpaperConfig, now: Date): string {
	const cols = 13;
	const rows = 10;
	const cellSize = Math.min(config.width, config.height) / 28;
	const gap = cellSize * 0.25;
	const gridWidth = cols * cellSize + (cols - 1) * gap;
	const gridHeight = rows * cellSize + (rows - 1) * gap;
	const startX = (config.width - gridWidth) / 2;
	const startY = (config.height - gridHeight) / 2 - config.height * 0.05;
	const progress = calculateYearProgress(now);
	const filledCount = Math.floor(progress * cols * rows);
	const cells: string[] = [];

	for (let index = 0; index < cols * rows; index++) {
		const row = Math.floor(index / cols);
		const col = index % cols;
		cells.push(roundedRect(
			startX + col * (cellSize + gap),
			startY + row * (cellSize + gap),
			cellSize,
			cellSize,
			cellSize * 0.2,
			config.theme.accent,
			index < filledCount ? 1 : 0.2
		));
	}

	return cells.join("");
}

function renderGoal(config: WallpaperConfig, now: Date): string {
	const fallbackTarget = new Date(now);
	fallbackTarget.setDate(fallbackTarget.getDate() + 7);
	const state = calculateGoalProgress(config.goalStartDate, config.targetDate || formatDateOnly(fallbackTarget), now);
	if (!state) return textElement("Invalid target date", config.width / 2, config.height / 2, 40, config.theme.text);

	const centerX = config.width / 2;
	const centerY = config.height / 2;
	const radius = Math.min(config.width, config.height) / 6;
	const strokeWidth = radius * 0.08;
	const circumference = Math.PI * 2 * radius;
	const progressLength = circumference * state.progress;

	return `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${config.theme.accent}" stroke-width="${strokeWidth}" opacity="0.2"/>`
		+ `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="${config.theme.accent}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-dasharray="${progressLength} ${circumference}" transform="rotate(-90 ${centerX} ${centerY})"/>`;
}

function renderMonth(config: WallpaperConfig, now: Date): string {
	const progress = calculateMonthProgress(now);
	const barWidth = config.width * 0.75;
	const barHeight = Math.min(config.height * 0.025, 50);
	const x = (config.width - barWidth) / 2;
	const y = config.height / 2;

	return roundedRect(x, y, barWidth, barHeight, barHeight / 2, config.theme.accent, 0.2)
		+ roundedRect(x, y, barWidth * progress, barHeight, barHeight / 2, config.theme.accent);
}

function renderWeek(config: WallpaperConfig, now: Date): string {
	const day = now.getDay() || 7;
	const dotSize = Math.min(config.width / 12, config.height / 20);
	const gap = dotSize * 0.6;
	const totalWidth = 7 * dotSize + 6 * gap;
	const startX = (config.width - totalWidth) / 2;
	const centerY = config.height / 2;
	const dots = Array.from({ length: 7 }, (_, index) => {
		const position = index + 1;
		const filter = position === day ? ` filter="url(#current-week-glow)"` : "";
		return `<circle cx="${startX + index * (dotSize + gap) + dotSize / 2}" cy="${centerY}" r="${dotSize / 2.2}" fill="${config.theme.accent}" opacity="${position <= day ? 1 : 0.2}"${filter}/>`;
	}).join("");

	return glowFilter("current-week-glow", dotSize * 0.15) + dots;
}

function renderMinimal(): string {
	return "";
}

function renderLife(config: WallpaperConfig, now: Date): string {
	if (!config.birthDate) return "";

	const lifespanWeeks = Math.min(120, Math.max(1, config.lifespan || 80)) * 52;
	const lifeState = calculateLifeState(config.birthDate, now, lifespanWeeks);
	const weeksLived = lifeState.weeksLived;
	const layout = calculateLifeGrid(config.width, config.height, lifespanWeeks);
	const activePaths: string[] = [];
	const inactivePaths: string[] = [];
	const radius = layout.cellSize / 2.5;
	let currentWeek: { x: number; y: number } | undefined;

	for (let index = 0; index < lifespanWeeks; index++) {
		const row = Math.floor(index / layout.cols);
		const col = index % layout.cols;
		const x = layout.startX + col * (layout.cellSize + layout.gap) + layout.cellSize / 2;
		const y = layout.startY + row * (layout.cellSize + layout.gap) + layout.cellSize / 2;
		const active = index < weeksLived || (lifeState.hasStarted && index === weeksLived);
		const circlePath = `M${x - radius} ${y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
		(active ? activePaths : inactivePaths).push(circlePath);
		if (lifeState.hasStarted && index === weeksLived) currentWeek = { x, y };
	}

	return (currentWeek ? glowFilter("current-life-week-glow", layout.cellSize * 0.15) : "")
		+ (activePaths.length > 0 ? `<path d="${activePaths.join("")}" fill="${config.theme.accent}"/>` : "")
		+ (inactivePaths.length > 0 ? `<path d="${inactivePaths.join("")}" fill="${config.theme.accent}" opacity="0.15"/>` : "")
		+ (currentWeek ? `<ellipse cx="${currentWeek.x}" cy="${currentWeek.y}" rx="${radius}" ry="${radius}" fill="${config.theme.accent}" filter="url(#current-life-week-glow)"/>` : "");
}

function renderDay(config: WallpaperConfig, now: Date): string {
	const layout = calculateDayLayout(config.width, config.height);
	const hourAngle = ((now.getHours() % 12) + now.getMinutes() / 60) * Math.PI / 6;
	const minuteAngle = now.getMinutes() * Math.PI / 30;
	const hand = (angle: number, length: number, width: number) => {
		const x = layout.centerX + Math.sin(angle) * length;
		const y = layout.centerY - Math.cos(angle) * length;
		return `<line x1="${layout.centerX}" y1="${layout.centerY}" x2="${x}" y2="${y}" stroke="${config.theme.accent}" stroke-width="${width}" stroke-linecap="round"/>`;
	};

	return `<circle cx="${layout.centerX}" cy="${layout.centerY}" r="${layout.radius}" fill="none" stroke="${config.theme.accent}" stroke-width="4" opacity="0.3"/>`
		+ hand(hourAngle, layout.radius * 0.5, Math.max(4, layout.radius * 0.025))
		+ hand(minuteAngle, layout.radius * 0.8, Math.max(2, layout.radius * 0.0125));
}

export function renderWallpaperSvg(config: WallpaperConfig, now = new Date(), includeText = true): string {
	const rawContent = {
		year: renderYear,
		goal: renderGoal,
		month: renderMonth,
		week: renderWeek,
		minimal: renderMinimal,
		life: renderLife,
		day: renderDay,
	}[config.type](config, now);
	const shapes = rawContent.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, "");
	const text = includeText
		? getWallpaperTextLayers(config, now).map((layer) => textElement(layer.text, layer.x, layer.y, layer.size, config.theme.text, layer.weight, layer.opacity)).join("")
		: "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}"><rect width="100%" height="100%" fill="${config.theme.bg}"/>${shapes}${text}</svg>`;
}
