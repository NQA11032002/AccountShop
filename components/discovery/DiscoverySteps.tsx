import { ArrowUpRight } from 'lucide-react';

export default function DiscoverySteps({ steps }: { steps: { title: string; description: string }[] }) {
  return <div className="discovery-steps grid gap-3 sm:grid-cols-3">{steps.map((step, index) => <div key={step.title} className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 font-mono text-xs font-semibold text-violet-600">0{index + 1}</span><div className="min-w-0"><p className="text-sm font-bold text-slate-800">{step.title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p></div><ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-slate-300" aria-hidden="true" /></div>)}</div>;
}
