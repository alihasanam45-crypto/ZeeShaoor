"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

// ═══════════════════════════════════════════════════════════
// ELITE TYPES & ROLE MATRIX
// ═══════════════════════════════════════════════════════════
export type UserRole = "admin" | "teacher" | "student" | "parent";

interface SubItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

interface NavItem {
  id: string;
  label: string;
  svgPath: string;
  badge?: string;
  badgeColor?: string;
  href: string;
  tooltip: string;
  pulse?: boolean;
  roles: UserRole[]; // THE GATEKEEPER: Array of allowed roles
  subItems?: SubItem[];
}

interface NavSection {
  section: string;
  sectionColor: string;
  items: NavItem[];
}

// ═══════════════════════════════════════════════════════════
// SECURE NAV CONFIG 
// ═══════════════════════════════════════════════════════════
const NAV: NavSection[] = [
  {
    section: "CORE SYSTEMS",
    sectionColor: "#f0abfc",
    items: [
      {
        id: "admin",
        label: "Admin Dashboard",
        svgPath: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
        badge: "PRO",
        badgeColor: "#a855f7",
        href: "/app/admin",
        tooltip: "Platform control center",
        roles: ["admin"], // ONLY ADMIN
        subItems: [
          { id: "adm-users", label: "Manage Users", href: "/app/admin/users", icon: "◈" },
          { id: "adm-analytics", label: "Analytics", href: "/app/admin/analytics", icon: "◉" },
          { id: "adm-settings", label: "Settings", href: "/app/admin/settings", icon: "✦" },
        ],
      },
      {
        id: "generator",
        label: "Automated Paper Generator",
        svgPath: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4",
        badge: "MAIN",
        badgeColor: "#00d4ff",
        href: "/app/generator",
        tooltip: "AI exam paper generator",
        pulse: true,
        roles: ["admin", "teacher"], // ADMIN & TEACHER
        subItems: [
          { id: "gen-new", label: "New Paper", href: "/app/generator/new", icon: "✦" },
          { id: "gen-history", label: "Paper History", href: "/app/generator/history", icon: "◈" },
          { id: "gen-templates", label: "Templates", href: "/app/generator/templates", icon: "◉" },
          { id: "gen-schedule", label: "Schedule", href: "/app/generator/schedule", icon: "⊙" },
        ],
      },
      {
        id: "student",
        label: "Student Portal",
        svgPath: "M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5",
        href: "/student",
        tooltip: "Student learning hub",
        roles: ["admin", "student"], 
        subItems: [
          { id: "stu-results", label: "My Results", href: "/student/results", icon: "◈" },
          { id: "stu-papers", label: "Practice Papers", href: "/student/papers", icon: "◉" },
          { id: "stu-progress", label: "Progress Map", href: "/student/progress", icon: "✦" },
        ],
      },
      {
        id: "guardian",
        label: "Guardian Portal",
        svgPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        href: "/app/parent",
        tooltip: "Monitor child's progress",
        roles: ["admin", "parent"],
        subItems: [
          { id: "par-overview", label: "Overview", href: "/app/parent/overview", icon: "◈" },
          { id: "par-reports", label: "Reports", href: "/app/parent/reports", icon: "◉" },
        ],
      },
    ],
  },
  {
    section: "NEURAL AI ENGINES",
    sectionColor: "#22d3ee",
    items: [
      {
        id: "ai-board",
        label: "Zee AI Board",
        svgPath: "M2 3h20v14H2zM8 21h8M12 17v4M6 8h.01M10 8h4M18 8h.01M6 12h12",
        badge: "AI",
        badgeColor: "#22d3ee",
        href: "/app/ai/board",
        tooltip: "Intelligent whiteboard",
        pulse: true,
        roles: ["admin", "teacher", "student"], 
        subItems: [
          { id: "board-new", label: "New Session", href: "/app/ai/board/new", icon: "✦" },
          { id: "board-saved", label: "Saved Boards", href: "/app/ai/board/saved", icon: "◈" },
        ],
      },
      {
        id: "math-solver",
        label: "Zee Math Solver",
        svgPath: "M4 4h16v16H4zM8 4v16M4 8h8M4 12h16M4 16h16",
        badge: "AI",
        badgeColor: "#22d3ee",
        href: "/app/ai/math",
        tooltip: "Step-by-step math AI",
        roles: ["admin", "student", "teacher"],
        subItems: [
          { id: "math-solve", label: "Solve Problem", href: "/app/ai/math/solve", icon: "✦" },
          { id: "math-history", label: "Solution History", href: "/app/ai/math/history", icon: "◈" },
        ],
      },
      {
        id: "analytics",
        label: "AI Board Analytics",
        svgPath: "M22 12h-4l-3 9L9 3l-3 9H2",
        badge: "AI",
        badgeColor: "#22d3ee",
        href: "/app/ai/analytics",
        tooltip: "Performance deep analytics",
        roles: ["admin", "teacher"], 
        subItems: [
          { id: "ana-class", label: "Class Analytics", href: "/app/ai/analytics/class", icon: "◈" },
          { id: "ana-subject", label: "Subject Insights", href: "/app/ai/analytics/subject", icon: "◉" },
        ],
      },
      {
        id: "paper-checker",
        label: "Zee Paper Checker",
        svgPath: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 12m-3 0a3 3 0 1 0 6 0 3 3 0 0 0-6 0",
        badge: "AI",
        badgeColor: "#22d3ee",
        href: "/app/ai/checker",
        tooltip: "Automated answer evaluation",
        roles: ["admin", "teacher"],
        subItems: [
          { id: "chk-upload", label: "Upload Paper", href: "/app/ai/checker/upload", icon: "✦" },
          { id: "chk-results", label: "Check Results", href: "/app/ai/checker/results", icon: "◈" },
        ],
      },
      {
        id: "tracker",
        label: "Smart Progress Tracker",
        svgPath: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
        badge: "AI",
        badgeColor: "#22d3ee",
        href: "/app/ai/tracker",
        tooltip: "Adaptive learning tracker",
        roles: ["admin", "student", "parent"],
        subItems: [
          { id: "trk-goals", label: "Set Goals", href: "/app/ai/tracker/goals", icon: "✦" },
          { id: "trk-milestones", label: "Milestones", href: "/app/ai/tracker/milestones", icon: "◈" },
        ],
      },
    ],
  },
  {
    section: "RESOURCES & SUPPORT",
    sectionColor: "#f0abfc",
    items: [
      {
        id: "library",
        label: "Resource Library",
        svgPath: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
        href: "/app/resources",
        tooltip: "Study materials & past papers",
        roles: ["admin", "teacher", "student"],
        subItems: [
          { id: "res-past", label: "Past Papers", href: "/app/resources/past-papers", icon: "◈" },
          { id: "res-notes", label: "Notes", href: "/app/resources/notes", icon: "◉" },
          { id: "res-videos", label: "Video Lectures", href: "/app/resources/videos", icon: "✦" },
        ],
      },
      {
        id: "support",
        label: "Live Support",
        svgPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
        href: "/app/support",
        tooltip: "24/7 AI + human support",
        pulse: true,
        roles: ["admin", "teacher", "student", "parent"], // Accessible to all
        subItems: [
          { id: "sup-chat", label: "Live Chat", href: "/app/support/chat", icon: "✦" },
          { id: "sup-ticket", label: "Raise Ticket", href: "/app/support/ticket", icon: "◈" },
        ],
      },
    ],
  },
];

function NavIcon({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function ZeeSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // ELITE FIX: Dynamic Role Simulation
  // Change this to "teacher", "student", "parent", or "admin" to test dynamic routing.
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("student");

  const [collapsed, setCollapsed] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // SECURE FILTER: Only keep sections and items allowed for the current role
  const filteredNav = NAV.map(section => ({
    ...section,
    items: section.items.filter(item => item.roles.includes(currentUserRole))
  })).filter(section => section.items.length > 0);

  useEffect(() => {
    for (const section of filteredNav) {
      for (const item of section.items) {
        if (pathname === item.href || pathname?.startsWith(item.href + "/")) {
          setExpandedId(item.id);
          return;
        }
      }
    }
  }, [pathname, filteredNav]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const handleNav = (href: string, label: string) => {
    router.push(href);
    showToast(`Initializing ${label}…`);
  };

  const isItemActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  // ANTI-BYPASS: Ensure search only finds authorized items
  const authorizedItems = filteredNav.flatMap((s) => s.items);
  const searchResults = searchQuery.trim()
    ? authorizedItems.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // 🔴 CRITICAL FIX: The return null must be placed AFTER all hooks (useState, useEffect) 🔴
  // ELITE FIX: SIDEBAR STEALTH MODE (Hides on Login and Registration pages)
  if (pathname === '/' || pathname === '/register') return null;

  return (
    <>
      <style>{CSS}</style>

      {toast && <div className="zs-toast">{toast}</div>}

      <aside className={`zs-root${collapsed ? " zs-collapsed" : ""}`}>
        
        {/* BRAND IDENTITY ROW */}
        <div className="zs-logo-row">
          {!collapsed && (
            <div style={{display: 'flex', flexDirection: 'column'}}>
               <span className="zs-logo">
                 ⚔️ Zee<span className="zs-logo-grad">Shaoor</span>.pk
               </span>
            </div>
          )}
          <button className="zs-icon-btn zs-collapse-btn" onClick={() => setCollapsed((c) => !c)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>

        {/* SECURE SEARCH */}
        <div className="zs-search-wrap" style={{ position: "relative" }}>
          {!collapsed ? (
            <div className={`zs-search-box${searchFocused ? " focused" : ""}`}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchRef}
                className="zs-search-input"
                placeholder="Search matrix…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => { setSearchFocused(false); setSearchQuery(""); }, 160)}
              />
              {searchQuery && (
                <button className="zs-clear-btn" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>
          ) : (
            <button className="zs-icon-btn" style={{ margin: "0 auto", display: "flex" }} onClick={() => setCollapsed(false)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          )}

          {searchFocused && searchResults.length > 0 && (
            <div className="zs-search-dropdown">
              {searchResults.map((item) => (
                <button key={item.id} className="zs-search-result" onMouseDown={() => handleNav(item.href, item.label)}>
                  <NavIcon path={item.svgPath} size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DYNAMIC NAV RENDERING */}
        <nav className="zs-nav">
          {filteredNav.map((section) => (
            <div key={section.section} className="zs-section">
              {!collapsed && (
                <p className="zs-section-label" style={{ color: section.sectionColor }}>
                  {section.section}
                </p>
              )}
              {collapsed && <div className="zs-divider" />}

              {section.items.map((item) => {
                const active = isItemActive(item.href);
                const expanded = expandedId === item.id && !collapsed;

                return (
                  <div key={item.id} className="zs-item-wrap">
                    <button
                      className={`zs-nav-btn${active ? " zs-active" : ""}${item.pulse ? " zs-pulse" : ""}`}
                      onClick={() => {
                        if (item.subItems && !collapsed) {
                          setExpandedId((prev) => (prev === item.id ? null : item.id));
                        } else {
                          handleNav(item.href, item.label);
                        }
                      }}
                      onMouseEnter={() => setHoveredId(item.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      {active && <span className="zs-active-bar" />}
                      <span className="zs-icon"><NavIcon path={item.svgPath} /></span>

                      {!collapsed && (
                        <>
                          <span className="zs-label">{item.label}</span>
                          <span className="zs-right">
                            {item.badge && (
                              <span className="zs-badge" style={{ color: item.badgeColor, borderColor: item.badgeColor + "55" }}>
                                {item.badge}
                              </span>
                            )}
                            {item.subItems && (
                              <span className={`zs-chevron${expanded ? " open" : ""}`}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </span>
                            )}
                          </span>
                        </>
                      )}
                      {collapsed && item.badge && <span className="zs-dot" style={{ background: item.badgeColor }} />}
                    </button>

                    {collapsed && hoveredId === item.id && (
                      <div className="zs-tooltip">
                        <strong>{item.label}</strong>
                        <span>{item.tooltip}</span>
                      </div>
                    )}

                    {expanded && item.subItems && (
                      <div className="zs-sub-list">
                        {item.subItems.map((sub) => (
                          <button key={sub.id} className={`zs-sub-btn${pathname === sub.href ? " zs-sub-active" : ""}`} onClick={() => handleNav(sub.href, sub.label)}>
                            <span className="zs-sub-icon">{sub.icon}</span>
                            <span>{sub.label}</span>
                            {pathname === sub.href && <span className="zs-sub-dot" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* SECURE USER FOOTER */}
        <div className="zs-user">
          <div className="zs-avatar">
            <span>AH</span>
            <span className="zs-online" />
          </div>
          {!collapsed && (
            <>
              <div className="zs-user-info">
                <p className="zs-user-name">ALI HASAN</p>
                <p className="zs-user-role" style={{textTransform: 'uppercase'}}>{currentUserRole}</p>
              </div>
              <button className="zs-icon-btn" style={{ marginLeft: "auto" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// CSS ENGINE
// ═══════════════════════════════════════════════════════════
const CSS = `
:root {
  --zs-w: 280px;
  --zs-cw: 70px;
  --zs-bg: #030305;
  --zs-surface: #0a0a0f;
  --zs-surface2: #11111a;
  --zs-border: rgba(0,240,255,0.1);
  --zs-cyan: #00f0ff;
  --zs-purple: #ff00ea;
  --zs-text: #ffffff;
  --muted: #888888;
  --zs-hover: rgba(0,240,255,0.05);
  --zs-active-bg: rgba(0,240,255,0.1);
  --zs-tr: 0.3s cubic-bezier(.4,0,.2,1);
}

.zs-root { position: fixed; left:0; top:0; bottom:0; width: var(--zs-w); background: var(--zs-bg); border-right: 1px solid var(--zs-border); display: flex; flex-direction: column; z-index: 200; transition: width var(--zs-tr); overflow: hidden; font-family: 'Inter', sans-serif; box-shadow: 5px 0 30px rgba(0,0,0,0.8); }
.zs-root.zs-collapsed { width: var(--zs-cw); }
.zs-logo-row { display: flex; align-items: center; justify-content: space-between; padding: 20px; border-bottom: 1px solid var(--zs-border); min-height: 70px; flex-shrink: 0; }
.zs-collapsed .zs-logo-row { justify-content: center; }
.zs-logo { font-size: 20px; font-weight: 900; color: var(--zs-text); letter-spacing: 1px; white-space: nowrap; }
.zs-logo-grad { background: linear-gradient(120deg, var(--zs-cyan), var(--zs-purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.zs-icon-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: var(--zs-surface2); border: 1px solid var(--zs-border); border-radius: 8px; color: var(--muted); cursor: pointer; flex-shrink: 0; transition: all var(--zs-tr); }
.zs-icon-btn:hover { color: var(--zs-cyan); border-color: rgba(0,240,255,0.3); box-shadow: 0 0 10px rgba(0,240,255,0.1); }
.zs-search-wrap { padding: 15px; flex-shrink: 0; }
.zs-search-box { display: flex; align-items: center; gap: 10px; background: var(--zs-surface2); border: 1px solid #222; border-radius: 8px; padding: 10px 15px; transition: all var(--zs-tr); }
.zs-search-box.focused { border-color: var(--zs-cyan); box-shadow: 0 0 15px rgba(0,240,255,0.1); }
.zs-search-input { flex:1; background:none; border:none; outline:none; color: var(--zs-text); font-size: 13px; }
.zs-search-input::placeholder { color: #555; }
.zs-clear-btn { background:none; border:none; color:var(--muted); cursor:pointer; font-size:12px; }
.zs-search-dropdown { position: absolute; top: 100%; left:15px; right:15px; background: var(--zs-surface); border: 1px solid var(--zs-cyan); border-radius: 8px; z-index: 400; box-shadow: 0 20px 50px rgba(0,0,0,0.9); overflow: hidden; }
.zs-search-result { width:100%; display:flex; align-items:center; gap:10px; padding: 12px; background:none; border:none; border-bottom: 1px solid #111; color: var(--zs-text); font-size:13px; cursor:pointer; text-align:left; transition: background var(--zs-tr); }
.zs-search-result:hover { background: var(--zs-active-bg); color: var(--zs-cyan); }
.zs-nav { flex:1; overflow-y:auto; overflow-x:hidden; padding: 10px 0; }
.zs-nav::-webkit-scrollbar { width:4px; }
.zs-nav::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.2); border-radius:4px; }
.zs-section { margin-bottom: 10px; }
.zs-divider { height:1px; background:var(--zs-border); margin:10px; }
.zs-section-label { font-size: 10px; font-weight:900; letter-spacing:2px; padding: 15px 20px 8px; text-transform:uppercase; opacity:0.7; }
.zs-item-wrap { position:relative; }
.zs-nav-btn { width:calc(100% - 20px); margin: 0 10px; display:flex; align-items:center; gap:12px; padding: 0 15px; height:45px; background:none; border: 1px solid transparent; border-radius: 8px; color:var(--muted); cursor:pointer; position:relative; font-size: 13px; font-weight:700; text-transform: uppercase; letter-spacing: 1px; text-align:left; white-space:nowrap; overflow:hidden; transition: all var(--zs-tr); }
.zs-collapsed .zs-nav-btn { width:calc(100% - 20px); padding:0; justify-content:center; }
.zs-nav-btn:hover { background: var(--zs-hover); color: #fff; border-color: rgba(255,255,255,0.05); }
.zs-nav-btn.zs-active { background: var(--zs-active-bg); color: var(--zs-cyan); border-color: rgba(0,240,255,0.3); box-shadow: 0 0 15px rgba(0,240,255,0.05); }
.zs-active-bar { position:absolute; left:0; top:0; width:3px; height:100%; background: linear-gradient(180deg, var(--zs-cyan), var(--zs-purple)); }
.zs-icon { width:20px; height:20px; flex-shrink:0; display:flex; align-items:center; }
.zs-label { flex:1; overflow:hidden; text-overflow:ellipsis; }
.zs-right { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.zs-badge { font-size: 9px; font-weight:900; letter-spacing:1px; padding: 2px 6px; border-radius:4px; border:1px solid; text-transform:uppercase; }
.zs-dot { position:absolute; top:12px; right:12px; width:6px; height:6px; border-radius:50%; }
.zs-chevron { display:flex; align-items:center; color:var(--muted); transition:transform var(--zs-tr); }
.zs-chevron.open { transform:rotate(180deg); color:var(--zs-cyan); }
@keyframes zsPulse { 0%,100% { box-shadow:0 0 0 0 rgba(255,0,234,0.6); } 50% { box-shadow:0 0 0 5px rgba(255,0,234,0); } }
.zs-pulse .zs-icon::after { content:''; position:absolute; width:6px; height:6px; border-radius:50%; background:var(--zs-purple); top:12px; right:15px; animation: zsPulse 2s infinite; }
.zs-sub-list { overflow:hidden; padding: 5px 0; animation: zsSlide .2s ease; }
@keyframes zsSlide { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
.zs-sub-btn { width:calc(100% - 20px); margin: 0 10px; display:flex; align-items:center; gap:10px; padding: 0 15px 0 45px; height:40px; background:none; border:none; border-radius: 6px; color:#666; cursor:pointer; font-size:12px; font-weight: 600; text-align:left; transition: all var(--zs-tr); position:relative; }
.zs-sub-btn:hover { background:rgba(255,255,255,0.02); color:#fff; }
.zs-sub-btn.zs-sub-active { color:var(--zs-cyan); background: rgba(0,240,255,0.05); }
.zs-sub-icon { font-size:10px; color:var(--zs-purple); flex-shrink:0; }
.zs-sub-dot { position:absolute; right:15px; top:50%; transform:translateY(-50%); width:5px; height:5px; border-radius:50%; background:var(--zs-cyan); box-shadow: 0 0 8px var(--zs-cyan); }
.zs-tooltip { position:absolute; left:calc(var(--zs-cw) + 10px); top:50%; transform:translateY(-50%); background: var(--zs-surface); border:1px solid var(--zs-cyan); border-radius:8px; padding:12px 15px; z-index:500; min-width:200px; box-shadow: 0 15px 40px rgba(0,0,0,0.8); pointer-events:none; animation: zsFade .2s ease; }
@keyframes zsFade { from { opacity:0; transform:translateY(-50%) translateX(-10px); } to { opacity:1; transform:translateY(-50%) translateX(0); } }
.zs-tooltip strong { display:block; color:var(--zs-cyan); font-size:13px; font-weight: 800; text-transform: uppercase; margin-bottom:4px; }
.zs-tooltip span { color:#888; font-size:11px; }
.zs-user { display:flex; align-items:center; gap:15px; padding:20px; border-top:1px solid var(--zs-border); background:#000; flex-shrink:0; }
.zs-collapsed .zs-user { justify-content:center; padding:20px 0; }
.zs-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--zs-cyan),var(--zs-purple)); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#000; position:relative; flex-shrink:0; }
.zs-online { position:absolute; bottom:0; right:0; width:10px; height:10px; border-radius:50%; background:#10b981; border:2px solid #000; }
.zs-user-info { flex:1; min-width:0; }
.zs-user-name { font-size:13px; font-weight:800; color:#fff; letter-spacing: 1px; margin:0; }
.zs-user-role { font-size:10px; color:var(--zs-purple); font-weight: bold; letter-spacing: 1px; margin:2px 0 0 0; }
.zs-toast { position:fixed; bottom:30px; right:30px; background:#000; border:1px solid var(--zs-cyan); color:var(--zs-cyan); font-size:13px; font-weight:700; text-transform: uppercase; letter-spacing: 1px; padding:12px 25px; border-radius:6px; z-index:9999; box-shadow:0 10px 40px rgba(0,240,255,0.2); animation: zsSlideUp .3s ease; }
@keyframes zsSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
`;