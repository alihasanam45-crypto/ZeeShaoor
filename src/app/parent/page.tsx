"use client";
import React, { useState } from 'react';

export default function GuardianPortal() {
  const [focusLocked, setFocusLocked] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: '40px 20px', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Top Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#10b981' }}>🛡️ Guardian</span> Oversight Matrix
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '13px', marginTop: '4px' }}>Empowering parents with actionable foresight and precision data.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '12px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px' }}>Linked Ward:</span>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '50px', fontSize: '14px', fontWeight: '600', color: '#00f0ff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 10px #00f0ff' }}></span>
              Zunishah
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* LEFT COLUMN: Analytics & Trajectory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Current Accuracy</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>89%</div>
                <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>↑ 4% from last week</div>
              </div>
              <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Consistency Streak</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#ff2a7a' }}>14 Days</div>
                <div style={{ color: '#A1A1AA', fontSize: '12px', marginTop: '4px' }}>Optimal engagement</div>
              </div>
              <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Syllabus Covered</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#00f0ff' }}>42%</div>
                <div style={{ color: '#A1A1AA', fontSize: '12px', marginTop: '4px' }}>On track for Finals</div>
              </div>
            </div>

            {/* THE UNIQUE FEATURE: Cognitive Trajectory Predictor */}
            <div style={{ background: 'linear-gradient(180deg, #18181B, #09090B)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(180deg, #00f0ff, #a855f7)' }}></div>
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#FAFAFA', fontWeight: '700' }}>AI Cognitive Trajectory Predictor</h3>
              <p style={{ color: '#A1A1AA', fontSize: '14px', marginBottom: '24px' }}>ZeeShaoor.pk neural engine's projection for upcoming Board Exams based on current data.</p>
              
              <div style={{ background: '#000', borderRadius: '12px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Projected Physics Score</div>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: '#FAFAFA', letterSpacing: '-2px' }}>71<span style={{ fontSize: '24px', color: '#71717A' }}>/75</span></div>
                </div>
                
                <div style={{ width: '2px', height: '60px', background: 'rgba(255,255,255,0.1)' }}></div>

                <div>
                  <div style={{ fontSize: '12px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>AI Recommended Action</div>
                  <div style={{ color: '#00f0ff', fontSize: '14px', fontWeight: '600', maxWidth: '200px' }}>Focus needed on Chapter 4 (Dynamics) to reach 75/75.</div>
                </div>

                <button style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}>
                  Assign Remedial Test
                </button>
              </div>
            </div>

            {/* Recent Assessments */}
            <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
               <h3 style={{ fontSize: '16px', margin: '0 0 20px 0', color: '#FAFAFA', fontWeight: '600' }}>Recent Neural Assessments</h3>
               
               {[
                 { subject: 'Mathematics', title: 'Algebra Expert Test', score: '95%', status: 'Excellent', color: '#10b981' },
                 { subject: 'Physics', title: 'Kinematics MCQs', score: '82%', status: 'Good', color: '#00f0ff' },
                 { subject: 'Chemistry', title: 'Periodic Table Quiz', score: '64%', status: 'Needs Review', color: '#ff2a7a' }
               ].map((test, index) => (
                 <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: index !== 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                   <div>
                     <div style={{ fontSize: '14px', fontWeight: '600', color: '#FAFAFA', marginBottom: '4px' }}>{test.title}</div>
                     <div style={{ fontSize: '12px', color: '#71717A' }}>{test.subject}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <div style={{ fontSize: '16px', fontWeight: '700', color: test.color }}>{test.score}</div>
                     <div style={{ fontSize: '11px', color: test.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{test.status}</div>
                   </div>
                 </div>
               ))}
            </div>

          </div>

          {/* RIGHT COLUMN: Control Center */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* THE UNIQUE FEATURE 2: Focus Lock Override */}
            <div style={{ background: focusLocked ? 'rgba(255, 42, 122, 0.05)' : '#09090B', border: `1px solid ${focusLocked ? 'rgba(255, 42, 122, 0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '16px', padding: '32px', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>{focusLocked ? '🔒' : '🔓'}</span>
                <h3 style={{ fontSize: '16px', margin: 0, color: focusLocked ? '#ff2a7a' : '#FAFAFA', fontWeight: '700' }}>Focus Lock Protocol</h3>
              </div>
              <p style={{ color: '#A1A1AA', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
                Override the student's Launchpad. Activating this locks all entertainment/surfing modules and forces the student to complete their pending assignment first.
              </p>
              
              <button 
                onClick={() => setFocusLocked(!focusLocked)}
                style={{ 
                  width: '100%', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: '0.2s',
                  background: focusLocked ? 'rgba(255, 42, 122, 0.1)' : '#FAFAFA',
                  color: focusLocked ? '#ff2a7a' : '#000',
                  border: focusLocked ? '1px solid #ff2a7a' : 'none',
                  boxShadow: focusLocked ? '0 0 20px rgba(255, 42, 122, 0.2)' : 'none'
                }}
              >
                {focusLocked ? 'DISENGAGE LOCK' : 'ACTIVATE FOCUS LOCK'}
              </button>
            </div>

            {/* Communication Module */}
            <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px' }}>
              <h3 style={{ fontSize: '14px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', fontWeight: '600' }}>System Communications</h3>
              <p style={{ color: '#E4E4E7', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                Receive instant WhatsApp notifications for missed exams, low accuracy thresholds, or completed milestones.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#000', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ color: '#FAFAFA', fontSize: '13px', fontWeight: '500' }}>WhatsApp Alerts</span>
                <span style={{ color: '#10b981', fontSize: '12px', fontWeight: '700', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>ACTIVE</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}