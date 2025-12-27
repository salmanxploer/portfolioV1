import GlitchText from "./GlitchText";
import { ChevronDown, Terminal } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden matrix-bg">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(120_100%_50%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(120_100%_50%/0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Terminal header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 border border-border rounded-full bg-card/50 backdrop-blur-sm animate-fade-in">
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

        {/* Subtitle with typing effect */}
        <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-light">
            <span className="text-primary">&gt;</span> Professional Web Developer
          </p>
          <p className="mt-2 text-sm md:text-base text-muted-foreground/70 font-mono terminal-cursor">
            React | JavaScript | TypeScript | WordPress | SEO
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}>
          <a
            href="#projects"
            className="group px-8 py-3 bg-primary text-primary-foreground font-mono font-semibold 
                       rounded-lg hover-glow transition-all duration-300 
                       hover:shadow-[0_0_30px_hsl(120_100%_50%/0.5)]"
          >
            <span className="flex items-center gap-2">
              <span>[</span>
              View Projects
              <span>]</span>
            </span>
          </a>
          <a
            href="#contact"
            className="group px-8 py-3 border border-primary text-primary font-mono 
                       rounded-lg hover-glow transition-all duration-300 
                       hover:bg-primary/10"
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
          <ChevronDown className="w-8 h-8 text-primary animate-bounce" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
