import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { MongoClient } = await import('mongodb')
    
    const uri = process.env.MONGODB_URI!
    
    // Direct connection — no mongoose, no SRV
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      directConnection: false,
    })
    
    await client.connect()
    
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('Admin123!', 10)
    
    const db = client.db('zeeshaoor')
    await db.collection('users').deleteMany({ role: 'admin' })
    await db.collection('users').insertOne({
      name: 'ZeeShaoor Admin',
      email: 'admin@zeeshaoor.pk',
      password: hash,
      role: 'admin',
      ghostMode: false,
      createdAt: new Date()
    })
    
    await client.close()
    
    return NextResponse.json({ 
      success: true, 
      email: 'admin@zeeshaoor.pk',
      password: 'Admin123!'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}