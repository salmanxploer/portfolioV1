import { 
  Code, 
  Globe, 
  Search, 
  Server, 
  Palette, 
  Zap,
  Sparkles,
  Lightbulb,
  Layers,
  Wind,
  Activity,
  BoxSelect
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMotionStore } from "@/stores/motionStore";

gsap.registerPlugin(ScrollTrigger);

type Service = {
  icon: LucideIcon;
  title: string;
  description: string;
  detailedDescription: string;
  tags: string[];
  features: string[];
  color: string;
  gradient: string;
  cursorHue: number;
};

const services: Service[] = [
  {
    icon: Code,
    title: "Frontend Development",
    description: "Building blazing-fast, responsive web applications with React, TypeScript, and modern frameworks.",
    detailedDescription: "Crafting pixel-perfect, high-performance frontends with cutting-edge web technologies. Expertise in component architecture, state management, and modern CSS solutions.",
    tags: ["React", "TypeScript", "Next.js"],
    features: ["Responsive Design", "Performance Optimized", "Accessibility First"],
    color: "hsl(120 100% 50%)",
    gradient: "from-neon-green/20 to-neon-cyan/10",
    cursorHue: 164,
  },
  {
    icon: Sparkles,
    title: "GSAP & ScrollTrigger",
    description: "Creating cinematic, scroll-driven animations and interactive motion sequences that captivate users.",
    detailedDescription: "Leverage the power of GSAP (GreenSock Animation Platform) to create buttery-smooth, performant animations. ScrollTrigger enables stunning scroll-based effects and timeline sequences.",
    tags: ["GSAP", "ScrollTrigger", "Tweens"],
    features: ["Smooth Tweening", "Scroll Animations", "Timeline Control"],
    color: "hsl(45 100% 50%)",
    gradient: "from-yellow-500/20 to-orange-500/10",
    cursorHue: 45,
  },
  {
    icon: Wind,
    title: "Framer Motion",
    description: "Production-ready motion library for React with declarative animation APIs and gesture support.",
    detailedDescription: "Build sophisticated animations with a simple, React-friendly API. Framer Motion handles transitions, gestures, and layout animations seamlessly.",
    tags: ["Framer Motion", "React", "Gestures"],
    features: ["Declarative Syntax", "Gesture Recognition", "Layout Shifts"],
    color: "hsl(200 100% 60%)",
    gradient: "from-cyan-500/20 to-blue-500/10",
    cursorHue: 196,
  },
  {
    icon: BoxSelect,
    title: "SVG Animation",
    description: "Craft scalable, responsive, and interactive vector graphics with advanced animation techniques.",
    detailedDescription: "Animate SVG paths, morphing shapes, and complex graphics with precision. Perfect for logos, icons, and data visualizations with motion.",
    tags: ["SVG", "Path Animation", "Morphing"],
    features: ["Path Animations", "Shape Morphing", "Responsive Scaling"],
    color: "hsl(290 100% 60%)",
    gradient: "from-purple-500/20 to-pink-500/10",
    cursorHue: 286,
  },
  {
    icon: Lightbulb,
    title: "Micro-Interactions",
    description: "Form-focused, subtle animations that provide delightful feedback and guide user behavior.",
    detailedDescription: "Design micro-interactions that enhance UX: button feedback, loading states, input validation, and hover effects that feel premium and responsive.",
    tags: ["Feedback", "Polish", "UX"],
    features: ["Button Feedback", "Loading States", "Validation Animations"],
    color: "hsl(50 100% 60%)",
    gradient: "from-yellow-400/20 to-yellow-500/10",
    cursorHue: 36,
  },
  {
    icon: Activity,
    title: "UI Motion Design",
    description: "Comprehensive motion design systems for modern interfaces with fluid transitions and dynamic interactions.",
    detailedDescription: "Create cohesive motion design language across your entire application. Combine multiple animation libraries for professional, branded interactions.",
    tags: ["Motion Design", "Transitions", "User flows"],
    features: ["Transition Systems", "Brand Animation", "Flow Design"],
    color: "hsl(15 100% 60%)",
    gradient: "from-orange-500/20 to-red-500/10",
    cursorHue: 15,
  },
  {
    icon: Layers,
    title: "State Management with Zustand",
    description: "Lightweight, simple state management for React with zero boilerplate and minimal overhead.",
    detailedDescription: "Zustand provides a minimal, intuitive API for managing app state without the complexity of Redux or MobX. Perfect for small to mid-scale applications.",
    tags: ["Zustand", "State", "React"],
    features: ["Simple API", "DevTools Support", "TypeScript Ready"],
    color: "hsl(270 100% 60%)",
    gradient: "from-purple-500/20 to-indigo-500/10",
    cursorHue: 266,
  },
  {
    icon: Globe,
    title: "WordPress Development",
    description: "Custom themes, plugins, and WooCommerce solutions for scalable business platforms.",
    detailedDescription: "Enterprise-grade WordPress solutions with custom themes, plugins, and e-commerce integration for maximum flexibility.",
    tags: ["WordPress", "WooCommerce", "PHP"],
    features: ["Custom Themes", "Plugin Dev", "E-Commerce"],
    color: "hsl(220 100% 60%)",
    gradient: "from-neon-blue/20 to-neon-purple/10",
    cursorHue: 214,
  },
  {
    icon: Server,
    title: "Backend Development",
    description: "Robust server-side solutions with Laravel, Node.js, and modern database technologies.",
    detailedDescription: "Build scalable, secure backend systems with modern frameworks and databases. RESTful APIs, real-time applications, and microservices architecture.",
    tags: ["Laravel", "Node.js", "MongoDB"],
    features: ["RESTful APIs", "Real-time Systems", "Scalable Architecture"],
    color: "hsl(280 100% 60%)",
    gradient: "from-neon-purple/20 to-neon-pink/10",
    cursorHue: 280,
  },
  {
    icon: Search,
    title: "SEO & Analytics",
    description: "Data-driven optimization strategies with Google Analytics, GTM, and search ranking improvements.",
    detailedDescription: "Comprehensive SEO implementation with technical optimization, schema markup, and detailed analytics tracking for measurable results.",
    tags: ["GA4", "GTM", "Core Vitals"],
    features: ["Technical SEO", "Analytics Setup", "Conversion Tracking"],
    color: "hsl(30 100% 50%)",
    gradient: "from-neon-orange/20 to-neon-green/10",
    cursorHue: 28,
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Creating intuitive, visually stunning user experiences with modern design principles.",
    detailedDescription: "End-to-end design solutions from wireframes to high-fidelity prototypes. Accessibility-first approach with usability testing and refinement.",
    tags: ["Figma", "Design Systems", "Prototyping"],
    features: ["Wireframes", "High-Fidelity", "User Testing"],
    color: "hsl(330 100% 60%)",
    gradient: "from-neon-pink/20 to-neon-purple/10",
    cursorHue: 328,
  },
  {
    icon: Zap,
    title: "Performance Optimization",
    description: "Speed up your website with advanced techniques for Core Web Vitals and UX improvements.",
    detailedDescription: "Optimize every millisecond. Image optimization, code splitting, lazy loading, and advanced caching strategies for blazing-fast sites.",
    tags: ["Speed", "Caching", "CDN"],
    features: ["Image Optimization", "Code Splitting", "Caching Strategy"],
    color: "hsl(180 100% 50%)",
    gradient: "from-neon-cyan/20 to-neon-green/10",
    cursorHue: 188,
  },
];

const WAVE_PATH_A = "M20 90 C110 20, 190 120, 280 60 S450 20, 540 75 S710 130, 880 42";
const WAVE_PATH_B = "M20 105 C140 155, 220 35, 320 85 S510 145, 600 70 S770 28, 880 108";

const ServicesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const expandedIndex = useMotionStore((state) => state.expandedCard);
  const setExpandedIndex = useMotionStore((state) => state.setExpandedCard);
  const activeCard = useMotionStore((state) => state.activeCard);
  const setActiveCard = useMotionStore((state) => state.setActiveCard);
  const setCursorHue = useMotionStore((state) => state.setCursorHue);

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { y: 40, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              once: true,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleExpand = (index: number, hue: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
    setCursorHue(hue);
  };

  return (
    <section
      ref={sectionRef}
      id="services" 
      className="section-shell py-32 px-4 relative overflow-hidden"
    >
      {/* Enhanced animated background with matte effect */}
      <div className="absolute inset-0 opacity-40" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(79, 172, 254, 0.1) 0%, transparent 50%),
                          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
        zIndex: 1
      }} />
      <div className="absolute inset-0 cyber-grid opacity-5" style={{ zIndex: 1 }} />
      <div className="section-divider" />
      
      <ScrollReveal className="max-w-7xl mx-auto relative z-10" as="div">
        {/* Enhanced Section header */}
        <motion.div
          className="services-heading text-center mb-20"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="inline-block mb-4">
            <p className="text-sm font-mono text-primary/90 tracking-wider bg-primary/10 px-4 py-1.5 rounded-full border border-primary/30">
              // EXPERTISE & SPECIALIZATION
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight text-foreground">
            Motion-Driven Design System
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Real motion engineering powered by GSAP + ScrollTrigger, SVG path animation, Framer Motion,
            and Zustand state orchestration to deliver smooth micro-interactions with a modern visual rhythm.
          </p>

          <div className="max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card/50 backdrop-blur-xl p-4 md:p-5 shadow-[0_10px_30px_hsl(228_30%_6%/0.45)]">
            <svg viewBox="0 0 900 140" className="w-full h-28 md:h-32" role="img" aria-label="Animated motion waveform">
              <defs>
                <linearGradient id="waveA" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(192 92% 66%)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(192 92% 66%)" stopOpacity="1" />
                  <stop offset="100%" stopColor="hsl(192 92% 66%)" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="waveB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(266 85% 73%)" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="hsl(266 85% 73%)" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="hsl(266 85% 73%)" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <path d={WAVE_PATH_A} stroke="hsl(192 92% 66% / 0.2)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <path d={WAVE_PATH_B} stroke="hsl(266 85% 73% / 0.22)" strokeWidth="2.8" fill="none" strokeLinecap="round" />

              <motion.path
                d={WAVE_PATH_A}
                pathLength={1}
                stroke="url(#waveA)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.24 0.76"
                animate={{ strokeDashoffset: [0, -1] }}
                transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
              />
              <motion.path
                d={WAVE_PATH_B}
                pathLength={1}
                stroke="url(#waveB)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.22 0.78"
                animate={{ strokeDashoffset: [0, 1] }}
                transition={{ duration: 6.6, repeat: Infinity, ease: "linear" }}
              />

              <motion.circle
                cx="450"
                cy="70"
                r="8"
                fill="hsl(328 88% 74%)"
                animate={{ x: [-18, 18, -18], opacity: [0.65, 1, 0.65] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </svg>
          </div>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = expandedIndex === index;

            return (
              <motion.div
                key={service.title}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onMouseEnter={() => {
                  setActiveCard(index);
                  setCursorHue(service.cursorHue);
                }}
                onMouseLeave={() => setActiveCard(null)}
                onClick={() => handleExpand(index, service.cursorHue)}
                className={`group relative cursor-pointer transition-all duration-500 ease-out
                           ${isExpanded ? 'lg:col-span-2 lg:row-span-2' : ''}`}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: "spring", stiffness: 240, damping: 20 }}
              >
                {/* Card Container - Dark Matte with Light Accents */}
                <div className={`relative h-full p-6 md:p-8 rounded-2xl overflow-hidden
                              backdrop-blur-xl border transition-all duration-500
                              ${isExpanded 
                                ? 'shadow-2xl' 
                                : 'hover:shadow-xl'
                              }
                              opacity-0 animate-fade-in`}
                  style={{
                    backgroundColor: isExpanded 
                      ? `rgba(15, 23, 42, 0.8)` 
                      : `rgba(15, 23, 42, 0.6)`,
                    borderColor: isExpanded 
                      ? `${service.color}60` 
                      : `${service.color}30`,
                    boxShadow: isExpanded 
                      ? `0 0 40px ${service.color}25, inset 0 0 30px ${service.color}15` 
                      : `0 0 20px ${service.color}15`,
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards"
                  }}
                >
                  {/* Animated gradient border effect on hover */}
                  <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                       style={{
                         background: `linear-gradient(135deg, ${service.color}25, transparent)`,
                       }} />

                  {/* Top accent bar with light glow */}
                  <div className="absolute top-0 left-0 h-1.5 transition-all duration-500 blur-sm"
                       style={{
                         width: isExpanded ? '100%' : '0%',
                         backgroundColor: service.color,
                         opacity: isExpanded ? 1 : 0,
                         boxShadow: `0 0 20px ${service.color}80`,
                       }} />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-4">
                      {/* Icon with enhanced light glow */}
                      <motion.div
                        className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 transform"
                        animate={{
                          scale: isExpanded ? 1.1 : activeCard === index ? 1.06 : 1,
                          rotate: activeCard === index ? 2 : 0,
                        }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        style={{ 
                          backgroundColor: `${service.color}12`,
                          borderColor: `${service.color}45`,
                          boxShadow: `0 0 25px ${service.color}40, inset 0 0 20px ${service.color}15`,
                        }}
                      >
                        <Icon 
                          className={`transition-all duration-300 ${isExpanded ? 'w-8 h-8' : 'w-7 h-7'}`}
                          style={{ 
                            color: service.color,
                            filter: `drop-shadow(0 0 12px ${service.color}60)` 
                          }}
                        />
                      </motion.div>
                      
                      {/* Index badge with light accent */}
                      <div className="px-3 py-1 rounded-lg border text-xs font-mono transition-all duration-300"
                           style={{
                             backgroundColor: `${service.color}15`,
                             borderColor: `${service.color}40`,
                             color: service.color,
                             textShadow: `0 0 8px ${service.color}40`,
                           }}>
                        0{index + 1}
                      </div>
                    </div>

                    {/* Title with light color */}
                    <h3 className={`font-bold mb-3 transition-all duration-300 line-clamp-2`}
                        style={{
                          fontSize: isExpanded ? '1.5rem' : '1.125rem',
                          color: isExpanded ? '#e0f2fe' : '#cbd5e1'
                        }}>
                      {service.title}
                    </h3>
                    
                    {/* Separator line with glow */}
                    <div className="w-8 h-1 rounded-full mb-4 transition-all duration-300"
                         style={{ 
                           backgroundColor: service.color, 
                           opacity: isExpanded ? 1 : 0.5,
                           boxShadow: `0 0 12px ${service.color}60`,
                         }} />

                    {/* Description - always shown */}
                    <p className={`leading-relaxed transition-all duration-300`}
                       style={{
                         fontSize: isExpanded ? '1rem' : '0.875rem',
                         color: '#cbd5e1',
                         maxHeight: isExpanded ? 'none' : '3em',
                         overflow: isExpanded ? 'visible' : 'hidden',
                       }}>
                      {service.description}
                    </p>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="space-y-5 mb-6 animate-fade-in">
                        {/* Divider with light accent */}
                        <div style={{
                          height: '1px',
                          background: `linear-gradient(to right, ${service.color}50, ${service.color}10, transparent)`,
                        }} />

                        {/* Detailed description */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: service.color }}>
                            <span className="w-1 h-4 rounded-full" style={{ backgroundColor: service.color, boxShadow: `0 0 8px ${service.color}` }} />
                            Details
                          </h4>
                          <p className="text-sm leading-relaxed ml-1" style={{ color: '#cbd5e1' }}>
                            {service.detailedDescription}
                          </p>
                        </div>

                        {/* Features with light styling */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: service.color }}>
                            <span className="w-1 h-4 rounded-full" style={{ backgroundColor: service.color, boxShadow: `0 0 8px ${service.color}` }} />
                            Key Features
                          </h4>
                          <div className="flex flex-wrap gap-2 ml-1">
                            {service.features.map((feature) => (
                              <motion.div
                                key={feature}
                                className="px-3 py-2 rounded-lg transition-all duration-300 border backdrop-blur-sm hover:scale-105 cursor-default"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                style={{
                                  backgroundColor: `${service.color}20`,
                                  borderColor: `${service.color}50`,
                                  color: service.color,
                                  boxShadow: `0 0 12px ${service.color}30`,
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">✦</span>
                                  <span className="text-xs font-medium">{feature}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{
                          height: '1px',
                          background: `linear-gradient(to right, transparent, ${service.color}10, ${service.color}50)`,
                        }} />
                      </div>
                    )}

                    {/* Tags with light styling */}
                    <div className="flex flex-wrap gap-2 mb-4 transition-all duration-300"
                         style={{ maxHeight: isExpanded ? '200px' : 'auto' }}>
                      {service.tags.map((tag) => (
                        <motion.span 
                          key={tag}
                          className="px-2.5 py-1 text-xs font-mono rounded-md backdrop-blur-sm transition-all duration-300 border hover:scale-105 cursor-default"
                          whileHover={{ y: -2, scale: 1.06 }}
                          style={{
                            backgroundColor: `${service.color}15`,
                            borderColor: `${service.color}40`,
                            color: service.color,
                            textShadow: `0 0 6px ${service.color}40`,
                            boxShadow: `0 0 8px ${service.color}20`,
                          }}
                        >
                          #{tag}
                        </motion.span>
                      ))}
                    </div>

                    {/* Expandable CTA with light accent */}
                    <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 mt-auto pt-4`}
                         style={{ 
                           color: service.color,
                           borderTopColor: `${service.color}25`,
                           borderTopWidth: '1px'
                         }}>
                      <span className="font-mono text-xs opacity-70">→</span>
                      <span>{isExpanded ? 'Click to collapse' : 'Click to explore'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ServicesSection;