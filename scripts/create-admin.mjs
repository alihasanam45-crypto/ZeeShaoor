import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'

const uri = 'mongodb+srv://ZeeShaoor_Pk:0786A5m4@cluster0.bqsiile.mongodb.net/zeeshaoor?retryWrites=true&w=majority'

const hash = await bcrypt.hash('Admin123!', 12)

const client = new MongoClient(uri)
await client.connect()

await client.db('zeeshaoor').collection('users').deleteMany({ role: 'admin' })

await client.db('zeeshaoor').collection('users').insertOne({
  name: 'ZeeShaoor Admin',
  email: 'admin@zeeshaoor.pk',
  password: hash,
  role: 'admin',
  ghostMode: false,
  createdAt: new Date()
})

console.log('✅ Admin Created! Login with:')
console.log('Email: admin@zeeshaoor.pk')
console.log('Password: Admin123!')

await client.close()