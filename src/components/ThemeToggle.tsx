'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

type Variant = 'icon' | 'segmented'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

/**
 * Theme control, in two shapes:
 *
 * - `icon` (default) — a single button for app headers. Flips between light and
 *   dark, and shows a dot when the app is still following the OS preference.
 * - `segmented` — an explicit Light / Dark / System picker for settings panes,
 *   where "System" needs to be a first-class, discoverable choice.
 *
 * Theme state is read from next-themes, so every instance stays in sync and
 * persists via the shared `zs-theme` key.
 */
/* Hydration gate. The server cannot know the OS colour preference, so the
   control renders a same-sized placeholder until the client takes over.
   `useSyncExternalStore` expresses this directly — server snapshot false,
   client snapshot true — with no post-mount setState or cascading render. */
const noopSubscribe = () => () => {}

export default function ThemeToggle({ variant = 'icon' }: { variant?: Variant }) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )

  if (!mounted) {
    return variant === 'segmented' ? (
      <div className="h-9 w-[13.5rem]" aria-hidden />
    ) : (
      <div className="h-9 w-9" aria-hidden />
    )
  }

  if (variant === 'segmented') {
    return (
      <div
        role="radiogroup"
        aria-label="Colour theme"
        className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface-inset p-1"
      >
        {OPTIONS.map(({ value, label, Icon }) => {
          const active = theme === value
          return (
            <button
              key={value}
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'bg-surface text-fg shadow-xs'
                  : 'text-fg-subtle hover:text-fg'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          )
        })}
      </div>
    )
  }

  const isDark = resolvedTheme === 'dark'
  const followingSystem = theme === 'system'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme${
        followingSystem ? ' (currently following system)' : ''
      }`}
      title={followingSystem ? 'Following system theme' : `${isDark ? 'Dark' : 'Light'} theme`}
      className="relative flex h-9 w-9 items-center justify-center rounded-xl text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg"
    >
      {/* Both icons stay mounted and cross-fade, so the swap reads as one
          continuous motion rather than a pop. */}
      <Sun
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
        aria-hidden
      />
      <Moon
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${
          isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
        aria-hidden
      />
      {followingSystem && (
        <span
          className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden
        />
      )}
    </button>
  )
}
