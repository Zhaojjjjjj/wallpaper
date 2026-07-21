import React, { InputHTMLAttributes, useId } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", wrapperClassName = "", type, id, ...props }) => {
	const generatedId = useId();
	const inputId = id || generatedId;

	return (
		<div className={`${styles.wrapper} ${wrapperClassName} ${type === "date" ? styles.dateWrapper : ""}`}>
			{label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
			<input id={inputId} className={`${styles.input} ${className}`} type={type} {...props} />
		</div>
	);
};
