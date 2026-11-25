import { createHash, createHmac } from "node:crypto";

// Minimal Tencent COS PUT (XML API, q-sign sha1) — enough to publish the
// daily wallpaper object without pulling in a full SDK. Bucket and region
// are not secrets; the API keys come from the COS_SECRET_ID /
// COS_SECRET_KEY environment variables.
const COS_BUCKET = "wallpaper-1322238592";
const COS_REGION = "ap-guangzhou";

const sha1Hex = (text: string) => createHash("sha1").update(text).digest("hex");
const hmacSha1Hex = (key: string, text: string) => createHmac("sha1", key).update(text).digest("hex");

export async function putCosObject(key: string, body: Buffer, contentType: string): Promise<void> {
	const secretId = process.env.COS_SECRET_ID;
	const secretKey = process.env.COS_SECRET_KEY;
	if (!secretId || !secretKey) {
		throw new Error("COS_SECRET_ID / COS_SECRET_KEY environment variables are not set");
	}

	const host = `${COS_BUCKET}.cos.${COS_REGION}.myqcloud.com`;
	const pathname = `/${key}`;
	const now = Math.floor(Date.now() / 1000);
	const signTime = `${now - 60};${now + 600}`;
	const signKey = hmacSha1Hex(secretKey, signTime);

	const signedHeaders: Record<string, string> = {
		"cache-control": "no-store",
		"content-type": contentType,
		host,
		"x-cos-acl": "public-read",
	};
	// Encoding and field names follow Tencent's official SDKs exactly
	// (quote with safe chars -_.~, and the signature field is
	// "q-signature" — a "q-sign" field is ignored and the request is
	// treated as unauthenticated, which COS answers with AccessDenied).
	const quote = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
	const headerKeys = Object.keys(signedHeaders).sort();
	const headerString = headerKeys.map((k) => `${k}=${quote(signedHeaders[k])}`).join("&");
	const httpString = `put\n${pathname}\n\n${headerString}\n`;
	const stringToSign = `sha1\n${signTime}\n${sha1Hex(httpString)}\n`;
	const signature = hmacSha1Hex(signKey, stringToSign);
	const authorization =
		`q-sign-algorithm=sha1&q-ak=${secretId}&q-sign-time=${signTime}&q-key-time=${signTime}` +
		`&q-header-list=${headerKeys.join(";")}&q-url-param-list=&q-signature=${signature}`;

	const response = await fetch(`https://${host}${pathname}`, {
		method: "PUT",
		headers: {
			Authorization: authorization,
			"Cache-Control": "no-store",
			"Content-Type": contentType,
			"x-cos-acl": "public-read",
		},
		body: new Uint8Array(body),
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new Error(`COS PUT ${key} failed: HTTP ${response.status} ${detail.slice(0, 300)}`);
	}
}
