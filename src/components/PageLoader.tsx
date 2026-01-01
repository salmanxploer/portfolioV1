import { memo, useState, useEffect } from "react";
import { GridLoader } from "react-spinners";

const PageLoader = memo(function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  const statusMessages = [
    "Initializing...",
    "Loading assets...",
    "Connecting to server...",
    "Decrypting data...",
    "Almost ready...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 15;
        
        // Update status text based on progress
        if (newProgress > 80) {
          setStatusText(statusMessages[4]);
        } else if (newProgress > 60) {
          setStatusText(statusMessages[3]);
        } else if (newProgress > 40) {
          setStatusText(statusMessages[2]);
        } else if (newProgress > 20) {
          setStatusText(statusMessages[1]);
        }
        
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Animated grid background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(hsl(120 100% 50% / 0.1) 1px, transparent 1px),
            linear-gradient(90deg, hsl(120 100% 50% / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glowing orb background effect */}
      <div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
        style={{
          background: 'radial-gradient(circle, hsl(120 100% 50% / 0.4) 0%, transparent 70%)',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      />

      {/* Main loader container */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Terminal-style header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-primary/30 rounded-lg backdrop-blur-sm">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-xs font-mono text-muted-foreground">
            system://loading
          </span>
        </div>

        {/* Spinner with glow effect */}
        <div className="relative">
          {/* Outer glow ring */}
          <div 
            className="absolute inset-[-20px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, hsl(120 100% 50% / 0.3) 0%, transparent 70%)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          
          <GridLoader
            color="hsl(120, 100%, 50%)"
            size={20}
            margin={4}
            speedMultiplier={0.8}
          />
        </div>

        {/* Logo text with glitch effect */}
        <div className="text-center">
          <h1 
            className="text-2xl md:text-3xl font-bold font-mono tracking-widest text-primary"
            style={{
              textShadow: '0 0 10px hsl(120 100% 50% / 0.8), 0 0 20px hsl(120 100% 50% / 0.5)',
            }}
          >
            &lt;SH/&gt;
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            SALMAN HAFIZ
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 space-y-2">
          <div className="h-1 bg-card/50 rounded-full overflow-hidden border border-primary/20">
            <div 
              className="h-full bg-gradient-to-r from-primary via-neon-cyan to-primary rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 10px hsl(120 100% 50% / 0.8), 0 0 20px hsl(120 100% 50% / 0.4)',
              }}
            />
          </div>
          
          {/* Status text */}
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-neon-cyan animate-pulse">{statusText}</span>
            <span className="text-primary">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Decorative code lines */}
        <div className="mt-4 text-xs font-mono text-muted-foreground/50 space-y-1 text-center">
          <p className="animate-pulse" style={{ animationDelay: '0s' }}>
            <span className="text-neon-purple">const</span> developer = <span className="text-neon-cyan">"Salman Hafiz"</span>;
          </p>
          <p className="animate-pulse" style={{ animationDelay: '0.2s' }}>
            <span className="text-neon-purple">await</span> loadPortfolio();
          </p>
        </div>
      </div>

      {/* Bottom decorative line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        style={{
          boxShadow: '0 0 10px hsl(120 100% 50% / 0.5)',
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-4 left-4 text-xs font-mono text-primary/50">
        [SYSTEM]
      </div>
      <div className="absolute top-4 right-4 text-xs font-mono text-primary/50 animate-pulse">
        ● LIVE
      </div>
      <div className="absolute bottom-4 left-4 text-xs font-mono text-muted-foreground/50">
        v1.0.0
      </div>
      <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground/50">
        © 2026
      </div>
    </div>
  );
});

export default PageLoader;
