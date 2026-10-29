/*
  DEADWEIGHT - an Among Us style game.
  Zero dependencies: just run   node server.js
  Then open http://localhost:3000
  (Game rules live in engine.js, which the browser also uses for offline mode.)
*/
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const engine = require('./engine.js');

const PORT = process.env.PORT || 3000;

/* Optional: real AI bots. Set ANTHROPIC_API_KEY and EVERY bot becomes its own AI agent: its own personality,
   secret role and private notes, reading the meeting chat and deciding by itself what to say and who to vote for.
   Without a key the bots use the built-in rule-based chat (it still reacts to what you type). */
if (process.env.ANTHROPIC_API_KEY && typeof fetch === 'function') {
  const MODEL = process.env.DEADWEIGHT_MODEL || 'claude-haiku-5-5';
  let lastErr = 0;
  const warn = msg => { if (Date.now() - lastErr > 30000) { lastErr = Date.now(); console.log('  Bot AI problem: ' + msg + '  (bots fall back to the built-in chat)'); } };
  engine.setBrain(async (system, user, opts) => {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 13000);
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctl.signal,
        headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: MODEL, max_tokens: (opts && opts.max) || 170, system, messages: [{ role: 'user', content: user }] }),
      });
      const j = await r.json();
      if (!r.ok) { warn('HTTP ' + r.status + ' ' + JSON.stringify(j.error || j).slice(0, 200)); return null; }
      return j && j.content && j.content[0] && j.content[0].text;
    } catch (e) { warn(e && e.message); return null; }
    finally { clearTimeout(timer); }
  });
  console.log('  Bot AI: ON, every bot is its own AI agent (' + MODEL + ')');
} else if (process.env.ANTHROPIC_API_KEY) console.log('  Bot AI: needs Node 18 or newer (fetch is missing). Using the built-in bot chat.');
else console.log('  Bot AI: off (set ANTHROPIC_API_KEY to turn every bot into its own AI). Using the built-in bot chat.');

/* ---------------- minimal WebSocket (RFC 6455) ---------------- */
function encode(data, op = 1) {
  const payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = payload.length;
  let head;
  if (len < 126) head = Buffer.from([0x80 | op, len]);
  else if (len < 65536) { head = Buffer.alloc(4); head[0] = 0x80 | op; head[1] = 126; head.writeUInt16BE(len, 2); }
  else { head = Buffer.alloc(10); head[0] = 0x80 | op; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  return Buffer.concat([head, payload]);
}
class Conn {
  constructor(socket) {
    this.socket = socket; this.buf = Buffer.alloc(0); this.frags = []; this.alive = true;
    this.onmessage = () => {}; this.onclose = () => {};
    socket.setNoDelay(true);
    socket.on('data', d => { this.buf = Buffer.concat([this.buf, d]); this.parse(); });
    socket.on('close', () => this.close());
    socket.on('error', () => this.close());
  }
  parse() {
    for (;;) {
      const b = this.buf;
      if (b.length < 2) return;
      const fin = !!(b[0] & 0x80), op = b[0] & 15, masked = !!(b[1] & 0x80);
      let len = b[1] & 127, off = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); off = 4; }
      else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); off = 10; }
      if (len > 100000) return this.close();
      const mlen = masked ? 4 : 0;
      if (b.length < off + mlen + len) return;
      const payload = Buffer.from(b.subarray(off + mlen, off + mlen + len));
      if (masked) { const m = b.subarray(off, off + 4); for (let i = 0; i < payload.length; i++) payload[i] ^= m[i & 3]; }
      this.buf = b.subarray(off + mlen + len);
      if (op === 8) return this.close();
      if (op === 9) { this.raw(encode(payload, 10)); continue; }
      if (op === 10) continue;
      this.frags.push(payload);
      if (fin) { const s = Buffer.concat(this.frags).toString('utf8'); this.frags = []; try { this.onmessage(s); } catch (e) { console.error(e); } }
    }
  }
  raw(buf) { if (this.alive) try { this.socket.write(buf); } catch (e) {} }
  send(str) { this.raw(encode(str)); }
  ping() { this.raw(encode('', 9)); }
  close() {
    if (!this.alive) return;
    this.alive = false;
    try { this.socket.destroy(); } catch (e) {}
    this.onclose();
  }
}

/* ---------------- http + upgrade ---------------- */
const FILES = {
  '/': 'index.html', '/index.html': 'index.html', '/engine.js': 'engine.js', '/sw.js': 'sw.js', '/manifest.webmanifest': 'manifest.webmanifest',
  '/icon-192.png': 'icon-192.png', '/icon-512.png': 'icon-512.png', '/icon-maskable.png': 'icon-maskable.png', '/favicon.png': 'favicon.png',
};
const TYPES = {
  'index.html': 'text/html; charset=utf-8', 'engine.js': 'application/javascript; charset=utf-8', 'sw.js': 'application/javascript; charset=utf-8',
  'manifest.webmanifest': 'application/manifest+json; charset=utf-8', 'icon-192.png': 'image/png', 'icon-512.png': 'image/png', 'icon-maskable.png': 'image/png', 'favicon.png': 'image/png',
};
const STARTED = Date.now();
const CORS = { 'Access-Control-Allow-Origin': '*' };
function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) out.push(i.address);
  return out;
}
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (FILES[url]) {
    const f = FILES[url];
    fs.readFile(path.join(__dirname, f), (err, data) => {
      if (err) { res.writeHead(500); return res.end(f + ' missing'); }
      res.writeHead(200, { 'Content-Type': TYPES[f], 'Cache-Control': f.endsWith('.png') ? 'public, max-age=86400' : 'no-cache' });
      res.end(data);
    });
  } else if (url === '/health') { res.writeHead(200, CORS); res.end('ok'); }
  else if (url === '/info') { // lets the page show which server it is on, and the Wi-Fi addresses friends can use
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ game: 'deadweight', id: engine.SERVER_ID, up: Math.round((Date.now() - STARTED) / 1000), rooms: engine.roomCount(), ai: engine.hasBrain(), port: Number(PORT), lan: lanAddresses() }));
  }
  else if (url === '/rooms') { // public lobbies, for the in-app server browser (CORS open so the installed app can read it)
    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    res.end(JSON.stringify({ game: 'deadweight', id: engine.SERVER_ID, rooms: engine.publicRooms() }));
  }
  else if (req.method === 'OPTIONS') { res.writeHead(204, { ...CORS, 'Access-Control-Allow-Methods': 'GET, OPTIONS' }); res.end(); }
  else { res.writeHead(404); res.end('Not found'); }
});

server.on('upgrade', (req, socket) => {
  const key = req.headers['sec-websocket-key'];
  if (!key || String(req.headers.upgrade).toLowerCase() !== 'websocket') return socket.destroy();
  const accept = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
  const conn = new Conn(socket), link = engine.connect(conn);
  conn.onmessage = raw => link.recv(raw);
  conn.onclose = () => link.close();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  DEADWEIGHT is running\n');
  console.log('  This computer:  http://localhost:' + PORT);
  for (const a of lanAddresses()) console.log('  Same Wi-Fi:     http://' + a + ':' + PORT + '   (school wifi often blocks this)');
  console.log('  Server id:      ' + engine.SERVER_ID + '   (everyone in a room must see the same id)');
  console.log('\n  For friends anywhere (and school wifi): host it online, see "HOST IT ONLINE" in README.txt\n');
});
