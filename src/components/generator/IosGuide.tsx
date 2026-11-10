import React from "react";
import styles from "./IosGuide.module.css";

const SHORTCUT_STEPS: string[] = [
	"先点上方「复制链接」，把 PNG 壁纸链接复制下来。",
	"打开 iPhone 自带的「快捷指令」App，点右上角「+」新建快捷指令。",
	"添加操作「获取 URL 内容」，把链接粘贴到 URL 一栏。",
	"再添加操作「设定墙纸」，选择「锁定屏幕」（也可以同时勾上主屏幕），展开后关闭「显示预览」。",
	"点右上角完成，命名为「每日壁纸」。点一次运行按钮测试，锁屏壁纸换上即成功。",
];

const AUTOMATION_STEPS: string[] = [
	"在「快捷指令」App 底部切到「自动化」，点「+」新建个人自动化。",
	"选择「特定时间」→ 时间设为 00:05、「每天」重复。",
	"动作选择刚才建好的「每日壁纸」快捷指令。",
	"选择「立即运行」（或关闭「运行前询问」），完成。此后每天凌晨自动换新壁纸，不用再管。",
];

export const IosGuide: React.FC = () => (
	<div className={styles.container}>
		<h3 className={styles.title}>iOS 设置教程 · 每天自动换壁纸</h3>
		<p className={styles.desc}>
			iPhone 不能直接定时换壁纸，用系统自带的「快捷指令」把上面的链接设成自动化，五分钟配好，一次到位。
		</p>
		<h4 className={styles.subhead}>第一步 · 建快捷指令</h4>
		<ol className={styles.steps}>
			{SHORTCUT_STEPS.map((step) => (
				<li key={step} className={styles.step}>
					<span className={styles.stepText}>{step}</span>
				</li>
			))}
		</ol>
		<h4 className={styles.subhead}>第二步 · 设为每天自动运行</h4>
		<ol className={styles.steps}>
			{AUTOMATION_STEPS.map((step) => (
				<li key={step} className={styles.step}>
					<span className={styles.stepText}>{step}</span>
				</li>
			))}
		</ol>
		<p className={styles.note}>
		小提示：链接里带着你选的样式、机型与主题。之后想换样式，重新复制链接、把快捷指令里的 URL 换掉即可；时间和内容每天自动更新。
		</p>
	</div>
);
