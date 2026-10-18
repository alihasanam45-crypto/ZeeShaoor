import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/options'
import { ROUTE_CONFIG } from '@/config/routes'
import { getAdminPulseMetrics } from '@/actions/admin-dashboard-actions'
import LiveSchoolPulse from '@/components/admin/LiveSchoolPulse'

export default async function AdminLivePulsePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  // Defense-in-depth behind the proxy: send a wrong-role visitor to their own
  // dashboard, never to '/' (which would bounce back through the root redirect).
  if (session.user.role !== 'admin') redirect(ROUTE_CONFIG.redirectAfterLogin[session.user.role])

  const { metrics, pendingApprovals } = await getAdminPulseMetrics()

  return <LiveSchoolPulse metrics={metrics} pendingApprovals={pendingApprovals} />
}
