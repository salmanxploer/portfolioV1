import { Terminal, Heart, Code, ArrowUp } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-12 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to top button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={scrollToTop}
            className="group p-3 bg-card border border-border rounded-full 
                       hover:border-primary hover:shadow-[0_0_20px_hsl(120_100%_50%/0.3)]
                       transition-all duration-300"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-card border border-border rounded-lg">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono font-semibold text-foreground">
              salmanhafiz<span className="text-gradient">.</span>me
            </span>
          </div>

          {/* Center text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span>Built </span>
            <span>by</span>
            <span className="text-gradient font-semibold">Salman Hafiz</span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">©</span> {currentYear} All rights reserved
          </div>
        </div>

        {/* Tech stack used */}
        <div className="mt-8 pt-8 border-t border-border/30">
          <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-muted-foreground/50">
            <span className="hover:text-neon-green transition-colors cursor-default">React</span>
            <span>•</span>
            <span className="hover:text-neon-cyan transition-colors cursor-default">TypeScript</span>
            <span>•</span>
            <span className="hover:text-neon-purple transition-colors cursor-default">Tailwind CSS</span>
            <span>•</span>
            <span className="hover:text-neon-pink transition-colors cursor-default">Vite</span>
            <span>•</span>
            <span className="hover:text-neon-orange transition-colors cursor-default">Lucide Icons</span>
          </div>
        </div>

        {/* ASCII art decoration */}
        <div className="mt-8 text-center hidden md:block">
            <pre className="text-[9px] text-primary/30 font-mono leading-[1.1] select-none tracking-tight">
{`
          ███████╗ █████╗ ██╗     ███╗   ███╗ █████╗ ███╗   ██╗    ██╗  ██╗ █████╗ ███████╗██╗███████╗
          ██╔════╝██╔══██╗██║     ████╗ ████║██╔══██╗████╗  ██║    ██║  ██║██╔══██╗██╔════╝██║╚══███╔╝
          ███████╗███████║██║     ██╔████╔██║███████║██╔██╗ ██║    ███████║███████║█████╗  ██║  ███╔╝ 
          ╚════██║██╔══██║██║     ██║╚██╔╝██║██╔══██║██║╚██╗██║    ██╔══██║██╔══██║██╔══╝  ██║ ███╔╝  
          ███████║██║  ██║███████╗██║ ╚═╝ ██║██║  ██║██║ ╚████║    ██║  ██║██║  ██║██║     ██║███████╗
          ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
`}
          </pre>
        </div>
      </div>
    </footer>
  );
};

export default Footer;