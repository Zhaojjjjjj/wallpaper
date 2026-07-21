export interface DevicePreset {
	id: string;
	name: string;
	width: number;
	height: number;
}

export const DEVICE_PRESETS: readonly DevicePreset[] = [
	{ id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", width: 1320, height: 2868 },
	{ id: "iphone-16-pro", name: "iPhone 16 Pro", width: 1206, height: 2622 },
	{ id: "iphone-16-plus", name: "iPhone 16 Plus", width: 1290, height: 2796 },
	{ id: "iphone-16", name: "iPhone 16", width: 1179, height: 2556 },
	{ id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", width: 1290, height: 2796 },
	{ id: "iphone-15-pro", name: "iPhone 15 Pro", width: 1179, height: 2556 },
	{ id: "iphone-15-plus", name: "iPhone 15 Plus", width: 1290, height: 2796 },
	{ id: "iphone-15", name: "iPhone 15", width: 1179, height: 2556 },
	{ id: "iphone-14-pro-max", name: "iPhone 14 Pro Max", width: 1290, height: 2796 },
	{ id: "iphone-14-pro", name: "iPhone 14 Pro", width: 1179, height: 2556 },
	{ id: "iphone-14-plus", name: "iPhone 14 Plus", width: 1284, height: 2778 },
	{ id: "iphone-14", name: "iPhone 14", width: 1170, height: 2532 },
	{ id: "iphone-13-pro-max", name: "iPhone 13 Pro Max", width: 1284, height: 2778 },
	{ id: "iphone-13-pro", name: "iPhone 13 Pro", width: 1170, height: 2532 },
	{ id: "iphone-13", name: "iPhone 13", width: 1170, height: 2532 },
	{ id: "iphone-13-mini", name: "iPhone 13 mini", width: 1080, height: 2340 },
	{ id: "iphone-12-pro-max", name: "iPhone 12 Pro Max", width: 1284, height: 2778 },
	{ id: "iphone-12-pro", name: "iPhone 12 Pro", width: 1170, height: 2532 },
	{ id: "iphone-12", name: "iPhone 12", width: 1170, height: 2532 },
	{ id: "iphone-12-mini", name: "iPhone 12 mini", width: 1080, height: 2340 },
	{ id: "iphone-11-pro-max", name: "iPhone 11 Pro Max", width: 1242, height: 2688 },
	{ id: "iphone-11-pro", name: "iPhone 11 Pro", width: 1125, height: 2436 },
	{ id: "iphone-11", name: "iPhone 11", width: 828, height: 1792 },
	{ id: "iphone-se-3", name: "iPhone SE (3rd gen)", width: 750, height: 1334 },
	{ id: "iphone-xs-max", name: "iPhone XS Max", width: 1242, height: 2688 },
	{ id: "iphone-x-xs", name: "iPhone X/XS", width: 1125, height: 2436 },
	{ id: "iphone-xr", name: "iPhone XR", width: 828, height: 1792 },
	{ id: "android-1080p", name: "1080p Android", width: 1080, height: 2400 },
	{ id: "android-2k", name: "2K Android", width: 1440, height: 3200 },
	{ id: "desktop-4k", name: "4K Desktop", width: 3840, height: 2160 },
	{ id: "macbook-pro-16", name: "MacBook Pro 16", width: 3456, height: 2234 },
	{ id: "macbook-pro-14", name: "MacBook Pro 14", width: 3024, height: 1964 },
	{ id: "macbook-air-13", name: "MacBook Air 13", width: 2560, height: 1664 },
];

export function resolveDevicePresetId(width: number, height: number, preferredId?: string): string {
	const preferred = preferredId ? DEVICE_PRESETS.find((device) => device.id === preferredId) : undefined;
	if (preferred?.width === width && preferred.height === height) return preferred.id;

	return DEVICE_PRESETS.find((device) => device.width === width && device.height === height)?.id || "custom";
}
