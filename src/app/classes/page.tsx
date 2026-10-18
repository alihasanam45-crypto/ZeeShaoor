"use client";
import React, { useState } from 'react';

export default function DynamicClassesGrid() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Dynamic Data Array for Classes 5th to 12th
  const classesData = [
    { id: 5, grade: "5th Grade", title: "Foundation Tier", subjects: "4 Core Subjects", isTrial: true },
    { id: 6, grade: "6th Grade", title: "Middle School Prep", subjects: "5 Core Subjects", isTrial: true },
    { id: 7, grade: "7th Grade", title: "Pre-Science Tier", subjects: "6 Core Subjects", isTrial: true },
    { id: 8, grade: "8th Grade", title: "Pre-Matriculation", subjects: "6 Core Subjects", isTrial: true },
    { id: 9, grade: "9th Grade", title: "Matriculation (Part-I)", subjects: "8 Subjects (Science)", isTrial: false },
    { id: 10, grade: "10th Grade", title: "Matriculation (Part-II)", subjects: "8 Subjects (Science)", isTrial: false },
    { id: 11, grade: "11th Grade", title: "Intermediate (FSc-I)", subjects: "Pre-Med / Pre-Eng", isTrial: false },
    { id: 12, grade: "12th Grade", title: "Intermediate (FSc-II)", subjects: "Pre-Med / Pre-Eng", isTrial: false },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#000000', 
      color: '#FAFAFA', 
      fontFamily: 'Inter, sans-serif',
      padding: '60px 20px'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px' }}>
            Select Your <span style={{ color: '#00f0ff' }}>Academic Matrix</span>
          </h1>
          <p style={{ color: '#A1A1AA', margin: 0, fontSize: '16px', maxWidth: '600px', marginInline: 'auto' }}>
            Choose your current grade to initialize the neural engine and load your customized curriculum vault.
          </p>
        </div>

        {/* Dynamic Grid Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px' 
        }}>
          {classesData.map((cls) => (
            <div 
              key={cls.id}
              onMouseEnter={() => setHoveredCard(cls.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                background: '#09090B',
                border: hoveredCard === cls.id 
                  ? `1px solid ${cls.isTrial ? 'rgba(16, 185, 129, 0.5)' : 'rgba(168, 85, 247, 0.5)'}` 
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                transform: hoveredCard === cls.id ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: hoveredCard === cls.id 
                  ? (cls.isTrial ? '0 10px 30px rgba(16, 185, 129, 0.1)' : '0 10px 30px rgba(168, 85, 247, 0.1)') 
                  : 'none'
              }}
            >
              {/* Dynamic Badge (Trial vs Premium) */}
              <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                {cls.isTrial ? (
                  <span style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', 
                    padding: '4px 10px', borderRadius: '4px', fontSize: '10px', 
                    fontWeight: '700', letterSpacing: '0.5px', border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}>
                    FREE TRIAL
                  </span>
                ) : (
                  <span style={{ 
                    background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', 
                    padding: '4px 10px', borderRadius: '4px', fontSize: '10px', 
                    fontWeight: '700', letterSpacing: '0.5px', border: '1px solid rgba(168, 85, 247, 0.2)'
                  }}>
                    PREMIUM
                  </span>
                )}
              </div>

              {/* Class Content */}
              <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#FAFAFA' }}>
                {cls.grade}
              </div>
              <div style={{ fontSize: '14px', color: cls.isTrial ? '#10b981' : '#a855f7', fontWeight: '600', marginBottom: '16px' }}>
                {cls.title}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#71717A', fontSize: '13px' }}>
                <span>📚</span> {cls.subjects}
              </div>

              {/* Hover Action Button */}
              <div style={{ 
                marginTop: '24px',
                height: '2px', 
                width: '100%', 
                background: 'rgba(255,255,255,0.05)',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, height: '100%',
                  width: hoveredCard === cls.id ? '100%' : '0%',
                  background: cls.isTrial ? '#10b981' : 'linear-gradient(90deg, #00f0ff, #a855f7)',
                  transition: 'width 0.4s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}