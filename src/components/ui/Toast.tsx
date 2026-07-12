"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

// ==========================================
// ELITE NEURAL TOAST MATRIX
// ==========================================

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000); // Cinematic fade out after 4 seconds
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* GOD-TIER TOAST CSS ENGINE */}
      <style>{`
        .toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 15px;
          pointer-events: none;
        }
        .toast-card {
          min-width: 300px;
          padding: 16px 24px;
          border-radius: 12px;
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(12px);
          color: #FAFAFA;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 15px;
          animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .toast-success { border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
        .toast-error { border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 0 20px rgba(239, 68, 68, 0.1); }
        .toast-info { border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 0 20px rgba(168, 85, 247, 0.1); }
        
        .toast-icon { font-size: 18px; }
        .icon-success { color: #10b981; }
        .icon-error { color: #ef4444; }
        .icon-info { color: #a855f7; }

        @keyframes slideIn {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card toast-${toast.type}`}>
            <span className={`toast-icon icon-${toast.type}`}>
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : '✦'}
            </span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};