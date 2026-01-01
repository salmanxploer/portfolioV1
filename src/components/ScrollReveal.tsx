import React, { useEffect, useRef, useState, memo } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms
  as?: keyof JSX.IntrinsicElements;
}

const ScrollReveal: React.FC<ScrollRevealProps> = memo(function ScrollReveal({ 
  children, 
  className, 
  delay = 0, 
  as = "div" 
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Use requestAnimationFrame for smoother animation triggering
            requestAnimationFrame(() => {
              setVisible(true);
            });
            observer.disconnect();
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px' // Trigger slightly before element is fully visible
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Comp = as as any;

  return (
    <Comp
      ref={ref}
      className={[
        className,
        "transform-gpu", // Force GPU acceleration
        visible ? "animate-in fade-in slide-in-from-bottom-2" : "opacity-0 translate-y-2"
      ].filter(Boolean).join(" ")}
      style={{ 
        animationDelay: visible ? `${delay}ms` : undefined, 
        animationFillMode: visible ? "forwards" : undefined,
        willChange: visible ? "auto" : "transform, opacity"
      }}
    >
      {children}
    </Comp>
  );
});

export default ScrollReveal;
