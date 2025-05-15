import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Markdown Editor',
  description: 'A simple markdown editor for notes.',
  generator: '0xrakesh',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
