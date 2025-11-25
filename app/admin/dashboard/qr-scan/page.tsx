'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { QrCode, Download, ExternalLink } from 'lucide-react'

export default function QRScanPage() {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://qr-nextjs-da4a.vercel.app'
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(frontendUrl)}`

  const handleDownloadQR = () => {
    // Helper function to draw rounded rectangle
    const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    // Create a canvas to draw the styled QR code
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size (larger for better quality)
    const cardPadding = 80
    const qrSize = 512
    const messageHeight = 80
    const cornerSize = 80
    canvas.width = qrSize + (cardPadding * 2)
    canvas.height = qrSize + (cardPadding * 2) + messageHeight + 40

    // Draw gradient background (purple to pink)
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    bgGradient.addColorStop(0, '#f3e8ff') // purple-50
    bgGradient.addColorStop(1, '#fce7f3') // pink-50
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw white card background
    const cardX = cardPadding / 2
    const cardY = cardPadding / 2
    const cardWidth = qrSize + cardPadding
    const cardHeight = qrSize + cardPadding + messageHeight + 40
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 24)
    ctx.fill()

    // Draw shadow effect (simulated with darker border)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.lineWidth = 2
    roundRect(ctx, cardX + 1, cardY + 1, cardWidth, cardHeight, 24)
    ctx.stroke()

    // Draw decorative corner elements
    const cornerGradient1 = ctx.createLinearGradient(cardX, cardY, cardX + cornerSize, cardY + cornerSize)
    cornerGradient1.addColorStop(0, 'rgba(168, 85, 247, 0.2)') // purple-400/20
    cornerGradient1.addColorStop(1, 'transparent')
    ctx.fillStyle = cornerGradient1
    ctx.beginPath()
    ctx.arc(cardX, cardY, cornerSize, 0, Math.PI / 2)
    ctx.fill()

    const cornerGradient2 = ctx.createLinearGradient(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - cornerSize, cardY + cardHeight - cornerSize)
    cornerGradient2.addColorStop(0, 'rgba(236, 72, 153, 0.2)') // pink-400/20
    cornerGradient2.addColorStop(1, 'transparent')
    ctx.fillStyle = cornerGradient2
    ctx.beginPath()
    ctx.arc(cardX + cardWidth, cardY + cardHeight, cornerSize, Math.PI, Math.PI * 1.5)
    ctx.fill()

    // Draw white inner card for QR code
    const innerPadding = 32
    const innerX = cardX + innerPadding
    const innerY = cardY + innerPadding
    const innerSize = qrSize
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, innerX, innerY, innerSize, innerSize, 12)
    ctx.fill()

    // Inner card shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.lineWidth = 1
    roundRect(ctx, innerX, innerY, innerSize, innerSize, 12)
    ctx.stroke()

    // Load and draw QR code image
    const qrImage = new Image()
    qrImage.crossOrigin = 'anonymous'
    qrImage.onload = () => {
      // Draw QR code
      ctx.drawImage(qrImage, innerX + 16, innerY + 16, innerSize - 32, innerSize - 32)

      // Draw message badge
      const messageY = innerY + innerSize + 24
      const messageWidth = 280
      const messageX = cardX + (cardWidth - messageWidth) / 2
      const badgeHeight = 48

      // Gradient for message badge
      const messageGradient = ctx.createLinearGradient(messageX, messageY, messageX + messageWidth, messageY)
      messageGradient.addColorStop(0, '#9333ea') // purple-600
      messageGradient.addColorStop(0.5, '#ec4899') // pink-600
      messageGradient.addColorStop(1, '#9333ea') // purple-600
      ctx.fillStyle = messageGradient
      roundRect(ctx, messageX, messageY, messageWidth, badgeHeight, 24)
      ctx.fill()

      // Draw QR icon (simple square representation)
      const iconSize = 18
      const iconX = messageX + 20
      const iconY = messageY + (badgeHeight - iconSize) / 2
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(iconX, iconY, iconSize, iconSize)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.strokeRect(iconX + 4, iconY + 4, iconSize - 8, iconSize - 8)
      ctx.fillRect(iconX + 6, iconY + 6, 2, 2)
      ctx.fillRect(iconX + iconSize - 8, iconY + 6, 2, 2)
      ctx.fillRect(iconX + 6, iconY + iconSize - 8, 2, 2)

      // Draw text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('Scan to get the report !!', iconX + iconSize + 12, messageY + badgeHeight / 2)

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'qr-code-report.png'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
      }, 'image/png')
    }
    qrImage.onerror = () => {
      alert('Failed to load QR code image. Please try again.')
    }
    qrImage.src = qrCodeUrl
  }

  return (
    <div>
      <Breadcrumb items={[{ label: 'QR Scan' }]} />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-xl shadow-lg shadow-purple-500/50">
            <QrCode className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Download Report QR Code</h1>
            <p className="text-slate-600">Scan or download QR code to download the report!!!</p>
          </div>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* QR Code */}
          <div className="flex-shrink-0">
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8 rounded-2xl border-2 border-purple-200 shadow-lg relative overflow-hidden">
              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-transparent rounded-br-full"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-pink-400/20 to-transparent rounded-tl-full"></div>

              {/* QR Code Image */}
              <div className="relative z-10 bg-white p-4 rounded-xl shadow-md">
                <img
                  src={qrCodeUrl}
                  alt="Frontend QR Code"
                  className="w-64 h-64 rounded-lg"
                />
              </div>

              {/* Bottom Message */}
              <div className="relative z-10 mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-full shadow-md">
                  <QrCode size={18} />
                  <span className="font-semibold text-sm">Scan to get the report !!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details and Actions */}
          <div className="flex-1 w-full md:w-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Download Report QR Code</h2>
            <p className="text-slate-600 mb-6">
              Scan this QR code with any QR code scanner to access the report form directly.
              You can also download the QR code image for printing or sharing.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={frontendUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all duration-200 shadow-md shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-600/50 font-medium"
              >
                <ExternalLink size={20} />
                Open Report form
              </a>
              <button
                onClick={handleDownloadQR}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                <Download size={20} />
                Download QR Code
              </button>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}

