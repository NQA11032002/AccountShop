"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, Wallet, ArrowRight, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { checkRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CollaboratorPage() {
  const router = useRouter();
  const { user, sessionId } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const fetchRoleAndRedirect = async () => {
      if (!sessionId) {
        setIsCheckingRole(false);
        return;
      }
      try {
        const roleData = await checkRole(sessionId);
        if (roleData.role !== "collaborator") {
          router.replace("/");
          return;
        }
        setIsAuthorized(true);
      } catch {
        router.replace("/login");
      } finally {
        setIsCheckingRole(false);
      }
    };

    fetchRoleAndRedirect();
  }, [sessionId, router]);

  if (!user) {
    return null;
  }

  if (isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Đang kiểm tra quyền truy cập...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50">
      <div className="container-max section-padding py-8 sm:py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Kênh Cộng tác viên
            </h1>
            <p className="text-gray-600 mt-1">
              Xin chào, {user.name || user.email}. Bạn có thể mua hàng với tư cách cộng tác viên.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  Sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Xem danh mục và chọn sản phẩm để mua.
                </p>
                <Button asChild variant="default" className="w-full sm:w-auto">
                  <Link href="/collaborator/products" className="inline-flex items-center gap-2">
                    Xem sản phẩm (giá CTV)
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  Ví của tôi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Nạp tiền và quản lý số dư ví.
                </p>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href="/wallet" className="inline-flex items-center gap-2">
                    Vào ví
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
                Đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Theo dõi đơn hàng đã đặt.
              </p>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/orders" className="inline-flex items-center gap-2">
                  Xem đơn hàng
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button asChild variant="ghost" size="sm" className="text-gray-600">
              <Link href="/" className="inline-flex items-center gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
