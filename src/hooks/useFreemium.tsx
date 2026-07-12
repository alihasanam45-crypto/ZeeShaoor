"use client";
import React, { useState } from 'react';

// The Elite Gateway Matrix
export function useFreemium(initialStatus: boolean = false) {
  // initialStatus 'false' means user is currently on Freemium (Trial)
  const [isPremium] = useState(initialStatus); 
  const [showGateway, setShowGateway] = useState(false);
  const [attemptedFeature, setAttemptedFeature] = useState('');

  // The Verification Engine
  const verifyAccess = (featureName: string) => {
    if (isPremium) {
      return true; // Access Granted
    } else {
      setAttemptedFeature(featureName);
      setShowGateway(true); // Trigger Security Intercept
      return false; // Access Denied
    }
  };

  // The Ultra Pro Intercept Overlay (Only renders when access is blocked)
  const PremiumGatewayModal = () => {
    if (!showGateway) return null;

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
        <div style={{ background: 'linear-gradient(135deg, #09090B, #18181B)', border: '1px solid rgba(255, 42, 122, 0.3)', borderRadius: '16px', padding: '40px', maxWidth: '500px', textAlign: 'center', boxShadow: '0 20px 50px rgba(255, 42, 122, 0.15)', position: 'relative', overflow: 'hidden' }}>
          
          {/* Cybernetic Top Border */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, #ff2a7a, #a855f7)' }}></div>
          
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FAFAFA', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>
            Access Restricted
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
            The neural pathway to <strong style={{ color: '#ff2a7a', textTransform: 'uppercase', letterSpacing: '1px' }}>{attemptedFeature}</strong> requires an elevated clearance level. Upgrade your workspace to unlock unrestricted architectural power across ZeeShaoor.Pk.
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => setShowGateway(false)} 
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#FAFAFA', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: '0.2s' }}
            >
              Acknowledge
            </button>
            <button 
              style={{ background: 'linear-gradient(90deg, #ff2a7a, #a855f7)', border: 'none', color: '#FAFAFA', padding: '12px 24px', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 20px rgba(255, 42, 122, 0.3)', transition: '0.2s' }}
            >
              INITIATE UPGRADE
            </button>
          </div>
        </div>
      </div>
    );
  };

  return { isPremium, verifyAccess, PremiumGatewayModal };
}