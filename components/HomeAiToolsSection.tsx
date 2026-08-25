import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AI_TOOLS } from "@/data/ai-tools";
import AiToolLogo from "@/components/AiToolLogo";

const featuredTools = AI_TOOLS.slice(0, 12);

export default function HomeAiToolsSection() {
  return (
    <section className="section-padding py-14 sm:py-20" aria-labelledby="home-ai-tools-title">
      <div className="container-max">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="home-ai-tools-title"
            className="text-3xl font-bold tracking-tight text-brand-charcoal sm:text-4xl"
          >
            Công Cụ AI Tôi Sử Dụng
          </h2>
          <p className="mt-3 text-base text-brand-gray/80 sm:text-lg">
            Những công cụ AI mình đang dùng thực tế cho việc tạo nội dung, tự động hóa và phát triển.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-violet-200/80 bg-white/75 p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg"
            >
              <AiToolLogo tool={tool} className="h-12 w-12" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-brand-charcoal">{tool.name}</span>
                <span className="mt-1 block line-clamp-2 text-sm text-brand-gray/70">
                  {tool.useCase}
                </span>
              </span>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-brand-gray/50 transition-colors group-hover:text-brand-blue"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/cong-cu-ai"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-6 py-3 text-sm font-semibold text-brand-charcoal shadow-sm transition-colors hover:border-brand-blue hover:text-brand-blue"
          >
            Xem tất cả {AI_TOOLS.length} công cụ
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
