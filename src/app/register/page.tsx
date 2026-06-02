"use client";
import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    ownerName: "", institutionName: "", branchAddress: "", phone: "", email: "", password: "", confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Awakening Intellect, Anchoring Truth - Connecting to ZeeShaoor.Pk...");
  };

  return (
    <>
      <style>{`
        .ultra-container { min-height: 100vh; display: flex; justify-content: center; align-items: center; background-color: #050810; padding: 20px; box-sizing: border-box; }
        .ultra-card { width: 100%; max-width: 600px; background-color: #0f1423; border-radius: 16px; box-shadow: 0 0 50px rgba(168, 85, 247, 0.15); border: 1px solid #1e293b; overflow: hidden; }
        .neon-line { height: 5px; width: 100%; background: linear-gradient(90deg, #00f2fe 0%, #4facfe 50%, #f093fb 100%); }
        .content-box { padding: 40px; }
        
        /* CUSTOM IMAGE LOGO STYLES */
        .brand-header-wrapper { display: flex !important; justify-content: center !important; align-items: center !important; gap: 15px !important; margin-bottom: 25px !important; width: 100% !important; }
        .custom-logo-img { width: 75px !important; height: auto !important; object-fit: contain !important; filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)); }
        .brand-title { color: #ffffff !important; font-size: 34px !important; font-weight: 900 !important; letter-spacing: 0.5px !important; margin: 0 !important; }
        
        .header-text { text-align: center; margin-bottom: 30px; }
        .title-row { display: flex; justify-content: center; align-items: center; gap: 12px; margin-bottom: 8px; }
        .title-row h2 { color: #ffffff; font-size: 26px; font-weight: 800; margin: 0; }
        .badge { background-color: #eab308; color: #000; font-size: 11px; font-weight: 900; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px; box-shadow: 0 0 15px rgba(234, 179, 8, 0.4); }
        .sub-title { color: #94a3b8; font-size: 14px; font-weight: 500; margin: 0; }
        .form-grid { display: grid; grid-template-columns: 1fr; gap: 20px; margin-bottom: 20px; }
        @media(min-width: 600px) { .form-grid { grid-template-columns: 1fr 1fr; } }
        .input-group label { display: block; color: #cbd5e1; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .input-group input { width: 100%; padding: 14px 16px; background-color: #171e2e; border: 1px solid #334155; border-radius: 8px; color: #ffffff; font-size: 14px; outline: none; transition: all 0.3s ease; box-sizing: border-box; }
        .input-group input::placeholder { color: #64748b; }
        .input-group input:focus { border-color: #a855f7; box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2); }
        .submit-btn { width: 100%; padding: 16px; background: linear-gradient(90deg, #06b6d4, #a855f7, #ec4899); border: none; border-radius: 8px; color: #ffffff; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; transition: all 0.3s ease; margin-top: 10px; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px -5px rgba(168, 85, 247, 0.6); }
        .login-row { text-align: center; margin-top: 25px; font-size: 14px; color: #94a3b8; font-weight: 500; }
        .login-row span { color: #22d3ee; font-weight: 800; cursor: pointer; transition: 0.3s; margin-left: 5px; }
        .login-row span:hover { color: #ec4899; text-decoration: underline; }
      `}</style>

      <div className="ultra-container">
        <div className="ultra-card">
          <div className="neon-line"></div>
          <div className="content-box">
            
            {/* CUSTOM LOGO SECTION */}
            <div className="brand-header-wrapper">
              {/* Yahan aap ka logo public folder se load hoga */}
              <img src="/logo.png" alt="ZeeShaoor Logo" className="custom-logo-img" />
              <h1 className="brand-title">ZeeShaoor.Pk</h1>
            </div>
            
            <div className="header-text">
              <div className="title-row">
                <h2>Create Account</h2>
                <span className="badge">ULTRA PRO</span>
              </div>
              <p className="sub-title">Awakening Intellect, Anchoring Truth</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="input-group">
                  <label>👤 Owner's Name</label>
                  <input placeholder="e.g. ALI HASAN" onChange={(e) => setFormData({...formData, ownerName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>🏢 Institution Name</label>
                  <input placeholder="e.g. ZeeShaoor Sci Academy" onChange={(e) => setFormData({...formData, institutionName: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>📍 Branch Address</label>
                  <input placeholder="e.g. Main Campus, Lahore" onChange={(e) => setFormData({...formData, branchAddress: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>📞 Phone Number</label>
                  <input placeholder="03XX-XXXXXXX" onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label>✉️ Email Address</label>
                <input type="email" placeholder="abc@xyz.com" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>🔒 Password</label>
                  <input type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
                </div>
              </div>

              <button type="submit" className="submit-btn">
                Create Professional Account
              </button>

              <div className="login-row">
                Already have an account? <span>Login Here ➔</span>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
}