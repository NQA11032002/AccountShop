'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to help with debugging
    console.error('🚨 Global error caught:', error);
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled promise rejection:', event.reason);
      event.preventDefault(); // Prevent default error logging
      
      // Optionally show user-friendly error message
      console.log('📋 Handled unhandled promise rejection gracefully');
    };

    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Unhandled error:', event.error);
      event.preventDefault(); // Prevent default error logging
    };

    // Add global error handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đã xảy ra lỗi
            </h2>
            <p className="text-gray-600 mb-6">
              Có lỗi không mong muốn xảy ra. Chúng tôi đã ghi nhận và sẽ khắc phục sớm nhất.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={reset}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Thử lại
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}