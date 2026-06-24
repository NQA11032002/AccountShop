import { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100/90">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-brand-blue/15 blur-3xl animate-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-72 -right-20 h-80 w-80 rounded-full bg-brand-emerald/15 blur-3xl [animation-duration:4s] animate-float"
      />
      {children}
    </div>
  );
}
