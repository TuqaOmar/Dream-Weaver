import { Router } from "express";
type Request = any;
type Response = any;
import { eq, ilike, or, sql } from "drizzle-orm";
import { db, cardsTable } from "@workspace/db";
import { randomUUID } from "crypto";
import QRCode from "qrcode";
import os from "os";

function getLocalIp(): string {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

function resolvePublicDomain(req: Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  const hostHeader = req.get("x-forwarded-host") || req.get("host") || "";
  const proto = req.get("x-forwarded-proto") || (req.secure ? "https" : "http");

  if (hostHeader) {
    const isLocalhost = hostHeader.startsWith("localhost") || hostHeader.startsWith("127.0.0.1");
    if (isLocalhost) {
      const port = hostHeader.includes(":") ? hostHeader.split(":")[1] : "8080";
      return `http://${getLocalIp()}:${port}`;
    }
    return `${proto}://${hostHeader}`;
  }

  return `http://${getLocalIp()}:8080`;
}

const router = Router();

// GET /api/cards/stats/summary — MUST be before /:id
router.get("/cards/stats/summary", async (req: Request, res: Response) => {
  try {
    const allCards = await db.select().from(cardsTable);
    const total = allCards.length;
    const completed = allCards.filter((c) => c.status === "completed").length;
    const drafts = allCards.filter((c) => c.status === "draft").length;
    const generating = allCards.filter((c) => c.status === "generating").length;

    const profMap: Record<string, number> = {};
    for (const card of allCards) {
      const p = card.customProfession || card.profession;
      profMap[p] = (profMap[p] || 0) + 1;
    }
    const professionBreakdown = Object.entries(profMap).map(
      ([profession, count]) => ({ profession, count }),
    );

    const recentCards = allCards
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    res.json({ total, completed, drafts, generating, professionBreakdown, recentCards });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// GET /api/cards/public/:id — MUST be before /:id
router.get("/cards/public/:id", async (req: Request, res: Response) => {
  try {
    const card = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!card.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const c = card[0];
    res.json({
      id: c.id,
      childName: c.childName,
      profession: c.profession,
      customProfession: c.customProfession,
      aiImageUrl: c.aiImageUrl,
      childPhotoUrl: c.childPhotoUrl,
      voiceMessageUrl: c.voiceMessageUrl,
      parentMessage: c.parentMessage,
      language: c.language,
      createdAt: c.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get public card");
    res.status(500).json({ error: "Failed to get public card" });
  }
});

// GET /api/cards
router.get("/cards", async (req: Request, res: Response) => {
  try {
    const { search } = req.query as { search?: string };
    let cards;
    if (search && search.trim()) {
      cards = await db
        .select()
        .from(cardsTable)
        .where(
          or(
            ilike(cardsTable.childName, `%${search}%`),
            ilike(cardsTable.profession, `%${search}%`),
          ),
        )
        .orderBy(sql`${cardsTable.createdAt} desc`);
    } else {
      cards = await db
        .select()
        .from(cardsTable)
        .orderBy(sql`${cardsTable.createdAt} desc`);
    }
    res.json(cards);
  } catch (err) {
    req.log.error({ err }, "Failed to list cards");
    res.status(500).json({ error: "Failed to list cards" });
  }
});

// POST /api/cards
router.post("/cards", async (req: Request, res: Response) => {
  try {
    const {
      childName,
      profession = "memory",
      customProfession,
      childPhotoUrl,
      voiceMessageUrl,
      parentMessage,
      language = "en",
    } = req.body as {
      childName: string;
      profession?: string;
      customProfession?: string;
      childPhotoUrl?: string;
      voiceMessageUrl?: string;
      parentMessage?: string;
      language?: string;
    };

    if (!childName) {
      res.status(400).json({ error: "childName is required" });
      return;
    }

    const safeLanguage = language === "ar" ? "ar" : "en";
    const id = randomUUID();
    const now = new Date();

    const [card] = await db
      .insert(cardsTable)
      .values({
        id,
        childName: String(childName).slice(0, 200),
        profession: String(profession).slice(0, 100),
        customProfession: customProfession ? String(customProfession).slice(0, 100) : null,
        childPhotoUrl: childPhotoUrl ? String(childPhotoUrl) : null,
        voiceMessageUrl: voiceMessageUrl ? String(voiceMessageUrl) : null,
        parentMessage: parentMessage ? String(parentMessage).slice(0, 2000) : null,
        status: "draft",
        language: safeLanguage,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    res.status(201).json(card);
  } catch (err) {
    req.log.error({ err }, "Failed to create card");
    res.status(500).json({ error: "Failed to create card" });
  }
});

// GET /api/cards/:id
router.get("/cards/:id", async (req: Request, res: Response) => {
  try {
    const card = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!card.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    res.json(card[0]);
  } catch (err) {
    req.log.error({ err }, "Failed to get card");
    res.status(500).json({ error: "Failed to get card" });
  }
});

// PATCH /api/cards/:id
router.patch("/cards/:id", async (req: Request, res: Response) => {
  try {
    const existing = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!existing.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const updates: Partial<typeof cardsTable.$inferInsert> = { updatedAt: new Date() };
    const body = req.body as Record<string, unknown>;

    if (typeof body.childName === "string") updates.childName = body.childName.slice(0, 200);
    if (typeof body.profession === "string") updates.profession = body.profession.slice(0, 100);
    if (typeof body.customProfession === "string") updates.customProfession = body.customProfession.slice(0, 100);
    if (body.customProfession === null) updates.customProfession = null;
    if (typeof body.childPhotoUrl === "string") updates.childPhotoUrl = body.childPhotoUrl;
    if (typeof body.aiImageUrl === "string") updates.aiImageUrl = body.aiImageUrl;
    if (typeof body.voiceMessageUrl === "string") updates.voiceMessageUrl = body.voiceMessageUrl;
    if (typeof body.parentMessage === "string") updates.parentMessage = body.parentMessage.slice(0, 2000);
    if (typeof body.qrCodeUrl === "string") updates.qrCodeUrl = body.qrCodeUrl;
    if (body.status === "draft" || body.status === "generating" || body.status === "completed") {
      updates.status = body.status as string;
    }
    if (body.language === "en" || body.language === "ar") {
      updates.language = body.language as string;
    }

    const [updated] = await db
      .update(cardsTable)
      .set(updates)
      .where(eq(cardsTable.id, String(req.params.id)))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to update card");
    res.status(500).json({ error: "Failed to update card" });
  }
});

// DELETE /api/cards/:id
router.delete("/cards/:id", async (req: Request, res: Response) => {
  try {
    const existing = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!existing.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    await db.delete(cardsTable).where(eq(cardsTable.id, String(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete card");
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// DELETE /api/cards/:id/photo
router.delete("/cards/:id/photo", async (req: Request, res: Response) => {
  try {
    const existing = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!existing.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    const card = existing[0];
    
    // If we want to delete the file from disk:
    if (card.childPhotoUrl && card.childPhotoUrl.startsWith("/api/uploads/")) {
      const filename = card.childPhotoUrl.replace("/api/uploads/", "");
      const fs = require("fs");
      const path = require("path");
      const filePath = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    const [updated] = await db
      .update(cardsTable)
      .set({ childPhotoUrl: null, aiImageUrl: null, updatedAt: new Date() })
      .where(eq(cardsTable.id, String(req.params.id)))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to delete card photo");
    res.status(500).json({ error: "Failed to delete card photo" });
  }
});

// POST /api/cards/:id/generate
router.post("/cards/:id/generate", async (req: Request, res: Response) => {
  try {
    const card = await db
      .select()
      .from(cardsTable)
      .where(eq(cardsTable.id, String(req.params.id)))
      .limit(1);

    if (!card.length) {
      res.status(404).json({ error: "Card not found" });
      return;
    }

    await db
      .update(cardsTable)
      .set({ status: "generating", updatedAt: new Date() })
      .where(eq(cardsTable.id, String(req.params.id)));

    const c = card[0];
    const profession = (c.customProfession || c.profession).toLowerCase();

    // Image map uses lowercase keys matching frontend profession IDs
    const professionImageMap: Record<string, string> = {
      doctor: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80",
      pilot: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80",
      engineer: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80",
      teacher: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80",
      police: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
      "police officer": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80",
      firefighter: "https://images.unsplash.com/photo-1587500154541-9ae3f5a18225?w=600&q=80",
      astronaut: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&q=80",
      chef: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80",
      football: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
      "football player": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
      scientist: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80",
      artist: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80",
      entrepreneur: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    };

    // Preserve the exact uploaded photo. The selected profession is used as
    // card metadata; the frontend adds a decorative frame without changing
    // or cropping the child's original image.
    const aiImageUrl =
      c.childPhotoUrl ||
      professionImageMap[profession] ||
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80";

    const domain = resolvePublicDomain(req);
    const publicUrl = `${domain}/listen/${c.id}`;

    const qrCodeUrl = await QRCode.toDataURL(publicUrl, {
      width: 300,
      margin: 1,
      color: { dark: "#1a1a2e", light: "#FFFFFF" },
    });

    const [updated] = await db
      .update(cardsTable)
      .set({ aiImageUrl, qrCodeUrl, status: "completed", updatedAt: new Date() })
      .where(eq(cardsTable.id, String(req.params.id)))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Failed to generate card image");
    res.status(500).json({ error: "Failed to generate card image" });
  }
});

export default router;
