import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/icon-blue.png";
import { ScrollLock } from "./ScrollLock";

export function PageLoader() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* Hors d'AnimatePresence : la page se deverrouille des le debut du fondu, pendant que
          l'ecran la couvre encore, et non a sa toute fin. */}
      {show && <ScrollLock />}
      <AnimatePresence>
        {show && (
          // `w-screen` plutot que `inset-0` : la barre de defilement revient au debut du
          // fondu, et le logo ne doit pas se decaler de sa demi-largeur. Au-dessus de tout,
          // bandeau cookies compris (z-100) : rien de la page ne se montre avant la fin.
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-y-0 left-0 z-[110] flex w-screen items-center justify-center bg-paper"
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="h-20 w-20 p-2">
                  <img
                    src={logo}
                    alt="Souss Droguerie, droguerie à Agadir"
                    className="h-full w-full object-cover"
                  />
                </div>
                <motion.div
                  className="absolute -inset-2 rounded-2xl border-2 border-accent-red"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
