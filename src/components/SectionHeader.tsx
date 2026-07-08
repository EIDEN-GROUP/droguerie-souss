import { motion } from "framer-motion";

export function SectionHeader({
  kicker,
  title,
  align = "center",
}: {
  kicker?: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`flex flex-col gap-3 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      {kicker && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2"
        >
          <span className="h-px w-8 bg-accent-red" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent-red">
            {kicker}
          </span>
          <span className="h-px w-8 bg-accent-red" />
        </motion.div>
      )}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-ink sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
    </div>
  );
}
