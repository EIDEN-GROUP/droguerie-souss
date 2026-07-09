export function getEnv(key: string): string {
  // For backward compatibility: if looking for SUPABASE_SERVICE_ROLE_KEY,
  // also check the old VITE_ prefixed name
  const fallbackKey = key === "SUPABASE_SERVICE_ROLE_KEY" ? "VITE_SUPABASE_SERVICE_ROLE_KEY" : undefined;
  for (const k of [key, fallbackKey].filter(Boolean)) {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[k!]) {
      return import.meta.env[k!] as string;
    }
    if (typeof process !== "undefined" && process.env && process.env[k!]) {
      return process.env[k!] as string;
    }
  }
  throw new Error(`Missing environment variable: ${key}`);
}
