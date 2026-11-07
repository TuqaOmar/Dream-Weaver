import { Router } from "express";
import multer from "multer";
import { isDriveConfigured, uploadToDrive } from "../lib/drive.js";

const router = Router();

// Vercel serverless functions reject request bodies larger than ~4.5 MB,
// so keep uploads safely below that.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    if (mime.startsWith("image/") || mime.startsWith("audio/") || mime === "video/webm" || mime === "video/mp4") {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  },
});

// GET /api/config — tells the frontend whether Drive uploads are available.
router.get("/config", (_req: any, res: any) => {
  res.json({ driveEnabled: isDriveConfigured(), maxUploadBytes: MAX_UPLOAD_BYTES });
});

router.get("/uploads/:filename", (_req: any, res: any) => {
  res.status(404).send("Not found");
});

// POST /api/upload/photo — returns a data URL (photos are small after client compression)
router.post("/upload/photo", upload.single("file"), (req: any, res: any) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const b64 = req.file.buffer.toString("base64");
  res.json({ url: `data:${req.file.mimetype};base64,${b64}`, storage: "site" });
});

function audioExtension(mime: string, originalName?: string): string {
  const fromName = originalName?.match(/\.([a-z0-9]{2,5})$/i)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (mime.includes("mpeg")) return "mp3";
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  if (mime.includes("wav")) return "wav";
  return "webm";
}

// POST /api/upload/voice
// - Drive configured  → uploads to Google Drive, returns the public Drive link
// - otherwise         → returns a data URL stored with the card (QR opens the listen page)
router.post("/upload/voice", upload.single("file"), async (req: any, res: any) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const mime = String(req.file.mimetype || "audio/webm").split(";")[0];
  const fallback = () => ({
    url: `data:${mime};base64,${req.file.buffer.toString("base64")}`,
    storage: "site" as const,
  });

  if (!isDriveConfigured()) {
    res.json(fallback());
    return;
  }

  try {
    const rawName = String(req.body?.name || "voice").replace(/[^\p{L}\p{N} _-]+/gu, "").trim().slice(0, 60) || "voice";
    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `${rawName} - ${stamp}.${audioExtension(mime, req.file.originalname)}`;
    const result = await uploadToDrive(req.file.buffer, mime, fileName);
    res.json({ url: result.url, storage: "drive", driveFileId: result.id });
  } catch (err: any) {
    console.error("Drive upload failed, falling back to site storage:", err?.message || err);
    res.json({ ...fallback(), warning: "drive_upload_failed", details: err?.message || String(err) });
  }
});

// Multer error handler
router.use((err: any, _req: any, res: any, _next: any) => {
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    res.status(tooBig ? 413 : 400).json({ error: tooBig ? "file_too_large" : err.message });
    return;
  }
  if (err?.message?.startsWith("File type")) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error("Upload error:", err);
  res.status(500).json({ error: "Upload failed", details: err?.message || String(err) });
});

export default router;
