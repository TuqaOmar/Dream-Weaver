import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema/index.js";

const { Pool } = pg;

function createDb() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set. Please provision a PostgreSQL database (e.g. Neon free tier) and set DATABASE_URL.",
    );
  }

  // Use Neon serverless driver only when host is neon.tech
  const isNeon = dbUrl.includes("neon.tech");
  const isServerless =
    (!!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.NETLIFY) && isNeon;

  if (isServerless) {
    const client = neon(dbUrl);
    const db = drizzleNeon(client, { schema });
    return { pool: null, db };
  }

  const ssl = dbUrl.includes("supabase") || dbUrl.includes("sslmode=require") || dbUrl.includes("pooler.supabase.com")
    ? { rejectUnauthorized: false }
    : undefined;

  const pool = new Pool({ connectionString: dbUrl, ssl });
  const db = drizzleNode(pool, { schema });
  return { pool, db };
}

const instance = createDb();
export const pool = instance.pool;
export const db = instance.db;

export * from "./schema/index.js";
export * from "drizzle-orm";

// ---------------------------------------------------------------------------
// Make sure the table exists (fresh Supabase/Neon databases start empty).
// ---------------------------------------------------------------------------
let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (instance.db as any)
      .execute(
        sql`CREATE TABLE IF NOT EXISTS cards (
          id text PRIMARY KEY,
          child_name text NOT NULL,
          profession text NOT NULL,
          custom_profession text,
          child_photo_url text,
          ai_image_url text,
          voice_message_url text,
          parent_message text,
          qr_code_url text,
          status text NOT NULL DEFAULT 'draft',
          language text NOT NULL DEFAULT 'en',
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now()
        )`,
      )
      .then(() => undefined)
      .catch((err: unknown) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady!;
}

/** Human-readable root cause of a database error (never includes the password). */
export function dbErrorMessage(err: any): string {
  const root = err?.cause ?? err;
  const parts = [root?.code, root?.message || String(root)].filter(Boolean).join(": ");
  return parts.replace(/postgres(ql)?:\/\/[^\s"']+/gi, "postgres://***");
}
