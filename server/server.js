// Minimal in-memory WebRTC signaling server for grepaudio (dsp_rtc/https_rtc_client.js).
// No dependencies. Binds 127.0.0.1 by default; nginx proxies /api/ to it.
//
// Flow (host = peer that publishes a service, client = https_rtc_client.connectToService):
//   host   POST /api/rtc/:service/host     {localDescription, iceCandidates?} -> {ok, service, expiresAt}
//   client GET  /api/rtc/list                                                 -> ["svc", ...]
//   client GET  /api/rtc/:service/connect/                                    -> {localDescription, iceCandidates}
//   client POST /api/rtc/:service/offer    {offer, iceCandidates:[]}          -> {iceCandidates}
//          ("offer" is the client's SDP *answer*; the client names it offer.)
//          localDescription is intentionally NOT returned: the client already applied the host's
//          description, and re-applying it after createAnswer would fail in "stable" state.
//   host   GET  /api/rtc/:service/answers?since=<id>                          -> [{id, answer, iceCandidates, at}]
//   host   DELETE /api/rtc/:service                                           -> {ok}
'use strict';
const http = require('http');

const PORT = Number(process.env.PORT || 3021);
const HOST = process.env.HOST || '127.0.0.1';
const TTL_MS = Number(process.env.TTL_MS || 10 * 60 * 1000);
const MAX_BODY = Number(process.env.MAX_BODY || 64 * 1024);
const MAX_SERVICES = 200, MAX_ANSWERS = 50;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://dsp.grepawk.com').split(',');

const services = new Map(); // name -> {localDescription, iceCandidates, answers:[], nextId, updatedAt}
const NAME_RE = /^[A-Za-z0-9_.-]{1,64}$/;

function send(req, res, status, obj) {
  const body = JSON.stringify(obj);
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', 'Content-Length': Buffer.byteLength(body) };
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin; h['Vary'] = 'Origin';
    h['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  res.writeHead(status, h); res.end(req.method === 'HEAD' ? undefined : body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0, tooBig = false; const chunks = [];
    if (Number(req.headers['content-length'] || 0) > MAX_BODY) tooBig = true;
    req.on('data', c => { size += c.length; if (size > MAX_BODY) tooBig = true; if (!tooBig) chunks.push(c); });
    req.on('end', () => {
      if (tooBig) return reject(Object.assign(new Error('body too large'), { status: 413 })); try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('invalid JSON'), { status: 400 })); } });
    req.on('error', reject);
  });
}

const isDesc = d => d && typeof d === 'object' && typeof d.type === 'string' && typeof d.sdp === 'string';
const cands = c => Array.isArray(c) ? c.filter(x => x && typeof x === 'object').slice(0, 100) : [];
function live(name) {
  const s = services.get(name);
  if (s && Date.now() - s.updatedAt > TTL_MS) { services.delete(name); return undefined; }
  return s;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean); // api rtc ...
    if (req.method === 'OPTIONS') return send(req, res, 204, {});
    if (parts[0] !== 'api' || parts[1] !== 'rtc') return send(req, res, 404, { error: 'not found' });
    const [, , name, action] = parts;

    if (name === 'list' && !action && (req.method === 'GET' || req.method === 'HEAD'))
      return send(req, res, 200, [...services.keys()].filter(live));
    if (name === 'health' && !action) return send(req, res, 200, { ok: true, services: services.size });

    if (!name || !NAME_RE.test(name)) return send(req, res, 400, { error: 'invalid service name' });
    const s = live(name);

    if (action === 'host' && req.method === 'POST') {
      const b = await readJson(req);
      if (!isDesc(b.localDescription)) return send(req, res, 400, { error: 'localDescription {type,sdp} required' });
      if (!s && services.size >= MAX_SERVICES) return send(req, res, 503, { error: 'too many services' });
      services.set(name, { localDescription: b.localDescription, iceCandidates: cands(b.iceCandidates), answers: [], nextId: 1, updatedAt: Date.now() });
      return send(req, res, 200, { ok: true, service: name, expiresAt: new Date(Date.now() + TTL_MS).toISOString() });
    }
    if (!s) return send(req, res, 404, { error: 'service not found' });

    if (action === 'connect' && req.method === 'GET')
      return send(req, res, 200, { localDescription: s.localDescription, iceCandidates: s.iceCandidates });
    if (action === 'offer' && req.method === 'POST') {
      const b = await readJson(req);
      if (!isDesc(b.offer)) return send(req, res, 400, { error: 'offer {type,sdp} required' });
      if (s.answers.length >= MAX_ANSWERS) s.answers.shift();
      const id = s.nextId++;
      s.answers.push({ id, answer: b.offer, iceCandidates: cands(b.iceCandidates), at: Date.now() });
      return send(req, res, 200, { id, iceCandidates: s.iceCandidates });
    }
    if (action === 'answers' && req.method === 'GET') {
      s.updatedAt = Date.now(); // host polling keeps the service alive
      const since = Number(url.searchParams.get('since') || 0);
      return send(req, res, 200, s.answers.filter(a => a.id > since));
    }
    if (!action && req.method === 'DELETE') { services.delete(name); return send(req, res, 200, { ok: true }); }
    return send(req, res, 405, { error: 'method not allowed' });
  } catch (e) {
    return send(req, res, e.status || 500, { error: e.status ? e.message : 'internal error' });
  }
});

setInterval(() => { for (const k of services.keys()) live(k); }, 60 * 1000).unref();
server.listen(PORT, HOST, () => console.log(`grepaudio-rtc listening on ${HOST}:${PORT}`));
for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => server.close(() => process.exit(0)));
