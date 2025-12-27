import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

const GlitchText = ({ text, className, as: Component = "h1" }: GlitchTextProps) => {
  return (
    <Component
      className={cn("glitch glow-text", className)}
      data-text={text}
    >
      {text}
    </Component>
  );
};

export default GlitchText;
