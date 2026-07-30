import { SectionHeader } from "./SectionHeader";
import LAFARGE from "@/assets/lafarge.webp";
import HOLCIM from "@/assets/holcim.png";
import SANIMAR from "@/assets/sanimar.jpg";
import COLORADO from "@/assets/colorado.jpg";
import ASTRAL from "@/assets/astral.jpeg"
import SCHNEIDER from "@/assets/schneider.png";
import LEGRAND from "@/assets/legrand.png";
import GEBERIT from "@/assets/geberit.png";
import GROHE from "@/assets/grohe.webp";
import SIKA from "@/assets/sika.png";
import WEBER from "@/assets/weber.png";
import KNAUF from "@/assets/knauf.png";

const suppliers = [
  { name: "LAFARGE", logo: LAFARGE },
  { name: "HOLCIM", logo: HOLCIM },
  { name: "SANIMAR", logo: SANIMAR },
  { name: "COLORADO", logo: COLORADO },
  { name: "ASTRAL", logo: ASTRAL },
  { name: "SCHNEIDER", logo: SCHNEIDER },
  { name: "LEGRAND", logo: LEGRAND },
  { name: "GEBERIT", logo: GEBERIT },
  { name: "GROHE", logo: GROHE },
  { name: "SIKA", logo: SIKA },
  { name: "WEBER", logo: WEBER },
  { name: "KNAUF", logo: KNAUF },
];

export function SuppliersCarousel() {
  const doubled = [...suppliers, ...suppliers];

  return (
    <section className="overflow-hidden border-y bg-cream py-14">
      <div className="container-x">
        <SectionHeader
          kicker="Ils nous font confiance"
          title="Nos fournisseurs partenaires"
        />
      </div>

      <div className="relative mt-10">
        <div className="flex gap-4 animate-[marquee_4s_linear_infinite] lg:animate-[marquee_10s_linear_infinite]">
          {doubled.map((supplier, i) => (
            <div key={i} className="grid h-16 min-w-[140px] shrink-0 place-items-center rounded-xl border bg-paper px-4 shadow-sm md:h-24 md:min-w-[200px] md:px-8">
              <img src={supplier.logo} alt={supplier.name} className="max-h-8 w-auto object-contain md:max-h-12" />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </section>
  );
}