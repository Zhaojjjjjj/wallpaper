import { WallpaperConfig } from "./types";

export class WallpaperEngine {
	private ctx: CanvasRenderingContext2D;
	private config: WallpaperConfig;
	private width: number;
	private height: number;

	constructor(ctx: CanvasRenderingContext2D, config: WallpaperConfig) {
		this.ctx = ctx;
		this.config = config;
		this.width = config.width;
		this.height = config.height;
	}

	public render() {
		try {
			// Clear background
			this.ctx.fillStyle = this.config.theme.bg;
			this.ctx.fillRect(0, 0, this.width, this.height);

			// Render based on type
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
				case "minimal":
					this.drawMinimal();
					break;
				default:
					this.drawText("未知的壁纸类型", this.width / 2, this.height / 2, 40);
			}
		} catch (error) {
			// Handle any rendering errors gracefully
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
		const now = new Date();
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
		const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
		const daysPassed = (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
		const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

		// Use legacy style logic: 10 rows x 13 cols = 130 cells.
		const lCols = 13;
		const lRows = 10;

		const cellSize = Math.min(this.width, this.height) / 28;
		const gap = cellSize * 0.25;
		const gridWidth = lCols * cellSize + (lCols - 1) * gap;
		const gridHeight = lRows * cellSize + (lRows - 1) * gap;

		const startX = (this.width - gridWidth) / 2;
		const startY = (this.height - gridHeight) / 2 - this.height * 0.05;

		const filledCount = Math.floor((percent / 100) * (lCols * lRows));

		for (let i = 0; i < lCols * lRows; i++) {
			const row = Math.floor(i / lCols);
			const col = i % lCols;
			const x = startX + col * (cellSize + gap);
			const y = startY + row * (cellSize + gap);

			this.ctx.fillStyle = this.config.theme.accent;
			this.ctx.globalAlpha = i < filledCount ? 1 : 0.2;

			this.roundRect(x, y, cellSize, cellSize, cellSize * 0.2);
			this.ctx.fill();
		}

		this.ctx.globalAlpha = 1;

		// Text - better spacing
		const textY = startY + gridHeight + this.height * 0.12;
		this.drawText(`${Math.floor(percent)}%`, this.width / 2, textY, Math.min(this.width, this.height) / 10, "bold");
		this.drawText(String(now.getFullYear()), this.width / 2, textY + this.height * 0.08, Math.min(this.width, this.height) / 22, "500", 0.6);
	}

	private drawLife() {
		if (!this.config.birthDate) {
			this.drawText("Please set birth date", this.width / 2, this.height / 2, 40);
			return;
		}

		// Validate birth date
		const birthDate = new Date(this.config.birthDate);
		if (isNaN(birthDate.getTime())) {
			this.drawText("Invalid birth date", this.width / 2, this.height / 2, 40);
			return;
		}

		const now = new Date();
		const lifespanWeeks = (this.config.lifespan || 80) * 52;
		const weeksLived = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

		const cols = 26; // 26 weeks per row (half year)
		const rows = Math.ceil(lifespanWeeks / cols);

		const cellSize = Math.min(this.width / (cols + 4), this.height / (rows + 20));
		const gap = cellSize * 0.2;
		const gridWidth = cols * cellSize + (cols - 1) * gap;
		const gridHeight = rows * cellSize + (rows - 1) * gap;

		const startX = (this.width - gridWidth) / 2;
		const startY = (this.height - gridHeight) / 2;

		for (let i = 0; i < lifespanWeeks; i++) {
			const row = Math.floor(i / cols);
			const col = i % cols;
			const x = startX + col * (cellSize + gap);
			const y = startY + row * (cellSize + gap);

			this.ctx.fillStyle = this.config.theme.accent;

			if (i < weeksLived) {
				this.ctx.globalAlpha = 1;
			} else if (i === weeksLived) {
				this.ctx.globalAlpha = 1;
				this.ctx.shadowColor = this.config.theme.accent;
				this.ctx.shadowBlur = cellSize;
			} else {
				this.ctx.globalAlpha = 0.15;
				this.ctx.shadowBlur = 0;
			}

			this.ctx.beginPath();
			this.ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2.5, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.shadowBlur = 0;
		}

		this.ctx.globalAlpha = 1;
		const statsY = this.height - this.height * 0.08;
		this.drawText(`${weeksLived.toLocaleString()} / ${lifespanWeeks.toLocaleString()} Weeks`, this.width / 2, statsY, Math.min(this.width, this.height) / 40, "500", 0.6);
	}

	private drawGoal() {
		// Use default target date (7 days from now) if not set
		const targetDateStr = this.config.targetDate || this.getDefaultTargetDate();
		const target = new Date(targetDateStr);

		// Validate target date
		if (isNaN(target.getTime())) {
			this.drawText("Invalid target date", this.width / 2, this.height / 2, 40);
			return;
		}

		const now = new Date();
		const daysLeft = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		const centerX = this.width / 2;
		const centerY = this.height / 2;
		const radius = Math.min(this.width, this.height) / 6;

		// Ring
		this.ctx.beginPath();
		this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		this.ctx.strokeStyle = this.config.theme.accent;
		this.ctx.globalAlpha = 0.2;
		this.ctx.lineWidth = radius * 0.08;
		this.ctx.stroke();

		// Progress ring
		const MAX_DAYS = 100;
		const progress = Math.min(1, Math.max(0, (MAX_DAYS - daysLeft) / MAX_DAYS));

		this.ctx.beginPath();
		const startAngle = -Math.PI / 2;
		const endAngle = startAngle + Math.PI * 2 * progress;
		this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
		this.ctx.globalAlpha = 1;
		this.ctx.stroke();

		// Days number - larger and centered
		this.drawText(Math.max(0, daysLeft).toString(), centerX, centerY - radius * 0.1, radius * 0.9, "bold");

		// Days left label - below the number with proper spacing
		this.drawText("剩余天数", centerX, centerY + radius * 0.5, radius * 0.18, "500", 0.7);

		// Goal name - at the bottom with more spacing
		const goalName = this.config.goalName || "我的目标";
		this.drawText(goalName, centerX, this.height * 0.68, Math.min(this.width * 0.06, 60), "600");
	}

	private getDefaultTargetDate(): string {
		const date = new Date();
		date.setDate(date.getDate() + 7); // Default to 7 days from now
		return date.toISOString().split("T")[0];
	}

	private drawMonth() {
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
		const total = end.getDate();
		const current = now.getDate();
		const percent = current / total;

		// Draw a sleek bar
		const barWidth = this.width * 0.75;
		const barHeight = Math.min(this.height * 0.025, 50);
		const x = (this.width - barWidth) / 2;
		const y = this.height / 2;

		this.ctx.fillStyle = this.config.theme.accent;
		this.ctx.globalAlpha = 0.2;
		this.roundRect(x, y, barWidth, barHeight, barHeight / 2);
		this.ctx.fill();

		this.ctx.globalAlpha = 1;
		this.roundRect(x, y, barWidth * percent, barHeight, barHeight / 2);
		this.ctx.fill();

		// Better spacing for text
		this.drawText(`${Math.floor(percent * 100)}%`, this.width / 2, y - this.height * 0.08, Math.min(this.width * 0.12, 100), "bold");
		const monthName = now.toLocaleString("zh-CN", { month: "long" });
		this.drawText(monthName, this.width / 2, y + this.height * 0.1, Math.min(this.width * 0.06, 50), "500", 0.7);
	}

	private drawWeek() {
		// 7 dots
		const now = new Date();
		const day = now.getDay() || 7; // 1-7

		const dotSize = Math.min(this.width / 12, this.height / 20);
		const gap = dotSize * 0.6;
		const totalW = 7 * dotSize + 6 * gap;
		let startX = (this.width - totalW) / 2;
		const centerY = this.height / 2;

		for (let i = 1; i <= 7; i++) {
			this.ctx.fillStyle = this.config.theme.accent;
			if (i <= day) {
				this.ctx.globalAlpha = 1;
				if (i === day) this.ctx.shadowBlur = dotSize * 0.3;
			} else {
				this.ctx.globalAlpha = 0.2;
				this.ctx.shadowBlur = 0;
			}

			this.ctx.beginPath();
			this.ctx.arc(startX + dotSize / 2, centerY, dotSize / 2.2, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.shadowBlur = 0;

			startX += dotSize + gap;
		}

		// Better spacing for label
		this.drawText("本周", this.width / 2, centerY + dotSize + this.height * 0.06, Math.min(this.width * 0.06, 50), "500", 0.8);
	}

	private drawDay() {
		const now = new Date();
		const minutes = now.getHours() * 60 + now.getMinutes();
		const total = 24 * 60;
		const percent = minutes / total;

		const cx = this.width / 2;
		const cy = this.height / 2;
		const r = this.width * 0.3;

		// Clock face
		this.ctx.beginPath();
		this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
		this.ctx.strokeStyle = this.config.theme.accent;
		this.ctx.lineWidth = 4;
		this.ctx.globalAlpha = 0.3;
		this.ctx.stroke();

		// Hands (Visual only)
		const hourAngle = (((now.getHours() % 12) + now.getMinutes() / 60) * 30 * Math.PI) / 180; // 360/12 = 30
		const minAngle = (now.getMinutes() * 6 * Math.PI) / 180; // 360/60 = 6

		this.ctx.globalAlpha = 1;
		this.drawHand(cx, cy, hourAngle, r * 0.5, 12);
		this.drawHand(cx, cy, minAngle, r * 0.8, 6);

		this.drawText(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`, cx, cy + r + 100, 80, "bold");
	}

	private drawMinimal() {
		const now = new Date();
		const startOfYear = new Date(now.getFullYear(), 0, 1);
		const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
		const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
		const daysPassed = (now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24);
		const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));

		const cx = this.width / 2;
		const cy = this.height / 2;

		// Better proportion for minimal style
		this.drawText(`${Math.floor(percent)}%`, cx, cy - this.height * 0.02, this.width * 0.3, "800");
		this.drawText(String(now.getFullYear()), cx, cy + this.height * 0.12, Math.min(this.width * 0.06, 60), "300", 0.5);
	}

	// --- Helpers ---

	private drawHand(cx: number, cy: number, angle: number, length: number, width: number) {
		this.ctx.save();
		this.ctx.translate(cx, cy);
		this.ctx.rotate(angle);
		this.ctx.beginPath();
		this.ctx.moveTo(0, 0);
		this.ctx.lineTo(0, -length);
		this.ctx.lineWidth = width;
		this.ctx.strokeStyle = this.config.theme.accent;
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

	private drawText(text: string, x: number, y: number, size: number, weight = "normal", alpha = 1) {
		this.ctx.globalAlpha = alpha;
		this.ctx.fillStyle = this.config.theme.accent; // Or text color, but usually accent for wallpaper
		// Fallback font stack
		this.ctx.font = `${weight} ${size}px Inter, -apple-system, sans-serif`;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillText(text, x, y);
		this.ctx.globalAlpha = 1;
	}
}
