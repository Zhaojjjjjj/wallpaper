import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findWallpaperQueryIssues, parseWallpaperConfig } from "@/lib/wallpaper-config";
import { getWallpaperTextLayers, renderWallpaperSvg, svgToDataUrl } from "@/lib/wallpaper-svg";
import { toWallClockDate } from "@/lib/wallpaper-progress";
import { getWallpaperCacheSeconds } from "@/lib/wallpaper-time";

export const runtime = "nodejs";
const notoSansSc = readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/NotoSansSC-Regular.otf"))
	.then((font) => font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer);

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
	const filename = `lifegrid-${config.type}-${config.width}x${config.height}.png`;
	const cacheSeconds = getWallpaperCacheSeconds(config.type, instant, config.timeZone);
	const fontData = await notoSansSc;

	return new ImageResponse(
		(
			<div style={{ display: "flex", position: "relative", width: "100%", height: "100%", background: config.theme.bg }}>
				{/* ImageResponse requires a renderable image element; next/image is not available in this server renderer. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={imageSource} width={config.width} height={config.height} alt="" />
				{textLayers.map((layer, index) => (
					<div
						key={`${index}-${layer.text}`}
						style={{
							display: "flex",
							position: "absolute",
							left: layer.x,
							top: layer.y,
							transform: "translate(-50%, -50%)",
							color: config.theme.text,
							fontFamily: "Noto Sans SC",
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
