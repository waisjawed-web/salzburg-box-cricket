import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/button";

export default function BookingSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface rounded-lg p-8 text-center">
        <CheckCircle2 className="mx-auto text-lime" size={48} />
        <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-lime">Payment received</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl font-black text-white">Your booking is confirmed.</h1>
        <p className="mt-4 text-slate-300">We saved the booking to your account. A confirmation email will be sent if email delivery is enabled.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/dashboard">Open dashboard</Button>
          <Button href="/booking" variant="outline">Book another slot</Button>
        </div>
      </div>
    </div>
  );
}
