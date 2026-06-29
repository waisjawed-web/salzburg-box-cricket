import { Activity, CalendarCheck, Trophy, Users } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";
import { courts, matches, pricingPlans, tournaments } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,17,11,0.7),rgba(7,17,11,0.15)),url('https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1800&auto=format&fit=crop')] bg-cover bg-center opacity-80" />
        <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-lime">Indoor cricket in Salzburg</p>
            <h1 className="mt-5 font-[var(--font-display)] text-5xl font-black leading-none text-white sm:text-7xl lg:text-8xl">
              Salzburg Box Cricket
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-100">
              Book high-quality indoor nets and match courts, join tournaments, and train under bright lights all year.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/booking">
                <CalendarCheck size={18} />
                Book a court
              </ButtonLink>
              <ButtonLink href="/tournaments" variant="secondary">
                <Trophy size={18} />
                Join tournament
              </ButtonLink>
            </div>
          </div>
          <div className="mt-14 grid gap-3 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className="surface rounded-lg p-4">
                <p className="font-bold text-white">{plan.name}</p>
                <p className="mt-1 text-2xl font-black text-lime">{plan.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Courts"
          title="Nets for practice, a full box for match night."
          copy="Choose a focused training lane or bring your squad for a fast 6v6 session."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {courts.map((court) => (
            <article key={court.id} className="surface rounded-lg p-6">
              <Activity className="text-lime" />
              <h3 className="mt-5 font-[var(--font-display)] text-2xl font-black text-white">{court.name}</h3>
              <p className="mt-3 min-h-16 text-sm leading-6 text-slate-300">{court.description}</p>
              <p className="mt-5 text-xl font-black text-white">{formatEuro(court.hourlyRate)} / hour</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading eyebrow="Fixtures" title="Tonight at the facility" />
            <div className="mt-6 space-y-3">
              {matches.map((match) => (
                <div key={`${match.time}-${match.teams}`} className="surface rounded-lg p-4">
                  <p className="text-sm font-bold text-lime">{match.time} · {match.court}</p>
                  <p className="mt-1 font-bold text-white">{match.teams}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Tournaments" title="Build your team and enter the next cup." />
            <div className="mt-6 space-y-3">
              {tournaments.map((tournament) => (
                <div key={tournament.id} className="surface rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-bold text-white">{tournament.name}</p>
                    <span className="rounded-md bg-turf px-2.5 py-1 text-xs font-black text-pitch">{tournament.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{tournament.teams}/{tournament.maxTeams} teams registered</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="surface flex flex-col items-start justify-between gap-6 rounded-lg p-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-lime">Ready to play?</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl font-black text-white">Reserve your next box cricket session.</h2>
          </div>
          <ButtonLink href="/booking">
            <Users size={18} />
            Start booking
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
