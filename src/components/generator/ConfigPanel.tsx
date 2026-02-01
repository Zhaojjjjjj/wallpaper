import React from "react";
import { Input } from "@/components/common/Input";
import { WallpaperConfig } from "@/lib/types";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
	config: WallpaperConfig;
	onChange: (newConfig: WallpaperConfig) => void;
}

const DEVICES = [
	{ name: "iPhone 16 Pro / 15 Pro", width: 1179, height: 2556 },
	{ name: "iPhone 16 Pro Max", width: 1320, height: 2868 },
	{ name: "iPhone 14/13/12", width: 1170, height: 2532 },
	{ name: "1080p Android", width: 1080, height: 2400 },
	{ name: "4K Desktop", width: 3840, height: 2160 },
	{ name: "MacBook Pro 16", width: 3456, height: 2234 },
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
			<h3 className={styles.sectionTitle}>Configuration</h3>

			{/* Device / Resolution */}
			<div className={styles.group}>
				<div className={styles.row}>
					<div className={styles.fullWidth}>
						<label className={styles.label}>Device Preset</label>
						<select className={styles.select} onChange={handleDeviceChange} defaultValue={0}>
							{DEVICES.map((d, i) => (
								<option key={d.name} value={i}>
									{d.name} ({d.width}x{d.height})
								</option>
							))}
							<option value={-1}>Custom</option>
						</select>
					</div>
				</div>
				<div className={styles.row}>
					<Input label="Width" type="number" value={config.width} onChange={(e) => handleChange("width", parseInt(e.target.value))} />
					<Input label="Height" type="number" value={config.height} onChange={(e) => handleChange("height", parseInt(e.target.value))} />
				</div>
			</div>

			<h3 className={styles.sectionTitle}>Theme</h3>
			<div className={styles.group}>
				<div className={styles.row}>
					<Input label="Background" type="color" value={config.theme.bg} onChange={(e) => handleChange("theme.bg", e.target.value)} />
					<Input label="Accent" type="color" value={config.theme.accent} onChange={(e) => handleChange("theme.accent", e.target.value)} />
				</div>
			</div>

			{/* Specific Configs */}
			<h3 className={styles.sectionTitle}>Details</h3>
			<div className={styles.group}>
				{config.type === "life" && (
					<>
						<Input label="Birth Date" type="date" value={config.birthDate || ""} onChange={(e) => handleChange("birthDate", e.target.value)} />
						<Input label="Lifespan (Years)" type="number" value={config.lifespan || 80} onChange={(e) => handleChange("lifespan", parseInt(e.target.value))} />
					</>
				)}

				{config.type === "goal" && (
					<>
						<Input label="Goal Name" value={config.goalName || ""} placeholder="My Big Goal" onChange={(e) => handleChange("goalName", e.target.value)} />
						<Input label="Target Date" type="date" value={config.targetDate || ""} onChange={(e) => handleChange("targetDate", e.target.value)} />
					</>
				)}

				{["year", "month", "week", "day", "minimal"].includes(config.type) && <p className={styles.hint}>No specific settings for this style. Just customize the theme!</p>}
			</div>
		</div>
	);
};
