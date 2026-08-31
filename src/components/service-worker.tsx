"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker (`public/sw.js`) once, in the browser,
 * in production only. The worker just caches the shell for fast repeat loads and
 * basic offline resilience — no push, no write queueing (see project non-goals).
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal — the app works without it.
      });
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
