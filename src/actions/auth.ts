'use server'

import { headers } from 'next/headers'
import {
  registerInstitutionWithOwner,
  asTrimmedString,
  type InstitutionFieldErrors,
} from '@/lib/auth/registration'

/**
 * Auth action layer — server functions the auth forms call directly.
 *
 * Every export of a 'use server' file is a public POST endpoint, so this file
 * exposes ONLY the intentional public surface (registration). All validation,
 * hashing and persistence live in src/lib/auth/registration.ts.
 *
 * Why there is no login action: next-auth v4 sessions can only be minted by
 * its CSRF-protected /api/auth/callback/credentials endpoint, which the
 * client-side signIn('credentials') helper drives. The login page
 * (src/app/(auth)/login/page.tsx) already does this; a server action cannot
 * set that cookie and must not try.
 */

export interface AuthFormState {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: InstitutionFieldErrors
}

/**
 * /register form action (useActionState signature).
 * Creates a pending Institution + its pending owner admin — no access is
 * granted until a platform admin approves both records.
 */
export async function registerInstitution(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const headerStore = await headers()

  try {
    const result = await registerInstitutionWithOwner({
      ownerName: asTrimmedString(formData.get('ownerName'), 80),
      institutionName: asTrimmedString(formData.get('institutionName'), 120),
      branchAddress: asTrimmedString(formData.get('branchAddress'), 200),
      phone: asTrimmedString(formData.get('phone'), 20),
      email: asTrimmedString(formData.get('email'), 254),
      password: typeof formData.get('password') === 'string' ? (formData.get('password') as string) : '',
      confirmPassword:
        typeof formData.get('confirmPassword') === 'string'
          ? (formData.get('confirmPassword') as string)
          : undefined,
      fingerprintSeed: {
        userAgent: headerStore.get('user-agent') ?? 'unknown-device',
        ip: headerStore.get('x-forwarded-for') ?? 'local-node',
      },
    })

    if (!result.ok) {
      return { status: 'error', message: result.error, fieldErrors: result.fieldErrors }
    }

    return {
      status: 'success',
      message: 'Registration received! Your institution is awaiting admin verification — you can sign in once approved.',
    }
  } catch (err) {
    console.error('[registerInstitution] failed:', err)
    return {
      status: 'error',
      message: 'Something went wrong on our side. Please try again in a moment.',
    }
  }
}
