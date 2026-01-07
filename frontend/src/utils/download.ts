/**
 * Download a blob as a file
 */
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Generate PDF filename for order
 */
export const generateOrderPDFFilename = (orderId: number) => {
  const date = new Date().toISOString().split('T')[0]
  return `Don-hang-${orderId}_${date}.pdf`
}
