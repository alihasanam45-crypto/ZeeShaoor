"use client";
import React, { useState } from 'react';
import { useFreemium } from '@/hooks/useFreemium'; // Elite Gateway Hook

export default function DataBankDashboard() {
  // Dummy data representing the injected LaTeX questions
  const [questions] = useState([
    { id: 'ZPK-901', board: 'Lahore', grade: '9th', subject: 'Physics', chapter: 'CH-2', type: 'MCQ', source: 'Exercise', statement: 'What is the SI unit of velocity? $$v = \\frac{d}{t}$$' },
    { id: 'ZPK-902', board: 'Federal', grade: '10th', subject: 'Mathematics', chapter: 'CH-5', type: 'SQ', source: 'PastPaper', statement: 'Solve the quadratic equation: $$ax^2 + bx + c = 0$$' },
    { id: 'ZPK-903', board: 'Gujranwala', grade: '11th', subject: 'Chemistry', chapter: 'CH-1', type: 'LQ', source: 'Additional', statement: 'Explain Bohr\'s atomic model with the equation $$E = h\\nu$$' },
    { id: 'ZPK-904', board: 'Lahore', grade: '12th', subject: 'Biology', chapter: 'CH-15', type: 'MCQ', source: 'Exercise', statement: 'Which of the following is responsible for osmoregulation?' },
  ]);

  // Elite Gateway Injection (Initial status set to false to test the Intercept Modal)
  const { verifyAccess, PremiumGatewayModal } = useFreemium(false); 

  // Action Handler for Restricted Features
  const handleProtectedAction = (actionName: string) => {
    if (verifyAccess(actionName)) {
      console.log(`[SYSTEM] Executing ${actionName}...`);
      // Actual execution logic goes here for Premium users
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: '40px 20px', backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0, 240, 255, 0.05) 0%, transparent 50%)' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Elite Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#00f0ff' }}>🗄️</span> Central Neural Vault
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '15px', margin: 0, fontWeight: '400' }}>
              Live telemetry of all verified academic assets injected into the system.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ background: '#09090B', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '10px 20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Indexed Assets</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#00f0ff' }}>14,592</span>
            </div>
            <div style={{ background: '#09090B', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '10px 20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px' }}>System Status</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></span> Active
              </span>
            </div>
          </div>
        </div>

        {/* Live Matrix Filtering */}
        <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search LaTeX or text..." style={{ flex: '1', minWidth: '250px', background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '6px', color: '#FAFAFA', fontSize: '14px', outline: 'none' }} />
          
          <select style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '6px', color: '#FAFAFA', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
            <option>All Boards</option>
            <option>Lahore</option>
            <option>Federal</option>
          </select>

          <select style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '6px', color: '#FAFAFA', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
            <option>All Subjects</option>
            <option>Physics</option>
            <option>Mathematics</option>
          </select>

          <button style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '0 24px', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: '0.2s' }}>
            Apply Filters
          </button>
        </div>

        {/* The Elite Data Table */}
        <div style={{ background: '#09090B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#000', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '16px 20px', color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Ref ID</th>
                <th style={{ padding: '16px 20px', color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Context</th>
                <th style={{ padding: '16px 20px', color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', width: '40%' }}>Raw Content / LaTeX</th>
                <th style={{ padding: '16px 20px', color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Tags</th>
                <th style={{ padding: '16px 20px', color: '#71717A', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px', color: '#00f0ff', fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px' }}>{q.id}</td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ color: '#FAFAFA', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{q.subject}</div>
                    <div style={{ color: '#A1A1AA', fontSize: '12px' }}>{q.board} • {q.grade} • {q.chapter}</div>
                  </td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', fontFamily: '"Fira Code", monospace', fontSize: '13px', color: '#E4E4E7', lineHeight: '1.6' }}>
                      {q.statement}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{q.type}</span>
                      <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>{q.source}</span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleProtectedAction('Data Mutation (Edit)')} style={{ background: '#18181B', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}>Edit</button>
                      <button onClick={() => handleProtectedAction('Database Purge Protocol')} style={{ background: 'rgba(255, 42, 122, 0.1)', border: '1px solid rgba(255, 42, 122, 0.3)', color: '#ff2a7a', padding: '8px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: '0.2s' }}>Purge</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Render the Elite Intercept Modal */}
        <PremiumGatewayModal />

      </div>
    </div>
  );
}