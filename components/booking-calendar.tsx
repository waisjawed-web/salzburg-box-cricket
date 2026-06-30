"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/button";
import { courts, slots } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

type CheckoutState = "idle" | "loading" | "error";

export function BookingCalendar() {
  const [selectedCourt, setSelectedCourt] = useState(courts[0].id);
  const [date, setDate] = useState("2026-07-03");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");

  const court = courts.find((item) => item.id === selectedCourt) ?? courts[0];
  const courtSlots = useMemo(() => slots.filter((slot) => slot.courtId === selectedCourt), [selectedCourt]);
  const slot = courtSlots.find((item) => item.time === selectedSlot);

  async function startCheckout() {
    if (!slot) return;

    setCheckoutState("loading");
    setMessage("");

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId: selectedCourt,
        date,
        time: slot.time
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setCheckoutState("error");
      setMessage(data.error || "Checkout could not start. Please try again.");
      return;
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    setCheckoutState("error");
    setMessage("Stripe did not return a checkout link. Please try again.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="surface rounded-lg p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-lime">Booking calendar</p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl font-black text-white sm:text-4xl">Reserve a court</h1>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
            <CalendarDays size={17} />
            Live slots
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-300">Date</span>
            <input className="field" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span className="mb-2 block text-sm font-bold text-slate-300">Court</span>
            <select
              className="field"
              value={selectedCourt}
              onChange={(event) => {
                setSelectedCourt(event.target.value);
                setSelectedSlot(null);
                setMessage("");
              }}
            >
              {courts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {courtSlots.map((item) => {
            const active = selectedSlot === item.time;
            return (
              <button
                key={item.time}
                disabled={!item.available}
                onClick={() => {
                  setSelectedSlot(item.time);
                  setMessage("");
                }}
                className={[
                  "min-h-24 rounded-lg border p-4 text-left transition",
                  active ? "border-turf bg-turf/15 shadow-glow" : "border-white/10 bg-white/5 hover:border-turf/70",
                  !item.available ? "cursor-not-allowed opacity-45" : ""
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-bold text-white">{item.label}</span>
                  {item.available ? <CheckCircle2 className="text-lime" size={19} /> : <XCircle className="text-red-300" size={19} />}
                </span>
                <span className="mt-3 block text-sm text-slate-300">{item.available ? "Available" : "Unavailable"}</span>
                <span className="mt-1 block font-[var(--font-display)] text-xl font-black text-white">{formatEuro(item.price)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="surface rounded-lg p-5 sm:p-6">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-lime">Checkout</p>
        <h2 className="mt-2 font-[var(--font-display)] text-2xl font-black text-white">{court.name}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-300">{court.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {court.features.map((feature) => (
            <span key={feature} className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">
              {feature}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-pitch/70 p-4">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Date</span>
            <span>{date}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
            <span>Slot</span>
            <span>{slot?.label ?? "Select a slot"}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 font-bold text-white">
            <span>Total</span>
            <span>{slot ? formatEuro(slot.price) : "EUR 0"}</span>
          </div>
        </div>

        <Button className="mt-5 w-full" disabled={!slot || checkoutState === "loading"} onClick={startCheckout}>
          <CreditCard size={18} />
          {checkoutState === "loading" ? "Opening Stripe..." : "Pay with Stripe"}
        </Button>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
          <Lock className="mt-0.5 shrink-0 text-lime" size={14} />
          Secure card payment is handled by Stripe. Your booking is confirmed after payment succeeds.
        </p>

        {message ? (
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
            {message}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
