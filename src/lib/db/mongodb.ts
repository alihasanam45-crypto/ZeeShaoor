import mongoose from 'mongoose'

/**
 * Enterprise MongoDB connection utility (Mongoose).
 *
 * Next.js App Router runs route handlers and server actions in a serverless
 * style: modules can be re-evaluated per request in dev (HMR) and per lambda
 * in production. Without a global cache each evaluation would open a new
 * connection pool and exhaust Atlas's connection limit. The cache lives on
 * `globalThis`, which survives HMR reloads within one process.
 */

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // Must be `var` — `let`/`const` do not attach to globalThis.
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = globalThis.__mongooseCache ?? { conn: null, promise: null }
globalThis.__mongooseCache = cached

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn

  // Read the env var at call time, not import time, so builds and tooling
  // that merely import a model never crash on a missing secret.
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('Missing MONGODB_URI — define it in .env.local')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      // Fail fast instead of buffering model calls while disconnected —
      // surfaces connection problems as errors rather than silent hangs.
      bufferCommands: false,
      // Pool sizing: one pooled client per server process. 10 concurrent
      // sockets is comfortably inside the Atlas M0/Flex 500-connection cap
      // even with several lambdas warm.
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      // IPv4 only — Atlas SRV lookups over IPv6 hang on some Windows/ISP DNS.
      family: 4,
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Evict the rejected promise so the next request can retry the
    // connection instead of awaiting the same cached failure forever.
    cached.promise = null
    throw err
  }

  return cached.conn
}

export const connectDB = connectToDatabase
export default connectToDatabase
