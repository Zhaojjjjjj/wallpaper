import type { LyricFont, WallpaperType } from "./types";

export type Lang = "zh" | "en";

export const LANG_COOKIE = "zz-lang";

export function parseLang(value: string | undefined | null): Lang {
	return value === "en" ? "en" : "zh";
}

const zh = {
	stylesHeading: "选择样式",
	styles: {
		calendar: { name: "日历", desc: "每日一页，一天一句" },
		generative: { name: "生成", desc: "以日子为种子的抽象构图" },
		lyric: { name: "歌词", desc: "每日一段歌词，配当年的专辑封面" },
		month: { name: "月历", desc: "真实日历，今日高亮" },
		minimal: { name: "极简", desc: "左对齐大字，只留百分比" },
	} as Record<WallpaperType, { name: string; desc: string }>,
	deviceHeading: "设备配置",
	deviceCategories: { desktop: "桌面", custom: "自定义" },
	width: "宽度",
	height: "高度",
	deviceNameSuffix: { unfolded: "（展开）", cover: "（外屏）" },
	themeHeading: "主题",
	themeNames: ["经典黑", "纸白", "白底紫", "深海", "墨绿", "暮橙", "石墨", "紫夜", "宣纸", "自定义"],
	customThemeName: "自定义",
	colorBg: "背景色",
	colorAccent: "强调色",
	colorText: "文字色",
	detailsHeading: "详细设置",
	fontHeading: "歌词字体",
	fontNames: { wenkai: "霞鹜文楷", serif: "思源宋体", brush: "马善政楷", sans: "思源黑体" } as Record<LyricFont, string>,
	detailsHint: "此样式无需额外设置，只需自定义主题即可！",
	urlTitle: "PNG 壁纸链接",
	urlDesc: "此链接直接返回 PNG 图片，可用于系统快捷指令、自动化工具或直接保存。",
	urlAriaLabel: "PNG 壁纸链接",
	copy: "复制链接",
	copied: "已复制！",
	copyFailed: "复制失败",
	openPreview: "打开全屏预览",
	guideTitle: "iOS 设置教程 · 每天自动换壁纸",
	guideDesc: "iPhone 不能直接定时换壁纸，用系统自带的「快捷指令」把上面的链接设成自动化，五分钟配好，一次到位。",
	guideShortcutHeading: "第一步 · 建快捷指令",
	guideAutomationHeading: "第二步 · 设为每天自动运行",
	guideShortcutSteps: [
		"先备一个「照片」锁屏：长按锁屏空白处，点右下角「+」，选「照片」随便挑一张图建好，并切换到这个锁屏。设定墙纸只能替换照片类锁屏的图，系统自带的渐变、天文类墙纸不行——跳过这步就会报「无法在选定墙纸上设定照片」。",
		"在上方选好样式和自己手机的机型，点「复制链接」把 PNG 壁纸链接复制下来（机型不对，壁纸会被裁切）。",
		"打开 iPhone 自带的「快捷指令」App，点右上角「+」新建快捷指令。",
		"搜索并添加「获取 URL 内容」，把链接粘贴到 URL 一栏。",
		"搜索「墙纸」，添加「设定墙纸照片」：点「墙纸」选中第 1 步建的那个照片锁屏，范围选「锁定屏幕」（可同时勾主屏幕）；再点右侧箭头展开选项，关掉「显示预览」和「裁剪到主体」——后者不关，iOS 会自动放大裁图，排版就乱了。",
		"命名为「每日壁纸」，点运行按钮先手动测试一次；弹出权限提示时选「始终允许」，锁屏换上新图即成功。",
	],
	guideAutomationSteps: [
		"在「快捷指令」App 底部切到「自动化」，点「+」新建个人自动化。",
		"选择「特定时间」：时间设为 00:05、重复选「每天」，并在同一屏选择「立即运行」（旧系统是下一步后关闭「运行前询问」）。",
		"点「下一步」，在列表里直接点选「每日壁纸」，不要选「新建空白自动化」。",
		"点完成。此后每天凌晨自动换新壁纸。若锁屏状态下没运行，去「设置 → 快捷指令 → 高级」打开「锁定时允许运行」。",
	],
	guideNote: "小提示：链接里带着你选的样式、机型与主题。之后想换样式，重新复制链接、把快捷指令里的 URL 换掉即可；时间和内容每天自动更新。",
	homeAriaLabel: "LifeGrid 首页",
	metaTitle: "LifeGrid - 把时间，做成壁纸",
	metaDesc: "选择一种时间尺度，生成只属于你的进度壁纸。链接直出 PNG，可接入快捷指令，每天自动更新。",
	ogAlt: "LifeGrid 日历壁纸示例",
};

export type Strings = typeof zh;

const en: Strings = {
	stylesHeading: "Choose a style",
	styles: {
		calendar: { name: "Calendar", desc: "One page a day, one line a day" },
		generative: { name: "Generative", desc: "Abstract compositions seeded by the day" },
		lyric: { name: "Lyric", desc: "A lyric a day, with its original album cover" },
		month: { name: "Month", desc: "A real calendar, today highlighted" },
		minimal: { name: "Minimal", desc: "Big left-aligned type, just the percentage" },
	},
	deviceHeading: "Device",
	deviceCategories: { desktop: "Desktop", custom: "Custom" },
	width: "Width",
	height: "Height",
	deviceNameSuffix: { unfolded: " (Unfolded)", cover: " (Cover Screen)" },
	themeHeading: "Theme",
	themeNames: ["Classic Black", "Paper White", "White & Violet", "Deep Sea", "Forest", "Dusk Orange", "Graphite", "Violet Night", "Rice Paper", "Custom"],
	customThemeName: "Custom",
	colorBg: "Background",
	colorAccent: "Accent",
	colorText: "Text",
	detailsHeading: "Details",
	fontHeading: "Lyric font",
	fontNames: { wenkai: "LXGW WenKai", serif: "Noto Serif SC", brush: "Ma Shan Zheng", sans: "Noto Sans SC" } as Record<LyricFont, string>,
	detailsHint: "This style needs no extra settings — just pick a theme.",
	urlTitle: "PNG wallpaper link",
	urlDesc: "This link returns a PNG image directly — use it in Shortcuts, automation tools, or just save it.",
	urlAriaLabel: "PNG wallpaper link",
	copy: "Copy link",
	copied: "Copied!",
	copyFailed: "Copy failed",
	openPreview: "Open fullscreen preview",
	guideTitle: "iOS setup · a new wallpaper every day, automatically",
	guideDesc: "iPhones can't rotate wallpapers on a schedule by themselves, so we'll use the built-in Shortcuts app to automate the link above. Five minutes, once.",
	guideShortcutHeading: "Step 1 · Build the shortcut",
	guideAutomationHeading: "Step 2 · Run it every day",
	guideShortcutSteps: [
		"First, prepare a Photo Lock Screen: long-press an empty area of the Lock Screen, tap “+”, choose “Photos”, pick any photo, add it, and switch to that Lock Screen. Wallpaper actions can only replace the photo of a photo-type Lock Screen — Apple's built-in gradient or astronomy wallpapers can't, and skipping this step gets you “Unable to set a photo on the selected wallpaper”.",
		"Pick your style and your exact phone model above, then tap “Copy link” to copy the PNG wallpaper link (the wrong model size gets cropped).",
		"Open the Shortcuts app and tap “+” in the top right to create a new shortcut.",
		"Search for and add “Get Contents of URL”, then paste the link into the URL field.",
		"Search “wallpaper” and add “Set Wallpaper Photo”: tap “Wallpaper” and pick the Photo Lock Screen from step 1, set the scope to “Lock Screen” (Home Screen optional); then tap the arrow to expand the options and turn off “Show Preview” and “Crop to Subject” — leave Crop to Subject on and iOS will zoom and crop the image, breaking the layout.",
		"Name it “Daily Wallpaper” and run it once to test; if a permission prompt appears, choose “Always Allow”. A new wallpaper on your Lock Screen means it works.",
	],
	guideAutomationSteps: [
		"In Shortcuts, switch to the “Automation” tab at the bottom and tap “+” to create a personal automation.",
		"Choose “Time of Day”: set 00:05, repeat “Daily”, and select “Run Immediately” on the same screen (on older iOS, turn off “Ask Before Running” on the next screen instead).",
		"Tap “Next” and pick “Daily Wallpaper” directly from the list — don't choose “New Blank Automation”.",
		"Tap Done. From now on your wallpaper updates itself every day. If it doesn't run while the phone is locked, enable “Allow Running When Locked” under Settings → Shortcuts → Advanced.",
	],
	guideNote: "Tip: the link carries your chosen style, device and theme. To change styles later, copy the new link and swap the URL inside the shortcut; the time and content update on their own every day.",
	homeAriaLabel: "LifeGrid home",
	metaTitle: "LifeGrid - Your Time, Visualized",
	metaDesc: "Turn time into a wallpaper: pick a scale, generate your progress wallpaper, and get a PNG link that updates daily via Shortcuts.",
	ogAlt: "LifeGrid calendar wallpaper example",
};

export const STRINGS: Record<Lang, Strings> = { zh, en };
