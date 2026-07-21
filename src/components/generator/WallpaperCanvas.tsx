import React, { useEffect, useRef } from "react";
import { WallpaperConfig } from "@/lib/types";
import { WallpaperEngine } from "@/lib/wallpaper-engine";
import { millisecondsUntilWallpaperUpdate } from "@/lib/wallpaper-time";

interface WallpaperCanvasProps {
	config: WallpaperConfig;
	className?: string;
}

export const WallpaperCanvas: React.FC<WallpaperCanvasProps> = ({ config, className = "" }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const render = () => new WallpaperEngine(ctx, config).render();
		let timer: number | undefined;

		const scheduleNextRender = () => {
			const delay = millisecondsUntilWallpaperUpdate(config.type, new Date(), config.timeZone);
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
	}, [config]);

	return <canvas ref={canvasRef} width={config.width} height={config.height} className={className} />;
};
