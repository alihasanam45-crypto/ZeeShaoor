// Compatibility shim — the connection utility moved to src/lib/db/mongodb.ts.
// 47+ files import from '@/lib/mongodb'; this keeps every import style working
// while guaranteeing a single connection cache.
export { connectDB, connectToDatabase, default } from './db/mongodb'
