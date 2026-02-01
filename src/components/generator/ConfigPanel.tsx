import React from "react";
import { Input } from "@/components/common/Input";
import { WallpaperConfig } from "@/lib/types";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
	config: WallpaperConfig;
	onChange: (newConfig: WallpaperConfig) => void;
}

const DEVICES = [
	// iPhone 17 series
	{ name: "iPhone 17 Pro Max", width: 1320, height: 2868 },
	{ name: "iPhone 17 Pro", width: 1179, height: 2556 },
	{ name: "iPhone 17 Plus", width: 1290, height: 2796 },
	{ name: "iPhone 17", width: 1179, height: 2556 },
	// iPhone 16 series
	{ name: "iPhone 16 Pro Max", width: 1320, height: 2868 },
	{ name: "iPhone 16 Pro", width: 1179, height: 2556 },
	{ name: "iPhone 16 Plus", width: 1290, height: 2796 },
	{ name: "iPhone 16", width: 1179, height: 2556 },
	// iPhone 15 series
	{ name: "iPhone 15 Pro Max", width: 1290, height: 2796 },
	{ name: "iPhone 15 Pro", width: 1179, height: 2556 },
	{ name: "iPhone 15 Plus", width: 1290, height: 2796 },
	{ name: "iPhone 15", width: 1179, height: 2556 },
	// iPhone 14 series
	{ name: "iPhone 14 Pro Max", width: 1290, height: 2796 },
	{ name: "iPhone 14 Pro", width: 1179, height: 2556 },
	{ name: "iPhone 14 Plus", width: 1284, height: 2778 },
	{ name: "iPhone 14", width: 1170, height: 2532 },
	// iPhone 13 series
	{ name: "iPhone 13 Pro Max", width: 1284, height: 2778 },
	{ name: "iPhone 13 Pro", width: 1170, height: 2532 },
	{ name: "iPhone 13", width: 1170, height: 2532 },
	{ name: "iPhone 13 mini", width: 1080, height: 2340 },
	// iPhone 12 series
	{ name: "iPhone 12 Pro Max", width: 1284, height: 2778 },
	{ name: "iPhone 12 Pro", width: 1170, height: 2532 },
	{ name: "iPhone 12", width: 1170, height: 2532 },
	{ name: "iPhone 12 mini", width: 1080, height: 2340 },
	// iPhone 11 series
	{ name: "iPhone 11 Pro Max", width: 1242, height: 2688 },
	{ name: "iPhone 11 Pro", width: 1125, height: 2436 },
	{ name: "iPhone 11", width: 828, height: 1792 },
	// iPhone SE/XR/XS
	{ name: "iPhone SE (3rd gen)", width: 750, height: 1334 },
	{ name: "iPhone XS Max", width: 1242, height: 2688 },
	{ name: "iPhone X/XS", width: 1125, height: 2436 },
	{ name: "iPhone XR", width: 828, height: 1792 },
	// Android
	{ name: "1080p Android", width: 1080, height: 2400 },
	{ name: "2K Android", width: 1440, height: 3200 },
	// Desktop
	{ name: "4K Desktop", width: 3840, height: 2160 },
	{ name: "MacBook Pro 16", width: 3456, height: 2234 },
	{ name: "MacBook Pro 14", width: 3024, height: 1964 },
	{ name: "MacBook Air 13", width: 2560, height: 1664 },
];

// Define valid theme field types
type ThemeField = "bg" | "accent" | "text";

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
	const handleChange = (field: keyof WallpaperConfig | `theme.${ThemeField}`, value: string | number) => {
		if (field.startsWith("theme.")) {
			const themeField = field.split(".")[1];
			onChange({
				...config,
				theme: { ...config.theme, [themeField]: value },
			});
		} else {
			onChange({ ...config, [field]: value });
		}
	};

	const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const idx = parseInt(e.target.value);
		if (idx === -1) return; // Custom
		const device = DEVICES[idx];
		onChange({ ...config, width: device.width, height: device.height });
	};

	return (
		<div className={styles.panel}>
			<h3 className={styles.sectionTitle}>设备配置</h3>

			{/* Device / Resolution */}
			<div className={styles.group}>
				<div className={styles.row}>
					<div className={styles.fullWidth}>
						<label className={styles.label}>设备预设</label>
						<select className={styles.select} onChange={handleDeviceChange} defaultValue={0}>
							{DEVICES.map((d, i) => (
								<option key={d.name} value={i}>
									{d.name} ({d.width}x{d.height})
								</option>
							))}
							<option value={-1}>自定义</option>
						</select>
					</div>
				</div>
				<div className={styles.row}>
					<Input label="宽度" type="number" value={config.width} onChange={(e) => handleChange("width", parseInt(e.target.value))} />
					<Input label="高度" type="number" value={config.height} onChange={(e) => handleChange("height", parseInt(e.target.value))} />
				</div>
			</div>

			<h3 className={styles.sectionTitle}>主题</h3>
			<div className={styles.group}>
				<div className={styles.row}>
					<Input label="背景色" type="color" value={config.theme.bg} onChange={(e) => handleChange("theme.bg", e.target.value)} />
					<Input label="强调色" type="color" value={config.theme.accent} onChange={(e) => handleChange("theme.accent", e.target.value)} />
				</div>
			</div>

			{/* Specific Configs */}
			<h3 className={styles.sectionTitle}>详细设置</h3>
			<div className={styles.group}>
				{config.type === "goal" && (
					<>
						<Input label="目标名称" value={config.goalName || ""} placeholder="我的大目标" onChange={(e) => handleChange("goalName", e.target.value)} />
						<Input label="目标日期" type="date" value={config.targetDate || ""} onChange={(e) => handleChange("targetDate", e.target.value)} />
					</>
				)}

				{["year", "month", "week", "minimal"].includes(config.type) && <p className={styles.hint}>此样式无需额外设置，只需自定义主题即可！</p>}
			</div>
		</div>
	);
};
