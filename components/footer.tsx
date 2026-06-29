export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-pitch/80">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-400 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-[var(--font-display)] text-xl font-black text-white">Salzburg Box Cricket</p>
          <p className="mt-2 max-w-sm">Indoor cricket nets, match courts, leagues, and memberships built for Salzburg players.</p>
        </div>
        <div>
          <p className="font-bold text-white">Hours</p>
          <p className="mt-2">Mon-Fri 09:00-22:00</p>
          <p>Sat-Sun 08:00-23:00</p>
        </div>
        <div>
          <p className="font-bold text-white">Contact</p>
          <p className="mt-2">bookings@salzburgboxcricket.at</p>
          <p>+43 662 000 128</p>
        </div>
      </div>
    </footer>
  );
}
