import { SectionHeader } from "./SectionHeader";
import LAFARGE from "@/assets/Lafarge.webp";
import HOLCIM from "@/assets/Holcim.png";
import SANIMAR from "@/assets/sanimar.jpg";
import COLORADO from "@/assets/colorado.jpg";
import ASTRAL from "@/assets/astral.jpeg"
import SCHNEIDER from "@/assets/Schneider.png";
import LEGRAND from "@/assets/Legrand.png";
import GEBERIT from "@/assets/geberit.png";
import GROHE from "@/assets/Grohe.webp";
import SIKA from "@/assets/sika.png";
import WEBER from "@/assets/Weber.png";
import KNAUF from "@/assets/KNAUF.png";

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
        <div className="flex gap-4 animate-[marquee_4s_linear_infinite] hover:[animation-play-state:paused] lg:animate-[marquee_10s_linear_infinite]">
          {doubled.map((supplier, i) => (
            <div key={i} className="group grid h-16 min-w-[140px] shrink-0 place-items-center rounded-xl border bg-paper px-4 shadow-sm transition-shadow duration-300 hover:shadow-md md:h-24 md:min-w-[200px] md:px-8">
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="max-h-8 w-auto object-contain opacity-60 grayscale transition duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0 md:max-h-12"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream to-transparent" />
      </div>
    </section>
  );
}