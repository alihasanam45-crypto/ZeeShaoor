// src/lib/wp-engine.ts

// ==========================================
// THE HEADLESS WP BRIDGE - ENTERPRISE SAAS EDITION
// ==========================================

// Environment Variable Injection (Security Standard)
// Local dev mein localhost, live production mein real domain khud uthayega
const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'http://localhost/zeeshaoor/wp-json/wp/v2';

export interface WPPost {
  id: number;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: any;
}

export async function fetchBoardNewsAndUpdates(): Promise<WPPost[]> {
  const endpoint = `${WP_API_URL}/posts?_embed&per_page=5`;

  // THE FAIL-SAFE MATRIX: Strict 8-second Timeout Rule
  // Agar WP server down ho ya slow ho, toh student ki screen hang nahi hogi
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); 

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      signal: controller.signal,
      next: { 
        revalidate: 3600, // Background sync every 1 hour as fallback
        tags: ['wp-board-news'] // On-Demand Revalidation (Instant Sync)
      },
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Matrix API Disconnected [Status: ${response.status}]`);
    }

    const data: WPPost[] = await response.json();
    return data;

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.error("Critical: WordPress Engine Timed Out. Serving empty/fallback state to protect UI.");
    } else {
      console.error("Headless WP Engine Error:", error.message);
    }
    
    // Graceful Degradation: System crash hone ke bajaye khali array return karega
    return []; 
  }
}