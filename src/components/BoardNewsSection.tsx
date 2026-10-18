import React from 'react';
import { fetchBoardNewsAndUpdates, WPPost } from '../lib/wp-engine'; // Apne folder path ke hisaab se adjust karein

export default async function BoardNewsFeed() {
  // Server-Side Fetching (Zero Client Load)
  const newsPosts: WPPost[] = await fetchBoardNewsAndUpdates();

  // Elite Date Formatter (e.g., "07 Jun, 2026")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(date).toUpperCase();
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid rgba(168, 85, 247, 0.15)', paddingBottom: '15px' }}>
        <div style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '50%', boxShadow: '0 0 15px #a855f7', animation: 'pulse 2s infinite' }}></div>
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#FAFAFA', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
          Transmission Feed <span style={{ color: '#71717A', fontSize: '14px', fontWeight: 'normal' }}>// Live Updates</span>
        </h2>
      </div>

      {/* GOD-TIER CSS ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
        .news-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255, 255, 255, 0.03);
          background: linear-gradient(145deg, rgba(15, 15, 15, 0.9) 0%, rgba(5, 5, 5, 0.95) 100%);
        }
        .news-card:hover {
          transform: translateY(-5px);
          border-color: rgba(168, 85, 247, 0.5);
          box-shadow: 0 10px 30px rgba(168, 85, 247, 0.15);
          background: linear-gradient(145deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 1) 100%);
        }
        .news-card::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: transparent;
          transition: background 0.3s ease;
        }
        .news-card:hover::before {
          background: #a855f7;
          box-shadow: 0 0 15px #a855f7;
        }
        .wp-content p { margin: 0; line-height: 1.6; color: #A1A1AA; font-size: 15px; }
      `}</style>

      {/* DYNAMIC FEED MAP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {newsPosts.length > 0 ? (
          newsPosts.map((post) => (
            <div key={post.id} className="news-card" style={{ position: 'relative', padding: '30px', borderRadius: '12px', overflow: 'hidden' }}>
              
              {/* Date & Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: '20px', letterSpacing: '1px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  BOARD UPDATE
                </span>
                <span style={{ fontSize: '12px', color: '#71717A', fontWeight: 'bold', letterSpacing: '1px' }}>
                  {formatDate(post.date)}
                </span>
              </div>

              {/* Title */}
              <h3 
                style={{ fontSize: '20px', fontWeight: '800', color: '#FAFAFA', marginBottom: '12px', lineHeight: '1.4' }}
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />

              {/* Excerpt / Content Injection */}
              <div 
                className="wp-content"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered || post.content.rendered }}
              />

              {/* Interaction Call */}
              <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: '#a855f7', cursor: 'pointer', letterSpacing: '1px' }}>
                INITIALIZE MODULE <span style={{ fontSize: '16px' }}>&#8594;</span>
              </div>
            </div>
          ))
        ) : (
          /* FAIL-SAFE: Empty State if WP Matrix is Offline */
          <div style={{ padding: '40px', textAlign: 'center', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ color: '#ef4444', fontSize: '24px', marginBottom: '10px' }}>&#9888;</div>
            <div style={{ color: '#FAFAFA', fontSize: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>TRANSMISSION INTERRUPTED</div>
            <div style={{ color: '#71717A', fontSize: '14px', marginTop: '5px' }}>The central intelligence matrix is currently offline. No recent updates found.</div>
          </div>
        )}
      </div>

    </div>
  );
}