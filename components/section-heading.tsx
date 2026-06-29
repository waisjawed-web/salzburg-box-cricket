export function SectionHeading({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-black uppercase tracking-[0.24em] text-lime">{eyebrow}</p>
      <h2 className="mt-3 font-[var(--font-display)] text-3xl font-black leading-tight text-white sm:text-5xl">{title}</h2>
      {copy ? <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">{copy}</p> : null}
    </div>
  );
}
