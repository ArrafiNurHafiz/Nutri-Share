import { useState, useEffect, useRef } from "react";

export function useHideOnScroll() {
  const [navVisible, setNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    const handle = () => {
      const current = window.scrollY;
      setNavVisible(current < lastScroll.current || current < 10);
      setIsScrolled(current > 20);
      lastScroll.current = current;
    };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return { navVisible, isScrolled };
}
