# LifeGrid

LifeGrid generates time-progress wallpapers in the browser and as direct PNG responses.

Pick a scale of time — a year, a goal, a month, a week, a day, or a whole life —
and LifeGrid renders it as a minimal grid wallpaper sized for your device.
The PNG URL is stable and cache-aware, so a Shortcuts / automation routine can
re-download it daily and your wallpaper always shows today's progress.

## Wallpaper types

| Type | What it shows |
| --- | --- |
| `year` | Year progress as a 13 × 10 grid with the elapsed percentage |
| `goal` | Countdown ring to a target date, with an optional goal name |
| `month` | Current month progress |
| `week` | The seven days of this week |
| `minimal` | Just the year progress percentage, nothing else |
| `life` | A life calendar in weeks, from a birth date and expected lifespan |
| `day` | An analog-style clock face for the current time |

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
| `type` | `year`, `goal`, `month`, `week`, `minimal`, `life`, or `day` |
| `width`, `height` | Output dimensions; normalized to the global pixel budget |
| `bg`, `accent`, `text` | Six-digit hexadecimal colors |
| `birthDate` | Life-calendar birth date in `YYYY-MM-DD` format |
| `lifespan` | Life-calendar lifespan from 1 to 120 years |
| `goalStartDate`, `targetDate` | Goal range in `YYYY-MM-DD` format |
| `goalName` | Goal label, limited to 40 characters |
| `timeZone` | IANA time zone such as `Asia/Shanghai` |

Preview parameters are normalized before Canvas rendering. The PNG endpoint accepts only canonical values and rejects unknown, duplicate, invalid, or style-irrelevant parameters so equivalent images cannot bypass the shared cache. Its cache lifetime follows the moment the picture would change (next minute / hour / day, per type), so a scheduled re-download never serves a stale day.

Example: an iPhone-sized year wallpaper at `GET /api/wallpaper.png?type=year&width=1179&height=2556`.

## How rendering works

- The configurator preview and `/wallpaper` draw with the Canvas engine in `src/lib/wallpaper-engine.ts`; the preview raster is capped at 1080px on its longer edge, full resolution is rendered only by the direct endpoints.
- The PNG endpoint composes the shared SVG scene (`src/lib/wallpaper-svg.ts`) and draws text layers with the bundled Noto Sans SC font via `next/og`, so arbitrary Chinese goal names render identically everywhere. The full font is kept on purpose: subsetting would break rare characters in user-supplied labels. Its SIL Open Font License is included at `src/app/api/wallpaper.png/NotoSansSC-LICENSE.txt`.
- Query parsing, canonicalization, progress math and cache timing live in `src/lib/wallpaper-config.ts`, `wallpaper-progress.ts` and `wallpaper-time.ts`, shared by all three render paths.
