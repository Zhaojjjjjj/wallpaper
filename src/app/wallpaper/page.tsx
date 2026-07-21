"use client";

import React, { useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WallpaperCanvas } from "@/components/generator/WallpaperCanvas";
import { parseWallpaperConfig } from "@/lib/wallpaper-config";
import styles from "./page.module.css";

function WallpaperPageContent() {
	const searchParams = useSearchParams();

	// Use useMemo to compute config from search params instead of useEffect + setState
	const config = useMemo(() => parseWallpaperConfig(searchParams), [searchParams]);

	useEffect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, []);

	return (
		<div className={styles.viewport} style={{ background: config.theme.bg }}>
			<WallpaperCanvas config={config} className={styles.canvas} />
		</div>
	);
}

export default function WallpaperPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WallpaperPageContent />
		</Suspense>
	);
}
