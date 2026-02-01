import React, { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", wrapperClassName = "", ...props }) => {
	return (
		<div className={`${styles.wrapper} ${wrapperClassName}`}>
			{label && <label className={styles.label}>{label}</label>}
			<input className={`${styles.input} ${className}`} {...props} />
		</div>
	);
};
