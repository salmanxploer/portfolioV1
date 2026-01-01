import { useState, useEffect, useCallback, memo } from "react";
import { cn } from "@/lib/utils";

interface DecodeTextProps {
  text: string;
  className?: string;
  delay?: number; // Initial delay before animation starts
  speed?: number; // Speed of decode (lower = faster)
  scrambleIterations?: number; // How many times to scramble before settling
}

const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/\\~`01";

const DecodeText = memo(function DecodeText({
  text,
  className,
  delay = 500,
  speed = 50,
  scrambleIterations = 3,
}: DecodeTextProps) {
  const [displayText, setDisplayText] = useState<string[]>(() => 
    text.split("").map(() => chars[Math.floor(Math.random() * chars.length)])
  );
  const [decodedIndices, setDecodedIndices] = useState<Set<number>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const [iterationCount, setIterationCount] = useState<number[]>(() => 
    new Array(text.length).fill(0)
  );

  // Start animation after delay
  useEffect(() => {
    const timer = setTimeout(() => setIsStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Scramble non-decoded characters
  useEffect(() => {
    if (!isStarted) return;

    const scrambleInterval = setInterval(() => {
      setDisplayText((prev) =>
        prev.map((char, index) => {
          if (decodedIndices.has(index) || text[index] === " ") {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
      );
    }, 40);

    return () => clearInterval(scrambleInterval);
  }, [isStarted, decodedIndices, text]);

  // Progressively decode characters
  useEffect(() => {
    if (!isStarted) return;

    const decodeInterval = setInterval(() => {
      setDecodedIndices((prev) => {
        // Find next character to potentially decode
        for (let i = 0; i < text.length; i++) {
          if (!prev.has(i) && text[i] !== " ") {
            // Check if this character has gone through enough iterations
            if (iterationCount[i] >= scrambleIterations) {
              const newSet = new Set(prev);
              newSet.add(i);
              return newSet;
            } else {
              // Increment iteration count
              setIterationCount((counts) => {
                const newCounts = [...counts];
                newCounts[i]++;
                return newCounts;
              });
              return prev;
            }
          }
        }
        return prev;
      });
    }, speed);

    // Stop when all decoded
    if (decodedIndices.size === text.replace(/ /g, "").length) {
      clearInterval(decodeInterval);
    }

    return () => clearInterval(decodeInterval);
  }, [isStarted, text, speed, scrambleIterations, iterationCount, decodedIndices.size]);

  return (
    <h1 className={cn("font-bold tracking-wider", className)}>
      {displayText.map((char, index) => {
        const isDecoded = decodedIndices.has(index) || text[index] === " ";
        const isSpace = text[index] === " ";
        
        return (
          <span
            key={index}
            className={cn(
              "inline-block transition-all duration-300",
              isSpace && "w-[0.3em]",
              isDecoded
                ? "text-primary glow-text"
                : "text-neon-cyan opacity-80",
              !isDecoded && !isSpace && "animate-pulse"
            )}
            style={{
              textShadow: isDecoded
                ? "0 0 10px hsl(120 100% 50% / 0.8), 0 0 20px hsl(120 100% 50% / 0.5), 0 0 40px hsl(120 100% 50% / 0.3)"
                : "0 0 5px hsl(180 100% 50% / 0.5)",
              transform: isDecoded ? "scale(1)" : "scale(0.95)",
            }}
          >
            {isSpace ? "\u00A0" : char}
          </span>
        );
      })}
    </h1>
  );
});

export default DecodeText;
