import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity, } from "framer-motion";
import { useRef } from "react";
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

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

const BASE_VELOCITY = 2.5;

export function SuppliersCarousel() {
  const doubled = [...suppliers, ...suppliers];
  const reduce = useReducedMotion();
  const offset = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(1);
  const x = useTransform(offset, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const b = boost.get();
    if (b < 0) direction.current = -1;
    else if (b > 0) direction.current = 1;
    const moveBy = direction.current * BASE_VELOCITY * (delta / 1000) * (1 + Math.abs(b));
    offset.set(wrap(-50, 0, offset.get() - moveBy));
  });

  return (
    <section className="overflow-hidden border-b py-5 container-xs">
      <div className="container-x">
        <SectionHeader kicker="Ils nous font confiance" />
      </div>

      <div className="relative mt-5">
        <motion.div style={{ x }} className="flex w-max">
          {doubled.map((supplier, i) => (
            <div key={i} className="group mr-4 grid h-10 min-w-[90px] shrink-0 place-items-center px-4 transition-shadow duration-300 md:h-24 md:min-w-[200px] md:px-8">
              <img src={supplier.logo} alt={supplier.name} className="max-h-10 w-auto object-contain transition duration-300 group-hover:scale-105" />
            </div>
          ))}
        </motion.div>

        {/* <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-cream to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-cream to-transparent" /> */}
      </div>
    </section>
  );
}