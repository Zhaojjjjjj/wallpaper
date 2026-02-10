# wallpaper render service

This project now serves both:

- static pages (`index.html`, `wallpaper.html`)
- PNG rendering API for automation (`/api/wallpaper.png`)

## Development

```bash
npm install
npm run playwright:install
npm run dev
```

Server default address:

- `http://127.0.0.1:3000`

Renderer base URL (optional):

- `RENDER_BASE_URL`
- default: `http://127.0.0.1:<PORT>`
- use this when your service is behind a reverse proxy and needs a specific internal origin for Playwright navigation

## API

`GET /api/wallpaper.png`

Query parameters:

- `type`, `bg`, `accent`, `lang`, `w`, `h`
- `target`, `name` (used by `type=goal`)

Example:

`/api/wallpaper.png?type=year&bg=%23000000&accent=%23FFFFFF&lang=zh&w=1179&h=2556`

The response is always a PNG image when rendering succeeds.

## Test

```bash
npm test
```
