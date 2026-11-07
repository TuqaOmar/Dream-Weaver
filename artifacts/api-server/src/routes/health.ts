import { Router } from "express";
import { ensureSchema, dbErrorMessage, db, cardsTable, sql } from "../../../../lib/db/src/index.js";

const router = Router();

// GET /api/healthz        → quick liveness check
// GET /api/healthz?db=1   → also checks the database connection
router.get("/healthz", async (req: any, res: any) => {
  if (!req.query?.db) {
    res.json({ status: "ok" });
    return;
  }
  try {
    await ensureSchema();
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(cardsTable);
    res.json({ status: "ok", database: "ok", cards: count });
  } catch (err) {
    res.status(503).json({ status: "degraded", database: "error", details: dbErrorMessage(err) });
  }
});

export default router;
