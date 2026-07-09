import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useAdminAuth } from "@/lib/adminAuth";

export function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email, password);
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setBusy(false);
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
        <p className="mt-1 text-center text-sm text-ink-soft">Droguerie Souss &mdash; Gestion</p>

        <label className="mt-6 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Email</span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand"
            />
          </div>
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink">Mot de passe</span>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full rounded-lg border border-border py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-brand"
            />
          </div>
        </label>

        {error && (
          <p className="mt-2 text-xs font-semibold text-accent-red">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-6 w-full rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-wider text-brand-foreground transition hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
