import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }
    const id = hash.replace("#", "");
    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    if (pathname === "/") {
      requestAnimationFrame(scrollToTarget);
    }
  }, [pathname, hash]);

  return null;
}
