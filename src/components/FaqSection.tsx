import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useId, useState } from "react";
import photo from "@/assets/collection-bath.jpg";
import mark from "@/assets/icon-blue.png";
import { aboutStats } from "@/lib/about";
import { FAQS } from "@/lib/faq";
import { Counter } from "./motion/Counter";
import { Reveal } from "./motion/Reveal";
import { fromTo, rise, useRevealState } from "./motion/reveals";
import { SplitReveal } from "./motion/SplitReveal";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = aboutStats.slice(1);


export function FaqSection() {
  const [ref, state, column] = useRevealState<HTMLDivElement>();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  const { scrollYProgress } = useScroll({ target: column, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <section className="grid lg:grid-cols-2">
      <motion.div
        ref={ref}
        initial="below"
        animate={state}
        className="relative isolate flex min-h-[34rem] items-end overflow-hidden bg-ink sm:min-h-[40rem] lg:min-h-[46rem]"
      >
        <motion.img
          src={photo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          style={{ y }}
          className="absolute inset-x-0 -top-[8%] -z-10 h-[116%] w-full object-cover object-[58%_50%]"
        />

        <motion.div
          variants={fromTo({ x: "-100%" }, { x: 0 }, { duration: 1.1 })}
          className="w-[92%] bg-paper bg-hatch py-9 pl-4 pr-[18%] [clip-path:polygon(0_0,86%_0,100%_100%,0_100%)] sm:w-[80%] sm:py-12 sm:pl-10 lg:pl-[max(2rem,calc((100vw_-_1500px)_/_2_+_2rem))] xl:py-14"
        >
          <ul className="space-y-7">
            {stats.map((s, i) => (
              <motion.li
                key={s.tag}
                variants={rise({ y: 16, delay: 0.5 + i * 0.15, duration: 0.6 })}
              >
                <p className="font-display text-lg leading-none text-ink sm:text-xl">
                  {s.tag} -{" "}
                  <span className="tabular-nums">
                    <Counter to={s.value} suffix={s.suffix} />
                  </span>
                </p>
                <div className="relative mt-3 h-[5px]">
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-red/35" />
                  <motion.span
                    variants={fromTo(
                      { scaleX: 0 },
                      { scaleX: 1 },
                      { delay: 0.7 + i * 0.15, duration: 1.4 },
                    )}
                    className="absolute inset-0 origin-left bg-accent-red"
                  />
                </div>
                <p className="mt-2.5 text-xs leading-snug text-ink-soft sm:text-sm">{s.text}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <div className="relative isolate overflow-hidden bg-cream bg-hatch px-4 py-16 sm:px-6 md:py-20 lg:px-12 lg:py-24 xl:px-20">
        <img
          src={mark}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="pointer-events-none absolute -bottom-10 -right-10 -z-10 w-72 opacity-[0.05] lg:w-96"
        />

        <div className="lg:max-w-[38rem]">
          <SplitReveal
            as="h2"
            className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl"
          >
            Questions fréquentes
          </SplitReveal>

          <div className="mt-9 space-y-2.5 sm:mt-11">
            {FAQS.map((item, i) => {
              const isOpen = open === i;
              const questionId = `${baseId}-q${i}`;
              const answerId = `${baseId}-a${i}`;
              return (
                <Reveal
                  key={item.q}
                  margin="-40px"
                  variants={rise({ y: 24, delay: i * 0.08, duration: 0.6 })}
                  className="bg-paper rounded-2xl shadow-[0_12px_32px_rgb(48_49_61_/_0.07)]"
                >
                  <h3 className="font-sans tracking-normal">
                    <button
                      type="button"
                      id={questionId}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className={`group flex w-full cursor-pointer items-center gap-5 border-b px-5 py-6 text-left transition-colors duration-300 sm:px-9 sm:py-7 ${
                        isOpen ? "border-ink/15" : "border-transparent"
                      }`}
                    >
                      {/* Le + : deux traits, dont le vertical se couche pour donner le -. */}
                      <span aria-hidden="true" className="relative h-4 w-4 shrink-0">
                        <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-ink transition-colors duration-300 group-hover:bg-accent-red" />
                        <motion.span
                          animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                          transition={{ duration: 0.35, ease: EASE }}
                          className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-ink transition-colors duration-300 group-hover:bg-accent-red"
                        />
                      </span>
                      <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-accent-red sm:text-base">
                        {item.q}
                      </span>
                    </button>
                  </h3>
                  <motion.div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    inert={!isOpen}
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-8 pt-6 text-sm leading-7 text-ink-soft sm:px-9 sm:pb-10 sm:pt-8 sm:text-[15px]">
                      {item.a}
                    </p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
