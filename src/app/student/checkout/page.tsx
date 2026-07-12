"use client";
import React, { useState } from 'react';

export default function EliteSecureCheckout() {
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [tid, setTid] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Premium Module');

  // WhatsApp Admin Number (Format: 923XXXXXXXXX)
  const ADMIN_WHATSAPP = "923224656131"; 

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(field);
    setTimeout(() => setCopiedState(null), 2000);
  };

  const handleWhatsAppVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tid) return;

    const payload = `/// SECURE CLEARANCE REQUEST ///
System ID: ZSH-PENDING
Target Module: ${selectedPlan}
Transaction ID (TID): ${tid}
Status: Awaiting Admin Verification...

[Please attach the screenshot of your payment below]`;

    const encodedPayload = encodeURIComponent(payload);
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodedPayload}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: 'clamp(20px, 5vw, 40px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* GOD-TIER CSS ANIMATIONS */}
      <style>{`
        .glass-panel {
          background: linear-gradient(145deg, rgba(20,20,20,0.9) 0%, rgba(10,10,10,0.95) 100%);
          border: 1px solid rgba(168, 85, 247, 0.2);
          box-shadow: 0 0 40px rgba(168, 85, 247, 0.05), inset 0 0 20px rgba(0,0,0,0.5);
          border-radius: 16px;
        }
        .bank-card {
          background: rgba(15,15,15,0.8);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .bank-card:hover {
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(168, 85, 247, 0.1);
        }
        .copy-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #A1A1AA;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-btn:hover { background: rgba(168, 85, 247, 0.2); color: #fff; border-color: #a855f7; }
        .copied { background: rgba(16, 185, 129, 0.2) !important; color: #10b981 !important; border-color: #10b981 !important; }
        
        .tid-input {
          width: 100%; background: rgba(5,5,5,0.8); border: 1px solid rgba(255,255,255,0.1);
          color: #FAFAFA; padding: 16px 20px; border-radius: 8px; font-size: 16px; outline: none; transition: 0.3s;
        }
        .tid-input:focus { border-color: #a855f7; box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
        
        .whatsapp-btn {
          width: 100%; padding: 18px; background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 900;
          letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s ease;
          display: flex; justify-content: center; alignItems: center; gap: 10px;
        }
        .whatsapp-btn:hover { box-shadow: 0 0 30px rgba(16, 185, 129, 0.4); transform: scale(1.01); }
      `}</style>

      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: 'clamp(30px, 5vw, 50px)' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '50px', height: '50px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a855f7', fontSize: '24px', boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}>
            🔒
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Secure Vault</h1>
          <div style={{ fontSize: '12px', color: '#71717A', letterSpacing: '2px', textTransform: 'uppercase' }}>Encrypted Payment Gateway</div>
        </div>

        {/* BANKING MATRIX */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
          
          {/* HBL CARD */}
          <div className="bank-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#00826b', letterSpacing: '1px' }}>HBL (HABIB BANK LIMITED)</span>
              <span style={{ fontSize: '10px', color: '#A1A1AA', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>Branch: Baghbanpura, LHR</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#71717A' }}>Account Title:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FAFAFA' }}>ALI</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#71717A' }}>Account Number:</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#FAFAFA', letterSpacing: '1px' }}>01927902159803</span>
                  <button onClick={() => handleCopy('01927902159803', 'hbl_acc')} className={`copy-btn ${copiedState === 'hbl_acc' ? 'copied' : ''}`}>
                    {copiedState === 'hbl_acc' ? 'COPIED ✓' : 'COPY'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#71717A' }}>IBAN:</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#a855f7', letterSpacing: '1px' }}>PK07HABB0001927902159803</span>
                  <button onClick={() => handleCopy('PK07HABB0001927902159803', 'hbl_iban')} className={`copy-btn ${copiedState === 'hbl_iban' ? 'copied' : ''}`}>
                    {copiedState === 'hbl_iban' ? 'COPIED ✓' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* JAZZCASH / EASYPAISA CARD */}
          <div className="bank-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#ef4444', letterSpacing: '1px' }}>JAZZCASH / EASYPAISA</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#71717A' }}>Mobile Number:</span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#FAFAFA', letterSpacing: '2px' }}>03224656131</span>
                  <button onClick={() => handleCopy('03224656131', 'jazzcash')} className={`copy-btn ${copiedState === 'jazzcash' ? 'copied' : ''}`}>
                    {copiedState === 'jazzcash' ? 'COPIED ✓' : 'COPY'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VERIFICATION FORM */}
        <form onSubmit={handleWhatsAppVerification}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>
              Enter 11-Digit Transaction ID (TID)
            </label>
            <input 
              type="text" 
              required
              value={tid}
              onChange={(e) => setTid(e.target.value)}
              placeholder="e.g. 01928374656"
              className="tid-input"
            />
          </div>

          <button type="submit" className="whatsapp-btn">
            <span style={{ fontSize: '20px' }}>✆</span> SUBMIT FOR CLEARANCE
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', color: '#71717A', lineHeight: '1.5' }}>
            Clicking submit will securely transfer your payload to the Admin Matrix via WhatsApp. <br/> Do not forget to attach your payment screenshot.
          </div>
        </form>

      </div>
    </div>
  );
}