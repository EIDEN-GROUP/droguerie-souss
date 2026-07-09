import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, getCookies, setResponseHeaders } from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import { getEnv } from "./env";

export const login = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async (ctx) => {
    const supabase = createSessionClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ctx.data.email,
      password: ctx.data.password,
    });
    if (error) throw new Error("Email ou mot de passe incorrect");
    return { user: data.user };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createSessionClient();
  await supabase.auth.signOut();
  return { success: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSessionClient();
  const { data } = await supabase.auth.getUser();
  return { user: data.user };
});

function createSessionClient() {
  const url = getEnv("VITE_SUPABASE_URL");
  const key = getEnv("VITE_SUPABASE_ANON_KEY");
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        const all = getCookies();
        return Object.entries(all).map(([name, value]) => ({
          name,
          value: value ?? "",
        }));
      },
      setAll(cookies, headers) {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options);
        }
        const h = new Headers();
        for (const [k, v] of Object.entries(headers)) h.set(k, v);
        setResponseHeaders(h as Parameters<typeof setResponseHeaders>[0]);
      },
    },
  });
}
