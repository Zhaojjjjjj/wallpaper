import React from "react";
import { Card } from "@/components/common/Card";
import { WallpaperType } from "@/lib/types";
import styles from "./StyleSelector.module.css";

interface StyleSelectorProps {
	selected: WallpaperType;
	onSelect: (type: WallpaperType) => void;
}

const STYLES: { id: WallpaperType; name: string; desc: string }[] = [
	{ id: "year", name: "年度进度", desc: "以网格形式可视化整年" },
	{ id: "goal", name: "目标倒计时", desc: "追踪重要截止日期" },
	{ id: "month", name: "月度进度", desc: "关注当前月份" },
	{ id: "week", name: "本周", desc: "一周七天一览" },
	{ id: "minimal", name: "极简", desc: "纯粹数据，无干扰" },
];

export const StyleSelector: React.FC<StyleSelectorProps> = ({ selected, onSelect }) => {
	return (
		<div className={styles.grid}>
			{STYLES.map((style) => (
				<Card key={style.id} isInteractive isActive={selected === style.id} onClick={() => onSelect(style.id)} className={styles.card}>
					<div className={styles.header}>
						<span className={styles.name}>{style.name}</span>
						{selected === style.id && <div className={styles.dot} />}
					</div>
					<p className={styles.desc}>{style.desc}</p>
				</Card>
			))}
		</div>
	);
};
