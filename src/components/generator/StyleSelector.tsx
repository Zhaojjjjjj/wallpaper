import React from "react";
import { Card } from "@/components/common/Card";
import { WallpaperType } from "@/lib/types";
import styles from "./StyleSelector.module.css";

interface StyleSelectorProps {
	selected: WallpaperType;
	onSelect: (type: WallpaperType) => void;
}

const STYLES: { id: WallpaperType; name: string; desc: string }[] = [
	{ id: "year", name: "Year Progress", desc: "Visualize the year as a grid" },
	{ id: "life", name: "Life Calendar", desc: "Your life in weeks" },
	{ id: "goal", name: "Goal Countdown", desc: "Track important deadlines" },
	{ id: "month", name: "Month Progress", desc: "Focus on the current month" },
	{ id: "week", name: "Weekly", desc: "Seven days at a glance" },
	{ id: "day", name: "Daily", desc: "Today's journey" },
	{ id: "minimal", name: "Minimal", desc: "Pure data, no distractions" },
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
