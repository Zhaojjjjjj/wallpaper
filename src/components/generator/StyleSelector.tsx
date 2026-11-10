import React, { useMemo } from "react";
import { Card } from "@/components/common/Card";
import { WallpaperCanvas } from "./WallpaperCanvas";
import { WallpaperConfig, WallpaperType } from "@/lib/types";
import styles from "./StyleSelector.module.css";

interface StyleSelectorProps {
	selected: WallpaperType;
	theme: WallpaperConfig["theme"];
	onSelect: (type: WallpaperType) => void;
}

const STYLES: { id: WallpaperType; name: string; desc: string }[] = [
	{ id: "calendar", name: "日历", desc: "每日一页，一天一句" },
	{ id: "generative", name: "生成", desc: "以日子为种子的抽象构图" },
	{ id: "lyric", name: "歌词", desc: "陈奕迅 · 赵雷 · 周杰伦，每日一段" },
	{ id: "month", name: "月历", desc: "真实日历，今日高亮" },
	{ id: "minimal", name: "极简", desc: "左对齐大字，只留百分比" },
];

function sampleConfig(type: WallpaperType, theme: WallpaperConfig["theme"]): WallpaperConfig {
	return { type, width: 300, height: 460, theme };
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selected, theme, onSelect }) => {
	const previews = useMemo(
		() => Object.fromEntries(STYLES.map((style) => [style.id, sampleConfig(style.id, theme)])) as Record<WallpaperType, WallpaperConfig>,
		[theme]
	);

	return (
		<div className={styles.grid}>
			{STYLES.map((style) => (
				<Card key={style.id} isInteractive isActive={selected === style.id} onClick={() => onSelect(style.id)} className={styles.card}>
					<div className={styles.preview} aria-hidden="true">
						<WallpaperCanvas config={previews[style.id]} className={styles.previewCanvas} />
					</div>
					<div className={styles.body}>
						<div className={styles.header}>
							<span className={styles.name}>{style.name}</span>
							{selected === style.id && <div className={styles.dot} />}
						</div>
						<p className={styles.desc}>{style.desc}</p>
					</div>
				</Card>
			))}
		</div>
	);
};
