"use client";

import { useMemo, useState } from "react";
import { Bot } from "lucide-react";
import type { AiTool } from "@/data/ai-tools";
import { getAiToolLogoSources } from "@/data/ai-tools";
import { cn } from "@/lib/utils";

type AiToolLogoProps = {
  tool: AiTool;
  className?: string;
  imgClassName?: string;
};

export default function AiToolLogo({ tool, className, imgClassName }: AiToolLogoProps) {
  const sources = useMemo(() => getAiToolLogoSources(tool), [tool]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const exhausted = sourceIndex >= sources.length;
  const src = exhausted ? "" : sources[sourceIndex];

  if (exhausted || !src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-white ring-1 ring-violet-200/80 shadow-sm",
          className
        )}
        aria-hidden
      >
        <Bot className="h-6 w-6 text-violet-400" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-1.5 ring-1 ring-violet-200/80 shadow-sm",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- logo từ CDN / favicon bên ngoài */}
      <img
        key={src}
        src={src}
        alt=""
        aria-hidden
        className={cn("h-full w-full object-contain", imgClassName)}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setSourceIndex((i) => i + 1)}
      />
    </div>
  );
}
