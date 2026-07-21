import React, { useMemo, useState, useSyncExternalStore } from "react";
import { WallpaperConfig } from "@/lib/types";
import { buildWallpaperImagePath, buildWallpaperPath } from "@/lib/wallpaper-config";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import styles from "./UrlGenerator.module.css";

interface UrlGeneratorProps {
	config: WallpaperConfig;
}

const subscribeToBrowserEnvironment = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";
const getBrowserTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const getServerTimeZone = () => "";

export const UrlGenerator: React.FC<UrlGeneratorProps> = ({ config }) => {
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
				<h3 className={styles.title}>PNG 壁纸链接</h3>
				<p className={styles.desc}>
					此链接直接返回 PNG 图片，可用于系统快捷指令、自动化工具或直接保存。
				</p>
				<div className={styles.inputGroup}>
					<Input aria-label="PNG 壁纸链接" readOnly value={url} className={styles.urlInput} />
					<Button onClick={handleCopy} variant="primary" className={styles.copyBtn} disabled={!origin}>
						{copyStatus === "success" ? "已复制！" : copyStatus === "error" ? "复制失败" : "复制链接"}
					</Button>
				</div>
				<a className={styles.previewLink} href={`${origin}${paths.preview}`} target="_blank" rel="noreferrer">
					打开全屏预览
				</a>
		</div>
	);
};
