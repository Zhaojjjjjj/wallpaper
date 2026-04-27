import React, { useEffect, useRef } from "react";
import { WallpaperConfig } from "@/lib/types";
import { WallpaperEngine } from "@/lib/wallpaper-engine";
import styles from "./PreviewCanvas.module.css";

interface PreviewCanvasProps {
	config: WallpaperConfig;
	className?: string;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ config, className = "" }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const engine = new WallpaperEngine(ctx, config);
		engine.render();
	}, [config]);

	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.canvasWrapper} style={{ aspectRatio: `${config.width} / ${config.height}` }}>
				<canvas ref={canvasRef} width={config.width} height={config.height} className={styles.canvas} />
			</div>
			<div className={styles.info}>
				{config.width} x {config.height}
			</div>
		</div>
	);
};
