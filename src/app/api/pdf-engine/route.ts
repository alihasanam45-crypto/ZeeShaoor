import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core'; 

export async function POST(request: Request) {
  try {
    const { htmlContent, metadata } = await request.json();

    console.log("[SYSTEM] Ghost Render Protocol Initiated...");

    // Launching your laptop's installed Google Chrome invisibly
    const browser = await puppeteer.launch({ 
      headless: true,
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Standard Windows Chrome path
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();

    // The World's #1 SaaS Injector: Adding Math and Print Styles
    const eliteHtmlWrapper = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
          <style>
            body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            * { box-sizing: border-box; font-family: "Times New Roman", Times, serif; }
            .matrix-container { width: 210mm; padding: 20mm; margin: 0 auto; background: #fff; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; }
          </style>
        </head>
        <body>
          <div class="matrix-container">
            ${htmlContent}
          </div>
        </body>
      </html>
    `;

    // 🔥 FIX: Changed 'networkidle0' to 'load' for ultra-fast rendering & fixing TS Error
    await page.setContent(eliteHtmlWrapper, { waitUntil: 'load' });

    // Generate pristine 1-Click HD PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    await browser.close();
    console.log("[SUCCESS] HD PDF Synthesized. Dispatching to Client.");

    // Bypass TS strict mode for Buffer response
    // @ts-ignore
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ZeeShaoor_Matrix_${metadata.class}_${metadata.subject}.pdf"`,
        'X-Author': 'ALI HASAN'
      }
    });

  } catch (error) {
    console.error("[CRITICAL ERROR] PDF Engine Failed:", error);
    return NextResponse.json({ error: 'System Architecture Error' }, { status: 500 });
  }
}