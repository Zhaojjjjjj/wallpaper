import React from "react";
import { STRINGS, type Lang } from "@/lib/i18n";
import styles from "./IosGuide.module.css";

export const IosGuide: React.FC<{ lang: Lang }> = ({ lang }) => {
	const strings = STRINGS[lang];
	return (
		<div className={styles.container}>
			<h3 className={styles.title}>{strings.guideTitle}</h3>
			<p className={styles.desc}>{strings.guideDesc}</p>
			<h4 className={styles.subhead}>{strings.guideShortcutHeading}</h4>
			<ol className={styles.steps}>
				{strings.guideShortcutSteps.map((step) => (
					<li key={step} className={styles.step}>
						<span className={styles.stepText}>{step}</span>
					</li>
				))}
			</ol>
			<h4 className={styles.subhead}>{strings.guideAutomationHeading}</h4>
			<ol className={styles.steps}>
				{strings.guideAutomationSteps.map((step) => (
					<li key={step} className={styles.step}>
						<span className={styles.stepText}>{step}</span>
					</li>
				))}
			</ol>
			<p className={styles.note}>{strings.guideNote}</p>
		</div>
	);
};
