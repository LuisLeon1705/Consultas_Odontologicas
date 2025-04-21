import { Sidebar } from "@/components/sidebar"
import type React from "react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>Sistema Odontológico</title>
        <meta name="description" content="Sistema de gestión odontológica" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
      <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
