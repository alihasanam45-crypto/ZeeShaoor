import { NextResponse } from 'next/server'
import { registerInstitutionWithOwner, asTrimmedString } from '@/lib/auth/registration'

/**
 * POST /api/register — institution self-registration (multipart).
 *
 * Thin adapter for API clients over the same core the /register form's server
 * action uses (src/lib/auth/registration.ts) — one code path, one rule set.
 * Public via ROUTE_CONFIG.public; the created owner is 'pending' and cannot
 * log in until approved, so this grants no access by itself.
 */

/** Placeholder vault path until the Phase-3 upload pipeline (S3/Cloudinary) lands. */
function vaultPath(kind: 'logos' | 'headers', file: unknown): string {
  if (!(file instanceof File) || file.size === 0) return ''
  return `/vault/${kind}/${Date.now()}_${file.name}`
}

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { message: 'Expected multipart/form-data body.' },
      { status: 400 },
    )
  }

  try {
    const result = await registerInstitutionWithOwner({
      ownerName: asTrimmedString(formData.get('ownerName'), 80),
      institutionName: asTrimmedString(formData.get('institutionName'), 120),
      branchAddress: asTrimmedString(formData.get('branchAddress'), 200),
      phone: asTrimmedString(formData.get('phone'), 20),
      email: asTrimmedString(formData.get('email'), 254),
      password:
        typeof formData.get('password') === 'string' ? (formData.get('password') as string) : '',
      masterPassword:
        typeof formData.get('masterPassword') === 'string'
          ? (formData.get('masterPassword') as string)
          : undefined,
      subscriptionPlan: asTrimmedString(formData.get('subscriptionPlan'), 20),
      logoPath: vaultPath('logos', formData.get('logo')),
      headerPath: vaultPath('headers', formData.get('header')),
      fingerprintSeed: {
        userAgent: req.headers.get('user-agent') ?? 'unknown-device',
        ip: req.headers.get('x-forwarded-for') ?? 'local-node',
      },
    })

    if (!result.ok) {
      return NextResponse.json(
        { message: result.error, fieldErrors: result.fieldErrors },
        { status: result.status },
      )
    }

    return NextResponse.json(
      {
        message: 'Registration received. Awaiting admin verification.',
        status: 'pending',
        schoolId: result.schoolId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[api/register] failed:', error)
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 })
  }
}
