"use client";

import { useEffect } from "react";

const SESSION_KEY = "arachchi_splash_shown";

export function SplashController() {
  useEffect(() => {
    const el = document.getElementById("splash") as HTMLElement | null;
    if (!el) return;

    if (sessionStorage.getItem(SESSION_KEY)) {
      el.style.display = "none";
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");

    const fadeTimer = setTimeout(() => {
      el.style.transition = "opacity 0.5s cubic-bezier(0.4,0,0.2,1)";
      el.style.opacity = "0";
      setTimeout(() => {
        el.style.display = "none";
      }, 500);
    }, 1600);

    return () => clearTimeout(fadeTimer);
  }, []);

  return null;
}
