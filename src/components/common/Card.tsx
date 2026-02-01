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
	return (
		<div className={`${styles.card} ${isInteractive ? styles.interactive : ""} ${isActive ? styles.active : ""} ${className}`} onClick={onClick}>
			{children}
		</div>
	);
};
