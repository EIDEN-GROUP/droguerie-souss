import { create } from "zustand";

// Static customer accounts — stored in the browser's localStorage, no backend.
// An account only exists in the browser where it was created.

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
}

interface StoredAccount {
  id: string;
  fullName: string;
  passHash: string;
}

const ACCOUNTS_KEY = "ds-accounts";
const CURRENT_KEY = "ds-current-user";

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

async function hash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readAccounts(): Record<string, StoredAccount> {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, StoredAccount>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export const useCustomerAuth = create<CustomerAuthState>()((set) => ({
  user: null,
  loading: true,
  authOpen: false,

  checkSession: async () => {
    try {
      const email = localStorage.getItem(CURRENT_KEY);
      const account = email ? readAccounts()[email] : undefined;
      if (email && account) {
        set({ user: { id: account.id, email, fullName: account.fullName }, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ user: null, loading: false });
    }
  },

  signIn: async (email, password) => {
    const key = email.trim().toLowerCase();
    const account = readAccounts()[key];
    if (!account || account.passHash !== (await hash(password))) {
      throw new Error("Email ou mot de passe incorrect");
    }
    localStorage.setItem(CURRENT_KEY, key);
    set({ user: { id: account.id, email: key, fullName: account.fullName }, loading: false });
  },

  signUp: async (fullName, email, password) => {
    const key = email.trim().toLowerCase();
    const accounts = readAccounts();
    if (accounts[key]) {
      throw new Error("Un compte existe déjà avec cet email");
    }
    if (password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères");
    }
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      fullName: fullName.trim(),
      passHash: await hash(password),
    };
    accounts[key] = account;
    writeAccounts(accounts);
    localStorage.setItem(CURRENT_KEY, key);
    set({ user: { id: account.id, email: key, fullName: account.fullName }, loading: false });
    return true;
  },

  signOut: async () => {
    localStorage.removeItem(CURRENT_KEY);
    set({ user: null, loading: false });
  },

  setAuthOpen: (v) => set({ authOpen: v }),
}));
