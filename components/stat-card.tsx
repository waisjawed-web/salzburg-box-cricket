import type { ReactNode } from "react";

export function StatCard({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="surface rounded-lg p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-turf/12 text-lime">{icon}</span>
      </div>
      <p className="mt-4 font-[var(--font-display)] text-3xl font-black text-white">{value}</p>
    </div>
  );
}
