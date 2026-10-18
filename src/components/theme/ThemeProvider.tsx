"use client";

/* ============================================================================
   ZeeShaoor.pk — PALETTE BRIDGE
   ----------------------------------------------------------------------------
   WHY THIS FILE CHANGED
   ---------------------
   This module used to own a second, parallel theme system: its own React
   state, its own `localStorage` key, its own palette objects. It had two
   problems:

     1. Its Provider was never actually mounted anywhere in the tree, so
        `usePalette()` always fell through to the DARK context default and
        `useGlobalTheme().toggleTheme` was a no-op stub. The theme button in
        the Paper Generator was wired to that stub — it did nothing.
     2. Even once mounted it would have fought `next-themes` in the root
        layout, giving the app two disagreeing sources of truth.

   WHAT IT DOES NOW
   ----------------
   `next-themes` is the single source of truth (system detection, persistence,
   no-flash boot script). This file is a thin bridge over it that keeps the
   exact same public API, so the ~216 `P.*` call sites in the Paper Generator
   and TopicSelectionModal keep working untouched:

       const { theme, toggleTheme } = useGlobalTheme();
       const P = usePalette();

   THE KEY TRICK
   -------------
   `usePalette()` no longer returns hex strings — it returns CSS `var()`
   references into the token layer defined in `globals.css`. Consumers write
   `style={{ background: P.bgPanel }}`, which becomes
   `background: var(--surface)` and is re-resolved by the browser the instant
   the `.dark` class flips. That buys three things at once:

     • Zero flash        — no JS round-trip between paint and correct colour.
     • Zero re-renders   — the object is frozen and referentially stable, so
                           `useCallback`/`useMemo` deps keyed on `P` (as in
                           the generator's `useParticles`) never invalidate.
     • Zero SSR mismatch — the same string renders on server and client.

   Adding a token? Add it to `globals.css` first, then map it here.
   ========================================================================= */

import React, { useCallback, useMemo } from "react";
import { useTheme } from "next-themes";

/* ---------------- Palette shape ----------------
   Every key that existed before is preserved. Values are `var()` handles into
   the token layer rather than literals. */

const PALETTE = Object.freeze({
  /* Canvas & surfaces */
  bg: "var(--bg)",
  bgPanel: "var(--surface)",
  bgElevated: "var(--surface-raised)",
  bgHover: "var(--surface-hover)",

  /* Borders */
  border: "var(--line)",
  borderStrong: "var(--line-strong)",
  borderActive: "var(--accent-ring)",

  /* Brand + neutrals */
  steel: "var(--fg-subtle)",
  blue: "var(--accent)",
  purple: "var(--chart-3)",
  gradient: "var(--accent-grad)",

  /* Text */
  text: "var(--fg)",
  textMuted: "var(--fg-muted)",
  textDim: "var(--fg-subtle)",

  /* Status */
  success: "var(--success)",
  danger: "var(--danger)",

  /* Glass & chrome */
  glassFaint: "var(--surface-inset)",
  glassCard: "var(--surface)",
  dock: "var(--glass)",
  scrim: "var(--scrim)",

  /* ---- Additive tokens (new; nothing depends on them yet) ---- */
  warning: "var(--warning)",
  info: "var(--info)",
  accentSoft: "var(--accent-soft)",
  accentText: "var(--accent-text)",
  surfaceInset: "var(--surface-inset)",
  surfaceOverlay: "var(--surface-overlay)",
  shadowCard: "var(--shadow-card)",
  shadowOverlay: "var(--shadow-overlay)",
  shadowAccent: "var(--shadow-accent)",
});

export type Palette = typeof PALETTE;
export type ThemeName = "dark" | "light";

/* `DARK` and `LIGHT` remain exported for API compatibility. They now point at
   the same token-backed object: the tokens themselves carry the per-theme
   values, so there is no longer a reason to branch in JS. */
export const DARK: Palette = PALETTE;
export const LIGHT: Palette = PALETTE;

/* ---------------- Hooks ---------------- */

/**
 * Theme-token accessor. Referentially stable across renders and themes.
 */
export function usePalette(): Palette {
  return PALETTE;
}

type ThemeState = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
};

/**
 * Read/'write the active theme. Backed by next-themes, so it shares state and
 * persistence with every other theme control in the app.
 *
 * `theme` is always the *resolved* value ("dark" | "light") — never "system" —
 * because callers use it to pick an icon or a literal colour.
 */
export function useGlobalTheme(): ThemeState {
  const { resolvedTheme, setTheme: setNextTheme } = useTheme();

  // Before hydration `resolvedTheme` is undefined. Dark matches this app's
  // historical default, so the first paint stays stable.
  const theme: ThemeName = resolvedTheme === "light" ? "light" : "dark";

  const setTheme = useCallback(
    (t: ThemeName) => setNextTheme(t),
    [setNextTheme],
  );

  const toggleTheme = useCallback(() => {
    setNextTheme(theme === "dark" ? "light" : "dark");
  }, [setNextTheme, theme]);

  return useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );
}

/* ---------------- Provider (compatibility shim) ----------------
   The real provider is `next-themes`, mounted once in the root layout. This
   export is kept so existing imports resolve; it renders children as-is.

   It deliberately does NOT reintroduce the old
   `<div className="flex h-screen w-full overflow-hidden">` wrapper — that
   element would have imposed a viewport-locked flex row on every descendant
   layout and broken the portal shells. */
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
