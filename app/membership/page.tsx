import { Check } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";
import { membershipPlans } from "@/lib/data";

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Membership" title="Train more often with member pricing and priority slots." />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {membershipPlans.map((plan) => (
          <article key={plan.name} className="surface rounded-lg p-6">
            <h2 className="font-[var(--font-display)] text-3xl font-black text-white">{plan.name}</h2>
            <p className="mt-4 text-3xl font-black text-lime">{plan.price}</p>
            <ul className="mt-6 space-y-3">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={17} className="text-lime" />
                  {perk}
                </li>
              ))}
            </ul>
            <ButtonLink href="/login" className="mt-7 w-full">Choose plan</ButtonLink>
          </article>
        ))}
      </div>
    </div>
  );
}
