import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// This script runs OUTSIDE the Next.js runtime (`node scripts/create-admin.mjs`),
// so Next's automatic .env loading does not apply — load env vars explicitly.
// Paths are resolved from the project root so the script works from any CWD.
// .env.local takes precedence (Next.js convention); .env is a fallback and
// never overrides a value already loaded from .env.local.
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: resolve(rootDir, '.env.local') })
dotenv.config({ path: resolve(rootDir, '.env') })

// NEVER hardcode connection strings — credentials live only in gitignored env
// files. Fail loudly if the URI is missing instead of falling back to a default.
const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('❌ MONGODB_URI is not set. Add it to .env.local before running this script.')
  process.exit(1)
}

const client = new MongoClient(uri)

try {
  await client.connect()

  const hash = await bcrypt.hash('Admin123!', 12)
  const users = client.db('zeeshaoor').collection('users')

  await users.deleteMany({ role: 'admin' })
  await users.insertOne({
    name: 'ZeeShaoor Admin',
    email: 'admin@zeeshaoor.pk',
    password: hash,
    role: 'admin',
    ghostMode: false,
    createdAt: new Date(),
  })

  console.log('✅ Admin created! Login with:')
  console.log('   Email:    admin@zeeshaoor.pk')
  console.log('   Password: Admin123!')
} catch (err) {
  console.error('❌ Failed to create admin:', err.message)
  process.exitCode = 1
} finally {
  await client.close()
}
