import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { PaymentProvider } from '@/contexts/PaymentContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { AdminProvider } from '@/contexts/AdminContext';
import DataSyncManager from '@/components/DataSyncManager';
import NavigationManager from '@/components/NavigationManager';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'QAI STORE - Shop Tài Khoản Premium Uy Tín',
  description: 'Mua tài khoản Netflix, Spotify, ChatGPT Plus, YouTube Premium với giá tốt nhất. Bảo hành uy tín, giao hàng tự động 24/7.',
  keywords: 'tài khoản premium, netflix, spotify, chatgpt plus, youtube premium, canva pro, adobe creative',
  authors: [{ name: 'QAI STORE' }],
  openGraph: {
    title: 'QAI STORE - Shop Tài Khoản Premium Uy Tín',
    description: 'Mua tài khoản Netflix, Spotify, ChatGPT Plus, YouTube Premium với giá tốt nhất. Bảo hành uy tín, giao hàng tự động 24/7.',
    type: 'website',
    locale: 'vi_VN',
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
                    <AdminProvider>
                      <DataSyncManager />
                      <NavigationManager />
                      {children}
                      <Toaster />
                    </AdminProvider>
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
    </html>
  );
}