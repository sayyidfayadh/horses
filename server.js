// Stands in for the carnival portal's `GET /api/accepted-horses`, which the
// backend's DrcSync reads. Run locally with `npm run mock:horses`, or deploy
// this folder on its own (Render: root directory `mock-server`, start command
// `npm start`).
const path = require('path');
const jsonServer = require('json-server');
const { generateHorse } = require('./generate');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

server.use(jsonServer.defaults({ logger: true, noCors: false }));

// The feed is read-only upstream; without this json-server would let anyone
// with the URL rewrite the data.
server.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
    return res.status(405).json({ status: 'error', message: 'Read-only mock.' });
  }
  next();
});

// When MOCK_API_KEY is set, require it in `X-API-Key`, as the real API does.
const apiKey = process.env.MOCK_API_KEY;
if (apiKey) {
  server.use((req, res, next) => {
    if (req.path === '/' || req.get('X-API-Key') === apiKey) return next();
    res.status(401).json({ status: 'error', message: 'Invalid API key.' });
  });
}

// The feed grows: db.json's fixed horses first, then generated ones whose ids
// carry on from there. Each request adds MOCK_GROW more (default 5, 0 holds
// the feed still), so every "Fetch from nomination portal" brings new horses
// in. `?count=N` answers exactly N instead and leaves the growth alone. The
// count is in memory, so a restart starts again from the fixed horses — the
// generated ones come back identical as it grows past them again.
const fixed = router.db.get('accepted-horses').get('data').value();
const grow = Math.max(0, Number(process.env.MOCK_GROW ?? 5) || 0);
let size = fixed.length;

server.get('/api/accepted-horses', (req, res) => {
  const asked = Number.parseInt(req.query.count, 10);
  let n;
  if (Number.isFinite(asked) && asked >= 0) {
    n = asked;
  } else {
    size += grow;
    n = size;
  }
  const data = fixed.slice(0, n);
  for (let id = fixed.length + 1; id <= n; id++) data.push(generateHorse(id));
  res.json({ status: 'success', count: data.length, data });
});

server.use(jsonServer.rewriter(require('./routes.json')));
server.use(router);

const port = Number(process.env.PORT) || 3001;
server.listen(port, '0.0.0.0', () => {
  console.log(`Accepted-horses mock on http://localhost:${port}/api/accepted-horses`);
});
