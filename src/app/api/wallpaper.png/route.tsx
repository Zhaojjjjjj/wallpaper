import { findWallpaperQueryIssues, parseWallpaperConfig } from "@/lib/wallpaper-config";
import { renderWallpaperImage } from "@/lib/wallpaper-image";

export const runtime = "nodejs";
// Run this function in Hong Kong: the audience is in mainland China, and the
// default US-East region made first renders of the day slow (3.5s+ before the
// first byte, plus a 1.26MB trans-Pacific download, which timed out on phones).
// The project-level Function Region setting (hkg1, set 2026-11-22) is what
// actually pins the region; this export stays as a per-route hint.
export const preferredRegion = "hkg1";

export async function GET(request: Request) {
	const searchParams = new URL(request.url).searchParams;
	const queryIssues = findWallpaperQueryIssues(searchParams);
	if (queryIssues.length > 0) {
		return Response.json(
			{ code: "INVALID_QUERY", issues: queryIssues },
			{ status: 400, headers: { "Cache-Control": "no-store" } }
		);
	}

	const config = parseWallpaperConfig(searchParams);
	return renderWallpaperImage(config, new Date());
}
