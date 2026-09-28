import { motion, useScroll, useSpring } from "framer-motion";

/** Fin filet rouge en haut de l'ecran, qui se remplit avec la lecture de la page. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-accent-red"
    />
  );
}
