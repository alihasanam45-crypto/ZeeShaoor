"use client";
import React from 'react';

export default function FounderProfile() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '60px' }}>
          <a href="/teacher" style={{ color: '#71717A', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: '0.2s' }}>
            <span style={{ fontSize: '16px' }}>←</span> Return to Portal
          </a>
        </div>

        {/* Section 1: Founder's Vision */}
        <div style={{ textAlign: 'center', marginBottom: '100px', padding: '0 20px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 32px 0', letterSpacing: '-1.5px', color: '#FAFAFA' }}>
            Founder's Vision
          </h1>
          
          <p style={{ color: '#E4E4E7', fontSize: '18px', lineHeight: '2', maxWidth: '800px', margin: '0 auto 32px auto', fontWeight: '400' }}>
            As an educator, I understand that a teacher's real job is to <strong style={{ color: '#FAFAFA', fontWeight: '700' }}>shape minds</strong>, not to waste hours on formatting papers.
          </p>
          
          <p style={{ color: '#A1A1AA', fontSize: '18px', lineHeight: '2', maxWidth: '850px', margin: '0 auto 40px auto' }}>
            At ZeeShaoor.pk, our vision is <strong style={{ color: '#FAFAFA', fontWeight: '700' }}>strictly grounded in reality and precision</strong>. We have built a flawless, automated system that takes the burden of paper generation off your shoulders. We demand <strong style={{ color: '#00f0ff', fontWeight: '700' }}>100% accuracy</strong> in our technology, so you can deliver excellence in your classrooms.
          </p>

          <p style={{ color: '#E4E4E7', fontSize: '20px', lineHeight: '1.8', maxWidth: '850px', margin: '0 auto 48px auto', fontWeight: '500' }}>
            We don't just offer a tool; we offer <strong style={{ color: '#FAFAFA', fontWeight: '800' }}>peace of mind and uncompromising quality</strong>.
          </p>
          
          {/* Elite Checklist Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', fontSize: '15px', fontWeight: '600', color: '#FAFAFA' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#09090B', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255, 42, 122, 0.3)' }}>
              <span style={{ background: '#ff2a7a', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}>✓</span> 
              100% Accurate & Error-Free Papers
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#09090B', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255, 42, 122, 0.3)' }}>
              <span style={{ background: '#ff2a7a', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}>✓</span> 
              Saves Valuable Time for Educators
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#09090B', padding: '10px 20px', borderRadius: '50px', border: '1px solid rgba(255, 42, 122, 0.3)' }}>
              <span style={{ background: '#ff2a7a', color: '#fff', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}>✓</span> 
              Strict & Uncompromising Quality
            </div>
          </div>
        </div>

        {/* Section 2: Meet the Founder Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-1px' }}>
            Meet the <span style={{ color: '#00f0ff' }}>Founder</span>
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '15px' }}>
            The academic excellence and technical innovation behind ZeeShaoor.pk, designed to transform assessment creation.
          </p>
        </div>

        {/* Section 3: The Purple Elite Card */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e0b2b 0%, #3b1459 100%)', 
          borderRadius: '24px', padding: '48px', border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 20px 50px rgba(59, 20, 89, 0.5)', position: 'relative', overflow: 'hidden'
        }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'start' }}>
            
            {/* Avatar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '140px', height: '140px', borderRadius: '50%', 
                background: 'linear-gradient(180deg, #00f0ff, #ff2a7a)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '4px', marginBottom: '16px', boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)'
              }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#09090B', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '48px', color: '#FAFAFA' }}>
                  👤
                </div>
              </div>
              <span style={{ color: '#FAFAFA', fontWeight: '800', letterSpacing: '2px', fontSize: '16px' }}>FOUNDER</span>
            </div>

            {/* Bio & Details Column */}
            <div>
              <h3 style={{ fontSize: '36px', fontWeight: '900', color: '#FAFAFA', margin: '0 0 8px 0', letterSpacing: '-1px' }}>
                ALI HASAN
              </h3>
              <p style={{ color: '#00f0ff', fontSize: '16px', fontWeight: '700', margin: '0 0 24px 0', letterSpacing: '0.5px' }}>
                Lead Educator, ZeeShaoor.pk
              </p>
              
              <p style={{ color: '#E4E4E7', fontSize: '16px', lineHeight: '1.8', marginBottom: '40px', fontWeight: '400' }}>
                Ali Hasan is a passionate educator and systems architect dedicated to revolutionizing Pakistan's academic landscape. By fusing cutting-edge software engineering with standard board curricula, he created ZeeShaoor.pk to empower institutions, teachers, and students with high-fidelity resources and rapid exam generation tools.
              </p>

              {/* Z Support Helpdesk Area */}
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', padding: '6px 12px', borderRadius: '50px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    🎧 PREMIUM HELPDESK
                  </span>
                  <span style={{ color: '#FAFAFA', fontWeight: '800', fontSize: '16px', letterSpacing: '1px' }}>
                    Z SUPPORT
                  </span>
                </div>
                
                <p style={{ color: '#E4E4E7', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                  Need custom board styling, batch school registration, or exclusive database queries? Connect directly with our founder's support helpline on WhatsApp for instant assistance.
                </p>

                <a 
                  href="https://wa.me/923160404585?text=Hello%20Ali%20Hasan%2C%20I%20need%20assistance%20via%20Z%20Support." 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#10b981', color: '#FAFAFA', border: 'none', 
                    padding: '16px 24px', borderRadius: '12px', fontWeight: '700', fontSize: '16px', textDecoration: 'none',
                    transition: '0.2s', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>💬</span> Contact Z Support
                  </span>
                  <span>0316-0404585</span>
                </a>
              </div>

            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}