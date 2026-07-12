import React from 'react';

// ==========================================
// QUANTUM SKELETON ENGINE (Cinematic Loading)
// ==========================================

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({ width = '100%', height = '20px', borderRadius = '8px', className = '' }: SkeletonProps) {
  return (
    <>
      <style>{`
        .skeleton-shimmer {
          background: rgba(20, 20, 20, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }
        .skeleton-shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            90deg, 
            transparent, 
            rgba(168, 85, 247, 0.08), 
            transparent
          );
          animation: shimmer 1.5s infinite linear;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
      
      <div 
        className={`skeleton-shimmer ${className}`}
        style={{ width, height, borderRadius }}
      />
    </>
  );
}