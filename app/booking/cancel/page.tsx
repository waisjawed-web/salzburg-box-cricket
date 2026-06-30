import { XCircle } from "lucide-react";
import { ButtonLink } from "@/components/button";

export default function BookingCancelPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="surface rounded-lg p-8 text-center">
        <XCircle className="mx-auto text-red-300" size={48} />
        <p className="mt-6 text-sm font-black uppercase tracking-[0.24em] text-lime">Payment cancelled</p>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl font-black text-white">No charge was made.</h1>
        <p className="mt-4 text-slate-300">Your slot is not confirmed until payment is completed. Pick a slot and try again whenever you are ready.</p>
        <div className="mt-8">
          <ButtonLink href="/booking">Return to booking</ButtonLink>
        </div>
      </div>
    </div>
  );
}
