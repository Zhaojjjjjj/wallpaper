import { WallpaperConfig } from "./types";
import { toWallClockDate } from "./wallpaper-progress";
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

type TextAlignOption = "left" | "center" | "right";

interface TextOptions {
	color?: string;
	align?: TextAlignOption;
	alpha?: number;
	tracking?: number;
}

const WEEKDAY_LETTERS = ["一", "二", "三", "四", "五", "六", "日"];
export const WALLPAPER_FONT_STACK = '"Inter", "Noto Sans SC", sans-serif';

export class WallpaperEngine {
	private ctx: CanvasRenderingContext2D;
	private config: WallpaperConfig;
	private now: Date;
	private width: number;
	private height: number;

	constructor(ctx: CanvasRenderingContext2D, config: WallpaperConfig, now?: Date) {
		this.ctx = ctx;
		this.config = config;
		this.now = now ?? toWallClockDate(new Date(), config.timeZone);
		this.width = config.width;
		this.height = config.height;
	}

	render() {
		this.resetState();
		this.drawBackground();

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
			case "calendar":
				this.drawCalendar();
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
		}
	}

	private resetState() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.ctx.globalAlpha = 1;
		this.ctx.globalCompositeOperation = "source-over";
		this.ctx.shadowBlur = 0;
		this.ctx.shadowColor = "transparent";
		this.ctx.lineCap = "butt";
		this.ctx.lineJoin = "miter";
		this.setTracking(0);
	}

	private setTracking(px: number) {
		const ctx = this.ctx as CanvasRenderingContext2D & { letterSpacing?: string };
		try {
			ctx.letterSpacing = `${px}px`;
		} catch {
			// Older engines ignore tracking; layout still holds.
		}
	}

	private drawBackground() {
		this.ctx.fillStyle = this.config.theme.bg;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	private drawText(
		text: string,
		x: number,
		y: number,
		size: number,
		weight: string | number = "400",
		opacity = 1,
		options: TextOptions = {}
	) {
		const { theme } = this.config;
		this.ctx.save();
		this.ctx.globalAlpha = options.alpha ?? opacity;
		this.ctx.fillStyle = options.color ?? theme.text;
		this.ctx.font = `${weight} ${size}px ${WALLPAPER_FONT_STACK}`;
		this.ctx.textAlign = options.align ?? "center";
		this.ctx.textBaseline = "middle";
		this.setTracking(options.tracking ?? 0);
		this.ctx.fillText(text, x, y);
		this.ctx.restore();
		this.setTracking(0);
	}

	private eyebrow(text: string, x: number, y: number, size: number, align: TextAlignOption = "left", alpha = 0.55) {
		this.drawText(text, x, y, size, "600", alpha, { align, tracking: size * 0.22 });
	}

	private footer(left: string, right: string, frame: { marginX: number; rightX: number; footerY: number; footerSize: number }) {
		this.drawText(left, frame.marginX, frame.footerY, frame.footerSize, "500", 0.5, { align: "left", tracking: frame.footerSize * 0.14 });
		this.drawText(right, frame.rightX, frame.footerY, frame.footerSize, "500", 0.5, { align: "right", tracking: frame.footerSize * 0.14 });
	}

	private hairline(x1: number, x2: number, y: number, color: string, opacity: number, width = 1) {
		this.ctx.save();
		this.ctx.globalAlpha = opacity;
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = width;
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y);
		this.ctx.lineTo(x2, y);
		this.ctx.stroke();
		this.ctx.restore();
	}

	private dot(x: number, y: number, radius: number, color: string, opacity: number) {
		this.ctx.save();
		this.ctx.globalAlpha = opacity;
		this.ctx.fillStyle = color;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.restore();
	}

	private ring(x: number, y: number, radius: number, color: string, lineWidth: number) {
		this.ctx.save();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = lineWidth;
		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.ctx.stroke();
		this.ctx.restore();
	}

	private drawYear() {
		const layout = calculateYearLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(`${layout.year} · 年度进度`, frame.marginX, frame.eyebrowY, frame.eyebrowSize);
		this.drawText(`${layout.percent}%`, frame.marginX, layout.heroY, layout.heroSize, 300, 1, { align: "left" });

		// Day dots: one column per weekday, one row per week.
		for (let i = 0; i < layout.totalDays; i++) {
			const col = i % 7;
			const row = Math.floor(i / 7);
			const x = layout.gridStartX + col * layout.pitch;
			const y = layout.gridTop + row * layout.pitch;
			if (i < layout.todayIndex) this.dot(x, y, layout.dotRadius, accent, 0.92);
			else if (i > layout.todayIndex) this.dot(x, y, layout.dotRadius, accent, FUTURE_OPACITY);
		}
		const todayX = layout.gridStartX + (layout.todayIndex % 7) * layout.pitch;
		const todayY = layout.gridTop + Math.floor(layout.todayIndex / 7) * layout.pitch;
		this.dot(todayX, todayY, layout.dotRadius, accent, 1);
		this.ring(todayX, todayY, layout.dotRadius * 2.1, accent, Math.max(1.2, layout.pitch * 0.11));

		this.drawText(String(layout.daysPassed), layout.statsX, layout.stat1Y, layout.statNumberSize, 300, 1, { align: "left" });
		this.drawText("DAYS PASSED · 已度过", layout.statsX, layout.stat1Y + layout.statNumberSize * 0.62, layout.statLabelSize, "500", 0.5, { align: "left", tracking: layout.statLabelSize * 0.14 });
		this.drawText(String(layout.daysLeft), layout.statsX, layout.stat2Y, layout.statNumberSize, 300, 1, { align: "left" });
		this.drawText("DAYS LEFT · 还剩", layout.statsX, layout.stat2Y + layout.statNumberSize * 0.62, layout.statLabelSize, "500", 0.5, { align: "left", tracking: layout.statLabelSize * 0.14 });

		this.footer(`DAY ${layout.todayIndex + 1} OF ${layout.totalDays}`, `${layout.year} · ${layout.percent}%`, frame);
	}

	private drawMonth() {
		const layout = calculateMonthLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(`${layout.monthEn} · ${layout.year}`, this.width / 2, frame.eyebrowY, frame.eyebrowSize, "center", 0.5);
		this.drawText(layout.monthName, this.width / 2, layout.titleY, layout.titleSize, "600");
		this.ctx.save();
		this.ctx.fillStyle = accent;
		this.ctx.fillRect(this.width / 2 - layout.ruleWidth / 2, layout.ruleY, layout.ruleWidth, 3);
		this.ctx.restore();

		for (let col = 0; col < 7; col++) {
			this.drawText(WEEKDAY_LETTERS[col], layout.startX + col * layout.pitch, layout.weekdayY, layout.pitch * 0.23, "500", 0.42);
		}
		this.hairline(frame.marginX, frame.rightX, layout.weekdayY + layout.pitch * 0.34, accent, TRACK_OPACITY, 1);

		for (let day = 1; day <= layout.daysInMonth; day++) {
			const position = layout.firstDayOffset + day - 1;
			const col = position % 7;
			const row = Math.floor(position / 7);
			const x = layout.startX + col * layout.pitch;
			const y = layout.firstRowY + row * layout.rowPitch;
			if (day === layout.today) {
				this.dot(x, y, layout.discRadius, accent, 1);
				this.drawText(String(day), x, y, layout.numberSize, "600", 1, { color: this.config.theme.bg });
			} else {
				this.drawText(String(day), x, y, layout.numberSize, "400", day < layout.today ? 0.88 : 0.34);
			}
		}

		this.hairline(frame.marginX, frame.rightX, layout.progressY, accent, TRACK_OPACITY, 2);
		this.hairline(frame.marginX, frame.marginX + frame.contentWidth * (layout.today / layout.daysInMonth), layout.progressY, accent, 1, 2);

		this.footer(`DAY ${layout.today} OF ${layout.daysInMonth}`, `${layout.daysLeft} DAYS LEFT`, frame);
	}

	private drawWeek() {
		const layout = calculateWeekLayout(this.config, this.now);
		const { accent, bg } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(`本周 · 第 ${layout.weekNumber} 周`, frame.marginX, frame.eyebrowY, frame.eyebrowSize);
		this.eyebrow(layout.rangeLabel, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.4);
		this.drawText(`周${WEEKDAY_LETTERS[layout.todayIndex]}`, frame.marginX, layout.titleY, layout.titleSize, 300, 1, { align: "left" });
		this.drawText(`${layout.percent}%`, frame.rightX, layout.titleY, layout.percentSize, 300, 0.85, { align: "right" });

		// Highlight today's column.
		const todayLeft = frame.marginX + layout.todayIndex * layout.colWidth;
		this.ctx.save();
		this.ctx.fillStyle = accent;
		const radius = Math.min(14, layout.colWidth * 0.16);
		this.ctx.beginPath();
		this.ctx.roundRect(todayLeft + 3, layout.stripTop, layout.colWidth - 6, layout.stripBottom - layout.stripTop, radius);
		this.ctx.fill();
		this.ctx.restore();

		for (let i = 0; i < 6; i++) {
			const x = frame.marginX + (i + 1) * layout.colWidth;
			this.ctx.save();
			this.ctx.globalAlpha = TRACK_OPACITY;
			this.ctx.strokeStyle = accent;
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			this.ctx.moveTo(x, layout.stripTop + (layout.stripBottom - layout.stripTop) * 0.14);
			this.ctx.lineTo(x, layout.stripBottom - (layout.stripBottom - layout.stripTop) * 0.14);
			this.ctx.stroke();
			this.ctx.restore();
		}

		layout.days.forEach((day, index) => {
			const x = frame.marginX + (index + 0.5) * layout.colWidth;
			const isToday = index === layout.todayIndex;
			const state = isToday ? 1 : index < layout.todayIndex ? 0.85 : 0.38;
			if (isToday) {
				this.drawText(WEEKDAY_LETTERS[index], x, layout.letterY, layout.letterSize, "600", 1, { color: bg });
				this.drawText(String(day.dayOfMonth), x, layout.dateY, layout.dateSize, "600", 1, { color: bg });
			} else {
				this.drawText(WEEKDAY_LETTERS[index], x, layout.letterY, layout.letterSize, "500", state);
				this.drawText(String(day.dayOfMonth), x, layout.dateY, layout.dateSize, "500", state);
			}
		});

		this.footer(`WEEK ${layout.weekNumber}`, `${layout.todayIndex + 1} OF 7 DAYS`, frame);
	}

	private drawToday() {
		const layout = calculateTodayLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;
		const currentHour = this.now.getHours();

		this.eyebrow(`今日 · ${layout.dateLabel}`, this.width / 2, frame.eyebrowY, frame.eyebrowSize, "center", 0.55);
		this.drawText(layout.timeLabel, this.width / 2, layout.timeY, layout.timeSize, 200);
		this.drawText(`今日已过 ${layout.percent}%`, this.width / 2, layout.subY, layout.subSize, "500", 0.6, { tracking: layout.subSize * 0.1 });

		for (let hour = 0; hour <= 24; hour++) {
			const x = frame.marginX + (frame.contentWidth / 24) * hour;
			const isCurrent = hour === currentHour;
			const half = isCurrent ? layout.tickCurrent : hour % 6 === 0 ? layout.tickSix : layout.tickBase;
			this.ctx.save();
			this.ctx.globalAlpha = isCurrent ? 1 : hour < currentHour ? 0.9 : 0.18;
			this.ctx.strokeStyle = accent;
			this.ctx.lineWidth = isCurrent ? 3 : 2;
			this.ctx.beginPath();
			this.ctx.moveTo(x, layout.tickY - half);
			this.ctx.lineTo(x, layout.tickY + half);
			this.ctx.stroke();
			this.ctx.restore();
			if (hour % 6 === 0) {
				this.drawText(String(hour), x, layout.numbersY, layout.numberSize, "500", 0.45);
			}
		}

		this.footer(layout.fullDateLabel, `还剩约 ${layout.hoursLeft} 小时`, frame);
	}

	private drawCalendar() {
		const layout = calculateCalendarLayout(this.config, this.now);
		const { accent, text } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(`${layout.monthEn} · ${layout.monthName}`, frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left", 0.6);
		this.eyebrow(`${String(layout.dayOfYear).padStart(3, "0")} / ${layout.totalDays}`, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.45);
		this.hairline(frame.marginX, frame.rightX, layout.headerRuleY, accent, TRACK_OPACITY, 1);

		this.drawText(String(layout.dayOfMonth), frame.marginX - layout.dateSize * 0.03, layout.dateY, layout.dateSize, 300, 1, { align: "left" });
		this.drawText(layout.weekdayCn, frame.marginX, layout.weekdayY, layout.weekdaySize, "500", 0.95, { align: "left" });
		this.drawText(layout.weekdayEn, frame.rightX, layout.weekdayY, layout.weekdaySize * 0.48, "600", 0.45, { align: "right", tracking: layout.weekdaySize * 0.18 });
		if (layout.isWeekend) this.dot(layout.weekendDotX, layout.weekendDotY, Math.max(3, layout.weekdaySize * 0.14), accent, 1);

		// The month's small line motif.
		for (const stroke of layout.motifLines) {
			this.ctx.save();
			this.ctx.strokeStyle = stroke.accent ? accent : text;
			this.ctx.globalAlpha = 0.85;
			this.ctx.lineWidth = stroke.width;
			this.ctx.lineCap = "round";
			this.ctx.beginPath();
			this.ctx.moveTo(stroke.x1, stroke.y1);
			this.ctx.lineTo(stroke.x2, stroke.y2);
			this.ctx.stroke();
			this.ctx.restore();
		}
		for (const circle of layout.motifCircles) {
			if (circle.filled) this.dot(circle.cx, circle.cy, circle.r, circle.accent ? accent : text, 0.9);
			else this.ring(circle.cx, circle.cy, circle.r, circle.accent ? accent : text, circle.width);
		}
		this.drawText(layout.motifName, this.width / 2, layout.motifCaptionY, layout.motifCaptionSize, "500", 0.5, { tracking: layout.motifCaptionSize * 0.5 });

		// Quote: vermilion dash, then the day's sentence.
		this.ctx.save();
		this.ctx.fillStyle = accent;
		this.ctx.fillRect(frame.marginX, layout.dashY, layout.dashWidth, Math.max(3, this.width * 0.006));
		this.ctx.restore();
		layout.quoteLines.forEach((line, i) => {
			this.drawText(line, frame.marginX, layout.quoteFirstY + i * layout.quoteLineHeight, layout.quoteSize, "500", 0.95, { align: "left" });
		});

		// Seal: a small accent square stamped with 日.
		this.ctx.save();
		this.ctx.fillStyle = accent;
		this.ctx.fillRect(layout.sealX, layout.sealY, layout.sealSize, layout.sealSize);
		this.ctx.restore();
		this.drawText("日", layout.sealX + layout.sealSize / 2, layout.sealY + layout.sealSize / 2, layout.sealSize * 0.58, "700", 1, { color: this.config.theme.bg });

		this.hairline(frame.marginX, frame.rightX, layout.footerRuleY, accent, TRACK_OPACITY, 1);
		this.drawText("ONE PAGE A DAY", frame.marginX, frame.footerY, frame.footerSize, "600", 0.45, { align: "left", tracking: frame.footerSize * 0.22 });
		this.hairline(layout.progressX0, layout.progressX1, frame.footerY, accent, TRACK_OPACITY, 2);
		this.dot(layout.progressDotX, frame.footerY, Math.max(3, this.width * 0.006), accent, 1);
	}

	private drawGoal() {
		const layout = calculateGoalLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		if (!layout.isValid) {
			this.drawText("请设置目标日期", this.width / 2, layout.errorY, Math.min(this.width, this.height) / 18, "500", 0.7);
			return;
		}

		this.eyebrow("目标倒计时 · COUNTDOWN", frame.marginX, frame.eyebrowY, frame.eyebrowSize);
		this.drawText(layout.goalName, frame.marginX, layout.nameY, layout.nameSize, "600", 1, { align: "left" });
		this.drawText(String(layout.daysLeft), frame.marginX, layout.heroY, layout.heroSize, 300, 1, { align: "left" });
		this.drawText("剩余天数 · DAYS LEFT", frame.marginX, layout.heroLabelY, layout.labelSize, "500", 0.5, { align: "left", tracking: layout.labelSize * 0.14 });

		// Timeline: start dot, progress fill, today marker, target ring.
		this.hairline(frame.marginX, frame.rightX, layout.lineY, accent, TRACK_OPACITY, 2);
		const progressX = frame.marginX + frame.contentWidth * layout.progress;
		if (layout.progress > 0) this.hairline(frame.marginX, progressX, layout.lineY, accent, 1, 2.5);
		this.dot(frame.marginX, layout.lineY, 4, accent, 1);
		this.ring(frame.rightX, layout.lineY, 6.5, accent, 2);
		if (layout.progress > 0 && layout.progress < 1) {
			this.dot(progressX, layout.lineY, 5.5, accent, 1);
			this.ring(progressX, layout.lineY, 5.5, this.config.theme.bg, 2);
		}
		this.drawText(layout.startLabel, frame.marginX, layout.dateLabelY, layout.dateSize, "500", 0.55, { align: "left" });
		this.drawText(layout.targetLabel, frame.rightX, layout.dateLabelY, layout.dateSize, "500", 0.55, { align: "right" });

		this.footer(`已完成 ${Math.floor(layout.progress * 100)}%`, `${layout.elapsedDays} / ${layout.totalDays} DAYS`, frame);
	}

	private drawLife() {
		const layout = calculateLifeLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		if (!layout.isValid) {
			this.drawText("请设置出生日期", this.width / 2, layout.errorY, Math.min(this.width, this.height) / 18, "500", 0.7);
			return;
		}

		this.eyebrow("生命日历", frame.marginX, frame.eyebrowY, frame.eyebrowSize);
		this.eyebrow("LIFE IN WEEKS", frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.4);
		this.drawText(`${layout.percent.toFixed(1)}%`, frame.marginX, layout.heroY, layout.heroSize, 300, 1, { align: "left" });

		for (let i = 0; i < layout.totalWeeks; i++) {
			const col = i % layout.cols;
			const row = Math.floor(i / layout.cols);
			const x = layout.gridStartX + col * layout.pitch;
			const y = layout.gridTop + row * layout.rowPitch;
			if (i < layout.currentWeekIndex) this.dot(x, y, layout.dotRadius, accent, 0.92);
			else if (i > layout.currentWeekIndex) this.dot(x, y, layout.dotRadius, accent, FUTURE_OPACITY);
		}
		const currentX = layout.gridStartX + (layout.currentWeekIndex % layout.cols) * layout.pitch;
		const currentY = layout.gridTop + Math.floor(layout.currentWeekIndex / layout.cols) * layout.rowPitch;
		this.dot(currentX, currentY, layout.dotRadius, accent, 1);
		this.ring(currentX, currentY, layout.dotRadius * 2.1, accent, Math.max(1.1, layout.pitch * 0.1));

		this.footer(`已度过 ${layout.weeksLived.toLocaleString("en-US")} 周`, `共 ${layout.totalWeeks.toLocaleString("en-US")} 周`, frame);
	}

	private drawDay() {
		const layout = calculateDayLayout(this.config);
		const { accent, text } = this.config.theme;
		const { centerX, centerY, radius } = layout;
		const hours = this.now.getHours();
		const minutes = this.now.getMinutes();
		const seconds = this.now.getSeconds() + this.now.getMilliseconds() / 1000;

		for (let i = 0; i < 60; i++) {
			const angle = (i / 60) * Math.PI * 2;
			const isHour = i % 5 === 0;
			const outer = radius;
			const inner = radius - (isHour ? radius * 0.11 : radius * 0.05);
			this.ctx.save();
			this.ctx.globalAlpha = isHour ? 0.9 : 0.25;
			this.ctx.strokeStyle = text;
			this.ctx.lineWidth = isHour ? 3 : 1.5;
			this.ctx.beginPath();
			this.ctx.moveTo(centerX + Math.cos(angle) * inner, centerY + Math.sin(angle) * inner);
			this.ctx.lineTo(centerX + Math.cos(angle) * outer, centerY + Math.sin(angle) * outer);
			this.ctx.stroke();
			this.ctx.restore();
		}

		const numerals: [string, number][] = [["12", -Math.PI / 2], ["3", 0], ["6", Math.PI / 2], ["9", Math.PI]];
		for (const [label, angle] of numerals) {
			const r = radius * 0.76;
			this.drawText(label, centerX + Math.cos(angle) * r, centerY + Math.sin(angle) * r, layout.numeralSize, "500", 0.85);
		}

		const hand = (angle: number, length: number, width: number, color: string, tail = 0) => {
			this.ctx.save();
			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = width;
			this.ctx.lineCap = "round";
			this.ctx.beginPath();
			this.ctx.moveTo(centerX - Math.cos(angle) * tail, centerY - Math.sin(angle) * tail);
			this.ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
			this.ctx.stroke();
			this.ctx.restore();
		};

		hand(((hours % 12) + minutes / 60) / 12 * Math.PI * 2 - Math.PI / 2, radius * 0.52, radius * 0.048, text);
		hand((minutes + seconds / 60) / 60 * Math.PI * 2 - Math.PI / 2, radius * 0.78, radius * 0.03, text);
		hand(seconds / 60 * Math.PI * 2 - Math.PI / 2, radius * 0.86, radius * 0.013, accent, radius * 0.2);

		this.dot(centerX, centerY, radius * 0.038, accent, 1);
		this.dot(centerX, centerY, radius * 0.016, this.config.theme.bg, 1);

		const pad = (value: number) => String(value).padStart(2, "0");
		this.drawText(`${pad(hours)}:${pad(minutes)}`, centerX, layout.digitalY, layout.timeSize, 300);
		const weekday = WEEKDAY_LETTERS[(this.now.getDay() + 6) % 7];
		this.drawText(`${this.now.getMonth() + 1}月${this.now.getDate()}日 · 星期${weekday}`, centerX, layout.dateY, layout.dateSize, "500", 0.55);
	}

	private drawMinimal() {
		const layout = calculateMinimalLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(String(layout.year), frame.marginX, frame.eyebrowY, Math.min(this.width * 0.034, this.height * 0.022), "left", 0.9);
		this.eyebrow(`DAY ${layout.todayIndex + 1} / ${layout.totalDays}`, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.5);
		this.drawText(`${layout.percent}%`, frame.marginX, layout.heroY, layout.heroSize, 200, 1, { align: "left" });
		this.ctx.save();
		this.ctx.fillStyle = accent;
		this.ctx.fillRect(frame.marginX, layout.ruleY, layout.ruleWidth, layout.ruleHeight);
		this.ctx.restore();
		this.drawText(`还剩 ${layout.daysLeft} 天`, frame.marginX, layout.captionY, layout.captionSize, "500", 0.65, { align: "left" });
	}
}
