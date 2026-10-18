'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * The app's single source of truth for theming.
 *
 * next-themes injects a blocking script that stamps the resolved theme class
 * onto <html> before first paint, so there is no flash of the wrong palette.
 *
 * - `attribute="class"`  drives the `.dark` variant defined in globals.css
 * - `defaultTheme="system"` + `enableSystem` honour the OS preference and keep
 *   following it live until the user makes an explicit choice
 * - `storageKey="zs-theme"` matches the key the previous bespoke provider
 *   used, so anyone who already picked a theme keeps it
 * - `disableTransitionOnChange={false}` keeps the deliberate ~220ms colour
 *   cross-fade defined in globals.css when toggling
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="zs-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  )
}
