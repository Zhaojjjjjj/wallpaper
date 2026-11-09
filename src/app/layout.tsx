import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "LifeGrid - Your Time, Visualized",
	description: "Generate beautiful personalized wallpapers visualizing your life time.",
	openGraph: {
		title: "LifeGrid - Your Time, Visualized",
		description: "把时间做成壁纸：年度进度、生命日历、目标倒计时，链接直出 PNG。",
		images: [
			{
				url: "/api/wallpaper.png?type=calendar&width=1200&height=630",
				width: 1200,
				height: 630,
				alt: "LifeGrid 年度进度壁纸示例",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: ["/api/wallpaper.png?type=calendar&width=1200&height=630"],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<body className={inter.variable} suppressHydrationWarning>{children}</body>
		</html>
	);
}
