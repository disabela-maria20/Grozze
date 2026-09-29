/**
 * Simulated network boundary. There is no backend yet: every "request" runs
 * the local store action after a short delay, so the UI already handles
 * pending/error states. When the real API exists, replace the callers'
 * `request(() => ...)` with `fetch` and keep the same hooks.
 */
const LATENCY_MS = 300;

export function request<T>(run: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(run());
      } catch (err) {
        reject(err);
      }
    }, LATENCY_MS);
  });
}
