import './globals.css'
import { ToastProvider } from '../components/ui/toast'

export const metadata = { title: 'KitchenSync', description: 'Pedidos em tempo real' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>
        <ToastProvider>
          <div className="min-h-screen max-w-6xl mx-auto p-4">{children}</div>
        </ToastProvider>
      </body>
    </html>
  )
}
