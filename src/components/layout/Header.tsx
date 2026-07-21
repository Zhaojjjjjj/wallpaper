import React from "react";
import Link from "next/link";
import styles from "./Header.module.css";

export const Header = () => {
	return (
		<header className={styles.header}>
			<div className={`container ${styles.container}`}>
				<Link href="/" className={styles.logo} aria-label="LifeGrid 首页">
					Life<span className={styles.logoAccent}>Grid</span>
				</Link>
				<nav className={styles.nav}>
					<Link href="/" className={styles.link}>
						Generator
					</Link>
					{/* <a href="#about" className={styles.link}>About</a> */}
				</nav>
			</div>
		</header>
	);
};
