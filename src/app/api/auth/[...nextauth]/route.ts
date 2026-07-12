import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { NextRequest } from 'next/server'

// --------- This explicit wrapper prevents the cookies().getAll crash ---------------------------------------------
// NextAuth v4 internally calls cookies() in a way that conflicts with
// Next.js 14 App Router's async cookie store unless wrapped like this.

const handler = NextAuth(authOptions)

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, context)
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handler(req, context)
}