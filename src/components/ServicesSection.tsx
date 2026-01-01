import { 
  Code, 
  Globe, 
  Search, 
  Server, 
  Palette, 
  Zap,
  ArrowRight 
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const services = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "Building blazing-fast, responsive web applications with React, TypeScript, and modern frameworks.",
    tags: ["React", "TypeScript", "Next.js"],
    color: "hsl(120 100% 50%)",
    gradient: "from-neon-green/20 to-neon-cyan/10",
  },
  {
    icon: Globe,
    title: "WordPress Development",
    description: "Custom themes, plugins, and WooCommerce solutions for scalable business platforms.",
    tags: ["WordPress", "WooCommerce", "PHP"],
    color: "hsl(220 100% 60%)",
    gradient: "from-neon-blue/20 to-neon-purple/10",
  },
  {
    icon: Server,
    title: "Backend Development",
    description: "Robust server-side solutions with Laravel, Node.js, and modern database technologies.",
    tags: ["Laravel", "Node.js", "MongoDB"],
    color: "hsl(280 100% 60%)",
    gradient: "from-neon-purple/20 to-neon-pink/10",
  },
  {
    icon: Search,
    title: "SEO & Analytics",
    description: "Data-driven optimization strategies with Google Analytics, GTM, and search ranking improvements.",
    tags: ["GA4", "GTM", "Core Vitals"],
    color: "hsl(30 100% 50%)",
    gradient: "from-neon-orange/20 to-neon-green/10",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Creating intuitive, visually stunning user experiences with modern design principles.",
    tags: ["Figma", "Design Systems", "Prototyping"],
    color: "hsl(330 100% 60%)",
    gradient: "from-neon-pink/20 to-neon-purple/10",
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Speed up your website with advanced techniques for Core Web Vitals and UX improvements.",
    tags: ["Speed", "Caching", "CDN"],
    color: "hsl(180 100% 50%)",
    gradient: "from-neon-cyan/20 to-neon-green/10",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 cyber-grid opacity-30" style={{ zIndex: 1 }} />
      <div className="gradient-orb gradient-orb-2 absolute top-1/4 -right-48" style={{ zIndex: 2 }} />
      <div className="gradient-orb gradient-orb-3 absolute bottom-1/4 -left-48" style={{ zIndex: 2 }} />
      
      <ScrollReveal className="max-w-7xl mx-auto relative z-10" as="div">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-mono text-primary mb-2">// WHAT I DO</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">&lt;Services /&gt;</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            I build fast, SEO-optimized websites and web apps using <strong>React</strong>, <strong>TypeScript</strong>, and <strong>WordPress</strong>.
            My focus is on <strong>Core Web Vitals</strong>, clean technical SEO (schema, sitemaps, robots), and measurable results with <strong>GA4</strong> and <strong>GTM</strong>.
            Whether you need a high-converting landing page or a scalable product UI, I deliver performance, accessibility, and maintainable code.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className={`group relative p-6 bg-card/80 backdrop-blur-sm border border-border rounded-xl
                           overflow-hidden transition-all duration-500 hover:border-primary/50
                           hover:transform hover:scale-[1.02] opacity-0 animate-fade-in shimmer`}
                style={{ 
                  animationDelay: `${index * 100}ms`, 
                  animationFillMode: "forwards" 
                }}
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 
                                group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon with glow */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 
                               border border-border bg-background/50 backdrop-blur-sm
                               group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      boxShadow: `0 0 20px ${service.color}20`,
                    }}
                  >
                    <Icon 
                      className="w-7 h-7 transition-all duration-300" 
                      style={{ color: service.color }}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 text-xs font-mono bg-background/50 border border-border 
                                   rounded-md text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Learn more link */}
                  <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 
                                  transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="font-mono">Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ServicesSection;