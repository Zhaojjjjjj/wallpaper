import assert from "node:assert/strict";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const port = 31_000 + (process.pid % 1_000);
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = path.resolve("node_modules/next/dist/bin/next");
const server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
	cwd: process.cwd(),
	env: { ...process.env, NODE_ENV: "production" },
	stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";

server.stdout.on("data", (chunk) => { logs += chunk; });
server.stderr.on("data", (chunk) => { logs += chunk; });

async function waitForServer() {
	const deadline = Date.now() + 20_000;
	while (Date.now() < deadline) {
		if (server.exitCode !== null) throw new Error(`Production server exited early.\n${logs}`);
		try {
			const response = await fetch(baseUrl);
			if (response.ok) return;
		} catch {
			// Server is still starting.
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	throw new Error(`Timed out waiting for production server.\n${logs}`);
}

function readPngDimensions(buffer) {
	const signature = buffer.subarray(0, 8).toString("hex");
	assert.equal(signature, "89504e470d0a1a0a");
	return {
		width: buffer.readUInt32BE(16),
		height: buffer.readUInt32BE(20),
	};
}

try {
	await waitForServer();

	for (const type of ["year", "goal", "month", "week", "minimal", "life", "day"]) {
		const query = new URLSearchParams({
			type,
			width: "320",
			height: "480",
			timeZone: "Asia/Shanghai",
		});
		if (type === "life") {
			query.set("birthDate", "1990-01-01");
			query.set("lifespan", "80");
		}
		if (type === "goal") {
			query.set("goalStartDate", "2026-07-18");
			query.set("targetDate", "2026-07-25");
			query.set("goalName", "测试目标");
		}
		const response = await fetch(`${baseUrl}/api/wallpaper.png?${query}`);
		if (!response.ok) throw new Error(`${type}: ${response.status} ${await response.text()}`);
		const image = Buffer.from(await response.arrayBuffer());

		assert.equal(response.headers.get("content-type"), "image/png");
		assert.equal(response.headers.get("x-lifegrid-font"), "Noto Sans SC");
		assert.match(response.headers.get("cache-control") || "", /^public, max-age=\d+, s-maxage=\d+$/);
		assert.deepEqual(readPngDimensions(image), { width: 320, height: 480 });
	}

	const invalidResponse = await fetch(`${baseUrl}/api/wallpaper.png?type=year&nonce=cache-bypass`);
	assert.equal(invalidResponse.status, 400);
	assert.deepEqual(await invalidResponse.json(), {
		code: "INVALID_QUERY",
		issues: ["unknown:nonce"],
	});

	const irrelevantResponse = await fetch(`${baseUrl}/api/wallpaper.png?type=year&goalName=cache-bypass`);
	assert.equal(irrelevantResponse.status, 400);
	assert.deepEqual(await irrelevantResponse.json(), {
		code: "INVALID_QUERY",
		issues: ["irrelevant:goalName"],
	});

	console.log("PNG integration: 7/7 image types and invalid-query handling passed");
} catch (error) {
	if (error instanceof Error) error.message += `\nProduction server logs:\n${logs}`;
	throw error;
} finally {
	server.kill("SIGTERM");
	await new Promise((resolve) => {
		if (server.exitCode !== null) return resolve();
		const timeout = setTimeout(resolve, 5_000);
		server.once("exit", () => {
			clearTimeout(timeout);
			resolve();
		});
	});
}
