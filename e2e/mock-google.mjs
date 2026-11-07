// Minimal stand-in for Google's OAuth + Drive endpoints used by the API server.
// Records every call so the E2E test can assert on them.
import http from 'node:http';

const port = Number(process.env.MOCK_PORT || 9999);
const calls = [];
let counter = 0;

const server = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const url = new URL(req.url, `http://localhost:${port}`);
    const json = (status, obj) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(obj));
    };

    if (url.pathname === '/__calls') return json(200, calls);

    calls.push({
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      auth: req.headers.authorization || null,
      contentType: req.headers['content-type'] || null,
      size: body.length,
      text: body.length < 4000 ? body.toString('utf8') : body.subarray(0, 600).toString('utf8'),
    });

    if (req.method === 'POST' && url.pathname === '/token') {
      const params = new URLSearchParams(body.toString());
      if (params.get('refresh_token') !== 'test-refresh-token') return json(400, { error: 'invalid_grant' });
      return json(200, { access_token: 'test-access-token', expires_in: 3599, token_type: 'Bearer' });
    }
    if (req.method === 'POST' && url.pathname === '/upload/drive/v3/files') {
      if (req.headers.authorization !== 'Bearer test-access-token') return json(401, { error: { message: 'bad token' } });
      counter += 1;
      return json(200, { id: `MockDriveFile${String(counter).padStart(4, '0')}xyz` });
    }
    const perm = url.pathname.match(/^\/drive\/v3\/files\/([^/]+)\/permissions$/);
    if (req.method === 'POST' && perm) {
      return json(200, { id: 'anyoneWithLink', role: 'reader', type: 'anyone' });
    }
    json(404, { error: { message: `no mock for ${req.method} ${url.pathname}` } });
  });
});

server.listen(port, () => console.log(`mock google listening on ${port}`));
