import React, { useState } from "react";
import { Input } from "@/components/common/Input";
import { WallpaperConfig } from "@/lib/types";
import {
	finalizeWallpaperIntegerDraft,
	normalizeWallpaperDimensions,
	parseWallpaperIntegerDraft,
	resolveWallpaperNumberDraft,
} from "@/lib/wallpaper-config";
import { DEVICE_CATEGORIES, DEVICE_PRESETS, DeviceCategory, getDeviceCategory, resolveDevicePresetId } from "@/lib/wallpaper-devices";
import { STRINGS, type Lang } from "@/lib/i18n";
import { DEFAULT_LYRIC_FONT, LYRIC_FONTS } from "@/lib/types";
import { lyricFontStack } from "@/lib/lyric-fonts";
import styles from "./ConfigPanel.module.css";

interface ConfigPanelProps {
	lang: Lang;
	config: WallpaperConfig;
	onChange: (newConfig: WallpaperConfig) => void;
}

// Preset themes: tasteful palettes, each with an explicit text color
const PRESET_THEMES: { name: string; bg: string; accent: string; text?: string }[] = [
	{ name: "经典黑", bg: "#000000", accent: "#ffffff" },
	{ name: "纸白", bg: "#faf9f6", accent: "#1a1625", text: "#1a1625" },
	{ name: "白底紫", bg: "#ffffff", accent: "#7c3aed" },
	{ name: "深海", bg: "#0a1628", accent: "#38bdf8" },
	{ name: "墨绿", bg: "#0c1a14", accent: "#4ade80" },
	{ name: "暮橙", bg: "#1c1007", accent: "#fb923c" },
	{ name: "石墨", bg: "#101014", accent: "#a1a1aa", text: "#f4f4f5" },
	{ name: "紫夜", bg: "#150a2e", accent: "#a78bfa", text: "#ede9fe" },
	{ name: "宣纸", bg: "#fdfcf8", accent: "#c03926", text: "#1a1a18" },
	{ name: "自定义", bg: "", accent: "" },
];

type ThemeField = "bg" | "accent" | "text";
type NumberField = "width" | "height";
type DeviceTab = DeviceCategory | "custom";

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

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ lang, config, onChange }) => {
	const strings = STRINGS[lang];
	const displayDeviceName = (name: string) =>
		lang === "en"
			? name.replace("（展开）", strings.deviceNameSuffix.unfolded).replace("（外屏）", strings.deviceNameSuffix.cover)
			: name;
	const [customTheme, setCustomTheme] = useState(false);
	const [selectedDeviceId, setSelectedDeviceId] = useState(() => resolveDevicePresetId(config.width, config.height));
	const [tabOverride, setTabOverride] = useState<DeviceTab | null>(null);

	const selectedTab: DeviceTab = selectedDeviceId === "custom" ? "custom" : getDeviceCategory(selectedDeviceId);
	const activeTab: DeviceTab = tabOverride ?? selectedTab;

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

	const handleDeviceSelect = (deviceId: string) => {
		const device = DEVICE_PRESETS.find((candidate) => candidate.id === deviceId);
		if (!device) return;
		setSelectedDeviceId(deviceId);
		setTabOverride(null);
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
		const currentValue = config[field];
		const normalized = finalizeWallpaperIntegerDraft(value, min, max, currentValue);
		applyNumberValue(field, normalized);
		return normalized;
	};

	const handleThemeSelect = (index: number) => {
		const theme = PRESET_THEMES[index];
		if (index === PRESET_THEMES.length - 1) {
			setCustomTheme(true);
		} else {
			setCustomTheme(false);
			onChange({
				...config,
				theme: { bg: theme.bg, accent: theme.accent, text: theme.text ?? theme.accent },
			});
		}
	};

	const getCurrentThemeIndex = () => {
		const index = PRESET_THEMES.findIndex(
			(t) => t.bg === config.theme.bg && t.accent === config.theme.accent
		);
		return index >= 0 ? index : PRESET_THEMES.length - 1;
	};

	return (
		<div className={styles.panel}>
			<h3 className={styles.sectionTitle}>{strings.deviceHeading}</h3>

			<div className={styles.group}>
				<div className={styles.tabs} role="tablist" aria-label={strings.deviceHeading}>
					{DEVICE_CATEGORIES.map((category) => (
						<button
							key={category.id}
							type="button"
							role="tab"
							aria-selected={activeTab === category.id}
							className={`${styles.tab} ${activeTab === category.id ? styles.tabActive : ""}`}
							onClick={() => setTabOverride(category.id)}
						>
							{category.id === "desktop" ? strings.deviceCategories.desktop : category.name}
						</button>
					))}
					<button
						type="button"
						role="tab"
						aria-selected={activeTab === "custom"}
						className={`${styles.tab} ${activeTab === "custom" ? styles.tabActive : ""}`}
						onClick={() => setTabOverride("custom")}
					>
						{strings.deviceCategories.custom}
					</button>
				</div>

				{activeTab === "custom" ? (
					<div className={styles.row}>
						<NumberInput label={strings.width} value={config.width} min={320} max={4320} onChange={(value) => handleNumberChange("width", value, 320, 4320)} onBlur={(value) => handleNumberBlur("width", value, 320, 4320)} />
						<NumberInput label={strings.height} value={config.height} min={320} max={7680} onChange={(value) => handleNumberChange("height", value, 320, 7680)} onBlur={(value) => handleNumberBlur("height", value, 320, 7680)} />
					</div>
				) : (
					<div className={styles.deviceGrid}>
						{DEVICE_PRESETS.filter((device) => getDeviceCategory(device.id) === activeTab).map((device) => (
							<button
								key={device.id}
								type="button"
								className={`${styles.deviceChip} ${selectedDeviceId === device.id ? styles.deviceChipActive : ""}`}
								aria-pressed={selectedDeviceId === device.id}
								onClick={() => handleDeviceSelect(device.id)}
							>
								<span className={styles.deviceName}>{displayDeviceName(device.name)}</span>
								<span className={styles.deviceDims}>{device.width} × {device.height}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<h3 className={styles.sectionTitle}>{strings.themeHeading}</h3>
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
							<span className={styles.themeName}>{strings.themeNames[index]}</span>
						</button>
					))}
				</div>

				{customTheme && (
					<div className={styles.row}>
						<Input label={strings.colorBg} type="color" value={config.theme.bg} onChange={(e) => handleChange("theme.bg", e.target.value)} />
						<Input label={strings.colorAccent} type="color" value={config.theme.accent} onChange={(e) => handleChange("theme.accent", e.target.value)} />
						<Input label={strings.colorText} type="color" value={config.theme.text} onChange={(e) => handleChange("theme.text", e.target.value)} />
					</div>
				)}
			</div>

			<h3 className={styles.sectionTitle}>{strings.detailsHeading}</h3>
			<div className={styles.group}>
				{config.type === "lyric" ? (
					<>
						<span className={styles.fieldLabel}>{strings.fontHeading}</span>
						<div className={styles.fontGrid}>
							{LYRIC_FONTS.map((id) => (
								<button
									key={id}
									type="button"
									className={`${styles.fontOption} ${(config.font ?? DEFAULT_LYRIC_FONT) === id ? styles.fontOptionActive : ""}`}
									aria-pressed={(config.font ?? DEFAULT_LYRIC_FONT) === id}
									style={{ fontFamily: lyricFontStack(id) }}
									onClick={() => onChange({ ...config, font: id })}
								>
									{strings.fontNames[id]}
								</button>
							))}
						</div>
					</>
				) : (
					<p className={styles.hint}>{strings.detailsHint}</p>
				)}
			</div>
		</div>
	);
};
