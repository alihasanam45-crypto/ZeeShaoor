// Single source of truth for ALL protected routes
export const ROUTE_CONFIG = {
  // Public — no auth needed
  public: [
    '/',
    '/login',
    '/register',
    '/register/admin',
    '/api/auth',
    '/api/v1/auth',
    // Self-registration APIs (institution + /student). Prefix match also
    // covers /api/register/student. Note /api/auth/register is admin-only —
    // enforced inside the handler, since /api/auth must stay whitelisted
    // for next-auth.
    '/api/register',
  ],

  // Role → allowed path prefixes
  admin:   ['/admin'],
  teacher: ['/teacher'],
  student: ['/student'],

  // Where to redirect after login per role
  redirectAfterLogin: {
    admin:   '/admin',
    teacher: '/teacher',
    student: '/student/dashboard',
  } as const,

  // Where anyone goes if unauthorized
  unauthorized: '/login',
} as const