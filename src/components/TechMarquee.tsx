import { memo, useMemo } from "react";
import { 
  Code2, 
  FileCode, 
  Database, 
  Flame, 
  GitBranch, 
  Server, 
  BarChart3, 
  Settings,
  Globe,
  Layers,
  Zap,
  Terminal
} from "lucide-react";

const techStack = [
  { name: "React", icon: Code2 },
  { name: "JavaScript", icon: FileCode },
  { name: "TypeScript", icon: FileCode },
  { name: "Node.js", icon: Server },
  { name: "MongoDB", icon: Database },
  { name: "Firebase", icon: Flame },
  { name: "GitHub", icon: GitBranch },
  { name: "WordPress", icon: Globe },
  { name: "SEO", icon: BarChart3 },
  { name: "GTM", icon: Settings },
  { name: "GA4", icon: BarChart3 },
  { name: "PHP", icon: Terminal },
  { name: "Laravel", icon: Layers },
  { name: "WooCommerce", icon: Zap },
];

const TechMarquee = memo(function TechMarquee() {
  // Double the items for seamless infinite scroll - memoized
  const items = useMemo(() => [...techStack, ...techStack], []);

  return (
    <div className="w-full overflow-hidden py-8 bg-terminal-surface border-y border-border contain-layout">
      <div className="marquee">
        <div className="marquee-content gap-8 md:gap-16">
          {items.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div
                key={`${tech.name}-${index}`}
                className="flex items-center gap-3 px-6 py-3 border border-border rounded-lg 
                         bg-background/50 hover-glow 
                         hover:border-primary hover:bg-primary/10 group cursor-pointer
                         min-w-fit transform-gpu"
              >
                <Icon 
                  className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" 
                  strokeWidth={1.5}
                />
                <span className="text-foreground font-mono text-sm md:text-base whitespace-nowrap">
                  {tech.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default TechMarquee;
