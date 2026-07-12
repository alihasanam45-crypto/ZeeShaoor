'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ADMIN_NAV } from './nav'

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-800 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-6">
        <Image
          src="/logo.png"
          alt="ZeeShaoor.pk"
          width={36}
          height={36}
          priority
          className="rounded-xl shadow-lg shadow-indigo-500/25"
        />
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">ZeeShaoor.pk</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">God Mode Console</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_NAV.map((section) => (
          <div key={section.heading} className="mb-6">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {section.heading}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                        isActive
                          ? 'bg-indigo-500/15 font-medium text-indigo-300 shadow-[inset_0_0_0_1px_rgb(99_102_241/0.25)]'
                          : 'text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-slate-800 px-6 py-3">
        <p className="text-[10px] leading-relaxed text-slate-600">
          Awakening Intellect, Anchoring Truth
          <span className="mt-0.5 block font-mono text-slate-700">Neural Learning Matrix v7.0</span>
        </p>
      </div>
    </aside>
  )
}
