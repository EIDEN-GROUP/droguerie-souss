import { useNavigate } from "@tanstack/react-router";
import { Loader2, Lock, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCustomerAuth } from "@/lib/customerAuth";

type Tab = "signin" | "signup";

export function AuthDialog() {
  const { authOpen, setAuthOpen, signIn, signUp } = useCustomerAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const reset = () => {
    setError("");
    setSubmitting(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (tab === "signin") {
        await signIn(form.email, form.password);
      } else {
        await signUp(form.name, form.email, form.password);
      }
      setAuthOpen(false);
      navigate({ to: "/compte" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={authOpen}
      onOpenChange={(v) => {
        setAuthOpen(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
        <div className="bg-brand px-6 py-5 text-brand-foreground">
          <DialogTitle className="font-display text-2xl font-bold uppercase">
            {tab === "signin" ? "Connexion" : "Créer un compte"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-brand-foreground/80">
            Suivez vos commandes et retrouvez vos favoris. Vous pouvez aussi commander sans compte.
          </DialogDescription>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 rounded-full bg-mint p-1">
            {(
              [
                { id: "signin", label: "Connexion" },
                { id: "signup", label: "Inscription" },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  reset();
                }}
                className={`rounded-full py-2 text-xs font-bold uppercase tracking-wider transition ${
                  tab === t.id
                    ? "bg-brand text-brand-foreground shadow"
                    : "text-ink hover:bg-paper/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            {tab === "signup" && (
              <AuthField label="Nom complet" icon={<UserRound className="h-4 w-4" />}>
                <input
                  required
                  value={form.name}
                  onChange={update("name")}
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Votre nom"
                />
              </AuthField>
            )}
            <AuthField label="Email" icon={<Mail className="h-4 w-4" />}>
              <input
                required
                type="email"
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="vous@exemple.com"
              />
            </AuthField>
            <AuthField label="Mot de passe" icon={<Lock className="h-4 w-4" />}>
              <input
                required
                type="password"
                minLength={6}
                value={form.password}
                onChange={update("password")}
                autoComplete={tab === "signin" ? "current-password" : "new-password"}
                className="w-full bg-transparent text-sm outline-none"
                placeholder="••••••••"
              />
            </AuthField>

            {error && <p className="text-xs font-semibold text-accent-red">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-accent-red px-5 py-3 text-sm font-bold uppercase tracking-wider text-paper transition hover:bg-accent-red/90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Patientez...
                </>
              ) : tab === "signin" ? (
                "Se connecter"
              ) : (
                "Créer mon compte"
              )}
            </button>

            <button
              type="button"
              onClick={() => setAuthOpen(false)}
              className="w-full text-center text-xs text-ink-soft underline-offset-2 hover:underline"
            >
              Continuer sans compte
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
        {label}
      </span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5 transition focus-within:border-brand">
        <span className="text-ink-soft">{icon}</span>
        {children}
      </div>
    </label>
  );
}
