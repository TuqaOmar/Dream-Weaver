import { Router, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
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

// Serve uploaded files statically
router.get("/uploads/:filename", (req: Request, res: Response) => {
  const safe = path.basename(String(req.params.filename));
  const filePath = path.join(uploadsDir, safe);
  res.sendFile(filePath);
});

// POST /api/upload/photo
router.post(
  "/upload/photo",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  },
);

// POST /api/upload/voice
router.post(
  "/upload/voice",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = `/api/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  },
);

// Multer error handler
router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError || err.message?.startsWith("File type")) {
    res.status(400).json({ error: err.message });
    return;
  }
  res.status(500).json({ error: "Upload failed" });
});

export default router;
