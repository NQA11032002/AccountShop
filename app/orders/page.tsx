"use client";

import { Suspense } from 'react';
import AccountOrdersDisplay from '@/components/AccountOrdersDisplay';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OrdersPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Header />

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 mt-16 sm:mt-20">
        {/* Page Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4 px-2">
            Đơn hàng của tôi
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Theo dõi và quản lý tất cả đơn hàng của bạn. Xem chi tiết sản phẩm đã mua và tài khoản đã nhận.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 px-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Về trang chủ</span>
              </Button>
            </Link>

            <Link href="/products" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Mua thêm sản phẩm
              </Button>
            </Link>
          </div>
        </div>

        {/* Orders Display */}
        <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
          <Suspense fallback={<OrdersLoadingSkeleton />}>
            <AccountOrdersDisplay />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OrdersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Statistics Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Loading */}
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}