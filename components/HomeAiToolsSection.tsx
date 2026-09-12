import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { AI_TOOLS } from "@/data/ai-tools";
import AiToolLogo from "@/components/AiToolLogo";

const featuredIds = ['chatgpt', 'claude', 'midjourney', 'runway', 'suno', 'cursor', 'notebooklm', 'n8n', 'meshy', 'deepl', 'julius', 'khanmigo'];
const featuredTools = featuredIds.flatMap((id) => AI_TOOLS.filter((tool) => tool.id === id));

export default function HomeAiToolsSection() {
  return (
    <section className="section-padding py-10 sm:py-14" aria-labelledby="home-ai-tools-title">
      <div className="container-max relative overflow-hidden rounded-[2rem] bg-[#11132b] p-5 sm:p-10 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-violet-300">BỘ CÔNG CỤ CHO Ý TƯỞNG LỚN</p>
          <h2
            id="home-ai-tools-title"
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            Thêm công cụ. Mở rộng khả năng.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Khám phá công cụ AI cho sáng tạo, học tập, phân tích dữ liệu và tự động hóa công việc.
          </p>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool) => (
            <a
              key={tool.id}
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="home-tool-card group flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-[transform,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/[0.09]"
            >
              <AiToolLogo tool={tool} className="h-12 w-12" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">{tool.name}</span>
                <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400">
                  {tool.useCase}
                </span>
              </span>
              <ExternalLink
                className="h-4 w-4 shrink-0 text-slate-500 transition-colors group-hover:text-violet-300"
                aria-hidden="true"
              />
            </a>
          ))}
        </div>

        <div className="relative mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-400">Tìm công cụ phù hợp với cách bạn làm việc.</p>
          <Link
            href="/cong-cu-ai"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-violet-100"
          >
            Xem tất cả {AI_TOOLS.length} công cụ
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
