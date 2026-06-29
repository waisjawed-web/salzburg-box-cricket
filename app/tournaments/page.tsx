import { Trophy } from "lucide-react";
import { ButtonLink } from "@/components/button";
import { SectionHeading } from "@/components/section-heading";
import { matches, tournaments } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

export default function TournamentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Tournaments" title="Register your team and follow the match schedule." />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {tournaments.map((tournament) => (
          <article key={tournament.id} className="surface rounded-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <Trophy className="text-lime" />
              <span className="rounded-md bg-turf px-3 py-1 text-xs font-black text-pitch">{tournament.status}</span>
            </div>
            <h2 className="mt-5 font-[var(--font-display)] text-3xl font-black text-white">{tournament.name}</h2>
            <p className="mt-3 text-slate-300">{tournament.date} · Entry {formatEuro(tournament.entryFee)}</p>
            <p className="mt-2 text-sm text-slate-400">{tournament.teams}/{tournament.maxTeams} teams registered</p>
            <ButtonLink href="/login" className="mt-6">Register team</ButtonLink>
          </article>
        ))}
      </div>

      <section className="surface mt-10 rounded-lg p-6">
        <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Match schedule</h2>
        <div className="mt-5 divide-y divide-white/10">
          {matches.map((match) => (
            <div key={`${match.time}-${match.teams}`} className="grid gap-2 py-4 md:grid-cols-4">
              <p className="font-bold text-lime">{match.time}</p>
              <p className="text-slate-300">{match.court}</p>
              <p className="font-bold text-white md:col-span-2">{match.teams}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
