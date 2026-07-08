import { create } from "zustand";
import { persist } from "zustand/middleware";

// Soft client-side gate only   not real security. Change this to update the
// dashboard password.
const ADMIN_PASSWORD = "souss2026";

interface AdminAuthState {
  isAuthed: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthed: false,
      login: (password) => {
        const ok = password === ADMIN_PASSWORD;
        if (ok) set({ isAuthed: true });
        return ok;
      },
      logout: () => set({ isAuthed: false }),
    }),
    { name: "droguerie-admin-auth" },
  ),
);
