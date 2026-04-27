import React, { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline";
	isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = "primary", isActive = false, className = "", ...props }) => {
	return (
		<button className={`${styles.button} ${styles[variant]} ${isActive ? styles.active : ""} ${className}`} {...props}>
			{children}
		</button>
	);
};
