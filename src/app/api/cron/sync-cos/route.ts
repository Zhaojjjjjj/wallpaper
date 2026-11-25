import { parseWallpaperConfig } from "@/lib/wallpaper-config";
import { renderWallpaperImage } from "@/lib/wallpaper-image";
import { putCosObject } from "@/lib/cos-upload";

export const runtime = "nodejs";
// Same Hong Kong pin as the PNG route (project-level Function Region).
export const preferredRegion = "hkg1";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// zz's fixed wallpaper configuration (the one his iOS shortcut used to
// fetch directly from Vercel before China access became unreliable).
const ZZ_PARAMS: Record<string, string> = {
	type: "lyric",
	width: "1320",
	height: "2868",
	bg: "#fdfcf8",
	accent: "#c03926",
	text: "#1a1a18",
	timeZone: "Asia/Shanghai",
	font: "wenkai",
	format: "jpg",
};

// The cron fires the evening before (22:00 Asia/Shanghai) and pre-renders
// tomorrow's wallpaper, so Vercel's loose cron timing on the free plan can
// never miss the phone's 00:05 fetch. Returns tomorrow's Shanghai date and
// an instant at its noon (any time inside the day selects the same pick).
function tomorrowInShanghai(): { date: string; instant: Date } {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Shanghai",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date());
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
	const tomorrow = new Date(Date.UTC(get("year"), get("month") - 1, get("day") + 1));
	const date = tomorrow.toISOString().slice(0, 10);
	return { date, instant: new Date(`${date}T12:00:00+08:00`) };
}

export async function GET(request: Request) {
	const secret = process.env.CRON_SECRET;
	if (!secret) {
		return Response.json({ ok: false, error: "CRON_SECRET is not configured" }, { status: 500 });
	}
	if (request.headers.get("authorization") !== `Bearer ${secret}`) {
		return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
	}

	// Object key override exists so a manual test run can upload to a
	// scratch key instead of the live daily.jpg; the cron itself passes
	// no query and always writes daily.jpg.
	const key = new URL(request.url).searchParams.get("key") ?? "daily.jpg";
	if (!/^[a-z0-9][a-z0-9._-]*$/i.test(key)) {
		return Response.json({ ok: false, error: "invalid key" }, { status: 400 });
	}

	// Phase-labeled errors with the full cause chain: an undici
	// "fetch failed" alone does not say which fetch (cover image during
	// render, or the COS PUT) or why.
	const describe = (error: unknown): string => {
		const parts: string[] = [];
		let current: unknown = error;
		while (current instanceof Error) {
			const code = (current as { code?: string }).code;
			parts.push(code ? `${current.message} [${code}]` : current.message);
			current = current.cause;
		}
		return parts.join(" <- ") || String(error);
	};

	let phase = "render";
	try {
		const { date, instant } = tomorrowInShanghai();
		const config = parseWallpaperConfig(new URLSearchParams(ZZ_PARAMS));
		const rendered = await renderWallpaperImage(config, instant);
		const contentType = rendered.headers.get("Content-Type") ?? "";
		if (!contentType.includes("image/jpeg")) {
			throw new Error(`render did not produce a JPEG (Content-Type: ${contentType || "none"})`);
		}
		const body = Buffer.from(await rendered.arrayBuffer());
		if (body.length < 50_000) {
			throw new Error(`rendered JPEG suspiciously small (${body.length} bytes)`);
		}
		phase = "upload";
		await putCosObject(key, body, "image/jpeg");
		return Response.json({ ok: true, date, key, bytes: body.length });
	} catch (error) {
		return Response.json({ ok: false, phase, error: describe(error) }, { status: 500 });
	}
}
