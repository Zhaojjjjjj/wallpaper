import { WallpaperConfig } from "./types";
import { toWallClockDate } from "./wallpaper-progress";
import {
	TRACK_OPACITY,
	calculateCalendarLayout,
			calculateGenerativeLayout,
	calculateLyricLayout,
	calculateMinimalLayout,
			calculateMonthLayout,
			} from "./wallpaper-layout";
import type { GenPath, MotifCircle, MotifLine } from "./wallpaper-layout";

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
			case "month":
				this.drawMonth();
				break;
			case "calendar":
				this.drawCalendar();
				break;
			case "minimal":
				this.drawMinimal();
				break;
			case "generative":
				this.drawGenerative();
				break;
			case "lyric":
				this.drawLyric();
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

	private drawCalendar() {
		const layout = calculateCalendarLayout(this.config, this.now);
		const { accent } = this.config.theme;
		const frame = layout.frame;

		this.eyebrow(`${layout.monthEn} · ${layout.monthName}`, frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left", 0.6);
		this.eyebrow(`${String(layout.dayOfYear).padStart(3, "0")} / ${layout.totalDays}`, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.45);
		this.hairline(frame.marginX, frame.rightX, layout.headerRuleY, accent, TRACK_OPACITY, 1);

		this.drawText(String(layout.dayOfMonth), frame.marginX - layout.dateSize * 0.03, layout.dateY, layout.dateSize, 300, 1, { align: "left" });
		this.drawText(layout.weekdayCn, frame.marginX, layout.weekdayY, layout.weekdaySize, "500", 0.95, { align: "left" });
		this.drawText(layout.weekdayEn, frame.rightX, layout.weekdayY, layout.weekdaySize * 0.48, "600", 0.45, { align: "right", tracking: layout.weekdaySize * 0.18 });
		if (layout.isWeekend) this.dot(layout.weekendDotX, layout.weekendDotY, Math.max(3, layout.weekdaySize * 0.14), accent, 1);

		// The month's small line motif.
		this.drawMotifLines(layout.motifLines);
		this.drawMotifCircles(layout.motifCircles);
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

private drawMotifLines(lines: MotifLine[]) {
		const { accent, text } = this.config.theme;
		for (const stroke of lines) {
			this.ctx.save();
			this.ctx.strokeStyle = stroke.color ?? (stroke.accent ? accent : text);
			this.ctx.globalAlpha = 0.85;
			this.ctx.lineWidth = stroke.width;
			this.ctx.lineCap = "round";
			this.ctx.beginPath();
			this.ctx.moveTo(stroke.x1, stroke.y1);
			this.ctx.lineTo(stroke.x2, stroke.y2);
			this.ctx.stroke();
			this.ctx.restore();
		}
	}

	private drawMotifCircles(circles: MotifCircle[]) {
		const { accent, text, bg } = this.config.theme;
		for (const circle of circles) {
			if (circle.bgFilled) this.dot(circle.cx, circle.cy, circle.r, bg, 1);
			else if (circle.filled) this.dot(circle.cx, circle.cy, circle.r, circle.fill ?? (circle.accent ? accent : text), circle.opacity ?? 0.9);
			else {
				this.ctx.save();
				this.ctx.globalAlpha = circle.opacity ?? 1;
				this.ctx.strokeStyle = circle.color ?? (circle.accent ? accent : text);
				this.ctx.lineWidth = circle.width;
				this.ctx.beginPath();
				this.ctx.arc(circle.cx, circle.cy, circle.r, 0, Math.PI * 2);
				this.ctx.stroke();
				this.ctx.restore();
			}
		}
	}

	private drawGenPaths(paths: GenPath[]) {
		if (typeof Path2D === "undefined") return;
		const { accent, text } = this.config.theme;
		for (const path of paths) {
			const p2d = new Path2D(path.d);
			this.ctx.save();
			if (path.filled) {
				this.ctx.globalAlpha = path.opacity ?? 0.92;
				this.ctx.fillStyle = path.fill ?? (path.accent ? accent : text);
				this.ctx.fill(p2d);
			} else {
				this.ctx.globalAlpha = path.opacity ?? 0.9;
				this.ctx.strokeStyle = path.accent ? accent : text;
				this.ctx.lineWidth = path.width;
				this.ctx.lineCap = "round";
				this.ctx.lineJoin = "round";
				this.ctx.stroke(p2d);
			}
			this.ctx.restore();
		}
	}

	private drawLyric() {
		const layout = calculateLyricLayout(this.config, this.now);
		const frame = layout.frame;
		const { excerpt } = layout;
		this.eyebrow("歌词 · DAILY LYRIC", frame.marginX, frame.eyebrowY, frame.eyebrowSize, "left", 0.55);
		this.eyebrow(excerpt.artistEn, frame.rightX, frame.eyebrowY, frame.eyebrowSize, "right", 0.5);
		this.drawMotifLines([layout.dash]);
		excerpt.lines.forEach((line, i) => {
			this.drawText(line, frame.marginX, layout.firstLineY + i * layout.lineGap, layout.heroSize, "500", 1, { align: "left" });
		});
		this.drawText(`《${excerpt.song}》`, frame.marginX, layout.creditY, frame.footerSize * 1.4, "500", 0.72, { align: "left" });
		this.footer(`${excerpt.artist} · ${excerpt.artistEn}`, "歌词 · LYRICS", frame);
	}

	private drawGenerative() {
		const layout = calculateGenerativeLayout(this.config, this.now);
		this.drawGenPaths(layout.paths);
		this.drawMotifCircles(layout.dots);
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
