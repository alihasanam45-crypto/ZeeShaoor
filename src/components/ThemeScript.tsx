/**
 * Runs before first paint so the theme attribute is on <html> before
 * anything renders. Server component — no 'use client'.
 *
 * DEFAULT IS LIGHT. A missing or unreadable localStorage value can never
 * push the public site into dark mode.
 *
 * CSP: this is a static string with no interpolation. If you run a strict
 * CSP, pass a nonce down from middleware and add nonce={nonce} below.
 */
const THEME_INIT = `(function(){try{
var s=localStorage.getItem('zeeshaoor-theme');
document.documentElement.dataset.theme=(s==='dark')?'dark':'light';
}catch(e){document.documentElement.dataset.theme='light';}})();`

export function ThemeScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
}