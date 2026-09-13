import app from '../artifacts/api-server/src/app.js';

export const config = {
  api: {
    bodyParser: false, // Required for multer to work on Vercel
  },
};

export default app;