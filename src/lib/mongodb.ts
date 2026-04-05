import { Db, MongoClient } from 'mongodb';

const globalForMongo = globalThis as unknown as {
  mongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.STORAGE_MONGODB_URI;
  if (!uri?.trim()) {
    throw new Error(
      'STORAGE_MONGODB_URI no está definida. Añádela en .env o en las variables del entorno (p. ej. Vercel).'
    );
  }
  const client = new MongoClient(uri);
  return client.connect();
}

/**
 * Cliente MongoDB reutilizable en desarrollo (hot reload) y en producción.
 * Usa STORAGE_MONGODB_URI desde el entorno.
 */
export function getMongoClientPromise(): Promise<MongoClient> {
  if (!globalForMongo.mongoClientPromise) {
    globalForMongo.mongoClientPromise = createClientPromise();
  }
  return globalForMongo.mongoClientPromise;
}

/**
 * Nombre de la base de datos (no la URI).
 * - `STORAGE_MONGODB_DB_NAME` si está definida (recomendado en Vercel / .env).
 * - Si la URI incluye ruta (`...mongodb.net/mi-db?...`), se usa ese segmento.
 * - Por defecto: `digital-church`.
 */
export function getMongoDbName(): string {
  const explicit = process.env.STORAGE_MONGODB_DB_NAME?.trim();
  if (explicit) return explicit;

  const uri = process.env.STORAGE_MONGODB_URI?.trim();
  if (uri) {
    const pathOnly = uri.split('?')[0] ?? uri;
    const lastSlash = pathOnly.lastIndexOf('/');
    if (lastSlash !== -1 && lastSlash < pathOnly.length - 1) {
      const segment = pathOnly.slice(lastSlash + 1).trim();
      if (segment && !segment.includes('@')) {
        return segment;
      }
    }
  }

  return 'digital-church';
}

export async function getMongoDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(getMongoDbName());
}
