import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Standalone seed for a test TEACHER account (`node scripts/create-teacher.mjs`).
// Runs OUTSIDE the Next.js runtime, so Next's automatic .env loading does not
// apply — load env vars explicitly. .env.local takes precedence (Next.js
// convention); .env is a fallback and never overrides .env.local.
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

const EMAIL = 'teacher@zeeshaoor.pk'
const PASSWORD = 'Teacher123!'

const client = new MongoClient(uri)

try {
  await client.connect()

  // Cost 12 — matches the register route and create-admin.mjs. There is no
  // pre-save hash hook on the User schema (see src/models/User.ts), so the
  // caller MUST hash here; authorize() bcrypt.compares against this value.
  const hash = await bcrypt.hash(PASSWORD, 12)
  const users = client.db('zeeshaoor').collection('users')

  // Idempotent upsert by email — safe to re-run, and won't touch any other
  // teacher records (unlike a role-wide deleteMany).
  const now = new Date()
  const result = await users.updateOne(
    { email: EMAIL },
    {
      $set: {
        name: 'Test Teacher',
        email: EMAIL,
        password: hash,
        role: 'teacher',
        // status MUST be 'active' — authorize() refuses 'pending'/'suspended'.
        status: 'active',
        // Schema default is bypassed on a raw driver write, so set it here.
        schoolId: 'zeeshaoor-main',
        // Sample grants so subject-gated /teacher/* areas are testable too.
        // (/teacher/generator itself is exempt — see validateTeacherPath.)
        permissions: ['teacher:physics:10A', 'teacher:physics:9A'],
        assignedSubjects: ['physics'],
        isPremium: false,
        ghostMode: false,
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  )

  const action = result.upsertedCount > 0 ? 'created' : 'updated'
  console.log(`✅ Test teacher ${action}! Log in with:`)
  console.log(`   Email:    ${EMAIL}`)
  console.log(`   Password: ${PASSWORD}`)
  console.log('   → lands on /teacher, can open /teacher/generator')
} catch (err) {
  console.error('❌ Failed to create teacher:', err.message)
  process.exitCode = 1
} finally {
  await client.close()
}
