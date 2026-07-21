# LifeGrid

LifeGrid generates time-progress wallpapers in the browser and as direct PNG responses.

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

Preview parameters are normalized before Canvas rendering. The PNG endpoint accepts only canonical values and rejects unknown, duplicate, invalid, or style-irrelevant parameters so equivalent images cannot bypass the shared cache.

PNG text is rendered with the bundled Noto Sans SC font. Its SIL Open Font License is included at `src/app/api/wallpaper.png/NotoSansSC-LICENSE.txt`.
