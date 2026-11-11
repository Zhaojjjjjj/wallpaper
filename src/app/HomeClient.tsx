"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PreviewCanvas } from "@/components/generator/PreviewCanvas";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { ConfigPanel } from "@/components/generator/ConfigPanel";
import { UrlGenerator } from "@/components/generator/UrlGenerator";
import { IosGuide } from "@/components/generator/IosGuide";
import { Header } from "@/components/layout/Header";
import { WallpaperConfig, DEFAULT_CONFIG } from "@/lib/types";
import { selectWallpaperType } from "@/lib/wallpaper-config";
import { LANG_COOKIE, STRINGS, type Lang } from "@/lib/i18n";
import styles from "./page.module.css";

export default function HomeClient({ initialLang }: { initialLang: Lang }) {
	const [config, setConfig] = useState<WallpaperConfig>(DEFAULT_CONFIG);
	const [lang, setLang] = useState<Lang>(initialLang);
	const router = useRouter();
	const strings = STRINGS[lang];

	const handleLangChange = (next: Lang) => {
		setLang(next);
		document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
		router.refresh();
	};

	return (
		<>
			<Header lang={lang} onLangChange={handleLangChange} />
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
							<h2 className={styles.sectionHeading}>{strings.stylesHeading}</h2>
							<StyleSelector lang={lang} selected={config.type} theme={config.theme} onSelect={(type) => setConfig((current) => selectWallpaperType(current, type))} />
						</section>

						<section className={styles.section}>
							<ConfigPanel lang={lang} config={config} onChange={setConfig} />
							<UrlGenerator lang={lang} config={config} />
							<IosGuide lang={lang} />
						</section>
					</div>
				</div>
			</main>
		</>
	);
}
