import { Banknote, CalendarClock, CircleDollarSign, Landmark, Trophy, Users } from "lucide-react";
import { Button } from "@/components/button";
import { StatCard } from "@/components/stat-card";
import { bookings, courts, tournaments } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

export default function AdminPage() {
  const revenue = bookings.reduce((sum, booking) => sum + booking.amount, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-lime">Admin dashboard</p>
      <h1 className="mt-3 font-[var(--font-display)] text-4xl font-black text-white">Facility control room</h1>
      <p className="mt-3 max-w-3xl text-slate-300">
        Manage bookings, prices, courts, customers, tournaments, and payments from one operational view.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard label="Bookings" value={bookings.length.toString()} icon={<CalendarClock size={20} />} />
        <StatCard label="Revenue" value={formatEuro(revenue)} icon={<CircleDollarSign size={20} />} />
        <StatCard label="Courts" value={courts.length.toString()} icon={<Landmark size={20} />} />
        <StatCard label="Tournaments" value={tournaments.length.toString()} icon={<Trophy size={20} />} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="surface rounded-lg p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Booking approvals</h2>
            <Button variant="secondary">Export CSV</Button>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-slate-400">
                <tr className="border-b border-white/10">
                  <th className="py-3 pr-4">Booking</th>
                  <th className="py-3 pr-4">Customer</th>
                  <th className="py-3 pr-4">Court</th>
                  <th className="py-3 pr-4">Date</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/10 text-slate-300">
                    <td className="py-4 pr-4 font-bold text-white">{booking.id}</td>
                    <td className="py-4 pr-4">
                      <span className="block font-bold text-white">{booking.customerName}</span>
                      <span className="text-xs text-slate-400">{booking.customerEmail}</span>
                    </td>
                    <td className="py-4 pr-4">{booking.courtName}</td>
                    <td className="py-4 pr-4">{booking.date} · {booking.time}</td>
                    <td className="py-4 pr-4">
                      <span className="rounded-md border border-turf/40 bg-turf/10 px-2 py-1 text-xs font-bold text-lime">{booking.status}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex gap-2">
                        <Button className="min-h-9 px-3 py-1 text-xs">Approve</Button>
                        <Button variant="secondary" className="min-h-9 px-3 py-1 text-xs">Cancel</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="surface rounded-lg p-6">
            <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Court prices</h2>
            <div className="mt-5 space-y-3">
              {courts.map((court) => (
                <div key={court.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="font-bold text-white">{court.name}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input className="field h-11" defaultValue={court.hourlyRate} aria-label={`${court.name} price`} />
                    <Button variant="secondary" className="h-11 px-3">Save</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="surface rounded-lg p-6">
            <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Tournament setup</h2>
            <div className="mt-5 space-y-3">
              <input className="field" placeholder="Tournament name" />
              <input className="field" type="date" />
              <input className="field" placeholder="Max teams" type="number" />
              <Button className="w-full">
                <Users size={18} />
                Create tournament
              </Button>
            </div>
          </section>

          <section className="surface rounded-lg p-6">
            <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Payments</h2>
            <div className="mt-5 flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <Banknote className="text-lime" />
              <div>
                <p className="font-bold text-white">Stripe checkout enabled</p>
                <p className="text-sm text-slate-400">Bookings open Stripe checkout and are marked paid by the Stripe webhook.</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
