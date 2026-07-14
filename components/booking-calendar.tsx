"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, CreditCard, Lock, XCircle } from "lucide-react";
import { Button } from "@/components/button";
import { courts, slots } from "@/lib/data";
import { formatEuro } from "@/lib/utils";

type BookingSlot = (typeof slots)[number];
type CheckoutState = "idle" | "loading" | "error" | "success";

function getDefaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function BookingCalendar() {
  const [selectedCourt, setSelectedCourt] = useState(courts[0].id);
  const [date, setDate] = useState(getDefaultDate);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>(() => slots.filter((slot) => slot.courtId === courts[0].id));
  const [checkoutState, setCheckoutState] = useState<CheckoutState>("idle");
  const [message, setMessage] = useState("");

  const court = courts.find((item) => item.id === selectedCourt) ?? courts[0];
  const slot = availableSlots.find((item) => item.time === selectedSlot);
  const selectedSlotStillAvailable = slot?.available ?? false;

  const selectedSlotPrice = useMemo(() => {
    return slot ? formatEuro(slot.price) : "EUR 0";
  }, [slot]);

  async function refreshAvailability() {
    const fallbackSlots = slots.filter((item) => item.courtId === selectedCourt);

    try {
      const response = await fetch(`/api/bookings?courtId=${encodeURIComponent(selectedCourt)}&date=${encodeURIComponent(date)}`);
      const data = await response.json();
      const nextSlots = response.ok && Array.isArray(data.slots) ? data.slots : fallbackSlots;
      setAvailableSlots(nextSlots);

      if (selectedSlot && !nextSlots.some((item: BookingSlot) => item.time === selectedSlot && item.available)) {
        setSelectedSlot(null);
      }
    } catch {
      setAvailableSlots(fallbackSlots);
    }
  }

  useEffect(() => {
    setSelectedSlot(null);
    setMessage("");
    setCheckoutState("idle");
    refreshAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt, date]);

  async function reserveWithoutStripe() {
    if (!slot) return false;

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courtId: selectedCourt,
        date,
        time: slot.time,
        amount: slot.price
      })
    });

    const data = await response.json();

    if (!response.ok) {
      setCheckoutState("error");
      setMessage(data.error || "Booking could not be reserved. Please try another slot.");
      return false;
    }

    setCheckoutState("success");
    setMessage(data.message || "Booking reserved. Please pay at the venue.");
    setSelectedSlot(null);
    await refreshAvailability();
    return true;
  }

  async function startCheckout() {
    if (!slot || !selectedSlotStillAvailable) return;

    setCheckoutState("loading");
    setMessage("");

    try {
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

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      const canReserveAtVenue = response.status === 503 || String(data.error || "").toLowerCase().includes("stripe");
      if (canReserveAtVenue) {
        await reserveWithoutStripe();
        return;
      }

      setCheckoutState("error");
      setMessage(data.error || "Checkout could not start. Please try again.");
    } catch {
      await reserveWithoutStripe();
    }
  }

  const messageClass = checkoutState === "success"
    ? "border-turf/40 bg-turf/10 text-lime"
    : "border-red-400/30 bg-red-500/10 text-red-100";

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
          {availableSlots.map((item) => {
            const active = selectedSlot === item.time;
            return (
              <button
                key={item.time}
                disabled={!item.available}
                onClick={() => {
                  setSelectedSlot(item.time);
                  setCheckoutState("idle");
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
            <span>{selectedSlotPrice}</span>
          </div>
        </div>

        <Button className="mt-5 w-full" disabled={!slot || !selectedSlotStillAvailable || checkoutState === "loading"} onClick={startCheckout}>
          <CreditCard size={18} />
          {checkoutState === "loading" ? "Confirming..." : "Book this slot"}
        </Button>
        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
          <Lock className="mt-0.5 shrink-0 text-lime" size={14} />
          Online payment opens when Stripe is connected. If not, your slot is reserved and you can pay at the venue.
        </p>

        {message ? (
          <div className={`mt-5 rounded-lg border p-4 text-sm ${messageClass}`}>
            {message}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
