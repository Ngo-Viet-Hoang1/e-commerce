import puppeteer from 'puppeteer'
import { generateInvoiceHTML, type InvoiceData } from './invoice.template'

class InvoiceService {
  async generatePDF(data: InvoiceData): Promise<Buffer> {
    const html = generateInvoiceHTML(data)

    let browser

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
    } catch {
      browser = await puppeteer.launch({
        headless: true,
        executablePath:
          process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      })
    }

    try {
      const page = await browser.newPage()

      await page.setContent(html, { waitUntil: 'networkidle0' })

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      })

      return pdfBuffer
    } finally {
      await browser.close()
    }
  }
}

export const invoiceService = new InvoiceService()
