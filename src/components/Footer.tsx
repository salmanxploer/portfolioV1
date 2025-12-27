import { Terminal, Heart, Code } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 px-4 bg-terminal-surface border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <span className="font-mono font-semibold text-foreground">
              salman<span className="text-primary">.</span>dev
            </span>
          </div>

          {/* Center text */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>&</span>
            <Code className="w-4 h-4 text-primary" />
            <span>by Salman Hafiz</span>
          </div>

          {/* Copyright */}
          <div className="text-sm text-muted-foreground font-mono">
            <span className="text-primary">©</span> {currentYear} All rights reserved
          </div>
        </div>

        {/* ASCII art decoration */}
        <div className="mt-8 text-center">
          <pre className="text-[8px] md:text-[10px] text-primary/30 font-mono leading-tight select-none">
{`
    ____  ___   __    __  ______    _   __   __  __   ___    ______ __  _____
   / __ \\/   | / /   /  |/  /   |  / | / /  / / / /  /   |  / __  //  |/  /   |
  / /_/ / /| |/ /   / /|_/ / /| | /  |/ /  / /_/ /  / /| | / /_/ // /|_/ / /| |
 /  ___/ ___ / /___/ /  / / ___ |/ /|  /  / __  /  / ___ |/ _, _// /  / / ___ |
/_/   /_/  |_/_____/_/  /_/_/  |_/_/ |_/  /_/ /_/  /_/  |_/_/ |_|/_/  /_/_/  |_|
`}
          </pre>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
