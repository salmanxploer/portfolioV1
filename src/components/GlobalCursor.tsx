import { useEffect, useRef, useState } from "react";
import { useMotionStore } from "@/stores/motionStore";

const INTERACTIVE_SELECTOR =
  "a, button, [role='button'], input, textarea, select, label, summary, .cursor-pointer";

const GlobalCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const cursorHue = useMotionStore((state) => state.cursorHue);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const rafId = useRef<number | null>(null);

  const renderCursor = () => {
    if (!outerRef.current || !innerRef.current) {
      rafId.current = null;
      return;
    }

    outerRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) translate(-50%, -50%)`;
    innerRef.current.style.transform = `translate3d(${mouseX.current}px, ${mouseY.current}px, 0) translate(-50%, -50%)`;
    rafId.current = null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const canUseFinePointer = window.matchMedia("(pointer: fine)").matches;
    setEnabled(canUseFinePointer);

    if (!canUseFinePointer) return;

    document.body.classList.add("has-custom-cursor");

    const handleMove = (event: MouseEvent) => {
      mouseX.current = event.clientX;
      mouseY.current = event.clientY;

      if (!rafId.current) {
        rafId.current = window.requestAnimationFrame(renderCursor);
      }

      const target = event.target as Element | null;
      const isInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      outerRef.current?.classList.toggle("is-interactive", isInteractive);
      innerRef.current?.classList.toggle("is-interactive", isInteractive);
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMove);
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="global-cursor-ring pointer-events-none fixed z-[9998] rounded-full border border-primary/70"
        style={{
          left: 0,
          top: 0,
          boxShadow: `0 0 18px hsl(${cursorHue} 92% 66% / 0.45)`,
          background: `hsl(${cursorHue} 92% 66% / 0.08)`,
        }}
      />
      <div
        ref={innerRef}
        className="global-cursor-dot pointer-events-none fixed z-[9999] rounded-full bg-primary"
        style={{
          left: 0,
          top: 0,
          boxShadow: `0 0 12px hsl(${cursorHue} 92% 66% / 0.85)`,
        }}
      />
    </>
  );
};

export default GlobalCursor;
