"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ProductBase, useProducts } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { X } from "lucide-react";

const PRODUCT_IMAGE_BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.taikhoangpremium.shop";

function getProductImageSrc(image?: string | null): string {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  const filename = image.includes("/") ? image.split("/").pop() : image;
  return filename ? `${PRODUCT_IMAGE_BASE}/images/products/${filename}` : "";
}

type RandomPurchaseNotificationProps = {
  // Danh sách sản phẩm đã có sẵn; nếu không truyền sẽ tự fetch
  products?: ProductBase[];
};

type NotificationState = {
  product: ProductBase | null;
  visible: boolean;
};

function getRandomDelayMs() {
  // Random từ 5s đến 60s
  const min = 5000;
  const max = 60000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function RandomPurchaseNotification({
  products: externalProducts,
}: RandomPurchaseNotificationProps) {
  const { products: fetchedProducts } = useProducts();
  const products = (externalProducts && externalProducts.length > 0
    ? externalProducts
    : fetchedProducts
  ).filter((p) => p && p.status === "active" && p.in_stock);

  const [state, setState] = useState<NotificationState>({
    product: null,
    visible: false,
  });

  useEffect(() => {
    if (!products || products.length === 0) return;

    let showTimeout: number | undefined;
    let hideTimeout: number | undefined;

    const scheduleNext = () => {
      const delay = getRandomDelayMs();
      showTimeout = window.setTimeout(() => {
        if (!products || products.length === 0) {
          scheduleNext();
          return;
        }
        const randomIndex = Math.floor(Math.random() * products.length);
        const product = products[randomIndex];

        setState({ product, visible: true });

        // Tự ẩn sau 6s rồi đặt lịch lần tiếp theo
        hideTimeout = window.setTimeout(() => {
          setState((prev) => ({ ...prev, visible: false }));
          scheduleNext();
        }, 6000);
      }, delay);
    };

    scheduleNext();

    return () => {
      if (showTimeout) window.clearTimeout(showTimeout);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  if (!state.visible || !state.product) return null;

  const product = state.product;

  return (
    <div className="fixed left-4 bottom-6 z-40 max-w-xs sm:max-w-sm drop-shadow-xl">
      <div className="flex gap-3 rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg p-3 sm:p-4">
        <div className="relative h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
          {getProductImageSrc(product.image) ? (
            <Image
              src={getProductImageSrc(product.image)}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized={PRODUCT_IMAGE_BASE.startsWith("http")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
              {product.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">Hoạt động gần đây</p>
          <p className="text-sm font-semibold text-gray-900">
            Một khách hàng vừa thêm{" "}
            <span className="text-indigo-600">{product.name}</span> vào giỏ hàng
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-600">
            {formatPrice(product.price)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setState((prev) => ({ ...prev, visible: false }))}
          className="ml-1 mt-1 h-6 w-6 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

