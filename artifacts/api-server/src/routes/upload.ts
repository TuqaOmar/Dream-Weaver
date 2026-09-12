import { Router } from "express";
import multer from "multer";

const router = Router();

// Use memory storage for Vercel Serverless environment
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/webm",
      "audio/ogg",
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/x-m4a",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// Since we use Data URIs, GET /api/uploads is no longer used for new uploads,
// but we can keep a stub just in case
router.get("/uploads/:filename", (_req: any, res: any) => {
  res.status(404).send("Not found");
});

// POST /api/upload/photo
router.post(
  "/upload/photo",
  upload.single("file"),
  (req: any, res: any) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const b64 = req.file.buffer.toString('base64');
    const url = `data:${req.file.mimetype};base64,${b64}`;
    res.json({ url, filename: "base64-image" });
  },
);

// POST /api/upload/voice
router.post(
  "/upload/voice",
  upload.single("file"),
  (req: any, res: any) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const b64 = req.file.buffer.toString('base64');
    const url = `data:${req.file.mimetype};base64,${b64}`;
    res.json({ url, filename: "base64-audio" });
  },
);

// Multer error handler
router.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("File type")) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Upload failed" });
});

export default router;
