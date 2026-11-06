"use client";

import React, { useState } from "react";
import { PreviewCanvas } from "@/components/generator/PreviewCanvas";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { ConfigPanel } from "@/components/generator/ConfigPanel";
import { UrlGenerator } from "@/components/generator/UrlGenerator";
import { Header } from "@/components/layout/Header";
import { WallpaperConfig, DEFAULT_CONFIG } from "@/lib/types";
import { selectWallpaperType } from "@/lib/wallpaper-config";
import styles from "./page.module.css";

export default function Home() {
	const [config, setConfig] = useState<WallpaperConfig>(DEFAULT_CONFIG);

	return (
		<>
			<Header />
			<main className={styles.main}>
				<div className="container">
					<section className={styles.hero}>
						<p className={styles.eyebrow}>LIFEGRID</p>
						<h1 className={styles.heroTitle}>把时间，做成壁纸。</h1>
						<p className={styles.heroDesc}>选择一种时间尺度，生成只属于你的进度壁纸。链接直出 PNG，可接入快捷指令，每天自动更新。</p>
					</section>
				</div>
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
							<StyleSelector selected={config.type} theme={config.theme} onSelect={(type) => setConfig((current) => selectWallpaperType(current, type))} />
						</section>

						<section className={styles.section}>
							<ConfigPanel config={config} onChange={setConfig} />
							<UrlGenerator config={config} />
						</section>
						</div>
					</div>
			</main>
		</>
	);
}
