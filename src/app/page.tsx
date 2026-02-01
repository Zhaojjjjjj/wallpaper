"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PreviewCanvas } from "@/components/generator/PreviewCanvas";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { ConfigPanel } from "@/components/generator/ConfigPanel";
import { UrlGenerator } from "@/components/generator/UrlGenerator";
import { WallpaperConfig, DEFAULT_CONFIG } from "@/lib/types";
import styles from "./page.module.css";
import { Button } from "@/components/common/Button";

export default function Home() {
	const [config, setConfig] = useState<WallpaperConfig>(DEFAULT_CONFIG);

	const handleDownload = () => {
		const canvas = document.querySelector("canvas");
		if (!canvas) return;

		const link = document.createElement("a");
		link.download = `lifegrid-${config.type}-${Date.now()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
	};

	return (
		<main className={styles.main}>
			<Header />

			<div className={`container ${styles.grid}`}>
				{/* Left Column: Preview (Sticky) */}
				<div className={styles.previewCol}>
					<div className={styles.stickyWrapper}>
						<PreviewCanvas config={config} />
						<div className={styles.actions}>
							<Button onClick={handleDownload} className={styles.downloadBtn}>
								Download Wallpaper
							</Button>
						</div>
					</div>
				</div>

				{/* Right Column: Controls */}
				<div className={styles.controlsCol}>
					<section className={styles.section}>
						<h2 className={styles.sectionHeading}>Choose Style</h2>
						<StyleSelector selected={config.type} onSelect={(type) => setConfig({ ...config, type })} />
					</section>

					<section className={styles.section}>
						<ConfigPanel config={config} onChange={setConfig} />
						<UrlGenerator config={config} />
					</section>
				</div>
			</div>
		</main>
	);
}
