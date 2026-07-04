import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardsTable = pgTable("cards", {
  id: text("id").primaryKey(),
  childName: text("child_name").notNull(),
  profession: text("profession").notNull(),
  customProfession: text("custom_profession"),
  childPhotoUrl: text("child_photo_url"),
  aiImageUrl: text("ai_image_url"),
  voiceMessageUrl: text("voice_message_url"),
  parentMessage: text("parent_message"),
  qrCodeUrl: text("qr_code_url"),
  status: text("status").notNull().default("draft"),
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({
  createdAt: true,
  updatedAt: true,
});

export const selectCardSchema = createSelectSchema(cardsTable);

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
