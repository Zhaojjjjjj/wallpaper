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
	getDayProgress,
	calculateGoalProgress,
	calculateLifeState,
	calculateYearProgress,
	formatDateOnly,
	getDayOfYearInfo,
	parseDateOnly,
	toWallClockDate,
} from "./wallpaper-progress";

const WEEKDAY_LETTERS = ["一", "二", "三", "四", "五", "六", "日"];

interface TextOptions {
	color?: string;
	align?: CanvasTextAlign;
	alpha?: number;
}

export class WallpaperEngine {
	private ctx: CanvasRenderingContext2D;
	private config: WallpaperConfig;
	private width: number;
	private height: number;
	private now: Date;

	constructor(ctx: CanvasRenderingContext2D, config: WallpaperConfig, now = new Date()) {
		this.ctx = ctx;
		this.config = config;
		this.width = config.width;
		this.height = config.height;
		this.now = toWallClockDate(now, config.timeZone);
	}

	public render() {
		try {
			this.resetDrawingState();

			this.ctx.fillStyle = this.config.theme.bg;
			this.ctx.fillRect(0, 0, this.width, this.height);

			switch (this.config.type) {
				case "year":
					this.drawYear();
					break;
				case "goal":
					this.drawGoal();
					break;
				case "month":
					this.drawMonth();
					break;
				case "week":
					this.drawWeek();
					break;
				case "today":
					this.drawToday();
					break;
				case "minimal":
					this.drawMinimal();
					break;
				case "life":
					this.drawLife();
					break;
				case "day":
					this.drawDay();
					break;
				default:
					this.drawText("未知的壁纸类型", this.width / 2, this.height / 2, 40);
			}
		} catch {
			this.ctx.fillStyle = "#000000";
			this.ctx.fillRect(0, 0, this.width, this.height);
			this.ctx.fillStyle = "#ffffff";
			this.ctx.font = "30px Inter, -apple-system, sans-serif";
			this.ctx.textAlign = "center";
			this.ctx.textBaseline = "middle";
			this.ctx.fillText("Error rendering wallpaper", this.width / 2, this.height / 2);
		}
	}

	private drawYear() {
		const now = new Date(this.now);
		const layout = calculateYearLayout(this.width, this.height, now);
		const { accent } = this.config.theme;

		this.drawText(String(now.getFullYear()), this.width / 2, layout.eyebrowY, Math.min(this.width, this.height) / 24, "600", 0.55);
		this.drawText(`${Math.floor(calculateYearProgress(now) * 100)}%`, this.width / 2, layout.percentY, layout.percentSize, "800");

		// Editorial hairline between the headline and the grid
		this.ctx.fillStyle = accent;
		this.ctx.globalAlpha = 0.22;
		this.ctx.fillRect(layout.startX - layout.pitch / 2, layout.ruleY, layout.pitch * layout.cols, Math.max(1.5, layout.dotRadius * 0.22));
		this.ctx.globalAlpha = 1;

		for (let index = 0; index < layout.daysInYear; index++) {
			const col = Math.floor(index / 7);
			const row = index % 7;
			const x = layout.startX + col * layout.pitch;
			const y = layout.firstRowY + row * layout.pitch;

			this.ctx.beginPath();
			this.ctx.arc(x, y, layout.dotRadius, 0, Math.PI * 2);
			this.ctx.fillStyle = accent;
			this.ctx.globalAlpha = index < layout.dayIndex ? 1 : TRACK_OPACITY;
			this.ctx.fill();
			this.ctx.globalAlpha = 1;

			if (index === layout.dayIndex) {
				this.ctx.beginPath();
				this.ctx.arc(x, y, layout.dotRadius * 1.9, 0, Math.PI * 2);
				this.ctx.strokeStyle = accent;
				this.ctx.lineWidth = Math.max(1.5, layout.dotRadius * 0.36);
				this.ctx.stroke();
			}
		}

		const daysLeft = layout.daysInYear - layout.dayIndex - 1;
		this.drawText(`DAY ${layout.dayIndex + 1} OF ${layout.daysInYear} · ${daysLeft} LEFT`, this.width / 2, layout.captionY, Math.min(this.width, this.height) / 26, "500", 0.5);
	}

	private drawMonth() {
		const now = new Date(this.now);
		const layout = calculateMonthLayout(this.width, this.height, now);
		const { accent, text } = this.config.theme;

		this.drawText(now.toLocaleString("zh-CN", { month: "long" }), this.width / 2, layout.titleY, layout.titleSize, "800");
		const monthEn = now.toLocaleString("en-US", { month: "long" }).toUpperCase();
		this.drawText(`${monthEn} · ${now.getFullYear()}`, this.width / 2, layout.subtitleY, Math.min(this.width, this.height) / 26, "600", 0.5);

		for (let col = 0; col < 7; col++) {
			this.drawText(WEEKDAY_LETTERS[col], layout.startX + col * layout.pitch, layout.weekdayY, layout.pitch * 0.24, "500", 0.4);
		}

		// Today: filled disc behind the date number
		const todayCell = layout.firstDayOffset + layout.today - 1;
		const todayX = layout.startX + (todayCell % 7) * layout.pitch;
		const todayY = layout.firstRowY + Math.floor(todayCell / 7) * layout.pitch;
		this.ctx.beginPath();
		this.ctx.arc(todayX, todayY, layout.pitch * 0.34, 0, Math.PI * 2);
		this.ctx.fillStyle = accent;
		this.ctx.fill();

		for (let day = 1; day <= layout.daysInMonth; day++) {
			const cell = layout.firstDayOffset + day - 1;
			const x = layout.startX + (cell % 7) * layout.pitch;
			const y = layout.firstRowY + Math.floor(cell / 7) * layout.pitch;
			if (day === layout.today) {
				this.drawText(String(day), x, y, layout.numberSize, "700", 1, { color: this.config.theme.bg });
			} else if (day < layout.today) {
				this.drawText(String(day), x, y, layout.numberSize, "500", 0.9);
			} else {
				this.drawText(String(day), x, y, layout.numberSize, "400", 0.38);
			}
		}

		// Progress hairline under the calendar
		const lineHeight = Math.max(3, Math.min(this.width, this.height) * 0.005);
		this.ctx.fillStyle = accent;
		this.ctx.globalAlpha = TRACK_OPACITY;
		this.roundRect(layout.lineX, layout.lineY, layout.lineWidth, lineHeight, lineHeight / 2);
		this.ctx.fill();
		this.ctx.globalAlpha = 1;
		this.roundRect(layout.lineX, layout.lineY, layout.lineWidth * (layout.today / layout.daysInMonth), lineHeight, lineHeight / 2);
		this.ctx.fill();

		this.drawText(`DAY ${layout.today} OF ${layout.daysInMonth}`, this.width / 2, layout.captionY, Math.min(this.width, this.height) / 26, "500", 0.5);
		void text;
	}

	private drawWeek() {
		const now = new Date(this.now);
		const layout = calculateWeekLayout(this.width, this.height, now);
		const { accent } = this.config.theme;

		this.drawText("本周", this.width / 2, layout.eyebrowY, Math.min(this.width, this.height) / 24, "600", 0.55);
		this.drawText(`周${WEEKDAY_LETTERS[layout.todayIndex]}`, this.width / 2, layout.titleY, layout.titleSize, "800");

		for (let index = 0; index < 7; index++) {
			const x = layout.startX + index * layout.pitch;
			const y = layout.circleY;
			const r = layout.circleRadius;

			if (index < layout.todayIndex) {
				this.ctx.beginPath();
				this.ctx.arc(x, y, r, 0, Math.PI * 2);
				this.ctx.fillStyle = accent;
				this.ctx.fill();
			} else if (index === layout.todayIndex) {
				this.ctx.beginPath();
				this.ctx.arc(x, y, r, 0, Math.PI * 2);
				this.ctx.fillStyle = accent;
				this.ctx.fill();
				this.ctx.beginPath();
				this.ctx.arc(x, y, r * 1.48, 0, Math.PI * 2);
				this.ctx.strokeStyle = accent;
				this.ctx.lineWidth = Math.max(1.5, r * 0.14);
				this.ctx.stroke();
			} else {
				this.ctx.beginPath();
				this.ctx.arc(x, y, r, 0, Math.PI * 2);
				this.ctx.strokeStyle = accent;
				this.ctx.globalAlpha = 0.38;
				this.ctx.lineWidth = Math.max(1.5, r * 0.13);
				this.ctx.stroke();
				this.ctx.globalAlpha = 1;
			}

			const isToday = index === layout.todayIndex;
			this.drawText(WEEKDAY_LETTERS[index], x, layout.letterY, layout.letterSize, isToday ? "700" : "500", isToday ? 1 : index < layout.todayIndex ? 0.75 : 0.35, isToday ? { color: accent } : undefined);
		}
	}

	private drawToday() {
		const now = new Date(this.now);
		const layout = calculateTodayLayout(this.width, this.height, now);
		const { accent } = this.config.theme;
		const progress = getDayProgress(now);

		this.drawText(`今日 · ${now.getMonth() + 1}月${now.getDate()}日`, this.width / 2, layout.eyebrowY, Math.min(this.width, this.height) / 24, "600", 0.55);
		this.drawText(`${Math.floor(progress * 100)}%`, this.width / 2, layout.percentY, layout.percentSize, "800");

		const step = (layout.tickEndX - layout.tickStartX) / 23;
		for (let hour = 0; hour < 24; hour++) {
			const x = layout.tickStartX + hour * step;
			const isCurrent = hour === layout.hoursElapsed;
			const height = isCurrent ? layout.tickTallHeight * 1.2 : hour % 6 === 0 ? layout.tickTallHeight : layout.tickBaseHeight;
			this.ctx.fillStyle = accent;
			this.ctx.globalAlpha = hour < layout.hoursElapsed || isCurrent ? 1 : 0.16;
			this.roundRect(x - layout.tickWidth / 2, layout.ticksY - height / 2, layout.tickWidth, height, layout.tickWidth / 2);
			this.ctx.fill();
			this.ctx.globalAlpha = 1;
		}

		const elapsedSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
		const hoursLeft = Math.ceil((86_400 - elapsedSeconds) / 3600);
		const timeText = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
		this.drawText(`${timeText} · 还剩约 ${hoursLeft} 小时`, this.width / 2, layout.captionY, Math.min(this.width, this.height) / 25, "500", 0.55);
	}

	private drawMinimal() {
		const now = new Date(this.now);
		const layout = calculateMinimalLayout(this.width, this.height);
		const { accent } = this.config.theme;
		const progress = calculateYearProgress(now);
		const { index, total } = getDayOfYearInfo(now);
		const left: TextOptions = { align: "left" };

		this.drawText(String(now.getFullYear()), layout.marginX, layout.eyebrowY, Math.min(this.width, this.height) * 0.045, "600", 0.55, left);
		this.drawText(`${Math.floor(progress * 100)}%`, layout.marginX, layout.percentY, layout.percentSize, "800", 1, left);

		this.ctx.fillStyle = accent;
		this.ctx.fillRect(layout.marginX, layout.ruleY, layout.ruleWidth, layout.ruleHeight);

		this.drawText(`DAY ${index + 1} OF ${total}`, layout.marginX, layout.captionY, Math.min(this.width, this.height) * 0.04, "500", 0.5, left);
	}

	private drawLife() {
		if (!this.config.birthDate) {
			this.drawText("Please set birth date", this.width / 2, this.height / 2, 40);
			return;
		}

		if (!parseDateOnly(this.config.birthDate)) {
			this.drawText("Invalid birth date", this.width / 2, this.height / 2, 40);
			return;
		}

		const now = new Date(this.now);
		const lifespanYears = Math.min(120, Math.max(1, this.config.lifespan || 80));
		const lifespanWeeks = lifespanYears * 52;
		const lifeState = calculateLifeState(this.config.birthDate, now, lifespanWeeks);
		const weeksLived = lifeState.weeksLived;
		const layout = calculateLifeGrid(this.width, this.height, lifespanWeeks);
		const { accent } = this.config.theme;

		this.drawText(`${((weeksLived / lifespanWeeks) * 100).toFixed(1)}%`, this.width / 2, layout.headerY, Math.min(this.width, this.height) * 0.085, "800");

		for (let i = 0; i < lifespanWeeks; i++) {
			const row = Math.floor(i / layout.cols);
			const col = i % layout.cols;
			const x = layout.startX + col * (layout.cellSize + layout.gap) + layout.cellSize / 2;
			const y = layout.startY + row * (layout.cellSize + layout.gap) + layout.cellSize / 2;
			const isCurrent = lifeState.hasStarted && i === weeksLived;

			this.ctx.beginPath();
			this.ctx.arc(x, y, layout.cellSize / 2.5, 0, Math.PI * 2);
			this.ctx.fillStyle = accent;
			this.ctx.globalAlpha = i < weeksLived || isCurrent ? 1 : 0.13;
			this.ctx.fill();
			this.ctx.globalAlpha = 1;

			if (isCurrent) {
				this.ctx.beginPath();
				this.ctx.arc(x, y, layout.cellSize * 0.85, 0, Math.PI * 2);
				this.ctx.strokeStyle = accent;
				this.ctx.lineWidth = Math.max(1.2, layout.cellSize * 0.16);
				this.ctx.stroke();
			}
		}

		this.drawText(`${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} Weeks`, this.width / 2, layout.statsY, Math.min(this.width, this.height) / 40, "500", 0.6);
	}

	private drawGoal() {
		const targetDateStr = this.config.targetDate || this.getDefaultTargetDate();
		const now = new Date(this.now);
		const goalState = calculateGoalProgress(this.config.goalStartDate, targetDateStr, now);

		if (!goalState) {
			this.drawText("Invalid target date", this.width / 2, this.height / 2, 40);
			return;
		}

		const layout = calculateGoalLayout(this.width, this.height);
		const { accent } = this.config.theme;

		this.drawText(this.config.goalName || "我的目标", this.width / 2, layout.nameY, Math.min(this.width, this.height) * 0.052, "600", 0.9);

		this.ctx.beginPath();
		this.ctx.arc(layout.centerX, layout.centerY, layout.radius, 0, Math.PI * 2);
		this.ctx.strokeStyle = accent;
		this.ctx.globalAlpha = 0.13;
		this.ctx.lineWidth = layout.strokeWidth;
		this.ctx.stroke();

		this.ctx.beginPath();
		const startAngle = -Math.PI / 2;
		this.ctx.arc(layout.centerX, layout.centerY, layout.radius, startAngle, startAngle + Math.PI * 2 * goalState.progress);
		this.ctx.globalAlpha = 1;
		this.ctx.lineCap = "round";
		this.ctx.stroke();
		this.ctx.lineCap = "butt";

		this.drawText(goalState.daysLeft.toString(), layout.centerX, layout.numberY, layout.radius * 0.85, "800");
		this.drawText("剩余天数", layout.centerX, layout.labelY, layout.radius * 0.17, "500", 0.6);

		const targetLabel = targetDateStr.replaceAll("-", ".");
		const datesText = this.config.goalStartDate
			? `${this.config.goalStartDate.replaceAll("-", ".")} → ${targetLabel}`
			: `目标日期 ${targetLabel}`;
		this.drawText(datesText, this.width / 2, layout.datesY, Math.min(this.width, this.height) / 25, "500", 0.55);
		this.drawText(`已完成 ${Math.floor(goalState.progress * 100)}%`, this.width / 2, layout.percentY, Math.min(this.width, this.height) / 25, "600", 0.75);
	}

	private getDefaultTargetDate(): string {
		const date = new Date(this.now);
		date.setDate(date.getDate() + 7);
		return formatDateOnly(date);
	}

	private drawDay() {
		const now = new Date(this.now);
		const layout = calculateDayLayout(this.width, this.height);
		const { accent, text } = this.config.theme;
		const radius = layout.radius;

		// Tick ring: fine minute ticks, stronger hour ticks, no bezel circle
		for (let tick = 0; tick < 60; tick++) {
			const isHour = tick % 5 === 0;
			const angle = (tick * Math.PI) / 30;
			const outer = radius;
			const inner = radius - (isHour ? radius * 0.11 : radius * 0.05);
			this.ctx.beginPath();
			this.ctx.moveTo(layout.centerX + Math.sin(angle) * inner, layout.centerY - Math.cos(angle) * inner);
			this.ctx.lineTo(layout.centerX + Math.sin(angle) * outer, layout.centerY - Math.cos(angle) * outer);
			this.ctx.strokeStyle = text;
			this.ctx.globalAlpha = isHour ? 0.9 : 0.3;
			this.ctx.lineWidth = isHour ? Math.max(2, radius * 0.02) : Math.max(1, radius * 0.008);
			this.ctx.stroke();
		}
		this.ctx.globalAlpha = 1;

		const hourAngle = (((now.getHours() % 12) + now.getMinutes() / 60) * 30 * Math.PI) / 180;
		const minAngle = (now.getMinutes() * 6 * Math.PI) / 180;
		const secAngle = (now.getSeconds() * 6 * Math.PI) / 180;

		this.drawHand(layout.centerX, layout.centerY, hourAngle, radius * 0.52, Math.max(3, radius * 0.045), text);
		this.drawHand(layout.centerX, layout.centerY, minAngle, radius * 0.78, Math.max(2, radius * 0.028), text);
		// Second hand in accent, with a short counterweight tail
		this.ctx.save();
		this.ctx.lineCap = "round";
		this.ctx.translate(layout.centerX, layout.centerY);
		this.ctx.rotate(secAngle);
		this.ctx.beginPath();
		this.ctx.moveTo(0, radius * 0.18);
		this.ctx.lineTo(0, -radius * 0.86);
		this.ctx.lineWidth = Math.max(1.5, radius * 0.012);
		this.ctx.strokeStyle = accent;
		this.ctx.stroke();
		this.ctx.restore();

		this.ctx.beginPath();
		this.ctx.arc(layout.centerX, layout.centerY, radius * 0.038, 0, Math.PI * 2);
		this.ctx.fillStyle = accent;
		this.ctx.fill();
		this.ctx.beginPath();
		this.ctx.arc(layout.centerX, layout.centerY, radius * 0.015, 0, Math.PI * 2);
		this.ctx.fillStyle = this.config.theme.bg;
		this.ctx.fill();

		this.drawText(
			`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
			layout.centerX,
			layout.timeY,
			layout.timeFontSize,
			"700"
		);
		const weekday = WEEKDAY_LETTERS[(now.getDay() + 6) % 7];
		this.drawText(`${now.getMonth() + 1}月${now.getDate()}日 · 星期${weekday}`, layout.centerX, layout.dateY, Math.min(this.width, this.height) / 24, "500", 0.55);
	}

	// --- Helpers ---

	private resetDrawingState() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.globalAlpha = 1;
		this.ctx.globalCompositeOperation = "source-over";
		this.ctx.lineCap = "butt";
		this.ctx.lineJoin = "miter";
		this.ctx.shadowBlur = 0;
		this.ctx.shadowColor = "transparent";
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	private drawHand(cx: number, cy: number, angle: number, length: number, width: number, color: string) {
		this.ctx.save();
		this.ctx.lineCap = "round";
		this.ctx.translate(cx, cy);
		this.ctx.rotate(angle);
		this.ctx.beginPath();
		this.ctx.moveTo(0, 0);
		this.ctx.lineTo(0, -length);
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
		this.ctx.restore();
	}

	private roundRect(x: number, y: number, w: number, h: number, r: number) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;
		this.ctx.beginPath();
		this.ctx.moveTo(x + r, y);
		this.ctx.arcTo(x + w, y, x + w, y + h, r);
		this.ctx.arcTo(x + w, y + h, x, y + h, r);
		this.ctx.arcTo(x, y + h, x, y, r);
		this.ctx.arcTo(x, y, x + w, y, r);
		this.ctx.closePath();
	}

	private drawText(text: string, x: number, y: number, size: number, weight = "normal", alpha = 1, options?: TextOptions) {
		this.ctx.globalAlpha = options?.alpha ?? alpha;
		this.ctx.fillStyle = options?.color ?? this.config.theme.text;
		this.ctx.font = `${weight} ${size}px Inter, -apple-system, "PingFang SC", sans-serif`;
		this.ctx.textAlign = options?.align ?? "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(text, x, y);
		this.ctx.globalAlpha = 1;
	}
}
