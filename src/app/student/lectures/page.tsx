"use client";
import React, { useState } from 'react';

// ==========================================
// 1. THE ENGINE (Isolated & Secure Video Core)
// ==========================================
interface EngineProps {
  videoId: string;
}

const YouTubeUnlistedEngine = ({ videoId }: EngineProps) => {
  if (!videoId) return null;

  const baseUrl = "https://www.youtube-nocookie.com/embed/";
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    disablekb: "1",
    controls: "1",
  }).toString();

  return (
    <iframe
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', zIndex: 5 }}
      src={`${baseUrl}${videoId}?${params}`}
      title="ZeeShaoor Custom Player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
};

// ==========================================
// 2. THE MATRIX (State & Cinematic Layout)
// ==========================================
interface VideoModule {
  id: string;
  title: string;
  module: string;
  duration: string;
  description: string;
  type: string;
  youtubeId: string;
}

export default function VisualLecturesHub() {
  // Playlist Initialization with Mock YouTube IDs
  const playlist: VideoModule[] = [
    { id: "ZSH-001", title: "The Reality of Quantum Mechanics", module: "Physics - Ch 1", duration: "45:20", description: "An absolute breakdown of quantum behavior, stripping away illusions to reveal the mathematical truth of the universe.", type: "Lecture", youtubeId: "ScMzIvxBSi4" },
    { id: "ZSH-TRF", title: "The Real Fact: Human Consciousness", module: "Documentary", duration: "1:15:00", description: "A profound journey into the depths of human awareness, separating societal programming from raw, unfiltered truth.", type: "Documentary", youtubeId: "t1MJUxE-o-Q" },
    { id: "ZSH-002", title: "Calculus: The Engine of Change", module: "Math - Expert", duration: "52:10", description: "Mastering the mathematics of continuous change. From Zero to Hero, understanding derivatives and integrals.", type: "Lecture", youtubeId: "5qap5aO4i9A" }
  ];

  // Dynamic State Control
  const [activeVideo, setActiveVideo] = useState<VideoModule>(playlist[0]);

  const studentData = {
    id: "STU-8842",
    name: "ALI HASAN",
    session: "2026-Alpha"
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 0%, #1a0b2e 0%, #050505 40%, #000000 100%)', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* INJECTING GOD-TIER CSS ANIMATIONS */}
      <style>{`
        .pulse-text { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { opacity: 0.5; text-shadow: 0 0 0 rgba(168, 85, 247, 0); }
          50% { opacity: 1; text-shadow: 0 0 20px rgba(168, 85, 247, 0.8); }
          100% { opacity: 0.5; text-shadow: 0 0 0 rgba(168, 85, 247, 0); }
        }
        .elite-scroll::-webkit-scrollbar { width: 6px; }
        .elite-scroll::-webkit-scrollbar-track { background: #09090B; }
        .elite-scroll::-webkit-scrollbar-thumb { background: #27272A; border-radius: 10px; }
        .elite-scroll::-webkit-scrollbar-thumb:hover { background: #a855f7; }
        .playlist-item:hover { background: rgba(168, 85, 247, 0.05) !important; transform: translateX(5px); border-left: 2px solid #a855f7 !important; }
      `}</style>

      {/* ELITE TOP NAVIGATION */}
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid rgba(168, 85, 247, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(5, 5, 5, 0.6)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            ZeeShaoor<span style={{ color: '#a855f7' }}>.pk</span>
          </h1>
          <div style={{ fontSize: '10px', color: '#a855f7', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '4px', fontWeight: 'bold' }}>
            Awakening Intellect, Anchoring Truth
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ fontSize: '12px', background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.1), rgba(0,0,0,0))', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '8px 16px', borderRadius: '30px', color: '#e9d5ff', fontWeight: 'bold', letterSpacing: '1px', boxShadow: '0 0 15px rgba(168, 85, 247, 0.2)' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', marginRight: '8px', boxShadow: '0 0 10px #10b981' }}></span>
            {studentData.name} | {studentData.id}
          </div>
        </div>
      </nav>

      {/* MAIN CINEMATIC LAYOUT */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT: THE CINEMA PLAYER AREA */}
        <div className="elite-scroll" style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
          
          {/* Video Container Skeleton (With Deep Glow) */}
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', position: 'relative', overflow: 'hidden', boxShadow: '0 0 50px rgba(168, 85, 247, 0.1), inset 0 0 100px rgba(0,0,0,1)' }}>
            
            {/* DRM WATERMARK (Cinematic Diagonal - Unclickable) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', zIndex: 10 }}>
                <div style={{ transform: 'rotate(-25deg)', color: 'rgba(255,255,255,0.04)', fontSize: '5vw', fontWeight: '900', textAlign: 'center', lineHeight: '1.2' }}>
                  {studentData.id} <br/> DO NOT RECORD
                </div>
            </div>

            {/* DYNAMIC YOUTUBE ENGINE INJECTION */}
            {activeVideo.youtubeId ? (
              <YouTubeUnlistedEngine videoId={activeVideo.youtubeId} />
            ) : (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', zIndex: 20 }}>
                <div className="pulse-text" style={{ color: '#ef4444', letterSpacing: '4px', fontSize: '16px', fontWeight: '900' }}>
                  [ ERROR: NO VIDEO STREAM DETECTED ]
                </div>
              </div>
            )}

          </div>

          {/* Video Metadata */}
          <div style={{ marginTop: '40px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(16, 185, 129, 0.1)', padding: '6px 14px', borderRadius: '4px', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                {activeVideo.type}
              </span>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(0, 240, 255, 0.1)', padding: '6px 14px', borderRadius: '4px', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                {activeVideo.module}
              </span>
            </div>
            <h2 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 15px 0', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{activeVideo.title}</h2>
            <p style={{ color: '#A1A1AA', fontSize: '18px', maxWidth: '850px', lineHeight: '1.8' }}>{activeVideo.description}</p>
          </div>
        </div>

        {/* RIGHT: THE MATRIX PLAYLIST */}
        <div className="elite-scroll" style={{ width: '420px', background: 'rgba(9, 9, 11, 0.8)', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)' }}>
           
           <div style={{ padding: '35px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, transparent 100%)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '900', margin: 0, textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#a855f7' }}>//</span> Transmission Feed
              </h3>
           </div>
           
           <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {playlist.map((item) => (
                <div 
                  key={item.id} 
                  className="playlist-item"
                  onClick={() => setActiveVideo(item)}
                  style={{ 
                    padding: '20px', 
                    background: activeVideo.id === item.id ? 'rgba(168, 85, 247, 0.1)' : 'transparent', 
                    border: '1px solid transparent',
                    borderLeft: activeVideo.id === item.id ? '2px solid #a855f7' : '2px solid transparent',
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease', 
                    borderRadius: '8px',
                    marginBottom: '10px'
                  }}
                >
                   <div style={{ fontSize: '10px', color: activeVideo.id === item.id ? '#d8b4fe' : '#71717A', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
                     {item.module}
                   </div>
                   <div style={{ fontSize: '15px', color: activeVideo.id === item.id ? '#fff' : '#D4D4D8', fontWeight: 'bold', lineHeight: '1.4' }}>
                     {item.title}
                   </div>
                   <div style={{ fontSize: '12px', color: '#71717A', marginTop: '12px', display: 'flex', gap: '15px', fontWeight: 'bold' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>⏱ {item.duration}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}