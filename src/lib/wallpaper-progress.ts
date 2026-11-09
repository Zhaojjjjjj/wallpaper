const DAY_MS = 24 * 60 * 60 * 1000;

function calendarDayNumber(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

function clampProgress(value: number): number {
	return Math.min(1, Math.max(0, value));
}

export function toWallClockDate(instant: Date, timeZone?: string): Date {
	if (!timeZone) return new Date(instant);

	try {
		const parts = new Intl.DateTimeFormat("en-CA", {
			timeZone,
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hourCycle: "h23",
		}).formatToParts(instant);
		const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

		return new Date(
			Number(values.year),
			Number(values.month) - 1,
			Number(values.day),
			Number(values.hour),
			Number(values.minute),
			Number(values.second),
			instant.getMilliseconds()
		);
	} catch {
		return new Date(instant);
	}
}

export function calculateMonthProgress(now: Date): number {
	const current = calendarDayNumber(now);
	const start = Date.UTC(now.getFullYear(), now.getMonth(), 1) / DAY_MS;
	const end = Date.UTC(now.getFullYear(), now.getMonth() + 1, 1) / DAY_MS;
	return clampProgress((current - start) / (end - start));
}

export function calculateYearProgress(now: Date): number {
	const current = calendarDayNumber(now);
	const start = Date.UTC(now.getFullYear(), 0, 1) / DAY_MS;
	const end = Date.UTC(now.getFullYear() + 1, 0, 1) / DAY_MS;
	return clampProgress((current - start) / (end - start));
}

export function getDayOfYearInfo(now: Date): { index: number; total: number } {
	const start = Date.UTC(now.getFullYear(), 0, 1) / DAY_MS;
	const end = Date.UTC(now.getFullYear() + 1, 0, 1) / DAY_MS;
	return { index: calendarDayNumber(now) - start, total: end - start };
}

export function getMonthInfo(now: Date): { daysInMonth: number; firstDayOffset: number; today: number } {
	const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
	const firstWeekday = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
	// Monday-first calendar: Sunday (0) becomes column 6.
	return { daysInMonth, firstDayOffset: (firstWeekday + 6) % 7, today: now.getDate() };
}

