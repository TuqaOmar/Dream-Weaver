import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { newDb } from "pg-mem";
import * as schema from "./schema";

const { Pool } = pg;

function createDb() {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    return { pool, db: drizzle(pool, { schema }) };
  }

  console.warn(
    "⚠️ [DATABASE] DATABASE_URL is not set. Falling back to in-memory PostgreSQL (pg-mem).",
  );
  const mem = newDb();
  mem.public.none(`
    CREATE TABLE IF NOT EXISTS cards (
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
    );
  `);
  const pgMem = mem.adapters.createPg();
  const pool = new pgMem.Pool();

  const patchQuery = (fn: any) => (config: any, values: any, cb: any) => {
    if (typeof config === "object" && config !== null) {
      delete config.types;
      const isArrayRowMode = config.rowMode === "array";
      if (isArrayRowMode) {
        delete config.rowMode;
      }
      const result = fn(config, values, cb);
      if (result && typeof result.then === "function") {
        return result.then((res: any) => {
          if (res && Array.isArray(res.rows) && res.rows.length > 0) {
            const keys = Object.keys(res.rows[0]);
            Object.defineProperty(res, "fields", {
              value: keys.map((k) => ({ name: k })),
              writable: true,
            });
            if (isArrayRowMode) {
              res.rows = res.rows.map((r: any) =>
                Array.isArray(r) ? r : keys.map((k) => r[k])
              );
            }
          }
          return res;
        });
      }
      return result;
    }
    return fn(config, values, cb);
  };

  const origQuery = pool.query.bind(pool);
  pool.query = patchQuery(origQuery);

  const origConnect = pool.connect.bind(pool);
  pool.connect = async (...args: any[]) => {
    const client = await origConnect(...args);
    const origClientQuery = client.query.bind(client);
    client.query = patchQuery(origClientQuery);
    return client;
  };

  return { pool, db: drizzle(pool as any, { schema }) };
}

const instance = createDb();
export const pool = instance.pool;
export const db = instance.db;

export * from "./schema";
