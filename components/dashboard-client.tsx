"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, CreditCard, Trophy } from "lucide-react";
import { StatCard } from "@/components/stat-card";

type User = {
  name: string;
  email: string;
  role: string;
};

type LocalBooking = {
  id: string;
  courtName: string;
  date: string;
  time: string;
  amount: number;
  status: string;
};

export function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [booking, setBooking] = useState<LocalBooking | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("sbc:user");
    const savedBooking = localStorage.getItem("sbc:lastBooking");
    setUser(savedUser ? JSON.parse(savedUser) : { name: "Demo Player", email: "player@example.com", role: "USER" });
    setBooking(savedBooking ? JSON.parse(savedBooking) : null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-lime">Player dashboard</p>
      <h1 className="mt-3 font-[var(--font-display)] text-4xl font-black text-white">Welcome, {user?.name ?? "Player"}</h1>
      <p className="mt-3 text-slate-300">{user?.email}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Upcoming bookings" value={booking ? "1" : "0"} icon={<CalendarCheck size={20} />} />
        <StatCard label="Payments" value={booking ? "Paid" : "None"} icon={<CreditCard size={20} />} />
        <StatCard label="Tournament teams" value="0" icon={<Trophy size={20} />} />
      </div>

      <section className="surface mt-8 rounded-lg p-6">
        <h2 className="font-[var(--font-display)] text-2xl font-black text-white">Latest booking</h2>
        {booking ? (
          <div className="mt-5 grid gap-4 rounded-lg border border-white/10 bg-white/5 p-4 md:grid-cols-5">
            <p><span className="block text-xs text-slate-400">ID</span><span className="font-bold text-white">{booking.id}</span></p>
            <p><span className="block text-xs text-slate-400">Court</span><span className="font-bold text-white">{booking.courtName}</span></p>
            <p><span className="block text-xs text-slate-400">Date</span><span className="font-bold text-white">{booking.date}</span></p>
            <p><span className="block text-xs text-slate-400">Time</span><span className="font-bold text-white">{booking.time}</span></p>
            <p><span className="block text-xs text-slate-400">Status</span><span className="font-bold text-lime">{booking.status}</span></p>
          </div>
        ) : (
          <p className="mt-4 text-slate-300">No booking yet. Reserve a slot to see it here.</p>
        )}
      </section>
    </div>
  );
}
