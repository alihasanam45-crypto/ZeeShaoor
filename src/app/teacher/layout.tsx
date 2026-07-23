import type { ReactNode } from 'react'
import TeacherSidebar from '@/components/teacher/Sidebar'

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0a0a14]">
      <TeacherSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
