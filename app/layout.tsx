import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PaymentProvider } from '@/contexts/PaymentContext';
import { WalletProvider } from '@/contexts/WalletContext';
import DataSyncManager from '@/components/DataSyncManager';
import NavigationManager from '@/components/NavigationManager';
import CoinsSync from '@/components/CoinsSync';
import Zalo from '@/components/Zalo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'QAI STORE - Cung cấp giải pháp uy tín',
  description: 'Cung cấp các gói giải pháp, hỗ trợ nhanh chóng, xử lý tự động 24/7. Quy trình rõ ràng, cam kết minh bạch.',
  keywords: 'giải pháp, gói giải pháp, phần mềm, khóa học, gói nâng cấp, shop uy tín, bảo hành, xử lý tự động',
  authors: [{ name: 'QAI STORE' }],
  icons: {
    icon: [
      { url: '/favicon.png' },
    ],
    apple: [
      { url: '/images/logo.png' },
    ],
  },
  openGraph: {
    title: 'QAI STORE - Cung cấp giải pháp uy tín',
    description: 'Cung cấp các gói giải pháp, hỗ trợ nhanh chóng, xử lý tự động 24/7. Quy trình rõ ràng, cam kết minh bạch.',
    type: 'website',
    locale: 'vi_VN',
    images: [
      {
        url: '/images/logo.png',
        width: 512,
        height: 512,
        alt: 'QAI STORE',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <PaymentProvider>
                  <WalletProvider>
                    {/* <AdminProvider> */}
                    <DataSyncManager />
                    <NavigationManager />
                    <CoinsSync />
                    {children}
                    <Zalo />
                    <Toaster />
                    {/* </AdminProvider> */}
                  </WalletProvider>
                </PaymentProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>

        {/* Global error handling script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global error handlers to prevent unhandled rejections
              window.addEventListener('unhandledrejection', function(event) {
                console.warn('🚨 Unhandled promise rejection caught and handled:', event.reason);
                event.preventDefault(); // Prevent default error logging
              });
              
              window.addEventListener('error', function(event) {
                console.warn('🚨 Global error caught and handled:', event.error);
                event.preventDefault(); // Prevent default error logging
              });
            `,
          }}
        />
      </body>
    </html >
  );
}