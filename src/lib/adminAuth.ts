import { create } from "zustand";
import { createClient } from "@/lib/supabase";

interface AdminAuthState {
  isAuthed: boolean;
  loading: boolean;
  userEmail: string | null;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAuth = create<AdminAuthState>()((set) => ({
  isAuthed: false,
  loading: true,
  userEmail: null,

  checkSession: async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        set({ isAuthed: true, userEmail: data.user.email, loading: false });
      } else {
        set({ isAuthed: false, userEmail: null, loading: false });
      }
    } catch {
      set({ isAuthed: false, userEmail: null, loading: false });
    }
  },

  login: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou mot de passe incorrect");
    set({ isAuthed: true, userEmail: data.user.email, loading: false });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ isAuthed: false, userEmail: null, loading: false });
  },
}));
