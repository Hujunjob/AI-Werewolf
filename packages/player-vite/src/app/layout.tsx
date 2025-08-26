import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Werewolf Player Manager',
  description: 'Configuration and management interface for AI Werewolf players',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold text-foreground">
                AI Werewolf Player Manager
              </h1>
              <p className="text-muted-foreground mt-2">
                配置和管理AI狼人杀玩家实例
              </p>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}