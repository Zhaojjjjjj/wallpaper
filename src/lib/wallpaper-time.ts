import { toWallClockDate } from "./wallpaper-progress";
import { WallpaperType } from "./types";

export function millisecondsUntilNextMinute(now: Date): number {
	const elapsed = now.getSeconds() * 1000 + now.getMilliseconds();
	return 60_000 - elapsed;
}

export function millisecondsUntilNextDay(now: Date): number {
	const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
	return nextDay.getTime() - now.getTime();
}

function wallClockTimestamp(date: Date): number {
	return Date.UTC(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	);
}

function millisecondsUntilNextDayInTimeZone(instant: Date, timeZone: string): number {
	const wallClock = toWallClockDate(instant, timeZone);
	const targetWallClock = Date.UTC(wallClock.getFullYear(), wallClock.getMonth(), wallClock.getDate() + 1);
	let targetInstant = targetWallClock;

	for (let iteration = 0; iteration < 4; iteration++) {
		const renderedWallClock = toWallClockDate(new Date(targetInstant), timeZone);
		targetInstant += targetWallClock - wallClockTimestamp(renderedWallClock);
	}

	return Math.max(1, targetInstant - instant.getTime());
}

export function millisecondsUntilWallpaperUpdate(type: WallpaperType, now: Date, timeZone?: string): number {
	return type === "day"
		? millisecondsUntilNextMinute(toWallClockDate(now, timeZone))
		: timeZone
			? millisecondsUntilNextDayInTimeZone(now, timeZone)
			: millisecondsUntilNextDay(now);
}

export function getWallpaperCacheSeconds(type: WallpaperType, now: Date, timeZone?: string): number {
	return Math.max(0, Math.floor(millisecondsUntilWallpaperUpdate(type, now, timeZone) / 1000));
}
