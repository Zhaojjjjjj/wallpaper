import React from "react";
import styles from "./IosGuide.module.css";

const SHORTCUT_STEPS: string[] = [
	"在上方选好样式和自己手机的机型，点「复制链接」把 PNG 壁纸链接复制下来（机型不对，壁纸会被裁切）。",
	"打开 iPhone 自带的「快捷指令」App，点右上角「+」新建快捷指令。",
	"搜索并添加「获取 URL 内容」，把链接粘贴到 URL 一栏。",
	"搜索「墙纸」，添加「设定墙纸照片」，点开它选择「锁定屏幕」（可同时勾主屏幕）；再点右侧箭头展开选项，关掉「显示预览」和「裁剪到主体」——后者不关，iOS 会自动放大裁图，排版就乱了。",
	"命名为「每日壁纸」，点运行按钮先手动测试一次；弹出权限提示时选「始终允许」，锁屏换上新图即成功。",
];

const AUTOMATION_STEPS: string[] = [
	"在「快捷指令」App 底部切到「自动化」，点「+」新建个人自动化。",
	"选择「特定时间」：时间设为 00:05、重复选「每天」，并在同一屏选择「立即运行」（旧系统是下一步后关闭「运行前询问」）。",
	"点「下一步」，在列表里直接点选「每日壁纸」，不要选「新建空白自动化」。",
	"点完成。此后每天凌晨自动换新壁纸。若锁屏状态下没运行，去「设置 → 快捷指令 → 高级」打开「锁定时允许运行」。",
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
