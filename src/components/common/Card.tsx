import React from "react";
import styles from "./Card.module.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
	isActive?: boolean;
	isInteractive?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick, isActive = false, isInteractive = false }) => {
	const classes = `${styles.card} ${isInteractive ? styles.interactive : ""} ${isActive ? styles.active : ""} ${className}`;

	if (isInteractive) {
		return (
			<button type="button" className={classes} onClick={onClick} aria-pressed={isActive}>
				{children}
			</button>
		);
	}

	return (
		<div className={classes}>
			{children}
		</div>
	);
};
