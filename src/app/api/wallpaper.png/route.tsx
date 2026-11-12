import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findWallpaperQueryIssues, parseWallpaperConfig } from "@/lib/wallpaper-config";
import { getWallpaperTextLayers, renderWallpaperSvg, svgToDataUrl } from "@/lib/wallpaper-svg";
import { calculateLyricLayout } from "@/lib/wallpaper-layout";
import { LYRIC_FONT_NAMES } from "@/lib/lyric-fonts";
import type { LyricFont } from "@/lib/types";
import { toWallClockDate } from "@/lib/wallpaper-progress";
import { getWallpaperCacheSeconds } from "@/lib/wallpaper-time";

export const runtime = "nodejs";
const toArrayBuffer = (font: Buffer) => font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer;

// Literal paths so the deployment file tracing bundles the font files.
const notoSansSc = readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/NotoSansSC-Regular.otf")).then(toArrayBuffer);
const lyricFontData: Partial<Record<LyricFont, Promise<ArrayBuffer | null>>> = {
	wenkai: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/wenkai-lyric.woff")).then(toArrayBuffer).catch(() => null),
	serif: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/serif-lyric.woff")).then(toArrayBuffer).catch(() => null),
	brush: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/brush-lyric.woff")).then(toArrayBuffer).catch(() => null),
};

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
	const instant = new Date();
	const now = toWallClockDate(instant, config.timeZone);
	const svg = renderWallpaperSvg(config, now, false);
	const imageSource = svgToDataUrl(svg);
	const textLayers = getWallpaperTextLayers(config, now);
	const lyricLayout = config.type === "lyric" ? calculateLyricLayout(config, now) : null;
	const filename = `lifegrid-${config.type}-${config.width}x${config.height}.png`;
	const cacheSeconds = getWallpaperCacheSeconds(instant, config.timeZone);
	const fontData = await notoSansSc;
	// Lyric subsets load only for the lyric type, and a missing file degrades
	// to the base font instead of failing the whole render.
	const lyricFonts: { name: string; data: ArrayBuffer; weight: 400; style: "normal" }[] = [];
	if (config.type === "lyric") {
		for (const id of ["wenkai", "serif", "brush"] as const) {
			const data = await lyricFontData[id];
			if (data) lyricFonts.push({ name: LYRIC_FONT_NAMES[id], data, weight: 400, style: "normal" });
		}
	}

	return new ImageResponse(
		(
			<div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: config.theme.bg }}>
				{/* ImageResponse requires a renderable image element; next/image is not available in this server renderer. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={imageSource} width={config.width} height={config.height} alt="" />
				{lyricLayout?.cover.url ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={lyricLayout.cover.url}
						width={lyricLayout.cover.size}
						height={lyricLayout.cover.size}
						alt=""
						style={{ position: "absolute", left: lyricLayout.cover.x, top: lyricLayout.cover.y, objectFit: "cover" }}
					/>
				) : null}
				{textLayers.map((layer, index) => (
					<div
						key={`${index}-${layer.text}`}
						style={{
							display: "flex",
							position: "absolute",
							left: layer.x,
							top: layer.y,
							transform: layer.align === "left" ? "translate(0, -50%)" : layer.align === "right" ? "translate(-100%, -50%)" : "translate(-50%, -50%)",
						...(layer.tracking ? { letterSpacing: `${layer.tracking}px` } : {}),
							color: layer.color ?? config.theme.text,
							fontFamily: layer.font ? LYRIC_FONT_NAMES[layer.font] : "Noto Sans SC",
							fontSize: layer.size,
							fontWeight: layer.weight,
							opacity: layer.opacity,
							whiteSpace: "nowrap",
						}}
					>
						{layer.text}
					</div>
				))}
			</div>
		),
		{
			fonts: [
				{
					name: "Noto Sans SC",
					data: fontData,
					weight: 400,
					style: "normal",
				},
				...lyricFonts,
			],
			width: config.width,
			height: config.height,
			headers: {
				"Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
				"Content-Disposition": `inline; filename="${filename}"`,
				"X-LifeGrid-Font": "Noto Sans SC",
			},
		}
	);
}
