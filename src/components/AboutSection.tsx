import { Code, Palette, Rocket, Shield, Zap, Globe, Coffee, Clock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const skills = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "Building responsive, performant UIs with React, TypeScript, and modern CSS frameworks.",
    color: "text-neon-green",
  },
  {
    icon: Globe,
    title: "WordPress Expert",
    description: "Custom themes, plugins, and WooCommerce solutions for scalable web platforms.",
    color: "text-neon-blue",
  },
  {
    icon: Rocket,
    title: "SEO & Analytics",
    description: "Google Tag Manager, GA4 integration, and search optimization strategies.",
    color: "text-neon-orange",
  },
  {
    icon: Shield,
    title: "Backend Development",
    description: "PHP, Laravel, Node.js, and database management with MongoDB & MySQL.",
    color: "text-neon-purple",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Creating intuitive user experiences with modern design principles.",
    color: "text-neon-pink",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Optimizing load times, Core Web Vitals, and user experience metrics.",
    color: "text-neon-cyan",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 relative overflow-hidden">
      {/* Colorful background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 cyber-grid opacity-20" style={{ zIndex: 1 }} />
      
      {/* Decorative orbs */}
      <div className="gradient-orb gradient-orb-1 absolute top-0 right-0 opacity-30" style={{ zIndex: 2 }} />
      <div className="gradient-orb gradient-orb-2 absolute bottom-0 left-0 opacity-30" style={{ zIndex: 2 }} />
      
      {/* Top line decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
      
      <ScrollReveal className="max-w-7xl mx-auto relative z-10" as="div">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-mono text-primary mb-2">// ABOUT ME</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">&lt;Skills /&gt;</span>
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed">
              I'm a passionate full-stack web developer with expertise in building 
              modern, scalable web applications. From crafting pixel-perfect frontends 
              to architecting robust backends, I bring ideas to life with clean code 
              and creative solutions.
            </p>
          </div>
        </div>

        {/* Terminal-style bio with enhanced design */}
        <div className="max-w-4xl mx-auto mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-green/20 via-neon-cyan/10 to-neon-purple/20 rounded-xl blur-xl" />
          <div className="relative p-6 bg-card/90 backdrop-blur-sm border border-border rounded-xl border-gradient">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="ml-4 text-sm text-muted-foreground font-mono">terminal — bash</span>
            </div>
            <div className="font-mono text-sm space-y-3">
              <p><span className="text-neon-green">$</span> cat about.txt</p>
              <div className="pl-4 space-y-2">
                <p className="text-muted-foreground">
                  Name: <span className="text-neon-cyan">Salman Hafiz</span>
                </p>
                <p className="text-muted-foreground">
                  Role: <span className="text-neon-purple">Professional Web Developer</span>
                </p>
                <p className="text-muted-foreground">
                  Focus: <span className="text-neon-pink">React, WordPress, SEO, Full-Stack Development</span>
                </p>
                <p className="text-muted-foreground">
                  Experience: <span className="text-neon-orange">5+ Years Building Production Apps</span>
                </p>
                <p className="text-muted-foreground">
                  Location: <span className="text-foreground">Available Worldwide</span>
                </p>
              </div>
              <p className="text-neon-green mt-4">$ <span className="animate-pulse">▋</span></p>
            </div>
          </div>
        </div>

        {/* Quick facts row */}
        <div className="flex flex-wrap justify-center gap-6 mb-16">
          <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border rounded-full">
            <Coffee className="w-4 h-4 text-neon-orange" />
            <span className="text-sm font-mono text-muted-foreground">Coffee Enthusiast</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border rounded-full">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-mono text-muted-foreground">Quick Turnaround</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-card/50 border border-border rounded-full">
            <Globe className="w-4 h-4 text-neon-purple" />
            <span className="text-sm font-mono text-muted-foreground">Remote Friendly</span>
          </div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.title}
                className="group p-6 bg-card/80 backdrop-blur-sm border border-border rounded-xl 
                         transition-all duration-500 hover:border-primary/50
                         hover:transform hover:scale-[1.02] shimmer
                         opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 bg-background/50 border border-border rounded-xl 
                                  group-hover:scale-110 transition-all duration-300`}>
                    <Icon className={`w-6 h-6 ${skill.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {skill.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{skill.description}</p>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
};

export default AboutSection;