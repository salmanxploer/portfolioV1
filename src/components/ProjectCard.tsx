import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  url: string;
  category: string;
  description?: string;
  index: number;
}

const ProjectCard = ({ title, url, category, description, index }: ProjectCardProps) => {
  const categoryColors: Record<string, string> = {
    "WordPress": "border-l-green-400",
    "Laravel": "border-l-red-400",
    "React": "border-l-cyan-400",
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative block p-6 bg-card border border-border rounded-lg",
        "tilt-card hover-glow transition-all duration-500",
        "border-l-4",
        categoryColors[category] || "border-l-primary",
        "opacity-0 animate-fade-in"
      )}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            [{category}]
          </span>
          <ExternalLink 
            className="w-4 h-4 text-muted-foreground group-hover:text-primary 
                       transform group-hover:translate-x-1 group-hover:-translate-y-1 
                       transition-all duration-300" 
          />
        </div>

        <h3 className="text-lg font-semibold text-foreground group-hover:glow-text transition-all mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="text-primary">$</span>
          <span className="font-mono truncate max-w-[200px]">
            {url.replace('https://', '').replace('http://', '')}
          </span>
        </div>
      </div>

      {/* Corner decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent 
                      group-hover:border-primary transition-colors duration-300 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-transparent 
                      group-hover:border-primary transition-colors duration-300 rounded-bl-lg" />
    </a>
  );
};

export default ProjectCard;
