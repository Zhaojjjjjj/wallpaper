import React, { useEffect, useRef } from "react";
import { WallpaperConfig } from "@/lib/types";
import { WallpaperEngine } from "@/lib/wallpaper-engine";
import { millisecondsUntilWallpaperUpdate } from "@/lib/wallpaper-time";

interface WallpaperCanvasProps {
	config: WallpaperConfig;
	className?: string;
	/** Cap the longer raster edge (CSS previews); omit for full resolution. */
	maxRenderDimension?: number;
}

export const WallpaperCanvas: React.FC<WallpaperCanvasProps> = ({ config, className = "", maxRenderDimension }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const scale = maxRenderDimension ? Math.min(1, maxRenderDimension / Math.max(config.width, config.height)) : 1;
	const renderWidth = Math.max(1, Math.round(config.width * scale));
	const renderHeight = Math.max(1, Math.round(config.height * scale));

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const renderConfig: WallpaperConfig =
			scale === 1 ? config : { ...config, width: renderWidth, height: renderHeight };
		const render = () => new WallpaperEngine(ctx, renderConfig).render();
		let timer: number | undefined;

		const scheduleNextRender = () => {
			const delay = millisecondsUntilWallpaperUpdate(new Date(), config.timeZone);
			timer = window.setTimeout(() => {
				render();
				scheduleNextRender();
			}, delay);
		};

		render();
		scheduleNextRender();

		return () => {
			if (timer !== undefined) window.clearTimeout(timer);
		};
	}, [config, scale, renderWidth, renderHeight]);

	return <canvas ref={canvasRef} width={renderWidth} height={renderHeight} className={className} />;
};
