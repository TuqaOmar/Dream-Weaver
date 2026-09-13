import { drizzle as drizzleNode } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

function createDb() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error(
      "DATABASE_URL is not set. Please provision a PostgreSQL database (e.g. Neon free tier) and set DATABASE_URL.",
    );
  }

  // Use Neon serverless driver for Vercel (or any serverless env)
  // Use node-postgres for local development
  const isServerless =
    !!process.env.VERCEL ||
    !!process.env.AWS_LAMBDA_FUNCTION_NAME ||
    !!process.env.NETLIFY;

  if (isServerless) {
    const client = neon(dbUrl);
    const db = drizzleNeon(client, { schema });
    return { pool: null, db };
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzleNode(pool, { schema });
  return { pool, db };
}

const instance = createDb();
export const pool = instance.pool;
export const db = instance.db;

export * from "./schema/index.js";
export * from "drizzle-orm";
