import { redirect } from 'next/navigation'

// /student and /student/dashboard used to be two divergent copies of the same
// dashboard. The dashboard now lives in one place — /student/dashboard.
export default function StudentIndex() {
  redirect('/student/dashboard')
}
