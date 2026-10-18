// src/lib/puppeteer-queue.ts

// ==========================================
// PUPPETEER ANTI-CHOKE PROTOCOL (Smart Queue Engine)
// ==========================================

type PrintTask = {
  paperId: string;
  htmlContent: string;
  resolve: (value: Buffer) => void;
  reject: (reason?: any) => void;
};

class PDFQueueMatrix {
  private queue: PrintTask[] = [];
  private isProcessing: boolean = false;
  // Strictly limiting to 2 parallel Chromium instances to prevent 504 Timeouts
  private CONCURRENCY_LIMIT = 2; 
  private activeWorkers = 0;

  public async addToQueue(paperId: string, htmlContent: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      this.queue.push({ paperId, htmlContent, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.queue.length === 0 || this.activeWorkers >= this.CONCURRENCY_LIMIT) {
      return;
    }

    this.activeWorkers++;
    const task = this.queue.shift();

    if (task) {
      try {
        console.log(`[PDF MATRIX] Rendering massive paper: ${task.paperId}...`);
        
        // Simulating Puppeteer PDF Generation logic here
        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.setContent(task.htmlContent);
        // const pdfBuffer = await page.pdf({ format: 'A4' });
        // await browser.close();
        
        const mockBuffer = Buffer.from(`PDF_MOCK_DATA_FOR_${task.paperId}`);
        
        // Garbage Collection Directive (Memory Leak Prevention)
        global.gc && global.gc(); 

        task.resolve(mockBuffer);
      } catch (error) {
        console.error(`[PDF MATRIX ERROR] Failed to render ${task.paperId}`, error);
        task.reject(error);
      } finally {
        this.activeWorkers--;
        // Recursive call to process the next paper in line smoothly
        this.processQueue();
      }
    }
  }
}

// Exporting a singleton instance so the entire Next.js app uses the same queue
export const pdfQueue = new PDFQueueMatrix();