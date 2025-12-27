import { Github, Linkedin, Mail, Twitter, Send, MessageSquare, MapPin, Phone } from "lucide-react";

const socials = [
  { name: "GitHub", icon: Github, url: "https://github.com/salmanhafiz", color: "hover:text-foreground hover:border-foreground", glow: "hover:shadow-[0_0_20px_hsl(0_0%_100%/0.3)]" },
  { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/in/salmanhafiz", color: "hover:text-neon-blue hover:border-neon-blue", glow: "hover:shadow-[0_0_20px_hsl(220_100%_60%/0.5)]" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com/salmanhafiz", color: "hover:text-neon-cyan hover:border-neon-cyan", glow: "hover:shadow-[0_0_20px_hsl(180_100%_50%/0.5)]" },
  { name: "Email", icon: Mail, url: "mailto:contact@salmanhafiz.dev", color: "hover:text-neon-green hover:border-neon-green", glow: "hover:shadow-[0_0_20px_hsl(120_100%_50%/0.5)]" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden">
      {/* Colorful background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="gradient-orb gradient-orb-1 absolute -top-32 left-1/4" />
      <div className="gradient-orb gradient-orb-3 absolute -bottom-32 right-1/4" />
      
      {/* Top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Section header */}
        <p className="text-sm font-mono text-primary mb-2">// GET IN TOUCH</p>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="text-gradient">&lt;Contact /&gt;</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Have a project in mind? Let's work together to build something amazing.
          I'm always open to discussing new opportunities.
        </p>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:border-neon-green/50 transition-all duration-300 shimmer">
            <Mail className="w-8 h-8 text-neon-green mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Email</h4>
            <p className="text-sm text-muted-foreground">contact@salmanhafiz.dev</p>
          </div>
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:border-neon-cyan/50 transition-all duration-300 shimmer">
            <MapPin className="w-8 h-8 text-neon-cyan mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Location</h4>
            <p className="text-sm text-muted-foreground">Available Worldwide</p>
          </div>
          <div className="p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:border-neon-purple/50 transition-all duration-300 shimmer">
            <Phone className="w-8 h-8 text-neon-purple mx-auto mb-3" />
            <h4 className="font-semibold mb-1">Availability</h4>
            <p className="text-sm text-muted-foreground">Mon - Fri, 9AM - 6PM</p>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mb-16">
          <a
            href="mailto:contact@salmanhafiz.dev"
            className="inline-flex items-center gap-3 px-8 py-4 font-mono font-semibold rounded-xl 
                       transition-all duration-300 group relative overflow-hidden
                       bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple
                       hover:shadow-[0_0_40px_hsl(120_100%_50%/0.4)]"
          >
            <Send className="w-5 h-5 text-background group-hover:translate-x-1 transition-transform" />
            <span className="text-background font-bold">Start a Conversation</span>
          </a>
        </div>

        {/* Social links */}
        <div className="flex justify-center gap-4 mb-12">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl 
                           transition-all duration-300 hover:scale-110 ${social.color} ${social.glow}`}
                aria-label={social.name}
              >
                <Icon className="w-6 h-6 transition-colors" />
              </a>
            );
          })}
        </div>

        {/* Quick response note */}
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full bg-card/50 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground font-mono">
            Usually responds within 24 hours
          </span>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;