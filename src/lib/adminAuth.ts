import { create } from "zustand";
import { createClient } from "@/lib/supabase";
import { getAdminRole } from "@/lib/api/admin-users";

interface AdminAuthState {
  isAuthed: boolean;
  loading: boolean;
  userEmail: string | null;
  role: "admin" | "sales" | null;
  checkSession: () => Promise<void>;
  checkRole: (email: string) => Promise<"admin" | "sales" | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()((set, get) => ({
  isAuthed: false,
  loading: true,
  userEmail: null,
  role: null,

  checkSession: async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const email = data.user.email!;
        const roleResult = await getAdminRole({ data: { email } });
        const role = roleResult?.role ?? null;
        set({ isAuthed: true, userEmail: email, role, loading: false });
      } else {
        set({ isAuthed: false, userEmail: null, role: null, loading: false });
      }
    } catch {
      set({ isAuthed: false, userEmail: null, role: null, loading: false });
    }
  },

  checkRole: async (email) => {
    try {
      const result = await getAdminRole({ data: { email } });
      return result?.role ?? null;
    } catch {
      return null;
    }
  },

  login: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou mot de passe incorrect");
    const roleResult = await getAdminRole({ data: { email } });
    const role = roleResult?.role ?? null;
    set({ isAuthed: true, userEmail: data.user.email, role, loading: false });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ isAuthed: false, userEmail: null, role: null, loading: false });
  },
}));
