import React, { useMemo } from "react";
import { Card } from "@/components/common/Card";
import { WallpaperCanvas } from "./WallpaperCanvas";
import { WallpaperConfig, WallpaperType } from "@/lib/types";
import { STRINGS, type Lang } from "@/lib/i18n";
import styles from "./StyleSelector.module.css";

interface StyleSelectorProps {
	lang: Lang;
	selected: WallpaperType;
	theme: WallpaperConfig["theme"];
	onSelect: (type: WallpaperType) => void;
}

const STYLE_IDS: WallpaperType[] = ["calendar", "generative", "lyric", "month", "minimal"];

function sampleConfig(type: WallpaperType, theme: WallpaperConfig["theme"]): WallpaperConfig {
	return { type, width: 300, height: 460, theme };
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ lang, selected, theme, onSelect }) => {
	const strings = STRINGS[lang];
	const previews = useMemo(
		() => Object.fromEntries(STYLE_IDS.map((id) => [id, sampleConfig(id, theme)])) as Record<WallpaperType, WallpaperConfig>,
		[theme]
	);

	return (
		<div className={styles.grid}>
			{STYLE_IDS.map((id) => (
				<Card key={id} isInteractive isActive={selected === id} onClick={() => onSelect(id)} className={styles.card}>
					<div className={styles.preview} aria-hidden="true">
						<WallpaperCanvas config={previews[id]} className={styles.previewCanvas} />
					</div>
					<div className={styles.body}>
						<div className={styles.header}>
							<span className={styles.name}>{strings.styles[id].name}</span>
							{selected === id && <div className={styles.dot} />}
						</div>
						<p className={styles.desc}>{strings.styles[id].desc}</p>
					</div>
				</Card>
			))}
		</div>
	);
};
