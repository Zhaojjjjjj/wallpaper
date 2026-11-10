# LifeGrid

LifeGrid generates time-progress wallpapers in the browser and as direct PNG responses.

Pick a scale of time — a year, a goal, a month, a week, a day, or a whole life —
and LifeGrid renders it as a minimal grid wallpaper sized for your device.
The PNG URL is stable and cache-aware, so a Shortcuts / automation routine can
re-download it daily and your wallpaper always shows today's progress.

## Wallpaper types

| Type | What it shows |
| --- | --- |
| `calendar` | A one-page-a-day calendar in the spirit of zz's calendar365: giant date, weekday in Chinese and English, a generative line motif that changes composition every day within the month's family （寒梅·春雨·新芽·落花·青叶·荷风·烈日·海浪·秋月·柿子·枯枝·落雪）, that day's sentence from the philosophical 365-quote set, a seal stamp, and a year-progress line |
| `month` | A poster-style calendar of the current month: tracked English eyebrow, accent rule, real Monday-first grid, today as a filled disc, progress hairline |
| `minimal` | Just the year progress as a giant light-weight percentage, with the days remaining |
| `generative` | 每日生成： a procedural study seeded by the day — four algorithms rotate (quarter arcs, wobbly contours, a dot interference field, quarter discs); the artwork changes completely every day and shows nothing but a seed code |
| `lyric` | 歌词 · 陈奕迅 / 赵雷 / 周杰伦的歌里每天随机一段，全周期不重复，配所属专辑封面（黑胶唱片造型）与专辑年份 |

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to configure and preview a wallpaper.

## Quality checks

```bash
npm test
npm run test:png
npm run lint
npm run typecheck
npm run build
```

The test suite uses the installed TypeScript compiler and Node's built-in test runner, so no additional test dependency is required.

## Wallpaper endpoints

- `/wallpaper?...` renders a clean full-screen Canvas preview.
- `/api/wallpaper.png?...` returns a directly downloadable PNG image.

Supported query parameters:

| Parameter | Description |
| --- | --- |
| `type` | `month`, `calendar`, `minimal`, `generative`, or `lyric` |
| `width`, `height` | Output dimensions; normalized to the global pixel budget |
| `bg`, `accent`, `text` | Six-digit hexadecimal colors |
| `timeZone` | IANA time zone such as `Asia/Shanghai` |

Preview parameters are normalized before Canvas rendering. The PNG endpoint accepts only canonical values and rejects unknown, duplicate, invalid, or style-irrelevant parameters so equivalent images cannot bypass the shared cache. Its cache lifetime ends at the next local midnight, when every style changes, so a scheduled re-download never serves a stale day.

Example: an iPhone-sized calendar wallpaper at `GET /api/wallpaper.png?type=calendar&width=1179&height=2556`.

## How rendering works

- The configurator preview and `/wallpaper` draw with the Canvas engine in `src/lib/wallpaper-engine.ts`; the preview raster is capped at 1080px on its longer edge, full resolution is rendered only by the direct endpoints.
- The PNG endpoint composes the shared SVG scene (`src/lib/wallpaper-svg.ts`) and draws text layers with the bundled Noto Sans SC font via `next/og`, so the Chinese sentences and labels render identically everywhere. The full font is kept on purpose: subsetting would break rare characters. Its SIL Open Font License is included at `src/app/api/wallpaper.png/NotoSansSC-LICENSE.txt`.
- Query parsing, canonicalization, progress math and cache timing live in `src/lib/wallpaper-config.ts`, `wallpaper-progress.ts` and `wallpaper-time.ts`, shared by all three render paths.
- All geometry (grid positions, type scale, motif composition) lives in `src/lib/wallpaper-layout.ts` and is consumed identically by the Canvas engine, the SVG renderer and the PNG text layers, so the three outputs cannot drift. Every style is composed as a poster on one shared frame — a tracked eyebrow at the top, a single hero element, and a split footer baseline — with light-weight hero numerals and wide-tracked small labels. Elapsed time is the accent color at full strength, today is ringed or column-highlighted, and the future sits at 22% opacity.
