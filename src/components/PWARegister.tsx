"use client";

import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registered successfully."))
        .catch((err) => console.error("Service worker registration failed", err));
    }
  }, []);

  return null;
}
