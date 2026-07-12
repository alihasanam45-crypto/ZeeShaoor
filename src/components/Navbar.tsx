// ---------------------------------------------------------------------------------------------------------------------------------------------------
//  ZeeShaoor.Pk — Navbar Component
//  Kahan lagayein: src/components/Navbar.tsx
//  Phir page.tsx mein import karein:
//    import Navbar from '@/components/Navbar'
// ---------------------------------------------------------------------------------------------------------------------------------------------------

import Image from 'next/image'

export default function Navbar() {
  return (
    <>
      {/* ═══ NAVBAR ═══ */}
      <nav className="zs-navbar">

        {/* ------ Logo (Z hata ke image laga di) ------ */}
        <a href="/" className="zs-logo">
          <Image
            src="/logo.png"       
            alt="ZeeShaoor Logo"
            width={42}
            height={42}
            className="zs-logo-img"
            priority
          />
          <span className="zs-logo-name">
            ZeeShaoor<span className="zs-logo-Pk">.Pk</span>
          </span>
        </a>

        {/* ------ Nav Links with Icons ------ */}
        <ul className="zs-nav-links">

          <li>
            <a href="#how-it-works">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              How It Works
            </a>
          </li>

          <li>
            <a href="#features">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              Features
            </a>
          </li>

          <li>
            <a href="#classes">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
                <path d="M6 12v5c3.33 1.67 8.67 1.67 12 0v-5"/>
              </svg>
              Classes
            </a>
          </li>

          <li>
            <a href="#pricing">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                <path d="M12 8v4l3 3"/>
              </svg>
              Pricing
            </a>
          </li>

          <li>
            <a href="#contact">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Contact
            </a>
          </li>

        </ul>

        {/* ------ Buttons ------ */}
        <div className="zs-nav-right">
          <button className="zs-btn-login">Login</button>
          <button className="zs-btn-signup">Sign Up</button>
        </div>

      </nav>

      {/* ═══ ANNOUNCEMENT BAR ═══
           "— Now Live" hata diya — LIVE pill pehle se hai
      ═══════════════════════════════ */}
      <div className="zs-ann-wrap">
        <div className="zs-ann-badge">

          {/* Pulsing dot */}
          <div className="zs-live-dot-wrap">
            <div className="zs-live-dot-ring" />
            <div className="zs-live-dot" />
          </div>

          {/* LIVE pill */}
          <span className="zs-live-pill">Live</span>

          {/* Text — "Now Live" removed */}
          <span className="zs-ann-text">
            Pakistan&apos;s <em>#1 AI Educational Platform</em>
          </span>

          <span className="zs-ann-arrow">→</span>

        </div>
      </div>
    </>
  )
}
