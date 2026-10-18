import { redirect } from 'next/navigation'

// The Live School Pulse (feature C2) is the admin portal's entry dashboard at /admin.
// This route keeps the blueprint path alive without maintaining a second divergent copy.
export default function LivePulseRedirect() {
  redirect('/admin')
}
