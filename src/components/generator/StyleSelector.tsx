import React, { useMemo } from "react";
import { Card } from "@/components/common/Card";
import { WallpaperCanvas } from "./WallpaperCanvas";
import { WallpaperConfig, WallpaperType } from "@/lib/types";
import { formatDateOnly } from "@/lib/wallpaper-progress";
import styles from "./StyleSelector.module.css";

interface StyleSelectorProps {
	selected: WallpaperType;
	theme: WallpaperConfig["theme"];
	onSelect: (type: WallpaperType) => void;
}

const STYLES: { id: WallpaperType; name: string; desc: string }[] = [
	{ id: "year", name: "年度进度", desc: "以周为列，走完 365 天" },
	{ id: "month", name: "月历", desc: "真实日历，今日高亮" },
	{ id: "week", name: "本周", desc: "七日圆点，一目了然" },
	{ id: "today", name: "今日", desc: "24 小时刻度，实时流逝" },
	{ id: "goal", name: "目标倒计时", desc: "细环倒计时与完成度" },
	{ id: "life", name: "生命日历", desc: "以周为单位的一生" },
	{ id: "day", name: "时钟", desc: "无圈刻度表盘，带秒针" },
	{ id: "minimal", name: "极简", desc: "左对齐大字，只留百分比" },
];

function sampleConfig(type: WallpaperType, theme: WallpaperConfig["theme"]): WallpaperConfig {
	const base: WallpaperConfig = { type, width: 300, height: 460, theme };
	if (type === "life") return { ...base, birthDate: "1995-06-15", lifespan: 80 };
	if (type === "goal") {
		const now = new Date();
		const target = new Date(now);
		target.setDate(target.getDate() + 90);
		return { ...base, goalName: "新年目标", goalStartDate: formatDateOnly(now), targetDate: formatDateOnly(target) };
	}
	return base;
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
