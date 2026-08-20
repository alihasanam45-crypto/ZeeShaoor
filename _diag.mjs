import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
dotenv.config({ path: 'D:/ZeeShaoor.Pk/zeeshaoor-pk/.env.local', quiet: true })

const client = new MongoClient(process.env.MONGODB_URI)
await client.connect()
const db = client.db()
console.log('DB NAME:', db.databaseName)

const colls = await db.listCollections().toArray()
console.log('COLLECTIONS:', colls.map(c => `${c.name}`).join(', ') || '(none)')

for (const c of colls) {
  const n = await db.collection(c.name).countDocuments()
  console.log(`  ${c.name}: ${n}`)
}

const q = db.collection('questions')
const total = await q.countDocuments()
console.log('\n=== questions total:', total, '===')

if (total > 0) {
  console.log('\nDISTINCT classLevel:', JSON.stringify(await q.distinct('classLevel')))
  console.log('DISTINCT subject   :', JSON.stringify(await q.distinct('subject')))
  console.log('DISTINCT qType     :', JSON.stringify(await q.distinct('questionType')))
  console.log('DISTINCT difficulty:', JSON.stringify(await q.distinct('difficulty')))
  console.log('DISTINCT chapter   :', JSON.stringify((await q.distinct('chapter')).slice(0, 40)))

  const combo = await q.aggregate([
    { $group: { _id: { c: '$classLevel', s: '$subject', t: '$questionType' }, n: { $sum: 1 } } },
    { $sort: { '_id.c': 1, '_id.s': 1, '_id.t': 1 } },
  ]).toArray()
  console.log('\nCOMBINATIONS (class / subject / type -> count):')
  combo.forEach(r => console.log(`  ${r._id.c} / ${r._id.s} / ${r._id.t} -> ${r.n}`))

  console.log('\nSAMPLE DOC:')
  console.log(JSON.stringify(await q.findOne({}), null, 2).slice(0, 1400))

  console.log('\nINDEXES:', JSON.stringify((await q.indexes()).map(i => i.name)))
}
await client.close()
