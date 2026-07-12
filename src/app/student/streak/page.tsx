import StreakCounter from '@/components/student/StreakCounter'
import { Flame } from 'lucide-react'

export default function StreakPage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-8 lg:p-12">
      <div className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <Flame className="h-5 w-5" />
          </span>
          <h1 className="text-lg font-bold text-slate-800">Streak</h1>
        </div>
        <StreakCounter />
      </div>
    </div>
  )
}
