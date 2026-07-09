import { AnimatePresence, motion, useAnimationControls, type Variants } from "framer-motion";
import { Lock, UserRound } from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/lib/adminAuth";
import loginVid from "@/assets/login-vid.mp4";
import { Link } from "@tanstack/react-router";

const layerVariants: Variants = {
  hidden: { x: "-100%" },
  show: (i: number) => ({
    x: 0,
    transition: { delay: 0.08 * i, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const formVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function AdminLogin() {
  const login = useAdminAuth((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const shakeControls = useAnimationControls();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError(true);
      void shakeControls.start({ x: [0, -8, 8, -5, 5, 0] }, { duration: 0.45 });
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-paper">
      {/* Decorative diagonal panel */}
      <div className="relative hidden overflow-hidden md:block md:w-1/2 lg:w-[40%]">
        <video
          src={loginVid}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover" style={{ filter: "brightness(0.5)" }}
        />
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-paper md:-ml-12 md:rounded-l-[48px]">
        {/* CONNEXION tab merging into the form panel */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-full top-[30%] -mr-px hidden md:block"
        >
          <Link to="/">
            <div className="relative mt-10 rounded-l-full bg-paper py-4 pl-10 pr-8 font-display text-lg font-bold tracking-widest text-accent-red transition-all duration-300 ease-in-out hover:scale-105 hover:text-ink/90">
              RETOUR
              <svg
                viewBox="0 0 16 16"
                className="pointer-events-none absolute -top-4 right-0 h-4 w-4 text-paper"
                aria-hidden="true"
              >
                <path d="M16 0 A16 16 0 0 1 0 16 L16 16 Z" fill="currentColor" />
              </svg>
              <svg
                viewBox="0 0 16 16"
                className="pointer-events-none absolute -bottom-4 right-0 h-4 w-4 text-paper"
                aria-hidden="true"
              >
                <path d="M0 0 A16 16 0 0 1 16 16 L16 0 Z" fill="currentColor" />
              </svg>
            </div> 
          </Link>
        </motion.div>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-8"
        >
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="show"
            className="w-full max-w-xs"
          >
            <motion.div
              variants={itemVariants}
              className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-secondary shadow-[0_15px_35px_-12px_rgba(47,55,141,0.6)] sm:h-24 sm:w-24"
            >
              <UserRound className="h-9 w-9 text-white sm:h-11 sm:w-11" strokeWidth={1.5} />
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="mt-5 text-center font-display text-2xl font-bold tracking-widest text-brand-secondary sm:text-3xl"
            >
              CONNEXION
            </motion.h1>

            <motion.div variants={itemVariants}>
              <motion.div animate={shakeControls}>
                <label className="mt-10 flex items-center gap-3 border-b border-border pb-2.5 transition-colors focus-within:border-brand-secondary">
                  <UserRound className="h-5 w-5 shrink-0 text-ink-soft/60" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
                  />
                </label>

                <label className="mt-7 flex items-center gap-3 border-b border-border pb-2.5 transition-colors focus-within:border-brand-secondary">
                  <Lock className="h-5 w-5 shrink-0 text-ink-soft/60" />
                  <input
                    type="password"
                    placeholder="Password"
                    autoFocus
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-soft/60"
                  />
                </label>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-3 text-xs font-semibold text-accent-red"
                >
                  Mot de passe incorrect.
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap items-center justify-between gap-3"
            >
              <button
                type="button"
                title="Contactez l'administrateur"
                className="text-xs font-medium text-brand-secondary hover:underline"
              >
                Mot de passe oublié ?
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full bg-gradient-to-r from-brand to-brand-secondary px-8 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-md"
              >
                SE CONNECTER
              </motion.button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
