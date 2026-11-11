import assert from "node:assert/strict";
import test from "node:test";
import { parseLang, STRINGS } from "./i18n";

test("parseLang only accepts en, everything else is zh", () => {
	assert.equal(parseLang("en"), "en");
	assert.equal(parseLang("zh"), "zh");
	assert.equal(parseLang(undefined), "zh");
	assert.equal(parseLang("fr"), "zh");
});

test("en strings mirror the zh structure", () => {
	const { zh, en } = STRINGS;
	assert.deepEqual(Object.keys(en.styles).sort(), Object.keys(zh.styles).sort());
	assert.equal(en.themeNames.length, zh.themeNames.length);
	assert.equal(en.guideShortcutSteps.length, zh.guideShortcutSteps.length);
	assert.equal(en.guideAutomationSteps.length, zh.guideAutomationSteps.length);
	for (const style of Object.values(en.styles)) {
		assert.ok(style.name.length > 0 && style.desc.length > 0);
	}
});
