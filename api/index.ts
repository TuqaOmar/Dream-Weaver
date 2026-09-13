let app: any;

try {
  // Dynamic import to catch any initialization errors
  const mod = require('../artifacts/api-server/src/app');
  app = mod.default ?? mod;
} catch (err: any) {
  // If the app fails to initialize, return a useful error
  const express = require('express');
  app = express();
  app.use((_req: any, res: any) => {
    res.status(500).json({
      error: 'Server initialization failed',
      details: err?.message || String(err),
      hint: 'Check that DATABASE_URL is set in Vercel Environment Variables',
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default app;