const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000; // Always use port 3000 for frontend

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
  let safePath;
  
  // Handle SPA routing - serve index.html for all routes except static files
  if (req.url === '/' || req.url === '/app' || req.url.startsWith('/app/')) {
    safePath = '/index.html';  // Serve the SPA for all app routes
  } else {
    safePath = req.url;  // Static files
  }
  
  let filePath = path.join(__dirname, path.normalize(safePath));

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  console.log('Available routes:');
  console.log(`  http://localhost:${PORT}/ - Landing page`);
  console.log(`  http://localhost:${PORT}/app - Main application`);
  console.log(`  http://localhost:${PORT}/app/production - Production version`);
});

