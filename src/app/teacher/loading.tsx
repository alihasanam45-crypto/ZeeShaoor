import React from 'react'

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0 }
    100% { background-position: 200% 0 }
  }
`

function SkeletonBar({ width, height, borderRadius }: {
  width: string | number
  height: string | number
  borderRadius?: string | number
}) {
  return (
    <div
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: borderRadius ?? 12,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

export default function TeacherLoading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      padding: '28px 32px',
      fontFamily: "'Inter',system-ui,sans-serif",
    }}>
      <style>{shimmer}</style>

      {/* Header skeleton */}
      <div style={{ marginBottom: 32 }}>
        <SkeletonBar width="40%" height={32} borderRadius={8} />
        <div style={{ marginTop: 8 }}>
          <SkeletonBar width="25%" height={14} borderRadius={6} />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '20px 22px',
            }}
          >
            <SkeletonBar width={80} height={12} borderRadius={6} />
            <div style={{ marginTop: 12 }}>
              <SkeletonBar width="60%" height={28} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 20,
      }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '24px',
              gridColumn: i <= 1 ? 'span 2' : 'auto',
            }}
          >
            <SkeletonBar width={120} height={16} borderRadius={6} />
            <div style={{ marginTop: 16 }}>
              {[1, 2, 3].map((j) => (
                <div key={j} style={{ marginBottom: 10 }}>
                  <SkeletonBar width={`${70 + j * 10}%`} height={12} borderRadius={6} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <SkeletonBar width="100%" height={160} borderRadius={12} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
