import { Pool, type PoolClient, type QueryResultRow } from "pg";

// Use globalThis to survive Next.js hot reloads in development
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function getPool(): Pool | null {
  if (globalForDb.pgPool) return globalForDb.pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[db] DATABASE_URL not set — database unavailable");
    return null;
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (err) => {
    console.error("[db] Unexpected pool error:", err);
  });

  globalForDb.pgPool = pool;
  return pool;
}

export async function isDatabaseAvailable(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB health check timeout")), 3000)
    );
    await Promise.race([p.query("SELECT 1"), timeout]);
    return true;
  } catch {
    return false;
  }
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const p = getPool();
  if (!p) throw new Error("Database not available");
  return p.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  const p = getPool();
  if (!p) throw new Error("Database not available");
  return p.connect();
}

export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
}

export async function closePool(): Promise<void> {
  if (globalForDb.pgPool) {
    await globalForDb.pgPool.end();
    globalForDb.pgPool = undefined;
  }
}
