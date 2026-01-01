import type React from "react";
import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Github, Linkedin, Mail, Twitter, Send, MessageSquare, MapPin, Phone, CheckCircle2, XCircle, Loader2 } from "lucide-react";

const socials = [
  { name: "GitHub", icon: Github, url: "https://github.com/salmanhafizshuvo/", color: "hover:text-foreground hover:border-foreground", glow: "hover:shadow-[0_0_20px_hsl(0_0%_100%/0.3)]" },
  { name: "LinkedIn", icon: Linkedin, url: "https://bd.linkedin.com/in/mdsalmanhafiz", color: "hover:text-neon-blue hover:border-neon-blue", glow: "hover:shadow-[0_0_20px_hsl(220_100%_60%/0.5)]" },
  { name: "Twitter", icon: Twitter, url: "https://x.com/mdsalmanhafiz", color: "hover:text-neon-cyan hover:border-neon-cyan", glow: "hover:shadow-[0_0_20px_hsl(180_100%_50%/0.5)]" },
  { name: "Email", icon: Mail, url: "mailto:insideshuv01@gmail.com", color: "hover:text-neon-green hover:border-neon-green", glow: "hover:shadow-[0_0_20px_hsl(120_100%_50%/0.5)]" },
];

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    project: "",
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('sending');

    try {
      // Use Netlify Functions endpoint in production, localhost in development
      const apiUrl = import.meta.env.DEV 
        ? 'http://localhost:3001/api/send-email' 
        : '/.netlify/functions/send-email';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', project: '' });
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        console.error('Email error:', data);
        alert(`Error: ${data.error || 'Unknown error'}\nDetails: ${data.details || 'No details'}`);
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert(`Network error: ${error}`);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden">
      {/* Colorful background */}
      <div className="absolute inset-0 mesh-gradient opacity-40" style={{ zIndex: 1 }} />
      <div className="gradient-orb gradient-orb-1 absolute -top-32 left-1/4" style={{ zIndex: 2 }} />
      <div className="gradient-orb gradient-orb-3 absolute -bottom-32 right-1/4" style={{ zIndex: 2 }} />
      
      {/* Top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-purple/50 to-transparent" />
      
      <ScrollReveal className="max-w-4xl mx-auto relative z-10 text-center" as="div">
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
            <p className="text-sm text-muted-foreground">insideshuv01@gmail.com</p>
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

        {/* Contact form */}
        <div className="mb-16 relative">
          {/* Success Message */}
          {status === 'success' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
              <div className="text-center space-y-4 animate-in zoom-in duration-300">
                <div className="relative inline-block">
                  <div className="absolute inset-0 animate-ping">
                    <CheckCircle2 className="w-20 h-20 text-neon-green opacity-75" />
                  </div>
                  <CheckCircle2 className="w-20 h-20 text-neon-green relative" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gradient mb-2">Message Sent Successfully! 🎉</h3>
                  <p className="text-muted-foreground">I'll get back to you within 24 hours.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/95 backdrop-blur-sm rounded-2xl animate-in fade-in duration-500">
              <div className="text-center space-y-4 animate-in zoom-in duration-300">
                <XCircle className="w-20 h-20 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong</h3>
                  <p className="text-muted-foreground">Please try again or email me at insideshuv01@gmail.com</p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-lg shadow-black/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-left text-sm font-medium text-foreground/80">
                Name
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="mt-2 w-full rounded-lg bg-background/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-green/60 focus:border-transparent transition"
                  required
                />
              </label>
              <label className="text-left text-sm font-medium text-foreground/80">
                Email
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@mail.com"
                  className="mt-2 w-full rounded-lg bg-background/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-cyan/60 focus:border-transparent transition"
                  required
                />
              </label>
            </div>
            <label className="text-left text-sm font-medium text-foreground/80">
              Project details
              <textarea
                name="project"
                value={formData.project}
                onChange={handleChange}
                placeholder="Tell me about your idea, goals, timeline, and budget."
                rows={5}
                className="mt-2 w-full rounded-lg bg-background/60 border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon-purple/60 focus:border-transparent transition resize-none"
                required
              />
            </label>
            <div className="flex flex-col gap-3 text-left md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-muted-foreground font-mono">
                Your message opens in your email client—no data stored here.
              </p>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold tracking-tight bg-gradient-to-r from-neon-green via-neon-cyan to-neon-purple text-background shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_hsl(200_100%_50%/0.35)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send message
                  </>
                )}
              </button>
            </div>
          </form>
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
      </ScrollReveal>
    </section>
  );
};

export default ContactSection;