const { toWallpaperQuery } = require('./validate');

const DATA_URL_PREFIX = 'data:image/png;base64,';

let browserPromise = null;

function ensureBaseUrl(baseUrl) {
    if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
        return 'http://127.0.0.1/';
    }

    return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

async function getBrowser() {
    if (!browserPromise) {
        let chromium;
        try {
            ({ chromium } = require('playwright'));
        } catch (error) {
            throw new Error('Playwright is not installed. Run `npm install` and `npm run playwright:install`.');
        }

        browserPromise = chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        });
    }

    return browserPromise;
}

async function renderWallpaperImage({ params, baseUrl }) {
    const browser = await getBrowser();
    const page = await browser.newPage({
        viewport: {
            width: params.width,
            height: params.height
        },
        deviceScaleFactor: 1
    });

    const pageBaseUrl = ensureBaseUrl(baseUrl);
    const wallpaperQuery = toWallpaperQuery(params);
    const wallpaperUrl = `${pageBaseUrl}wallpaper.html?${wallpaperQuery}`;

    try {
        await page.goto(wallpaperUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        await page.waitForFunction(
            () => {
                const canvas = document.getElementById('wallpaperCanvas');
                return Boolean(canvas && canvas.width > 0 && canvas.height > 0);
            },
            {
                timeout: 10000
            }
        );

        const dataUrl = await page.evaluate(() => {
            const canvas = document.getElementById('wallpaperCanvas');
            if (!canvas) {
                return null;
            }

            return canvas.toDataURL('image/png');
        });

        if (typeof dataUrl === 'string' && dataUrl.startsWith(DATA_URL_PREFIX)) {
            return Buffer.from(dataUrl.slice(DATA_URL_PREFIX.length), 'base64');
        }

        return await page.screenshot({
            type: 'png'
        });
    } finally {
        await page.close();
    }
}

async function closeBrowser() {
    if (!browserPromise) {
        return;
    }

    try {
        const browser = await browserPromise;
        await browser.close();
    } finally {
        browserPromise = null;
    }
}

module.exports = {
    closeBrowser,
    renderWallpaperImage
};
