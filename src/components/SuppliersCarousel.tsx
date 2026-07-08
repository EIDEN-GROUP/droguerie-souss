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
              className="grid h-24 min-w-[200px] shrink-0 place-items-center rounded-xl border bg-paper px-8 shadow-sm"
            >
              <span className="font-display text-2xl font-bold tracking-widest text-ink-soft transition hover:text-brand">
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
