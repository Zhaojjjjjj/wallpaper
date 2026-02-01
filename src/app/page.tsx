"use client";

import React, { useState } from "react";
import { PreviewCanvas } from "@/components/generator/PreviewCanvas";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { ConfigPanel } from "@/components/generator/ConfigPanel";
import { UrlGenerator } from "@/components/generator/UrlGenerator";
import { WallpaperConfig, DEFAULT_CONFIG } from "@/lib/types";
import styles from "./page.module.css";

export default function Home() {
	const [config, setConfig] = useState<WallpaperConfig>(DEFAULT_CONFIG);

	return (
		<main className={styles.main}>
			<div className={`container ${styles.grid}`}>
				{/* Left Column: Preview (Sticky) */}
				<div className={styles.previewCol}>
					<div className={styles.stickyWrapper}>
						<PreviewCanvas config={config} />
					</div>
				</div>

				{/* Right Column: Controls */}
				<div className={styles.controlsCol}>
					<section className={styles.section}>
						<h2 className={styles.sectionHeading}>选择样式</h2>
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
