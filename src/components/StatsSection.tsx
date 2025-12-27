import { useEffect, useState, useRef } from "react";
import { Briefcase, Code2, Users, Award } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    value: 5,
    suffix: "+",
    label: "Years Experience",
    color: "text-neon-green",
    glowClass: "group-hover:shadow-[0_0_30px_hsl(120_100%_50%/0.5)]",
  },
  {
    icon: Code2,
    value: 50,
    suffix: "+",
    label: "Projects Completed",
    color: "text-neon-cyan",
    glowClass: "group-hover:shadow-[0_0_30px_hsl(180_100%_50%/0.5)]",
  },
  {
    icon: Users,
    value: 40,
    suffix: "+",
    label: "Happy Clients",
    color: "text-neon-purple",
    glowClass: "group-hover:shadow-[0_0_30px_hsl(280_100%_60%/0.5)]",
  },
  {
    icon: Award,
    value: 100,
    suffix: "%",
    label: "Client Satisfaction",
    color: "text-neon-pink",
    glowClass: "group-hover:shadow-[0_0_30px_hsl(330_100%_60%/0.5)]",
  },
];

const AnimatedCounter = ({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, inView]);

  return (
    <span className="tabular-nums">
      {count}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 px-4 relative overflow-hidden">
      {/* Colorful gradient background */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-0 left-0 w-full h-px neon-line" />
      <div className="absolute bottom-0 left-0 w-full h-px neon-line" />
      
      {/* Floating orbs */}
      <div className="gradient-orb gradient-orb-1 absolute -top-32 -left-32" />
      <div className="gradient-orb gradient-orb-2 absolute -bottom-32 -right-32" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`group relative p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl
                           transition-all duration-500 hover:border-primary/50 float-card
                           opacity-0 animate-fade-in ${stat.glowClass}`}
                style={{ 
                  animationDelay: `${index * 150}ms`, 
                  animationFillMode: "forwards",
                  animationDuration: `${6 + index * 0.5}s`
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full bg-card border border-border mb-4 
                                  transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`w-6 h-6 ${stat.color} transition-all duration-300`} />
                  </div>
                  <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                  </div>
                  <p className="text-sm text-muted-foreground font-mono">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;