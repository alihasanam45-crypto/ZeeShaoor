import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb'
import UserModel from '@/models/User'
import bcrypt from 'bcryptjs'
import type { ZeeTokenPayload } from '@/types/auth'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  // --------- THIS BLOCK IS THE FIX ------------------------------------------------------------------------------------------------------------------------------------------------
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.callback-url'
        : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Host-next-auth.csrf-token'
        : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path:     '/',
        secure:   process.env.NODE_ENV === 'production',
      },
    },
  },
  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('EMAIL_PASSWORD_REQUIRED')
        }
        await connectDB()
        const user = await UserModel.findOne({
          email: credentials.email.toLowerCase().trim(),
        }).select('+password')

        if (!user)                                   throw new Error('USER_NOT_FOUND')
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid)                                  throw new Error('INVALID_PASSWORD')

        // Account status gate — self-registered institution owners stay
        // 'pending' until a platform admin approves them (see
        // src/lib/auth/registration.ts). Checked only after a valid
        // password so status is never leaked to guessers.
        if (user.status === 'pending')               throw new Error('ACCOUNT_PENDING')
        if (user.status === 'suspended')             throw new Error('ACCOUNT_SUSPENDED')

        // Fire-and-forget — login must not fail on a metrics write.
        UserModel.updateOne({ _id: user._id }, { lastLoginAt: new Date() }).catch(() => {})

        if (user.role === 'admin') {
          return { id: user._id.toString(), role: 'admin', superAccess: true,  email: user.email, name: user.name }
        }
        if (user.role === 'teacher') {
          return { id: user._id.toString(), role: 'teacher', superAccess: false, email: user.email, name: user.name, permissions: user.permissions ?? [] }
        }
        if (user.role === 'student') {
          return { id: user._id.toString(), role: 'student', superAccess: false, email: user.email, name: user.name, classId: user.classId, boardId: user.boardId, enrolledSubjects: user.enrolledSubjects ?? [] }
        }
        throw new Error('INVALID_ROLE')
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) Object.assign(token, user)
      return token
    },
    async session({ session, token }) {
      session.user = token as unknown as ZeeTokenPayload
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}