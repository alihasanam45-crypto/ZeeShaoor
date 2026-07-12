"use client";
import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  RadialLinearScale, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Radar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, RadialLinearScale, ArcElement, Tooltip, Legend, Filler);

export default function EliteProgressTracker() {
  
  // ==========================================
  // DATA MATRICES 
  // ==========================================
  
  const radarData = {
    labels: ['Quantum Physics', 'Calculus', 'Critical Thinking', 'Philosophy', 'Logic'],
    datasets: [{
      label: 'Intellect Level',
      data: [85, 92, 78, 95, 88],
      backgroundColor: 'rgba(168, 85, 247, 0.2)',
      borderColor: '#a855f7',
      pointBackgroundColor: '#fff',
      pointBorderColor: '#a855f7',
      borderWidth: 2,
    }]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false, // Elite Logic for Mobile Scaling
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: '#A1A1AA', font: { size: 10, family: 'Inter' } },
        ticks: { display: false, max: 100 }
      }
    },
    plugins: { legend: { display: false } }
  };

  const lineData = {
    labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    datasets: [{
      label: 'Focus Hours',
      data: [12, 19, 15, 25, 22, 30],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#050505',
    }]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#71717A' } },
      x: { grid: { display: false }, ticks: { color: '#71717A' } }
    },
    plugins: { legend: { display: false } }
  };

  const doughnutData = {
    labels: ['Mastered', 'In Progress', 'Unexplored'],
    datasets: [{
      data: [75, 15, 10],
      backgroundColor: ['#a855f7', '#3f3f46', '#18181b'],
      borderColor: '#050505',
      borderWidth: 4,
      hoverOffset: 10
    }]
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: 'clamp(20px, 5vw, 40px)' }}>
      
      {/* ========================================== */}
      {/* DAY 43: RESPONSIVE FLUID CSS ENGINE */}
      {/* ========================================== */}
      <style>{`
        /* The Algorithmic Grid Engine */
        .fluid-grid {
          display: grid;
          /* Auto-fit magic: Agar space kam hai toh 1 column, zyada hai toh 3 columns */
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: clamp(20px, 4vw, 30px);
        }
        
        .span-2 { grid-column: span 2; }
        .span-full { grid-column: 1 / -1; }
        
        .glass-card {
          background: linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%);
          padding: clamp(20px, 4vw, 30px);
          borderRadius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .glass-card:hover {
          border-color: rgba(168, 85, 247, 0.3);
          transform: translateY(-2px);
        }

        .flex-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Mobile View Strict Audit Logic */
        @media (max-width: 768px) {
          .span-2 { grid-column: 1 / -1; } /* Break grid to full width on mobile */
          
          .flex-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          
          .radar-text-box, .radar-chart-box {
            width: 100% !important;
          }
          
          .header-rank {
            text-align: left !important;
            margin-top: 15px;
          }
        }
      `}</style>

      {/* ELITE HEADER */}
      <div className="flex-container" style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: 'clamp(30px, 6vw, 50px)', borderBottom: '1px solid rgba(168, 85, 247, 0.2)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Neural Progress <span style={{ color: '#a855f7' }}>Tracker</span>
          </h1>
          <div style={{ fontSize: '10px', color: '#71717A', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            Awakening Intellect, Anchoring Truth
          </div>
        </div>
        <div className="header-rank" style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '5px' }}>Current Rank</div>
          <div style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', color: '#10b981', letterSpacing: '1px', textShadow: '0 0 15px rgba(16, 185, 129, 0.4)' }}>
            SEEKER OF TRUTH
          </div>
        </div>
      </div>

      {/* DASHBOARD FLUID GRID */}
      <div className="fluid-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP STAT CARDS */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Truth Index</div>
          <div style={{ fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: '900', color: '#FAFAFA' }}>88<span style={{ color: '#a855f7', fontSize: '24px' }}>%</span></div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Deep Focus</div>
          <div style={{ fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: '900', color: '#FAFAFA' }}>123<span style={{ color: '#10b981', fontSize: '24px' }}>H</span></div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Modules</div>
          <div style={{ fontSize: 'clamp(36px, 6vw, 48px)', fontWeight: '900', color: '#FAFAFA' }}>14<span style={{ color: '#A1A1AA', fontSize: '24px' }}>/20</span></div>
        </div>

        {/* CHART 1: LINE WAVE (Span 2 columns on desktop, full width on mobile) */}
        <div className="glass-card span-2" style={{ background: 'rgba(15,15,15,0.6)' }}>
          <h3 style={{ fontSize: '14px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>Focus Matrix</h3>
          <div style={{ height: 'clamp(200px, 40vw, 300px)', width: '100%', position: 'relative' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>

        {/* CHART 2: DOUGHNUT CORE */}
        <div className="glass-card" style={{ background: 'rgba(15,15,15,0.6)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', color: '#A1A1AA', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', width: '100%' }}>Core Mastery</h3>
          <div style={{ height: 'clamp(180px, 35vw, 250px)', width: '100%', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } }, cutout: '75%', maintainAspectRatio: false }} />
          </div>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#71717A', textAlign: 'center', lineHeight: '1.5' }}>
            <span style={{ color: '#a855f7', fontWeight: 'bold' }}>Purple:</span> Mastery <br/>
            <span style={{ color: '#A1A1AA' }}>Grey:</span> In Progress
          </div>
        </div>

        {/* CHART 3: RADAR INTELLECT MAPPING (Full width always, flex structure changes on mobile) */}
        <div className="glass-card span-full flex-container" style={{ background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(5,5,5,1) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
          <div className="radar-text-box" style={{ width: '45%' }}>
            <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '900', color: '#FAFAFA', marginBottom: '15px' }}>Cognitive Expansion</h2>
            <p style={{ color: '#A1A1AA', fontSize: 'clamp(14px, 2vw, 16px)', lineHeight: '1.8', marginBottom: '30px' }}>
              Yeh radar student ki zehni salahiyaton ka ek real-time x-ray hai. Har completed lecture is matrix ko expand karta hai.
            </p>
            <button style={{ padding: '12px 25px', background: 'transparent', border: '1px solid #a855f7', color: '#a855f7', borderRadius: '30px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', cursor: 'pointer', width: '100%', maxWidth: '250px' }}>
              GENERATE PDF REPORT
            </button>
          </div>
          <div className="radar-chart-box" style={{ width: '50%', height: 'clamp(250px, 50vw, 350px)', position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}