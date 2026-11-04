import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store-context';
import { ToastProvider } from '@/components/ui';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Threadly - CRM Fashion UMKM Indonesia',
  description: 'Kenali pelangganmu, ajak mereka kembali. CRM terpadu untuk butik, thrift, dan brand fashion lokal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-ivory-100 dark:bg-navy-950 text-navy-900 dark:text-ivory-100 antialiased selection:bg-violet-500 selection:text-white">
        <ToastProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
