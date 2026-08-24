import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

/**
 * Chuyển văn bản có **in đậm** thành React nodes (giữ nguyên xuống dòng).
 */
export function formatRichTextToNodes(text: string): ReactNode[] {
  if (!text) return [];

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const re = new RegExp(BOLD_PATTERN.source, "g");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</Fragment>
      );
    }
    nodes.push(
      <strong key={`b-${key++}`} className="font-semibold text-brand-charcoal">
        {match[1]}
      </strong>
    );
    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex)}</Fragment>);
  }

  return nodes.length > 0 ? nodes : [text];
}

type RichTextProps = {
  text: string;
  className?: string;
  as?: "p" | "div" | "span";
};

export function RichText({ text, className, as: Tag = "p" }: RichTextProps) {
  return (
    <Tag
      className={cn(
        "min-w-0 max-w-full whitespace-pre-line break-words [overflow-wrap:anywhere]",
        className
      )}
    >
      {formatRichTextToNodes(text)}
    </Tag>
  );
}
