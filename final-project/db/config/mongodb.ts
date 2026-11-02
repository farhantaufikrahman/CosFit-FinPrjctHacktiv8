import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;
if (!uri) {
  throw new Error("MONGO_URI belum di-set di .env");
}

// Saat `next dev` hot-reload, modul ini dievaluasi ulang. Tanpa cache global,
// setiap reload membuat MongoClient baru dan koneksi menumpuk.
// Pola ini sama dengan contoh resmi: https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
const globalForMongo = globalThis as unknown as { _mongoClient?: MongoClient };

const client = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}

export const database = client.db(process.env.MONGO_DB_NAME || "final-project");
