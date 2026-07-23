"use client";

/* ============================================================================
   ZeeShaoor.pk — GLOBAL THEME PROVIDER (Task 2)
   Paste at: src/components/theme/ThemeProvider.tsx

   Elevates the Day/Night theme to the layout level so the ENTIRE portal
   (TeacherSidebar + main content) switches between Executive Dark and
   Premium Frosted Light together. Persists choice in localStorage ("zs-theme").

   Consumers:
     const { theme, toggleTheme } = useGlobalTheme();
     const P = usePalette();            // full palette object
   CSS variables are also exposed (--zs-bg, --zs-panel, …) so components like
   TeacherSidebar can theme themselves with plain CSS if preferred.
   ========================================================================= */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ---------------- Palettes ---------------- */

export const DARK = {
  bg: "#0a0a14",
  bgPanel: "#0f0f1c",
  bgElevated: "#16162a",
  bgHover: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  borderActive: "rgba(129,140,248,0.55)",
  steel: "#94A3B8",
  blue: "#818CF8",
  purple: "#C084FC",
  gradient: "linear-gradient(135deg, #6366F1, #A855F7)",
  text: "#E2E8F0",
  textMuted: "#CBD5E1",
  textDim: "rgba(226,232,240,0.55)",
  success: "#34D399",
  danger: "#FB7185",
  glassFaint: "rgba(255,255,255,0.02)",
  glassCard: "rgba(255,255,255,0.04)",
  dock: "rgba(15,15,28,0.72)",
  scrim: "rgba(6,6,12,0.7)",
};

export const LIGHT = {
  /* Premium Frosted Silver */
  bg: "#E8EBF2",
  bgPanel: "#F4F6FA",
  bgElevated: "#FFFFFF",
  bgHover: "rgba(15,23,42,0.05)",
  border: "rgba(15,23,42,0.10)",
  borderStrong: "rgba(15,23,42,0.18)",
  borderActive: "rgba(99,102,241,0.55)",
  steel: "#64748B",
  blue: "#6366F1",
  purple: "#A855F7",
  gradient: "linear-gradient(135deg, #6366F1, #A855F7)",
  text: "#0F172A",
  textMuted: "#334155",
  textDim: "rgba(15,23,42,0.55)",
  success: "#059669",
  danger: "#E11D48",
  glassFaint: "rgba(255,255,255,0.55)",
  glassCard: "rgba(255,255,255,0.7)",
  dock: "rgba(255,255,255,0.72)",
  scrim: "rgba(100,116,139,0.4)",
};

export type Palette = typeof DARK;
export type ThemeName = "dark" | "light";

/* ---------------- Contexts ---------------- */

type ThemeState = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
};

const ThemeStateCtx = createContext<ThemeState>({
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
});

const PaletteCtx = createContext<Palette>(DARK);

export function useGlobalTheme(): ThemeState {
  return useContext(ThemeStateCtx);
}

export function usePalette(): Palette {
  return useContext(PaletteCtx);
}

/* ---------------- Provider ---------------- */

const STORAGE_KEY = "zs-theme";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("dark");

  /* Hydrate persisted choice on the client (avoids SSR mismatch). */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") setThemeState(saved);
    } catch { /* private mode etc. */ }
  }, []);

  const setTheme = useCallback((t: ThemeName) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  const P = theme === "dark" ? DARK : LIGHT;

  const state = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return (
    <ThemeStateCtx.Provider value={state}>
      <PaletteCtx.Provider value={P}>
        <div
          className="flex h-screen w-full overflow-hidden"
          data-theme={theme}
          style={{
            background: P.bg,
            color: P.text,
            transition: "background 0.35s ease, color 0.35s ease",
            ["--zs-bg" as any]: P.bg,
            ["--zs-panel" as any]: P.bgPanel,
            ["--zs-elevated" as any]: P.bgElevated,
            ["--zs-border" as any]: P.border,
            ["--zs-text" as any]: P.text,
            ["--zs-text-dim" as any]: P.textDim,
            ["--zs-accent" as any]: P.blue,
          }}
        >
          {children}
        </div>
      </PaletteCtx.Provider>
    </ThemeStateCtx.Provider>
  );
}
