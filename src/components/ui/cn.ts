/**
 * Minimal class-name joiner.
 *
 * Deliberately dependency-free: `clsx` is only present in node_modules as a
 * transitive dependency, and building the design system on a package that
 * isn't in package.json would break on a clean install with different
 * resolution.
 *
 * Note this does NOT do tailwind-merge style conflict resolution. Component
 * APIs in this library therefore expose `variant` / `size` / `tone` props for
 * anything a caller might legitimately need to change, and treat `className`
 * as *additive* (layout, spacing, positioning) rather than as an override
 * channel. If you find yourself fighting a base style, add a variant.
 */
/* `bigint` and `true` are included because callers routinely write
   `someReactNode && 'class'`, and ReactNode widens to include both. They are
   filtered out at runtime rather than rejected at the type level, so a
   conditional class never becomes a compile error at the call site. */
export type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | null | undefined>

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []

  const walk = (value: ClassValue): void => {
    if (!value) return

    if (typeof value === 'string' || typeof value === 'number') {
      out.push(String(value))
      return
    }

    if (Array.isArray(value)) {
      for (const item of value) walk(item)
      return
    }

    // `true` and non-zero bigints survive the falsy guard above but carry no
    // class name — drop them here rather than rejecting them at the call site.
    if (typeof value !== 'object') return

    for (const key in value) {
      if (value[key]) out.push(key)
    }
  }

  for (const input of inputs) walk(input)

  return out.join(' ')
}
