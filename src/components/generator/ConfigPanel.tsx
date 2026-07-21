import React, { useId, useState } from "react";
import { Input } from "@/components/common/Input";
import { WallpaperConfig } from "@/lib/types";
import {
	finalizeWallpaperIntegerDraft,
	normalizeWallpaperDimensions,
	parseWallpaperIntegerDraft,
	resolveWallpaperNumberDraft,
} from "@/lib/wallpaper-config";
import { formatDateOnly } from "@/lib/wallpaper-progress";
import { DEVICE_PRESETS, resolveDevicePresetId } from "@/lib/wallpaper-devices";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
	config: WallpaperConfig;
	onChange: (newConfig: WallpaperConfig) => void;
}

// Preset themes
const PRESET_THEMES = [
	{ name: "经典黑", bg: "#000000", accent: "#ffffff" },
	{ name: "暗夜蓝", bg: "#0a0a1a", accent: "#4fc3f7" },
	{ name: "森林绿", bg: "#0d1f0d", accent: "#81c784" },
	{ name: "暖橙色", bg: "#1a0f0a", accent: "#ff8a65" },
	{ name: "白底紫", bg: "#ffffff", accent: "#9c27b0" },
	{ name: "自定义", bg: "", accent: "" },
];

// Define valid theme field types
type ThemeField = "bg" | "accent" | "text";
type NumberField = "width" | "height" | "lifespan";

interface NumberInputProps {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: string) => void;
	onBlur: (value: string) => number;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, min, max, onChange, onBlur }) => {
	const [draft, setDraft] = useState(String(value));
	const [isEditing, setIsEditing] = useState(false);

	return (
		<Input
			label={label}
			type="number"
			min={min}
			max={max}
			value={resolveWallpaperNumberDraft(value, draft, isEditing)}
			onFocus={(event) => {
				setDraft(event.currentTarget.value);
				setIsEditing(true);
			}}
			onChange={(event) => {
				setDraft(event.target.value);
				onChange(event.target.value);
			}}
			onBlur={() => {
				setDraft(String(onBlur(draft)));
				setIsEditing(false);
			}}
		/>
	);
};

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
	const [customTheme, setCustomTheme] = useState(false);
	const [selectedDeviceId, setSelectedDeviceId] = useState(() => resolveDevicePresetId(config.width, config.height));
	const deviceSelectId = useId();

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
		const deviceId = e.target.value;
		setSelectedDeviceId(deviceId);
		if (deviceId === "custom") return;
		const device = DEVICE_PRESETS.find((candidate) => candidate.id === deviceId);
		if (!device) return;
		onChange({ ...config, width: device.width, height: device.height });
	};

	const applyNumberValue = (field: NumberField, normalized: number) => {
		if (field === "width" || field === "height") {
			const dimensions = normalizeWallpaperDimensions(
				field === "width" ? normalized : config.width,
				field === "height" ? normalized : config.height
			);
			onChange({ ...config, ...dimensions });
			setSelectedDeviceId("custom");
			return;
		}

		handleChange(field, normalized);
	};

	const handleNumberChange = (field: NumberField, value: string, min: number, max: number) => {
		if (field === "width" || field === "height") setSelectedDeviceId("custom");

		const parsed = parseWallpaperIntegerDraft(value, min, max);
		if (parsed === undefined) return;

		applyNumberValue(field, parsed);
	};

	const handleNumberBlur = (field: NumberField, value: string, min: number, max: number): number => {
		const currentValue = config[field] ?? 80;
		const normalized = finalizeWallpaperIntegerDraft(value, min, max, currentValue);
		applyNumberValue(field, normalized);
		return normalized;
	};

	const handleThemeSelect = (index: number) => {
		const theme = PRESET_THEMES[index];
		if (theme.name === "自定义") {
			setCustomTheme(true);
		} else {
			setCustomTheme(false);
			onChange({
				...config,
				theme: { ...config.theme, bg: theme.bg, accent: theme.accent, text: theme.accent },
			});
		}
	};

	const handleTargetDateChange = (targetDate: string) => {
		onChange({
			...config,
			targetDate,
			goalStartDate: config.goalStartDate || formatDateOnly(new Date()),
		});
	};

	// Get current theme index
	const getCurrentThemeIndex = () => {
		const index = PRESET_THEMES.findIndex(
			(t) => t.bg === config.theme.bg && t.accent === config.theme.accent
		);
		return index >= 0 ? index : PRESET_THEMES.length - 1; // Return custom if not found
	};

	return (
		<div className={styles.panel}>
			<h3 className={styles.sectionTitle}>设备配置</h3>

			{/* Device / Resolution */}
			<div className={styles.group}>
				<div className={styles.row}>
					<div className={styles.fullWidth}>
						<label className={styles.label} htmlFor={deviceSelectId}>设备预设</label>
						<select id={deviceSelectId} className={styles.select} onChange={handleDeviceChange} value={selectedDeviceId}>
							{DEVICE_PRESETS.map((d) => (
								<option key={d.id} value={d.id}>
									{d.name} ({d.width}x{d.height})
								</option>
							))}
							<option value="custom">自定义</option>
						</select>
					</div>
				</div>
				<div className={styles.row}>
					<NumberInput label="宽度" value={config.width} min={320} max={4320} onChange={(value) => handleNumberChange("width", value, 320, 4320)} onBlur={(value) => handleNumberBlur("width", value, 320, 4320)} />
					<NumberInput label="高度" value={config.height} min={320} max={7680} onChange={(value) => handleNumberChange("height", value, 320, 7680)} onBlur={(value) => handleNumberBlur("height", value, 320, 7680)} />
				</div>
			</div>

			<h3 className={styles.sectionTitle}>主题</h3>
			<div className={styles.group}>
				<div className={styles.themeGrid}>
					{PRESET_THEMES.map((theme, index) => (
						<button
							type="button"
							key={theme.name}
							className={`${styles.themeOption} ${getCurrentThemeIndex() === index ? styles.themeActive : ""}`}
							onClick={() => handleThemeSelect(index)}
						>
							<div className={styles.themePreview} style={{ background: theme.bg || config.theme.bg }}>
								<div className={styles.themeDot} style={{ background: theme.accent || config.theme.accent }} />
							</div>
							<span className={styles.themeName}>{theme.name}</span>
						</button>
					))}
				</div>

				{customTheme && (
					<div className={styles.row}>
						<Input label="背景色" type="color" value={config.theme.bg} onChange={(e) => handleChange("theme.bg", e.target.value)} />
						<Input label="强调色" type="color" value={config.theme.accent} onChange={(e) => handleChange("theme.accent", e.target.value)} />
						<Input label="文字色" type="color" value={config.theme.text} onChange={(e) => handleChange("theme.text", e.target.value)} />
					</div>
				)}
			</div>

			{/* Specific Configs */}
			<h3 className={styles.sectionTitle}>详细设置</h3>
			<div className={styles.group}>
				{config.type === "goal" && (
					<>
						<Input label="目标名称" value={config.goalName || ""} maxLength={40} placeholder="我的大目标" onChange={(e) => handleChange("goalName", e.target.value.slice(0, 40))} />
						<Input label="开始日期" type="date" max={config.targetDate} value={config.goalStartDate || ""} onChange={(e) => handleChange("goalStartDate", e.target.value)} />
						<Input label="目标日期" type="date" min={config.goalStartDate} value={config.targetDate || ""} onChange={(e) => handleTargetDateChange(e.target.value)} />
					</>
				)}

				{config.type === "life" && (
					<>
						<Input label="出生日期" type="date" value={config.birthDate || ""} onChange={(e) => handleChange("birthDate", e.target.value)} />
						<NumberInput label="预期寿命" value={config.lifespan ?? 80} min={1} max={120} onChange={(value) => handleNumberChange("lifespan", value, 1, 120)} onBlur={(value) => handleNumberBlur("lifespan", value, 1, 120)} />
					</>
				)}

				{["year", "month", "week", "minimal", "day"].includes(config.type) && <p className={styles.hint}>此样式无需额外设置，只需自定义主题即可！</p>}
			</div>
		</div>
	);
};
