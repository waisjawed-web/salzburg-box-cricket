import { SectionHeading } from "@/components/section-heading";
import { pricingPlans } from "@/lib/data";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Pricing" title="Simple rates for practice, matches, and team nights." />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <article key={plan.name} className="surface rounded-lg p-6">
            <h2 className="font-[var(--font-display)] text-2xl font-black text-white">{plan.name}</h2>
            <p className="mt-4 text-3xl font-black text-lime">{plan.price}</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">{plan.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
