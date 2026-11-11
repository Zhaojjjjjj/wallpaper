"use client";

import React from "react";
import type { Lang } from "@/lib/i18n";
import styles from "./LangToggle.module.css";

interface LangToggleProps {
	lang: Lang;
	onChange: (lang: Lang) => void;
}

export const LangToggle: React.FC<LangToggleProps> = ({ lang, onChange }) => (
	<div className={styles.toggle} role="group" aria-label="Language">
		<button
			type="button"
			className={`${styles.option} ${lang === "zh" ? styles.active : ""}`}
			aria-pressed={lang === "zh"}
			onClick={() => onChange("zh")}
		>
			中文
		</button>
		<button
			type="button"
			className={`${styles.option} ${lang === "en" ? styles.active : ""}`}
			aria-pressed={lang === "en"}
			onClick={() => onChange("en")}
		>
			EN
		</button>
	</div>
);
