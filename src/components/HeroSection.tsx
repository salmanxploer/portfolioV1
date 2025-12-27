import GlitchText from "./GlitchText";
import { ChevronDown, Terminal, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-background" />
      
      {/* Colorful gradient orbs */}
      <div className="gradient-orb gradient-orb-1 absolute top-20 left-10" />
      <div className="gradient-orb gradient-orb-2 absolute bottom-20 right-10" />
      <div className="gradient-orb gradient-orb-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(120_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(120_100%_50%/0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient opacity-60" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: i % 3 === 0 
                ? 'hsl(120 100% 50% / 0.4)' 
                : i % 3 === 1 
                  ? 'hsl(180 100% 50% / 0.3)' 
                  : 'hsl(280 100% 60% / 0.3)',
              boxShadow: i % 3 === 0 
                ? '0 0 10px hsl(120 100% 50% / 0.5)' 
                : i % 3 === 1 
                  ? '0 0 10px hsl(180 100% 50% / 0.4)' 
                  : '0 0 10px hsl(280 100% 60% / 0.4)',
            }}
          />
        ))}
      </div>

      {/* Rotating decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div className="absolute inset-0 border border-primary/10 rounded-full animate-spin-slow" />
        <div className="absolute inset-8 border border-neon-cyan/10 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
        <div className="absolute inset-16 border border-neon-purple/10 rounded-full animate-spin-slow" style={{ animationDuration: '30s' }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Terminal header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-border rounded-full bg-card/50 backdrop-blur-sm animate-fade-in border-gradient">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-mono">
            ~/salman-hafiz <span className="text-primary">$</span> whoami
          </span>
        </div>

        {/* Main title with glitch effect */}
        <GlitchText
          text="SALMAN HAFIZ"
          className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-wider mb-6"
        />

        {/* Colorful accent line */}
        <div className="w-48 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple opacity-0 animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }} />

        {/* Subtitle with typing effect */}
        <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-light flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-cyan animate-pulse-scale" />
            <span className="text-primary">&gt;</span> Professional Web Developer
            <Sparkles className="w-5 h-5 text-neon-purple animate-pulse-scale" style={{ animationDelay: '0.5s' }} />
          </p>
          <p className="mt-3 text-sm md:text-base text-muted-foreground/70 font-mono">
            <span className="text-neon-green">React</span>
            <span className="text-muted-foreground/40 mx-2">|</span>
            <span className="text-neon-cyan">JavaScript</span>
            <span className="text-muted-foreground/40 mx-2">|</span>
            <span className="text-neon-purple">TypeScript</span>
            <span className="text-muted-foreground/40 mx-2">|</span>
            <span className="text-neon-pink">WordPress</span>
            <span className="text-muted-foreground/40 mx-2">|</span>
            <span className="text-neon-orange">SEO</span>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          <a
            href="#projects"
            className="group relative px-8 py-3 bg-primary text-primary-foreground font-mono font-semibold 
                       rounded-lg transition-all duration-300 overflow-hidden
                       hover:shadow-[0_0_30px_hsl(120_100%_50%/0.5)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>[</span>
              View Projects
              <span>]</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-[gradient-text_2s_ease_infinite]" />
          </a>
          <a
            href="#contact"
            className="group px-8 py-3 border border-primary text-primary font-mono 
                       rounded-lg transition-all duration-300 
                       hover:bg-primary/10 hover:shadow-[0_0_20px_hsl(120_100%_50%/0.3)]"
          >
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">&lt;</span>
              Contact Me
              <span className="text-muted-foreground">/&gt;</span>
            </span>
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "forwards" }}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground/50">scroll</span>
            <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;