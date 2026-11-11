"use client";

import React from "react";
import Link from "next/link";
import { LangToggle } from "./LangToggle";
import { STRINGS, type Lang } from "@/lib/i18n";
import styles from "./Header.module.css";

interface HeaderProps {
	lang: Lang;
	onLangChange: (lang: Lang) => void;
}

export const Header: React.FC<HeaderProps> = ({ lang, onLangChange }) => {
	return (
		<header className={styles.header}>
			<div className={`container ${styles.container}`}>
				<Link href="/" className={styles.logo} aria-label={STRINGS[lang].homeAriaLabel}>
					Life<span className={styles.logoAccent}>Grid</span>
				</Link>
				<nav className={styles.nav}>
					<Link href="/" className={styles.link}>
						Generator
					</Link>
					<LangToggle lang={lang} onChange={onLangChange} />
				</nav>
			</div>
		</header>
	);
};
