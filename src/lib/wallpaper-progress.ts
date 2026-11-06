const DAY_MS = 24 * 60 * 60 * 1000;

function calendarDayNumber(date: Date): number {
	return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

function clampProgress(value: number): number {
	return Math.min(1, Math.max(0, value));
}

export function parseDateOnly(value: string | undefined): Date | null {
	const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;

	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(year, month - 1, day);

	if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
		return null;
	}

	return date;
}

export function formatDateOnly(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
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

export function calculateGoalProgress(
	startDateValue: string | undefined,
	targetDateValue: string | undefined,
	now: Date
): { daysLeft: number; progress: number; totalDays: number; elapsedDays: number } | null {
	const targetDate = parseDateOnly(targetDateValue);
	if (!targetDate) return null;

	const nowDay = calendarDayNumber(now);
	const targetDay = calendarDayNumber(targetDate);
	const daysLeft = Math.max(0, targetDay - nowDay);
	const startDate = parseDateOnly(startDateValue);

	if (!startDate) return { daysLeft, progress: 0, totalDays: 0, elapsedDays: 0 };

	const startDay = calendarDayNumber(startDate);
	const totalDays = targetDay - startDay;
	if (totalDays <= 0) return { daysLeft, progress: 0, totalDays: 0, elapsedDays: 0 };

	const elapsedDays = Math.min(totalDays, Math.max(0, nowDay - startDay));
	return {
		daysLeft,
		progress: clampProgress(elapsedDays / totalDays),
		totalDays,
		elapsedDays,
	};
}

export function calculateLifeWeeks(birthDateValue: string | undefined, now: Date, lifespanWeeks: number): number {
	return calculateLifeState(birthDateValue, now, lifespanWeeks).weeksLived;
}

export function calculateLifeState(
	birthDateValue: string | undefined,
	now: Date,
	lifespanWeeks: number
): { hasStarted: boolean; weeksLived: number } {
	const birthDate = parseDateOnly(birthDateValue);
	if (!birthDate) return { hasStarted: false, weeksLived: 0 };

	const elapsedDays = calendarDayNumber(now) - calendarDayNumber(birthDate);
	return {
		hasStarted: elapsedDays >= 0,
		weeksLived: Math.min(lifespanWeeks, Math.max(0, Math.floor(elapsedDays / 7))),
	};
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

export function getDayProgress(now: Date): number {
	const elapsedSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
	return clampProgress(elapsedSeconds / 86_400);
}

export interface WeekDayInfo {
	dayOfMonth: number;
	month: number;
}

export function getWeekInfo(now: Date): { todayIndex: number; weekNumber: number; days: WeekDayInfo[] } {
	const todayIndex = (now.getDay() + 6) % 7;
	const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayIndex);
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
		return { dayOfMonth: date.getDate(), month: date.getMonth() + 1 };
	});
	const { index } = getDayOfYearInfo(now);
	return { todayIndex, weekNumber: Math.floor(index / 7) + 1, days };
}
