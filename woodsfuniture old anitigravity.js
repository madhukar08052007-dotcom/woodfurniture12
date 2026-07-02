const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'wooodsfurniture.base44.app');
const ROOT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
};

const server = http.createServer((req, res) => {
    // Decode URL to handle spaces, etc.
    const decodedUrl = decodeURIComponent(req.url);
    const parsedUrl = new URL(decodedUrl, `http://localhost:${PORT}`);
    let pathname = parsedUrl.pathname;

    console.log(`[Request] ${req.method} ${pathname}`);

    // Determine which file to serve
    let filePath = '';

    // If it's a request for fonts or media from the downloaded structure
    if (pathname.startsWith('/media.base44.com/') ||
        pathname.startsWith('/fonts.googleapis.com/') ||
        pathname.startsWith('/fonts.gstatic.com/')) {
        filePath = path.join(ROOT_DIR, pathname);
    } else if (pathname === '/' || pathname === '/index.html') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
    } else {
        // Check if it exists in the public dir
        filePath = path.join(PUBLIC_DIR, pathname);
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // If it has no file extension, it might be an SPA route, serve index.html
            const ext = path.extname(pathname);
            if (!ext) {
                console.log(`[SPA Route] Redirecting ${pathname} to index.html`);
                res.writeHead(200, { 'Content-Type': 'text/html' });
                fs.createReadStream(path.join(PUBLIC_DIR, 'index.html')).pipe(res);
            } else {
                console.log(`[404] Not Found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            }
            return;
        }

        // Serve the file
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
