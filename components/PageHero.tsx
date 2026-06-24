import { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PageHeroProps = {
  badge: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  align?: "center" | "left";
  className?: string;
};

export default function PageHero({
  badge,
  title,
  description,
  children,
  align = "center",
  className = "",
}: PageHeroProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <section className={`section-spacing-home pb-12 sm:pb-14 lg:pb-16 ${className}`}>
      <div className="container-max section-padding">
        <div className={`mx-auto max-w-4xl ${alignClass}`}>
          <Badge className="mb-4 border-brand-blue/20 bg-brand-blue/10 text-brand-blue">
            <Sparkles className="mr-1 h-3 w-3" />
            {badge}
          </Badge>
          <h1 className="text-3xl font-bold leading-snug tracking-tight text-brand-charcoal sm:text-4xl md:text-5xl [&_.gradient-text]:mt-2 [&_.gradient-text]:block [&_.gradient-text]:pb-2">
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-5 max-w-3xl text-base leading-relaxed text-brand-gray/80 sm:text-lg ${
                align === "center" ? "mx-auto" : ""
              }`}
            >
              {description}
            </p>
          ) : null}
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
