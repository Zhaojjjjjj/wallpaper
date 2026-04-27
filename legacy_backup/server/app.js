const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { renderWallpaperImage, closeBrowser } = require('./render');
const { normalizeWallpaperParams } = require('./validate');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const DEFAULT_RENDER_BASE_URL = process.env.RENDER_BASE_URL || `http://127.0.0.1:${PORT}`;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, body) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
    });
    res.end(JSON.stringify(body));
}

function resolveStaticPath(pathname) {
    const decodedPath = decodeURIComponent(pathname || '/');
    const localPath = decodedPath === '/' ? 'index.html' : decodedPath.replace(/^\/+/, '');
    const normalized = path.normalize(localPath);

    if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
        return null;
    }

    return path.join(ROOT_DIR, normalized);
}

function serveStatic(req, res, pathname) {
    const filePath = resolveStaticPath(pathname);
    if (!filePath) {
        sendJson(res, 400, { code: 'INVALID_PATH', message: 'Invalid path' });
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            sendJson(res, 404, { code: 'NOT_FOUND', message: 'File not found' });
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': ext === '.html' ? 'no-store, max-age=0' : 'public, max-age=3600'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        stream.on('error', () => {
            if (!res.headersSent) {
                sendJson(res, 500, { code: 'FILE_READ_FAILED', message: 'Failed to read file' });
                return;
            }

            res.destroy();
        });
    });
}

function createRequestHandler({
    render = renderWallpaperImage,
    renderBaseUrl = DEFAULT_RENDER_BASE_URL
} = {}) {
    async function handleWallpaper(req, res, urlObject) {
        try {
            const params = normalizeWallpaperParams(urlObject.searchParams);
            const imageBuffer = await render({
                params,
                baseUrl: renderBaseUrl
            });

            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Cache-Control': 'no-store, max-age=0',
                'Content-Length': String(imageBuffer.length)
            });
            res.end(imageBuffer);
        } catch (error) {
            sendJson(res, 500, {
                code: 'RENDER_FAILED',
                message: 'Failed to render wallpaper image',
                details: error instanceof Error ? error.message : String(error)
            });
        }
    }

    return async function requestHandler(req, res) {
        const method = req.method || 'GET';
        const host = req.headers.host || `127.0.0.1:${PORT}`;
        const urlObject = new URL(req.url || '/', `http://${host}`);

        if (method !== 'GET') {
            sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', message: 'Only GET is supported' });
            return;
        }

        if (urlObject.pathname === '/api/wallpaper.png') {
            await handleWallpaper(req, res, urlObject);
            return;
        }

        serveStatic(req, res, urlObject.pathname);
    };
}

const requestHandler = createRequestHandler();

async function safeRequestHandler(req, res) {
    try {
        await requestHandler(req, res);
    } catch (error) {
        sendJson(res, 500, {
            code: 'UNEXPECTED_ERROR',
            message: 'Unexpected server error',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}

const server = http.createServer((req, res) => {
    safeRequestHandler(req, res);
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`wallpaper server running at http://127.0.0.1:${PORT}`);
    });
}

async function shutdown() {
    await closeBrowser();
}

process.on('SIGINT', async () => {
    await shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await shutdown();
    process.exit(0);
});

module.exports = {
    PORT,
    createRequestHandler,
    resolveStaticPath,
    requestHandler,
    server
};
