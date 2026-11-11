import { cookies } from "next/headers";
import HomeClient from "./HomeClient";
import { LANG_COOKIE, parseLang } from "@/lib/i18n";

export default async function Home() {
	const cookieStore = await cookies();
	const lang = parseLang(cookieStore.get(LANG_COOKIE)?.value);
	return <HomeClient initialLang={lang} />;
}
