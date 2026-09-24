/** Faithful port of the original app's `safeStorage()`: works even when storage APIs throw (privacy mode, disabled cookies) by falling back to an in-memory Map, and never blows up during SSR where `window` doesn't exist. */
function safeStorage(kind: "localStorage" | "sessionStorage") {
  const memory = new Map<string, string>();
  let native: Storage | null = null;
  try {
    if (typeof window !== "undefined") {
      native = window[kind];
      const k = "gz-test";
      native.setItem(k, "1");
      native.removeItem(k);
    }
  } catch {
    native = null;
  }
  return {
    read<T>(key: string, fallback: T): T {
      try {
        const raw = native ? native.getItem(key) : memory.get(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },
    write(key: string, value: unknown) {
      const raw = JSON.stringify(value);
      try {
        if (native) native.setItem(key, raw);
        else memory.set(key, raw);
      } catch {
        native = null;
        memory.set(key, raw);
      }
    },
    remove(key: string) {
      try {
        native?.removeItem(key);
      } catch {
        /* ignore */
      }
      memory.delete(key);
    },
  };
}

export const storage = safeStorage("localStorage");
export const tabStorage = safeStorage("sessionStorage");

export const KEYS = Object.freeze({
  profiles: "grozze.v1.profiles",
  session: "grozze.v1.demoSession",
  content: "grozze.v1.content",
  consent: "grozze.v1.consent",
  location: "grozze.v1.location",
  audit: "grozze.v1.audit",
  leads: "grozze.v1.leads",
});
