import type { ReactNode } from 'react';
import './discovery.css';

export default function DiscoveryShell({ children }: { children: ReactNode }) {
  return <div className="discovery-page relative min-h-screen min-w-0 bg-[#fafbff] text-slate-900">{children}</div>;
}
