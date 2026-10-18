import StudentShell from '@/components/student/StudentShell'
import { requirePortal } from '@/lib/security/page-guard'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  // Second, independent gate behind the proxy — see requirePortal().
  // Mirrors the proxy's portal ownership exactly: one role, one portal.
  await requirePortal('student')

  return <StudentShell>{children}</StudentShell>
}
