import React from "react";
import { WallpaperConfig } from "@/lib/types";
import { WallpaperCanvas } from "./WallpaperCanvas";
import styles from "./PreviewCanvas.module.css";

interface PreviewCanvasProps {
	config: WallpaperConfig;
	className?: string;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({ config, className = "" }) => {
	return (
		<div className={`${styles.container} ${className}`}>
			<div className={styles.canvasWrapper} style={{ aspectRatio: `${config.width} / ${config.height}` }}>
				<WallpaperCanvas config={config} className={styles.canvas} />
			</div>
			<div className={styles.info}>
				{config.width} x {config.height}
			</div>
		</div>
	);
};
