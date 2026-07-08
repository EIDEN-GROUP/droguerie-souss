import { Lock } from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/lib/adminAuth";

export function AdminLogin() {
  const login = useAdminAuth((s) => s.login);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-paper p-8 shadow-[var(--shadow-card)]"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand text-brand-foreground font-display text-xl font-bold">
          DS
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold uppercase">Espace Admin</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">Droguerie Souss   Gestion</p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">
            Mot de passe
          </span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand"
            />
          </div>
        </label>
        {error && (
          <p className="mt-2 text-xs font-semibold text-accent-red">Mot de passe incorrect.</p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition hover:bg-brand-dark"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}
