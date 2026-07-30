const WHATSAPP_NUMBER = "212528000000";
const PREFILLED_MESSAGE =
  "Bonjour, je souhaite avoir plus d'informations sur vos produits.";

const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

/** Official WhatsApp glyph. lucide-react dropped brand icons, so it is inlined. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.83 9.83 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.945c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.9 11.9 0 0 0 5.71 1.454h.005c6.585 0 11.946-5.36 11.949-11.945a11.9 11.9 0 0 0-3.45-8.406" />
    </svg>
  );
}

export function WhatsAppButton() {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous contacter sur WhatsApp"
      // No gap here on purpose: a flex gap applies even while the label is
      // collapsed, which would leave the resting button an off-centre pill.
      className="group fixed bottom-5 right-5 z-40 flex items-center rounded-full bg-[#25D366] p-4 text-white shadow-lg shadow-[#25D366]/30 outline-none transition-transform duration-200 hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#25D366]/50 active:scale-95 sm:bottom-6 sm:right-6"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s] motion-reduce:hidden" />
      <WhatsAppIcon className="relative h-6 w-6 shrink-0" />
      <span className="relative hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-bold uppercase tracking-wider opacity-0 transition-all duration-300 group-hover:ml-3 group-hover:max-w-[12rem] group-hover:opacity-100 md:inline">
        Discuter sur WhatsApp
      </span>
    </a>
  );
}
