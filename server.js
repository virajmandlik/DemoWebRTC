const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

// MIME types for different file extensions
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse URL and remove query parameters
    let parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    let pathname = parsedUrl.pathname;

    // Default to index.html for root path
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Construct file path
    const filePath = path.join(__dirname, 'public', pathname);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <head><title>404 Not Found</title></head>
                    <body>
                        <h1>404 - File Not Found</h1>
                        <p>The requested file <code>${pathname}</code> was not found.</p>
                        <p><a href="/">Go back to home</a></p>
                    </body>
                </html>
            `);
            return;
        }

        // Get file extension and corresponding MIME type
        const ext = path.extname(filePath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve the file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end(`
                    <html>
                        <head><title>500 Server Error</title></head>
                        <body>
                            <h1>500 - Internal Server Error</h1>
                            <p>Error reading file: ${err.message}</p>
                        </body>
                    </html>
                `);
                return;
            }

            // Set CORS headers for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            // Set content type and serve file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        });
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, 'public')}`);
    console.log(`🎥 Open http://localhost:${PORT} to access the video chat app`);
    console.log(`🧪 Open http://localhost:${PORT}/test.html to run tests`);
    console.log(`\n📋 Available pages:`);
    console.log(`   • http://localhost:${PORT}/ - Main video chat application`);
    console.log(`   • http://localhost:${PORT}/test.html - Browser compatibility tests`);
    console.log(`\n⚠️  Note: You need to configure Firebase in public/main.js before using the app`);
    console.log(`\nPress Ctrl+C to stop the server`);
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped');
        process.exit(0);
    });
});
