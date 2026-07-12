// scripts/chaos-engine.mjs

// ==========================================
// THE CHAOS MATRIX (Automated Stress & Memory Leak Test)
// ==========================================

const TARGET_URL = 'http://localhost:3000/api/payments/checkout'; // Test API endpoint
const CONCURRENT_USERS = 100;

async function simulateHeavyTraffic() {
  console.log(`\n[MATRIX INITIATED] Launching ${CONCURRENT_USERS} concurrent requests...`);
  const startTime = Date.now();

  const requests = Array.from({ length: CONCURRENT_USERS }).map((_, index) => {
    return fetch(TARGET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: `ZSH-TEST-${index}`, planId: 'elite' })
    }).catch(err => ({ status: 'FAILED', error: err.message }));
  });

  const responses = await Promise.all(requests);
  const endTime = Date.now();

  // The Memory Leak Radar & Status Report
  const successCount = responses.filter(r => r.status === 200).length;
  const failCount = CONCURRENT_USERS - successCount;
  const timeTaken = (endTime - startTime) / 1000;
  
  const memoryUsed = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

  console.log(`\n=== STRESS TEST RESULTS ===`);
  console.log(`Total Time: ${timeTaken} seconds`);
  console.log(`Successful Payloads: ${successCount}`);
  console.log(`Failed Payloads: ${failCount}`);
  console.log(`RAM Consumed During Peak: ${memoryUsed} MB`);
  
  if (failCount > 0 || timeTaken > 5) {
    console.log(`\n[WARNING] Server choked. Optimize database queries or increase memory limits.`);
  } else {
    console.log(`\n[STATUS: ELITE] System handled the massive spike flawlessly. Zero choke detected.`);
  }
}

simulateHeavyTraffic();