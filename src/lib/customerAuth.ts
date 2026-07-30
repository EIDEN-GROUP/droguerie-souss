import { create } from "zustand";
import { signupCustomer, loginCustomer } from "@/lib/api/customer-auth";

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
}

const SESSION_KEY = "ds-customer-session";

interface SessionData {
  id: string;
  email: string;
  fullName: string;
}

function saveSession(user: SessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function readSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

interface CustomerAuthState {
  user: CustomerUser | null;
  loading: boolean;
  authOpen: boolean;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  setAuthOpen: (v: boolean) => void;
}

export const useCustomerAuth = create<CustomerAuthState>()((set) => ({
  user: null,
  loading: true,
  authOpen: false,

  checkSession: async () => {
    try {
      const session = readSession();
      if (session) {
        set({ user: { id: session.id, email: session.email, fullName: session.fullName }, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    const result = await loginCustomer({ data: { email, password } });
    const user = { id: result.id, email: result.email, fullName: result.fullName };
    saveSession(user);
    set({ user, loading: false });
  },

  signUp: async (fullName, email, password) => {
    const result = await signupCustomer({ data: { email, fullName, password } });
    const user = { id: result.id, email: result.email, fullName: result.fullName };
    saveSession(user);
    set({ user, loading: false });
    return true;
  },

  signOut: async () => {
    clearSession();
    set({ user: null, loading: false });
  },

  setAuthOpen: (v) => set({ authOpen: v }),
}));
