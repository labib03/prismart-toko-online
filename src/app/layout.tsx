import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-E4TRBE0D34';

export const metadata: Metadata = {
  title: 'Prismart - Modern E-Commerce Platform',
  description: 'Toko online belanja produk elektronik & aksesoris terbaik dengan harga terjangkau.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
        <AnalyticsProvider />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <p className="font-medium">
              &copy; {new Date().getFullYear()} Prismart E-Commerce. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
      <GoogleAnalytics gaId={gaId} />
    </html>
  );
}
