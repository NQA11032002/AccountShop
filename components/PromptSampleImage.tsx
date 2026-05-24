"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { promptImageReferrerPolicy, resolvePromptImageUrl } from "@/lib/api";

type PromptSampleImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

export default function PromptSampleImage({
  src,
  alt,
  className,
  loading = "lazy",
}: PromptSampleImageProps) {
  const resolved = resolvePromptImageUrl(src);
  const [failed, setFailed] = useState(false);

  if (!resolved || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-slate-200 text-slate-400 ${className ?? ""}`}
        aria-hidden={!alt}
      >
        <ImageIcon className="h-8 w-8 opacity-60" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- ảnh mẫu từ upload hoặc link ngoài
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading={loading}
      referrerPolicy={promptImageReferrerPolicy(resolved)}
      onError={() => setFailed(true)}
    />
  );
}
