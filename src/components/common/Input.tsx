import React, { InputHTMLAttributes, useRef } from "react";
import styles from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = "", wrapperClassName = "", type, ...props }) => {
	const inputRef = useRef<HTMLInputElement>(null);

	const handleWrapperClick = () => {
		if (type === "date" && inputRef.current) {
			inputRef.current.showPicker?.();
		}
	};

	return (
		<div
			className={`${styles.wrapper} ${wrapperClassName} ${type === "date" ? styles.dateWrapper : ""}`}
			onClick={handleWrapperClick}
		>
			{label && <label className={styles.label}>{label}</label>}
			<input ref={inputRef} className={`${styles.input} ${className}`} type={type} {...props} />
		</div>
	);
};
