import { Code, Palette, Rocket, Shield, Zap, Globe } from "lucide-react";

const skills = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "Building responsive, performant UIs with React, TypeScript, and modern CSS frameworks.",
  },
  {
    icon: Globe,
    title: "WordPress Expert",
    description: "Custom themes, plugins, and WooCommerce solutions for scalable web platforms.",
  },
  {
    icon: Rocket,
    title: "SEO & Analytics",
    description: "Google Tag Manager, GA4 integration, and search optimization strategies.",
  },
  {
    icon: Shield,
    title: "Backend Development",
    description: "PHP, Laravel, Node.js, and database management with MongoDB & MySQL.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Creating intuitive user experiences with modern design principles.",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Optimizing load times, Core Web Vitals, and user experience metrics.",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 bg-terminal-surface relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-mono text-primary mb-2">// ABOUT ME</p>
          <h2 className="text-3xl md:text-4xl font-bold glow-text mb-4">
            &lt;Skills /&gt;
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

        {/* Terminal-style bio */}
        <div className="max-w-4xl mx-auto mb-16 p-6 bg-background border border-border rounded-lg">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-sm text-muted-foreground font-mono">terminal — bash</span>
          </div>
          <div className="font-mono text-sm space-y-2">
            <p><span className="text-primary">$</span> cat about.txt</p>
            <p className="text-muted-foreground pl-4">
              Name: <span className="text-foreground">Salman Hafiz</span>
            </p>
            <p className="text-muted-foreground pl-4">
              Role: <span className="text-foreground">Professional Web Developer</span>
            </p>
            <p className="text-muted-foreground pl-4">
              Focus: <span className="text-foreground">React, WordPress, SEO, Full-Stack Development</span>
            </p>
            <p className="text-muted-foreground pl-4">
              Experience: <span className="text-foreground">Building production-ready web solutions</span>
            </p>
            <p className="text-primary mt-4">$ _<span className="animate-pulse">▋</span></p>
          </div>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <div
                key={skill.title}
                className="group p-6 bg-background border border-border rounded-lg 
                         hover-glow transition-all duration-300 hover:border-primary
                         opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{skill.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
