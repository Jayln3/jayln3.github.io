import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { output } from './lib.mjs';

const port = Number(process.env.PORT || 4000);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.xml': 'application/xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.txt': 'text/plain; charset=utf-8' };
http.createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(output, '.' + name);
    if (file !== output && !file.startsWith(output + path.sep)) { res.writeHead(403).end(); return; }
    const stat = await fs.stat(file);
    if (stat.isDirectory()) {
      if (!name.endsWith('/')) { res.writeHead(301, { Location: name + '/' }).end(); return; }
      file = path.join(file, 'index.html');
    }
    const data = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await fs.readFile(path.join(output, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:' + port));
