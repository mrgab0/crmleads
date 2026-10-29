import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Lead Softphone',
  description: 'Softphone profesional con WhatsApp integrado',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: '14px' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
