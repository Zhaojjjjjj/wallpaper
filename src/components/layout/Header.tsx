import React from "react";
import styles from "./Header.module.css";

export const Header = () => {
	return (
		<header className={styles.header}>
			<div className={`container ${styles.container}`}>
				<div className={styles.logo}>
					Life<span className={styles.logoAccent}>Grid</span>
				</div>
				<nav className={styles.nav}>
					<a href="#" className={styles.link}>
						Generator
					</a>
					{/* <a href="#about" className={styles.link}>About</a> */}
				</nav>
			</div>
		</header>
	);
};
