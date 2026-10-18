import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

/**
 * One-off migration: rewrite `chapter` from a prose name to a chapter NUMBER.
 *
 * Documents seeded before src/data/chapter-registry.ts existed stored
 * chapter: "Kinematics". The generator matches on chapter: "2". Until this
 * runs, those documents are invisible to every chapter-filtered query.
 *
 * Idempotent: rows whose chapter is already numeric are left alone, so this is
 * safe to re-run. Pass --apply to write; the default is a dry run.
 *
 *   node scripts/migrate-chapter-numbers.mjs          # preview
 *   node scripts/migrate-chapter-numbers.mjs --apply  # commit
 */

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: resolve(rootDir, '.env.local'), quiet: true })
dotenv.config({ path: resolve(rootDir, '.env'), quiet: true })

const uri = process.env.MONGODB_URI
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to .env.local before running this script.')
  process.exit(1)
}

const APPLY = process.argv.includes('--apply')

// Prose name -> number, per `<classLevel>:<Subject>`. Mirrors CHAPTER_NAMES in
// src/data/chapter-registry.ts, plus the older wordings actually found in the
// database ("Turning Effect of Forces" vs the book's "Turning Effects of
// Force", "Chapter 1 - ..." from the original seedQuestions.ts).
const NAME_TO_NUMBER = {
  '9:Physics': {
    'physical quantities and measurements': '1',
    'chapter 1 - physical quantities and measurement': '1',
    'kinematics': '2',
    'dynamics': '3',
    'turning effects of force': '4',
    'turning effect of forces': '4',
    'work, energy and power': '5',
    'work and energy': '5',
    'mechanical properties of matter': '6',
    'properties of matter': '6',
    'thermal properties of matter': '7',
    'magnetism': '8',
    'nature of science': '9',
  },
}

const client = new MongoClient(uri)

try {
  await client.connect()
  const questions = client.db().collection('questions')

  // Anything already numeric is done; select only the stragglers.
  const stale = await questions.find({ chapter: { $not: /^\d{1,2}$/ } }).toArray()
  console.log(`${stale.length} document(s) with a non-numeric chapter\n`)

  const unmapped = new Map()
  const plan = new Map()

  for (const doc of stale) {
    const key = `${doc.classLevel}:${doc.subject}`
    const number = NAME_TO_NUMBER[key]?.[String(doc.chapter).trim().toLowerCase()]
    if (!number) {
      const label = `${key} — "${doc.chapter}"`
      unmapped.set(label, (unmapped.get(label) ?? 0) + 1)
      continue
    }
    const label = `${key} — "${doc.chapter}" -> "${number}"`
    plan.set(label, (plan.get(label) ?? 0) + 1)
  }

  console.log('WILL REWRITE:')
  if (plan.size === 0) console.log('  (nothing)')
  for (const [label, n] of plan) console.log(`  ${n.toString().padStart(5)} x  ${label}`)

  if (unmapped.size > 0) {
    console.log('\nNO MAPPING — left untouched, add them to NAME_TO_NUMBER and re-run:')
    for (const [label, n] of unmapped) console.log(`  ${n.toString().padStart(5)} x  ${label}`)
  }

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to write these changes.')
    process.exit(0)
  }

  let updated = 0
  for (const doc of stale) {
    const key = `${doc.classLevel}:${doc.subject}`
    const number = NAME_TO_NUMBER[key]?.[String(doc.chapter).trim().toLowerCase()]
    if (!number) continue
    await questions.updateOne(
      { _id: doc._id },
      {
        // Preserve the original wording as the display name rather than
        // discarding it — only the match key changes.
        $set: { chapter: number, chapterName: doc.chapterName ?? doc.chapter, updatedAt: new Date() },
      },
    )
    updated++
  }

  console.log(`\nRewrote ${updated} document(s).`)
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await client.close()
}
