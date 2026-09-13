export const config = {
  api: {
    bodyParser: false,
  },
};

let handler: any = null;
let initError: string | null = null;

async function getApp() {
  if (handler) return handler;
  if (initError) return null;

  try {
    const mod = await import('../artifacts/api-server/src/app.js');
    handler = mod.default ?? mod;
    return handler;
  } catch (err: any) {
    initError = err?.stack || err?.message || String(err);
    console.error('App init failed:', initError);
    return null;
  }
}

export default async function (req: any, res: any) {
  const app = await getApp();
  if (!app) {
    res.status(500).json({
      error: 'Server initialization failed',
      details: initError,
      hint: 'Check that DATABASE_URL is set in Vercel Environment Variables',
    });
    return;
  }
  return app(req, res);
}