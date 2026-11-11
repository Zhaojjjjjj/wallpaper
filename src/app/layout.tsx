import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { LANG_COOKIE, STRINGS, parseLang } from "@/lib/i18n";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	display: "swap",
	variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
	const cookieStore = await cookies();
	const lang = parseLang(cookieStore.get(LANG_COOKIE)?.value);
	const strings = STRINGS[lang];
	return {
		title: strings.metaTitle,
		description: strings.metaDesc,
		openGraph: {
			title: strings.metaTitle,
			description: strings.metaDesc,
			images: [
				{
					url: "/api/wallpaper.png?type=calendar&width=1200&height=630",
					width: 1200,
					height: 630,
					alt: strings.ogAlt,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			images: ["/api/wallpaper.png?type=calendar&width=1200&height=630"],
		},
	};
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const lang = parseLang(cookieStore.get(LANG_COOKIE)?.value);
	return (
		<html lang={lang === "en" ? "en" : "zh-CN"} suppressHydrationWarning>
			<body className={inter.variable} suppressHydrationWarning>{children}</body>
		</html>
	);
}
