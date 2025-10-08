/**
 * Compute server time offset (serverNowMs - clientNowMs) with RTT midpoint correction.
 * Tries /api/time first, then falls back to HEAD / Date header. Returns 0 on failure.
 */
export async function getServerOffsetMs(): Promise<number> {
  // Prefer dedicated endpoint
  try {
    const t0 = performance.now();
    const resp = await fetch("/api/time", { cache: "no-store" });
    const t1 = performance.now();
    if (resp.ok) {
      const json = await resp.json();
      const serverNowMs = Number(json?.serverNowMs);
      if (Number.isFinite(serverNowMs)) {
        const rttMs = t1 - t0;
        const clientMidNowMs = Date.now() - rttMs / 2;
        return serverNowMs - clientMidNowMs;
      }
    }
  } catch {}

  // Fallback to Date header
  try {
    const t0 = performance.now();
    const res = await fetch("/", { method: "HEAD", cache: "no-store" });
    const t1 = performance.now();
    const dateHeader = res.headers.get("date");
    if (!dateHeader) return 0;
    const rttMs = t1 - t0;
    const clientMidNowMs = Date.now() - rttMs / 2;
    const serverNowMs = new Date(dateHeader).getTime();
    return serverNowMs - clientMidNowMs;
  } catch {
    return 0;
  }
}

/**
 * Start a monotonic countdown based on an absolute end time and a server offset.
 * Returns a getter that yields whole seconds remaining, clamped at 0.
 */
export function createMonotonicSecondsGetter(
  endTimeMs: number,
  offsetMs: number,
) {
  const perfStart = performance.now();
  const initialRemainingMs = endTimeMs - (Date.now() + offsetMs);
  return () => {
    const elapsedMs = performance.now() - perfStart;
    const remainingMs = initialRemainingMs - elapsedMs;
    return Math.max(0, Math.ceil(remainingMs / 1000));
  };
}
