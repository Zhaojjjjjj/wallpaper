import React, { useState } from "react";
import { WallpaperConfig } from "@/lib/types";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import styles from "./UrlGenerator.module.css";

interface UrlGeneratorProps {
	config: WallpaperConfig;
}

export const UrlGenerator: React.FC<UrlGeneratorProps> = ({ config }) => {
	const [copied, setCopied] = useState(false);

	const generateUrl = () => {
		// In SSR/Next.js, window might not be available initially, but this is a client component
		if (typeof window === "undefined") return "";

		const params = new URLSearchParams();
		params.set("type", config.type);
		params.set("width", config.width.toString());
		params.set("height", config.height.toString());
		params.set("bg", config.theme.bg);
		params.set("accent", config.theme.accent);

		if (config.birthDate) params.set("birthDate", config.birthDate);
		if (config.lifespan) params.set("lifespan", config.lifespan.toString());
		if (config.targetDate) params.set("targetDate", config.targetDate);
		if (config.goalName) params.set("goalName", config.goalName);

		return `${window.location.origin}/wallpaper?${params.toString()}`;
	};

	const handleCopy = async () => {
		const url = generateUrl();
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy", err);
		}
	};

	return (
		<div className={styles.container}>
			<h3 className={styles.title}>Automation Link</h3>
			<p className={styles.desc}>Use this URL in Shortcuts (iOS) or MacroDroid (Android) to dynamically generate this wallpaper every day.</p>
			<div className={styles.inputGroup}>
				<Input readOnly value={generateUrl()} className={styles.urlInput} />
				<Button onClick={handleCopy} variant="secondary" className={styles.copyBtn}>
					{copied ? "Copied!" : "Copy Link"}
				</Button>
			</div>
		</div>
	);
};
