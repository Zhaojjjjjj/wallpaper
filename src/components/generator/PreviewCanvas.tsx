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
	const engineRef = useRef<WallpaperEngine | null>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Initialize or update engine
		// We recreate engine on config change for simplicity,
		// or just call render if we made engine stateful (but engine is currently stateless-ish draw helper)
		const engine = new WallpaperEngine(ctx, config);
		engineRef.current = engine;

		// Render
		engine.render();

		// Optional: Animation loop if needed (e.g. for day clock updates),
		// but for wallpaper generator usually static is fine.
		// However, original had animate(). Let's stick to static update on config change for performance,
		// unless type is 'day' which might need live updates?
		// Let's re-render "Day" every minute if we wanted, but config change triggers re-render anyway.
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
