import { memo } from "react";
import DecodeText from "./DecodeText";
import TypewriterText from "./TypewriterText";
import { Terminal, Sparkles, Code2, Zap, Award } from "lucide-react";

const DNA_ROWS = Array.from({ length: 12 }, (_, i) => i);

const DnaColumn = ({ side }: { side: "left" | "right" }) => {
  const leftNodeClass = side === "left" ? "hero-dna-dot-a" : "hero-dna-dot-c";
  const rightNodeClass = side === "left" ? "hero-dna-dot-b" : "hero-dna-dot-d";
  const amplitude = side === "left" ? 14 : 18;

  return (
    <div className={`hero-dna-column ${side === "left" ? "left-[6%]" : "right-[6%]"}`}>
      {DNA_ROWS.map((row) => (
        <div
          key={`${side}-${row}`}
          className="hero-dna-row"
          style={{
            ["--dna-amplitude" as string]: `${amplitude}px`,
            animationDelay: `${row * 0.11}s`,
            animationDuration: `${4 + (row % 4) * 0.35}s`,
          }}
        >
          <span className={`hero-dna-dot ${leftNodeClass}`} />
          <span className="hero-dna-bridge" />
          <span className={`hero-dna-dot ${rightNodeClass}`} />
        </div>
      ))}
    </div>
  );
};

const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-background" style={{ zIndex: 0 }} />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(120_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(120_100%_50%/0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] transform-gpu" style={{ zIndex: 1 }} />
      
      {/* Colorful gradient orbs - reduced for performance */}
      <div className="gradient-orb gradient-orb-1 absolute top-20 left-10 hidden sm:block" style={{ zIndex: 2 }} />
      <div className="gradient-orb gradient-orb-2 absolute bottom-20 right-10 hidden sm:block" style={{ zIndex: 2 }} />
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient opacity-40" style={{ zIndex: 3 }} />

      {/* DNA-style glowing background */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 4 }}>
        <div className="hidden lg:block">
          <DnaColumn side="left" />
          <DnaColumn side="right" />
        </div>

        <div className="hero-glow-blob hero-glow-blob-a" />
        <div className="hero-glow-blob hero-glow-blob-b" />
        <div className="hero-glow-blob hero-glow-blob-c" />
      </div>
      
      {/* Floating particles temporarily disabled */}

      {/* Rotating decorative rings - simplified for performance */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] md:w-[600px] md:h-[600px] pointer-events-none transform-gpu">
        <div className="absolute inset-0 border border-primary/10 rounded-full animate-spin-slow" style={{ animationDuration: '40s' }} />
        <div className="absolute inset-4 sm:inset-6 md:inset-8 border border-neon-cyan/10 rounded-full animate-spin-slow hidden sm:block" style={{ animationDirection: 'reverse', animationDuration: '50s' }} />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-16 sm:py-20 flex flex-col items-center">
        {/* Terminal header */}
        <div className="inline-flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8 border border-primary/40 rounded-xl bg-gradient-to-r from-card/70 via-card/55 to-card/70 backdrop-blur-md animate-fade-in
            shadow-[0_0_20px_hsl(196_92%_66%/0.22),inset_0_0_20px_hsl(196_92%_66%/0.1)]
            hover:shadow-[0_0_34px_hsl(196_92%_66%/0.3),inset_0_0_25px_hsl(196_92%_66%/0.16)]
                transition-all duration-300 max-w-full w-fit mx-auto">
          <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full bg-primary/20 border border-primary/50 flex-shrink-0">
            <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
          </div>
          <span className="text-xs sm:text-sm text-foreground font-mono font-medium tracking-wide truncate">
            ~/ <span className="text-primary font-bold">$</span> <span className="text-neon-cyan">whoami</span>
          </span>
        </div>

        {/* Main title with decode/decrypt effect */}
        <div className="relative mb-4 sm:mb-6 flex justify-center w-full">
          <div className="hero-name-glow-backdrop" />
          <DecodeText
            text="SALMAN HAFIZ"
            className="hero-name-glow text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-[0.06em] leading-tight text-center"
            delay={300}
            speed={60}
            scrambleIterations={4}
          />
        </div>

        <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.22em] text-foreground/55 mb-6 sm:mb-8 text-center">
          Motion-first modern web engineering
        </p>

        {/* Colorful accent line */}
        <div className="w-32 sm:w-48 h-1 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }} />

        {/* Subtitle with typing effect */}
        <div className="mb-8 sm:mb-10 opacity-0 animate-fade-in w-full" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-6 min-h-[2.5rem] sm:min-h-[3rem]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neon-cyan animate-pulse-scale" />
            <span className="text-primary font-bold">&gt;</span> 
            <TypewriterText 
              texts={[
                "Professional Frontend Engineer",
                "WordPress Web Developer",
                "WooCommerce Specialist",
                "React Expert",
                "SEO Optimization Pro"
              ]}
              typingSpeed={80}
              deletingSpeed={40}
              delayBetweenTexts={2500}
              className="bg-gradient-to-r from-primary via-neon-cyan to-neon-purple bg-clip-text text-transparent font-semibold text-center"
            />
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-neon-purple animate-pulse-scale" style={{ animationDelay: '0.5s' }} />
          </p>
          
          {/* Professional tagline */}
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground/80 font-light max-w-3xl mx-auto mb-6 leading-relaxed text-center">
            Crafting <span className="text-neon-cyan font-semibold">high-performance</span> web solutions with cutting-edge technologies.
            Specialized in building <span className="text-neon-green font-semibold">scalable applications</span>, custom WordPress platforms,
            and <span className="text-neon-purple font-semibold">SEO-optimized</span> digital experiences that drive results.
          </p>

          {/* Tech stack badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-5 max-w-4xl mx-auto">
            <span className="px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs sm:text-sm font-mono font-medium backdrop-blur-sm hover:bg-neon-green/20 transition-all duration-300">
              <Code2 className="w-3 h-3 inline-block mr-1" />
              React.js
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs sm:text-sm font-mono font-medium backdrop-blur-sm hover:bg-neon-cyan/20 transition-all duration-300">
              <Zap className="w-3 h-3 inline-block mr-1" />
              TypeScript
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple text-xs sm:text-sm font-mono font-medium backdrop-blur-sm hover:bg-neon-purple/20 transition-all duration-300">
              <Code2 className="w-3 h-3 inline-block mr-1" />
              WordPress
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink text-xs sm:text-sm font-mono font-medium backdrop-blur-sm hover:bg-neon-pink/20 transition-all duration-300">
              <Zap className="w-3 h-3 inline-block mr-1" />
              WooCommerce
            </span>
            <span className="px-3 py-1.5 rounded-full bg-neon-orange/10 border border-neon-orange/30 text-neon-orange text-xs sm:text-sm font-mono font-medium backdrop-blur-sm hover:bg-neon-orange/20 transition-all duration-300">
              <Award className="w-3 h-3 inline-block mr-1" />
              SEO Expert
            </span>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground/60 font-mono max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <span className="text-primary text-lg sm:text-xl font-bold">5+</span>
              <span>Years Experience</span>
            </div>
            <span className="text-muted-foreground/30 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-neon-cyan text-lg sm:text-xl font-bold">100+</span>
              <span>Projects Completed</span>
            </div>
            <span className="text-muted-foreground/30 hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <span className="text-neon-purple text-lg sm:text-xl font-bold">50+</span>
              <span>Happy Clients</span>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-stretch sm:items-center opacity-0 animate-fade-in w-full max-w-md sm:max-w-none" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          <a
            href="#projects"
            className="group relative px-8 sm:px-10 py-3.5 sm:py-4 bg-primary text-primary-foreground font-mono font-bold text-sm sm:text-base
                       rounded-xl transition-all duration-300 overflow-hidden
                       hover:shadow-[0_0_40px_hsl(196_92%_66%/0.56),0_0_80px_hsl(196_92%_66%/0.25)] 
                       hover:scale-105 active:scale-95 w-full sm:w-auto
                       shadow-[0_0_20px_hsl(196_92%_66%/0.35)]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              View Projects
              <span className="text-xs">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple bg-[length:200%_100%] opacity-0 group-hover:opacity-20 transition-opacity duration-300 group-hover:animate-[gradient-text_2s_ease_infinite]" />
          </a>
          <a
            href="#contact"
            className="group relative px-8 sm:px-10 py-3.5 sm:py-4 border-2 border-primary text-primary font-mono font-bold text-sm sm:text-base
                       rounded-xl transition-all duration-300 w-full sm:w-auto
                       hover:bg-primary/15 hover:shadow-[0_0_30px_hsl(196_92%_66%/0.35)]
                       hover:scale-105 active:scale-95 backdrop-blur-sm
                       bg-primary/5"
          >
            <span className="flex items-center justify-center gap-2.5">
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
              Contact Me
            </span>
          </a>
        </div>

        {/* Scroll indicator temporarily removed */}
      </div>
    </section>
  );
});

export default HeroSection;