import { WallpaperConfig } from "./types";
import {
	TRACK_OPACITY,
	calculateDayLayout,
	calculateGoalLayout,
	calculateLifeGrid,
	calculateMinimalLayout,
	calculateMonthLayout,
	calculateTodayLayout,
	calculateWeekLayout,
	calculateYearLayout,
} from "./wallpaper-layout";
import {
	calculateGoalProgress,
	calculateLifeState,
	calculateLifeWeeks,
	calculateYearProgress,
	formatDateOnly,
	getDayOfYearInfo,
	getDayProgress,
} from "./wallpaper-progress";

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
	align?: "left";
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
	const anchor = layer.align === "left" ? "start" : "middle";
	return `<text x="${layer.x}" y="${layer.y}" fill="${layer.color ?? defaultColor}" font-family="Arial, sans-serif" font-size="${layer.size}" font-weight="${layer.weight}" opacity="${layer.opacity}" text-anchor="${anchor}" dominant-baseline="middle">${escapeXml(layer.text)}</text>`;
}

export function getWallpaperTextLayers(config: WallpaperConfig, now = new Date()): WallpaperTextLayer[] {
	const shortSide = Math.min(config.width, config.height);
	const centerX = config.width / 2;

	switch (config.type) {
		case "year": {
			const layout = calculateYearLayout(config.width, config.height, now);
			const daysLeft = layout.daysInYear - layout.dayIndex - 1;
			return [
				{ text: String(now.getFullYear()), x: centerX, y: layout.eyebrowY, size: shortSide / 24, weight: 600, opacity: 0.55 },
				{ text: `${Math.floor(calculateYearProgress(now) * 100)}%`, x: centerX, y: layout.percentY, size: layout.percentSize, weight: 800, opacity: 1 },
				{ text: `DAY ${layout.dayIndex + 1} OF ${layout.daysInYear} · ${daysLeft} LEFT`, x: centerX, y: layout.captionY, size: shortSide / 26, weight: 500, opacity: 0.5 },
			];
		}
		case "goal": {
			const fallbackTarget = new Date(now);
			fallbackTarget.setDate(fallbackTarget.getDate() + 7);
			const targetDateStr = config.targetDate || formatDateOnly(fallbackTarget);
			const state = calculateGoalProgress(config.goalStartDate, targetDateStr, now);
			if (!state) return [{ text: "Invalid target date", x: centerX, y: config.height / 2, size: 40, weight: 400, opacity: 1 }];
			const layout = calculateGoalLayout(config.width, config.height);
			const targetLabel = targetDateStr.replaceAll("-", ".");
			const datesText = config.goalStartDate
				? `${config.goalStartDate.replaceAll("-", ".")} → ${targetLabel}`
				: `目标日期 ${targetLabel}`;
			return [
				{ text: config.goalName || "我的目标", x: centerX, y: layout.nameY, size: shortSide * 0.052, weight: 600, opacity: 0.9 },
				{ text: String(state.daysLeft), x: centerX, y: layout.numberY, size: layout.radius * 0.85, weight: 800, opacity: 1 },
				{ text: "剩余天数", x: centerX, y: layout.labelY, size: layout.radius * 0.17, weight: 500, opacity: 0.6 },
				{ text: datesText, x: centerX, y: layout.datesY, size: shortSide / 25, weight: 500, opacity: 0.55 },
				{ text: `已完成 ${Math.floor(state.progress * 100)}%`, x: centerX, y: layout.percentY, size: shortSide / 25, weight: 600, opacity: 0.75 },
			];
		}
		case "month": {
			const layout = calculateMonthLayout(config.width, config.height, now);
			const layers: WallpaperTextLayer[] = [
				{ text: now.toLocaleString("zh-CN", { month: "long" }), x: centerX, y: layout.titleY, size: layout.titleSize, weight: 800, opacity: 1 },
				{ text: `${now.toLocaleString("en-US", { month: "long" }).toUpperCase()} · ${now.getFullYear()}`, x: centerX, y: layout.subtitleY, size: shortSide / 26, weight: 600, opacity: 0.5 },
			];
			for (let col = 0; col < 7; col++) {
				layers.push({ text: WEEKDAY_LETTERS[col], x: layout.startX + col * layout.pitch, y: layout.weekdayY, size: layout.pitch * 0.24, weight: 500, opacity: 0.4 });
			}
			for (let day = 1; day <= layout.daysInMonth; day++) {
				const cell = layout.firstDayOffset + day - 1;
				const x = layout.startX + (cell % 7) * layout.pitch;
				const y = layout.firstRowY + Math.floor(cell / 7) * layout.pitch;
				if (day === layout.today) {
					layers.push({ text: String(day), x, y, size: layout.numberSize, weight: 700, opacity: 1, color: config.theme.bg });
				} else if (day < layout.today) {
					layers.push({ text: String(day), x, y, size: layout.numberSize, weight: 500, opacity: 0.9 });
				} else {
					layers.push({ text: String(day), x, y, size: layout.numberSize, weight: 400, opacity: 0.38 });
				}
			}
			layers.push({ text: `DAY ${layout.today} OF ${layout.daysInMonth}`, x: centerX, y: layout.captionY, size: shortSide / 26, weight: 500, opacity: 0.5 });
			return layers;
		}
		case "week": {
			const layout = calculateWeekLayout(config.width, config.height, now);
			const layers: WallpaperTextLayer[] = [
				{ text: "本周", x: centerX, y: layout.eyebrowY, size: shortSide / 24, weight: 600, opacity: 0.55 },
				{ text: `周${WEEKDAY_LETTERS[layout.todayIndex]}`, x: centerX, y: layout.titleY, size: layout.titleSize, weight: 800, opacity: 1 },
			];
			for (let index = 0; index < 7; index++) {
				const isToday = index === layout.todayIndex;
				layers.push({
					text: WEEKDAY_LETTERS[index],
					x: layout.startX + index * layout.pitch,
					y: layout.letterY,
					size: layout.letterSize,
					weight: isToday ? 700 : 500,
					opacity: isToday ? 1 : index < layout.todayIndex ? 0.75 : 0.35,
					...(isToday ? { color: config.theme.accent } : {}),
				});
			}
			return layers;
		}
		case "today": {
			const layout = calculateTodayLayout(config.width, config.height, now);
			const progress = getDayProgress(now);
			const elapsedSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
			const hoursLeft = Math.ceil((86_400 - elapsedSeconds) / 3600);
			const timeText = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
			return [
				{ text: `今日 · ${now.getMonth() + 1}月${now.getDate()}日`, x: centerX, y: layout.eyebrowY, size: shortSide / 24, weight: 600, opacity: 0.55 },
				{ text: `${Math.floor(progress * 100)}%`, x: centerX, y: layout.percentY, size: layout.percentSize, weight: 800, opacity: 1 },
				{ text: `${timeText} · 还剩约 ${hoursLeft} 小时`, x: centerX, y: layout.captionY, size: shortSide / 25, weight: 500, opacity: 0.55 },
			];
		}
		case "minimal": {
			const layout = calculateMinimalLayout(config.width, config.height);
			const { index, total } = getDayOfYearInfo(now);
			return [
				{ text: String(now.getFullYear()), x: layout.marginX, y: layout.eyebrowY, size: shortSide * 0.045, weight: 600, opacity: 0.55, align: "left" },
				{ text: `${Math.floor(calculateYearProgress(now) * 100)}%`, x: layout.marginX, y: layout.percentY, size: layout.percentSize, weight: 800, opacity: 1, align: "left" },
				{ text: `DAY ${index + 1} OF ${total}`, x: layout.marginX, y: layout.captionY, size: shortSide * 0.04, weight: 500, opacity: 0.5, align: "left" },
			];
		}
		case "life": {
			if (!config.birthDate) return [{ text: "Please set birth date", x: centerX, y: config.height / 2, size: 40, weight: 400, opacity: 1 }];
			const lifespanWeeks = Math.min(120, Math.max(1, config.lifespan || 80)) * 52;
			const weeksLived = calculateLifeWeeks(config.birthDate, now, lifespanWeeks);
			const layout = calculateLifeGrid(config.width, config.height, lifespanWeeks);
			return [
				{ text: `${((weeksLived / lifespanWeeks) * 100).toFixed(1)}%`, x: centerX, y: layout.headerY, size: shortSide * 0.085, weight: 800, opacity: 1 },
				{ text: `${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} Weeks`, x: centerX, y: layout.statsY, size: shortSide / 40, weight: 500, opacity: 0.6 },
			];
		}
		case "day": {
			const layout = calculateDayLayout(config.width, config.height);
			const weekday = WEEKDAY_LETTERS[(now.getDay() + 6) % 7];
			return [
				{ text: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, x: layout.centerX, y: layout.timeY, size: layout.timeFontSize, weight: 700, opacity: 1 },
				{ text: `${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekday}`, x: layout.centerX, y: layout.dateY, size: shortSide / 24, weight: 500, opacity: 0.55 },
			];
		}
	}
}

function circlePath(cx: number, cy: number, r: number): string {
	return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
}

function renderYear(config: WallpaperConfig, now: Date): string {
	const layout = calculateYearLayout(config.width, config.height, now);
	const { accent } = config.theme;
	const active: string[] = [];
	const inactive: string[] = [];
	let todayRing = "";

	for (let index = 0; index < layout.daysInYear; index++) {
		const col = Math.floor(index / 7);
		const row = index % 7;
		const x = layout.startX + col * layout.pitch;
		const y = layout.firstRowY + row * layout.pitch;
		(index < layout.dayIndex ? active : inactive).push(circlePath(x, y, layout.dotRadius));
		if (index === layout.dayIndex) {
			todayRing = `<circle cx="${x}" cy="${y}" r="${layout.dotRadius * 1.9}" fill="none" stroke="${accent}" stroke-width="${Math.max(1.5, layout.dotRadius * 0.36)}" class="today-ring"/>`;
		}
	}

	const rule = `<rect x="${layout.startX - layout.pitch / 2}" y="${layout.ruleY}" width="${layout.pitch * layout.cols}" height="${Math.max(1.5, layout.dotRadius * 0.22)}" fill="${accent}" opacity="0.22"/>`;
	return rule
		+ (active.length ? `<path d="${active.join("")}" fill="${accent}"/>` : "")
		+ (inactive.length ? `<path d="${inactive.join("")}" fill="${accent}" opacity="${TRACK_OPACITY}"/>` : "")
		+ todayRing;
}

function renderGoal(config: WallpaperConfig, now: Date): string {
	const fallbackTarget = new Date(now);
	fallbackTarget.setDate(fallbackTarget.getDate() + 7);
	const state = calculateGoalProgress(config.goalStartDate, config.targetDate || formatDateOnly(fallbackTarget), now);
	if (!state) return "";

	const layout = calculateGoalLayout(config.width, config.height);
	const circumference = Math.PI * 2 * layout.radius;
	const progressLength = circumference * state.progress;

	return `<circle cx="${layout.centerX}" cy="${layout.centerY}" r="${layout.radius}" fill="none" stroke="${config.theme.accent}" stroke-width="${layout.strokeWidth}" opacity="0.13"/>`
		+ `<circle cx="${layout.centerX}" cy="${layout.centerY}" r="${layout.radius}" fill="none" stroke="${config.theme.accent}" stroke-width="${layout.strokeWidth}" stroke-linecap="round" stroke-dasharray="${progressLength} ${circumference}" transform="rotate(-90 ${layout.centerX} ${layout.centerY})"/>`;
}

function renderMonth(config: WallpaperConfig, now: Date): string {
	const layout = calculateMonthLayout(config.width, config.height, now);
	const { accent } = config.theme;
	const todayCell = layout.firstDayOffset + layout.today - 1;
	const todayX = layout.startX + (todayCell % 7) * layout.pitch;
	const todayY = layout.firstRowY + Math.floor(todayCell / 7) * layout.pitch;
	const lineHeight = Math.max(3, Math.min(config.width, config.height) * 0.005);

	return `<circle cx="${todayX}" cy="${todayY}" r="${layout.pitch * 0.34}" fill="${accent}"/>`
		+ `<rect x="${layout.lineX}" y="${layout.lineY}" width="${layout.lineWidth}" height="${lineHeight}" rx="${lineHeight / 2}" fill="${accent}" opacity="${TRACK_OPACITY}"/>`
		+ `<rect x="${layout.lineX}" y="${layout.lineY}" width="${layout.lineWidth * (layout.today / layout.daysInMonth)}" height="${lineHeight}" rx="${lineHeight / 2}" fill="${accent}"/>`;
}

function renderWeek(config: WallpaperConfig, now: Date): string {
	const layout = calculateWeekLayout(config.width, config.height, now);
	const { accent } = config.theme;
	const parts: string[] = [];

	for (let index = 0; index < 7; index++) {
		const x = layout.startX + index * layout.pitch;
		const r = layout.circleRadius;
		if (index < layout.todayIndex) {
			parts.push(`<circle cx="${x}" cy="${layout.circleY}" r="${r}" fill="${accent}"/>`);
		} else if (index === layout.todayIndex) {
			parts.push(`<circle cx="${x}" cy="${layout.circleY}" r="${r}" fill="${accent}"/>`);
			parts.push(`<circle cx="${x}" cy="${layout.circleY}" r="${r * 1.48}" fill="none" stroke="${accent}" stroke-width="${Math.max(1.5, r * 0.14)}" class="today-ring"/>`);
		} else {
			parts.push(`<circle cx="${x}" cy="${layout.circleY}" r="${r}" fill="none" stroke="${accent}" stroke-width="${Math.max(1.5, r * 0.13)}" opacity="0.38"/>`);
		}
	}

	return parts.join("");
}

function renderToday(config: WallpaperConfig, now: Date): string {
	const layout = calculateTodayLayout(config.width, config.height, now);
	const { accent } = config.theme;
	const step = (layout.tickEndX - layout.tickStartX) / 23;
	const elapsed: string[] = [];
	const future: string[] = [];

	for (let hour = 0; hour < 24; hour++) {
		const x = layout.tickStartX + hour * step - layout.tickWidth / 2;
		const isCurrent = hour === layout.hoursElapsed;
		const height = isCurrent ? layout.tickTallHeight * 1.2 : hour % 6 === 0 ? layout.tickTallHeight : layout.tickBaseHeight;
		const rect = `<rect x="${x}" y="${layout.ticksY - height / 2}" width="${layout.tickWidth}" height="${height}" rx="${layout.tickWidth / 2}" fill="${accent}"/>`;
		(hour < layout.hoursElapsed || isCurrent ? elapsed : future).push(rect);
	}

	return elapsed.join("") + (future.length ? `<g opacity="0.16">${future.join("")}</g>` : "");
}

function renderMinimal(config: WallpaperConfig): string {
	const layout = calculateMinimalLayout(config.width, config.height);
	return `<rect x="${layout.marginX}" y="${layout.ruleY}" width="${layout.ruleWidth}" height="${layout.ruleHeight}" fill="${config.theme.accent}"/>`;
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
	let currentRing = "";

	for (let index = 0; index < lifespanWeeks; index++) {
		const row = Math.floor(index / layout.cols);
		const col = index % layout.cols;
		const x = layout.startX + col * (layout.cellSize + layout.gap) + layout.cellSize / 2;
		const y = layout.startY + row * (layout.cellSize + layout.gap) + layout.cellSize / 2;
		const isCurrent = lifeState.hasStarted && index === weeksLived;
		(index < weeksLived || isCurrent ? activePaths : inactivePaths).push(circlePath(x, y, radius));
		if (isCurrent) {
			currentRing = `<circle cx="${x}" cy="${y}" r="${layout.cellSize * 0.85}" fill="none" stroke="${config.theme.accent}" stroke-width="${Math.max(1.2, layout.cellSize * 0.16)}" class="today-ring"/>`;
		}
	}

	return (activePaths.length > 0 ? `<path d="${activePaths.join("")}" fill="${config.theme.accent}"/>` : "")
		+ (inactivePaths.length > 0 ? `<path d="${inactivePaths.join("")}" fill="${config.theme.accent}" opacity="0.13"/>` : "")
		+ currentRing;
}

function renderDay(config: WallpaperConfig, now: Date): string {
	const layout = calculateDayLayout(config.width, config.height);
	const { accent, text } = config.theme;
	const radius = layout.radius;
	const parts: string[] = [];

	for (let tick = 0; tick < 60; tick++) {
		const isHour = tick % 5 === 0;
		const angle = (tick * Math.PI) / 30;
		const inner = radius - (isHour ? radius * 0.11 : radius * 0.05);
		parts.push(`<line x1="${layout.centerX + Math.sin(angle) * inner}" y1="${layout.centerY - Math.cos(angle) * inner}" x2="${layout.centerX + Math.sin(angle) * radius}" y2="${layout.centerY - Math.cos(angle) * radius}" stroke="${text}" stroke-width="${isHour ? Math.max(2, radius * 0.02) : Math.max(1, radius * 0.008)}" opacity="${isHour ? 0.9 : 0.3}"/>`);
	}

	const hand = (angle: number, length: number, width: number, color: string, tail = 0) => {
		const x2 = layout.centerX + Math.sin(angle) * length;
		const y2 = layout.centerY - Math.cos(angle) * length;
		const x1 = layout.centerX - Math.sin(angle) * tail;
		const y1 = layout.centerY + Math.cos(angle) * tail;
		return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
	};

	const hourAngle = ((now.getHours() % 12) + now.getMinutes() / 60) * Math.PI / 6;
	const minuteAngle = now.getMinutes() * Math.PI / 30;
	const secondAngle = now.getSeconds() * Math.PI / 30;

	parts.push(hand(hourAngle, radius * 0.52, Math.max(3, radius * 0.045), text));
	parts.push(hand(minuteAngle, radius * 0.78, Math.max(2, radius * 0.028), text));
	parts.push(hand(secondAngle, radius * 0.86, Math.max(1.5, radius * 0.012), accent, radius * 0.18));
	parts.push(`<circle cx="${layout.centerX}" cy="${layout.centerY}" r="${radius * 0.038}" fill="${accent}"/>`);
	parts.push(`<circle cx="${layout.centerX}" cy="${layout.centerY}" r="${radius * 0.015}" fill="${config.theme.bg}"/>`);

	return parts.join("");
}

export function renderWallpaperSvg(config: WallpaperConfig, now = new Date(), includeText = true): string {
	const rawContent = {
		year: renderYear,
		goal: renderGoal,
		month: renderMonth,
		week: renderWeek,
		today: renderToday,
		minimal: renderMinimal,
		life: renderLife,
		day: renderDay,
	}[config.type](config, now);
	const shapes = rawContent.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, "");
	const text = includeText
		? getWallpaperTextLayers(config, now).map((layer) => textElement(layer, config.theme.text)).join("")
		: "";

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.width}" height="${config.height}" viewBox="0 0 ${config.width} ${config.height}"><rect width="100%" height="100%" fill="${config.theme.bg}"/>${shapes}${text}</svg>`;
}
