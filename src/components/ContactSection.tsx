import { Github, Linkedin, Mail, Twitter, Send, MessageSquare } from "lucide-react";

const socials = [
  { name: "GitHub", icon: Github, url: "https://github.com/salmanhafiz", color: "hover:text-gray-400" },
  { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com/in/salmanhafiz", color: "hover:text-blue-400" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com/salmanhafiz", color: "hover:text-cyan-400" },
  { name: "Email", icon: Mail, url: "mailto:contact@salmanhafiz.dev", color: "hover:text-primary" },
];

const ContactSection = () => {
  return (
    <section id="contact" className="py-20 px-4 bg-background relative">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-4xl mx-auto text-center">
        {/* Section header */}
        <p className="text-sm font-mono text-primary mb-2">// GET IN TOUCH</p>
        <h2 className="text-3xl md:text-4xl font-bold glow-text mb-4">
          &lt;Contact /&gt;
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
          Have a project in mind? Let's work together to build something amazing.
          I'm always open to discussing new opportunities.
        </p>

        {/* Contact CTA */}
        <div className="mb-16">
          <a
            href="mailto:contact@salmanhafiz.dev"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground 
                       font-mono font-semibold rounded-lg hover-glow transition-all duration-300 
                       hover:shadow-[0_0_30px_hsl(120_100%_50%/0.5)] group"
          >
            <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span>Start a Conversation</span>
          </a>
        </div>

        {/* Social links */}
        <div className="flex justify-center gap-6">
          {socials.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-4 bg-card border border-border rounded-lg 
                           hover-glow transition-all duration-300 hover:border-primary
                           hover:scale-110 ${social.color}`}
                aria-label={social.name}
              >
                <Icon className="w-6 h-6 transition-colors" />
              </a>
            );
          })}
        </div>

        {/* Quick response note */}
        <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 border border-border rounded-full bg-card/50">
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
