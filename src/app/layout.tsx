import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "./globals.css";

export const metadata: Metadata = {
	title: "LifeGrid - Your Time, Visualized",
	description: "Generate beautiful personalized wallpapers visualizing your life time.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<body suppressHydrationWarning>
				<Header />
				{children}
			</body>
		</html>
	);
}
