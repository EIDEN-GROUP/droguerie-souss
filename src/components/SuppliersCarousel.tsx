import { SectionHeader } from "./SectionHeader";

const suppliers = [
  "LAFARGE", "HOLCIM", "SANIMAR", "COLORADO",
  "ASTRAL", "SCHNEIDER", "LEGRAND", "GEBERIT",
  "GROHE", "SIKA", "WEBER", "KNAUF",
];

export function SuppliersCarousel() {
  const doubled = [...suppliers, ...suppliers];
  return (
    <section className="border-y bg-cream py-14 overflow-hidden">
      <div className="container-x">
        <SectionHeader kicker="Ils nous font confiance" title="Nos fournisseurs partenaires" />
      </div>
      <div className="mt-10 relative">
        <div className="flex marquee gap-4">
          {doubled.map((s, i) => (
            <div
              key={i}
              className="grid h-16 min-w-[140px] shrink-0 place-items-center rounded-xl border bg-paper px-4 shadow-sm md:h-24 md:min-w-[200px] md:px-8"
            >
              <span className="font-display text-sm font-bold tracking-widest text-ink-soft transition hover:text-brand md:text-2xl">
                {s}
              </span>
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </section>
  );
}
