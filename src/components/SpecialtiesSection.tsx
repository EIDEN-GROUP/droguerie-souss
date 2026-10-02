import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { specialties } from "@/lib/about";
import { cn } from "@/lib/utils";
import { Reveal } from "./motion/Reveal";
import { rise } from "./motion/reveals";
import { SectionHeader } from "./SectionHeader";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Les metiers couverts, en quatre cartes. Une seule est pleine (rouge, ombre portee) : la
 * premiere au repos, puis celle que l'on survole ou qui prend le focus - l'aplat glisse de
 * l'une a l'autre (`layoutId`). Sur ecran tactile, elle suit la carte touchee.
 */
export function SpecialtiesSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-paper pb-20 pt-6 md:pb-28">
      <div className="container-xs">
        <SectionHeader kicker="Notre expertise" title="Du gros œuvre aux finitions" animated />

        <Reveal
          as="ul"
          onPointerLeave={(e) => e.pointerType === "mouse" && setActive(0)}
          className="mt-12 grid gap-3 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4"
        >
          {specialties.map((s, i) => {
            const on = active === i;
            return (
              <motion.li key={s.name} variants={rise({ y: 36, delay: i * 0.1 })}>
                <Link
                  to="/categories"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="relative isolate flex h-full flex-col items-center px-6 py-10 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-red lg:px-7 lg:py-12"
                >
                  {on && (
                    <motion.span
                      layoutId="specialty-active"
                      aria-hidden="true"
                      transition={{ type: "spring", stiffness: 260, damping: 30 }}
                      className="absolute inset-0 -z-10 rounded-2xl bg-accent-red shadow-[0_28px_50px_-18px_rgb(184_0_31_/_0.55)] "
                    />
                  )}
                  <motion.span
                    animate={{ y: on ? -4 : 0, scale: on ? 1.08 : 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <s.icon
                      className={cn(
                        "h-12 w-12 transition-colors duration-300",
                        on ? "text-paper" : "text-accent-red",
                      )}
                      strokeWidth={1.25}
                    />
                  </motion.span>
                  <h3
                    className={cn(
                      "mt-6 font-display text-xl transition-colors duration-300 sm:text-2xl",
                      on ? "text-paper" : "text-ink",
                    )}
                  >
                    {s.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 text-sm leading-relaxed transition-colors duration-300",
                      on ? "text-paper/85" : "text-ink-soft",
                    )}
                  >
                    {s.text}
                  </p>
                </Link>
              </motion.li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
