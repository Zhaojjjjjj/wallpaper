"use client";

import React, { useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PreviewCanvas } from "@/components/generator/PreviewCanvas";
import { WallpaperConfig, DEFAULT_CONFIG, WallpaperType } from "@/lib/types";

function WallpaperPageContent() {
	const searchParams = useSearchParams();

	// Use useMemo to compute config from search params instead of useEffect + setState
	const config = useMemo<WallpaperConfig>(() => {
		const type = (searchParams.get("type") as WallpaperType) || "year";
		const width = parseInt(searchParams.get("width") || "1179");
		const height = parseInt(searchParams.get("height") || "2556");
		const bg = searchParams.get("bg") || "#000000";
		const accent = searchParams.get("accent") || "#ffffff";

		// Specifics
		const birthDate = searchParams.get("birthDate") || undefined;
		const lifespan = searchParams.get("lifespan") ? parseInt(searchParams.get("lifespan")!) : undefined;
		const targetDate = searchParams.get("targetDate") || undefined;
		const goalName = searchParams.get("goalName") || undefined;

		return {
			type,
			width,
			height,
			birthDate,
			lifespan,
			targetDate,
			goalName,
			theme: {
				bg,
				accent,
				text: accent,
			},
		};
	}, [searchParams]);

	useEffect(() => {
		// Set body styles for this page to ensure full screen canvas
		document.body.style.overflow = "hidden";
		document.body.style.margin = "0";

		return () => {
			document.body.style.overflow = "";
			document.body.style.margin = "";
		};
	}, []);

	return (
		<div style={{ width: "100vw", height: "100vh", background: config.theme.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
			<PreviewCanvas config={config} className="" />
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
