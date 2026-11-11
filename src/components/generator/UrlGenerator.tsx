import React, { useMemo, useState, useSyncExternalStore } from "react";
import { WallpaperConfig } from "@/lib/types";
import { buildWallpaperImagePath, buildWallpaperPath } from "@/lib/wallpaper-config";
import { Input } from "@/components/common/Input";
import { STRINGS, type Lang } from "@/lib/i18n";
import { Button } from "@/components/common/Button";
import styles from "./UrlGenerator.module.css";

interface UrlGeneratorProps {
	lang: Lang;
	config: WallpaperConfig;
}

const subscribeToBrowserEnvironment = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";
const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const getServerTimeZone = () => "";

export const UrlGenerator: React.FC<UrlGeneratorProps> = ({ lang, config }) => {
	const strings = STRINGS[lang];
	const [copyResult, setCopyResult] = useState<{ url: string; status: "success" | "error" } | null>(null);
	const origin = useSyncExternalStore(subscribeToBrowserEnvironment, getBrowserOrigin, getServerOrigin);
	const browserTimeZone = useSyncExternalStore(subscribeToBrowserEnvironment, getBrowserTimeZone, getServerTimeZone);

	const linkConfig = useMemo(() => ({
		...config,
		timeZone: config.timeZone || browserTimeZone || undefined,
	}), [browserTimeZone, config]);
	const paths = useMemo(() => ({
		image: buildWallpaperImagePath(linkConfig),
		preview: buildWallpaperPath(linkConfig),
	}), [linkConfig]);
	const url = `${origin}${paths.image}`;
	const copyStatus = copyResult?.url === url ? copyResult.status : "idle";

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopyResult({ url, status: "success" });
		} catch {
			setCopyResult({ url, status: "error" });
		}
	};

	return (
		<div className={styles.container}>
				<h3 className={styles.title}>{strings.urlTitle}</h3>
				<p className={styles.desc}>
					{strings.urlDesc}
				</p>
				<div className={styles.inputGroup}>
					<Input aria-label={strings.urlAriaLabel} readOnly value={url} className={styles.urlInput} />
					<Button onClick={handleCopy} variant="primary" className={styles.copyBtn} disabled={!origin}>
						{copyStatus === "success" ? strings.copied : copyStatus === "error" ? strings.copyFailed : strings.copy}
					</Button>
				</div>
				<a className={styles.previewLink} href={`${origin}${paths.preview}`} target="_blank" rel="noreferrer">
					{strings.openPreview}
				</a>
		</div>
	);
};
