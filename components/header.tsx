import Link from "next/link";
import { CalendarCheck, Dumbbell, ShieldCheck } from "lucide-react";
import { ButtonLink } from "@/components/button";

const links = [
  { href: "/booking", label: "Book" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/membership", label: "Membership" },
  { href: "/dashboard", label: "Dashboard" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-pitch/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-turf text-pitch">
            <Dumbbell size={23} />
          </span>
          <span>
            <span className="block font-[var(--font-display)] text-lg font-black leading-5">Salzburg</span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-lime">Box Cricket</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-300 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-lime">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <ButtonLink href="/admin" variant="secondary" className="px-4">
            <ShieldCheck size={16} />
            Admin
          </ButtonLink>
          <ButtonLink href="/booking" className="px-4">
            <CalendarCheck size={16} />
            Book now
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
