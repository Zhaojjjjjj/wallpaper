import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getWallpaperTextLayers, renderWallpaperSvg, svgToDataUrl } from "@/lib/wallpaper-svg";
import { calculateLyricLayout } from "@/lib/wallpaper-layout";
import { LYRIC_FONT_NAMES } from "@/lib/lyric-fonts";
import type { LyricFont, WallpaperConfig } from "@/lib/types";
import { toWallClockDate } from "@/lib/wallpaper-progress";
import { getWallpaperCacheSeconds } from "@/lib/wallpaper-time";

const toArrayBuffer = (font: Buffer) => font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer;

// Literal paths so the deployment file tracing bundles the font files.
const notoSansSc = readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/NotoSansSC-Regular.otf")).then(toArrayBuffer);
const lyricFontData: Partial<Record<LyricFont, Promise<ArrayBuffer | null>>> = {
	wenkai: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/wenkai-lyric.woff")).then(toArrayBuffer).catch(() => null),
	serif: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/serif-lyric.woff")).then(toArrayBuffer).catch(() => null),
	brush: readFile(path.join(process.cwd(), "src/app/api/wallpaper.png/fonts/brush-lyric.woff")).then(toArrayBuffer).catch(() => null),
};

// Renders one wallpaper image for an explicit config and instant. Shared by
// the public PNG route (instant = now) and the COS sync cron route
// (instant = tomorrow noon in the config timezone, pre-rendered the
// evening before).
export async function renderWallpaperImage(config: WallpaperConfig, instant: Date): Promise<Response> {
	// renderWallpaperSvg and getWallpaperTextLayers convert to the config
	// timezone internally, so they take the raw instant; calculateLyricLayout
	// does not convert, so it takes the wall-clock date. Passing the shifted
	// date to all three double-shifts the text layers (tomorrow's lyrics over
	// today's cover after 16:00 in the config timezone).
	const wallNow = toWallClockDate(instant, config.timeZone);
	const svg = renderWallpaperSvg(config, instant, false);
	const imageSource = svgToDataUrl(svg);
	const textLayers = getWallpaperTextLayers(config, instant);
	const lyricLayout = config.type === "lyric" ? calculateLyricLayout(config, wallNow) : null;
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

	const imageResponse = new ImageResponse(
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

	if (config.format !== "jpg") return imageResponse;

	// JPEG output: a photo cover makes the PNG 1.3MB+, and on the slow
	// cross-border link to China that size is what times out on phones. A
	// quality-88 4:4:4 JPEG keeps text edges clean at a fraction of the
	// bytes. Any failure (e.g. sharp unavailable in the runtime) falls back
	// to the PNG response untouched.
	try {
		const sharp = (await import("sharp")).default;
		const png = Buffer.from(await imageResponse.clone().arrayBuffer());
		const jpeg = await sharp(png).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
		return new Response(new Uint8Array(jpeg), {
			headers: {
				"Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
				"Content-Disposition": `inline; filename="${filename.replace(/\.png$/, ".jpg")}"`,
				"Content-Type": "image/jpeg",
				"X-LifeGrid-Font": "Noto Sans SC",
			},
		});
	} catch {
		return imageResponse;
	}
}
