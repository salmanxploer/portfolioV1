import ProjectCard from "./ProjectCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const projects = {
  WordPress: [
    { title: "RH Auto Repair", url: "https://rhautorepair.com/", description: "Auto repair service website with booking system" },
    { title: "Elitice Education", url: "https://eliticeducation.org/", description: "Educational institution platform with course management" },
    { title: "Blissful Touch", url: "https://blissfultouch.ca/", description: "Wellness & spa services with online booking" },
    { title: "Puff Picks", url: "https://puffpicks.com/", description: "E-commerce product showcase with WooCommerce" },
    { title: "Rides On Time", url: "https://ridesontime.com/", description: "Transportation services with fleet management" },
    { title: "The Busy Builders", url: "https://thebusybuilders.com/", description: "Construction company with project portfolio" },
    { title: "Quirky Cart", url: "https://quirky-cart.com/", description: "Unique e-commerce platform with custom checkout" },
    { title: "Junk Car Buyers Dallas", url: "https://junkcarbuyersdallas.com/", description: "Auto buying service with instant quotes" },
  ],
  Laravel: [
    { title: "Cashing Carz", url: "https://cashingcarz.com/", description: "Vehicle cash buying platform with real-time valuations" },
    { title: "Cash Carzz", url: "https://cashcarzz.com/", description: "Quick cash for cars service with instant offers" },
  ],
  React: [
    { title: "BUBT Cafe", url: "https://bubt-cafe.netlify.app/", description: "University cafe ordering system with menu management" },
    { title: "Alpha Travel", url: "https://alpha-travel-svo.netlify.app/", description: "Travel booking platform with destination search" },
    { title: "Tea Land", url: "https://tea-land-svo.netlify.app/", description: "Tea shop e-commerce with product customization" },
    { title: "Disable Site", url: "https://disabesite-svo.netlify.app/", description: "Accessibility-focused platform with WCAG compliance" },
    { title: "G3 Architects", url: "https://g3-architects-svo.netlify.app/", description: "Architecture firm showcase with 3D project views" },
  ],
};

const categories = ["All", "WordPress", "Laravel", "React"] as const;
type Category = typeof categories[number];

const categoryColors: Record<Category, string> = {
  All: "from-neon-green to-neon-cyan",
  WordPress: "from-neon-blue to-neon-purple",
  Laravel: "from-neon-orange to-neon-pink",
  React: "from-neon-cyan to-neon-green",
};

const ProjectsSection = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredProjects = activeCategory === "All"
    ? Object.entries(projects).flatMap(([category, items]) =>
        items.map((project) => ({ ...project, category }))
      )
    : projects[activeCategory as keyof typeof projects]?.map((project) => ({
        ...project,
        category: activeCategory,
      })) || [];

  return (
    <section id="projects" className="py-20 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="gradient-orb gradient-orb-2 absolute top-1/3 -left-32" />
      <div className="gradient-orb gradient-orb-1 absolute bottom-1/3 -right-32" />
      
      {/* Section decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon-pink/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-2">// PORTFOLIO</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">&lt;Projects /&gt;</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of websites and applications I've built for clients worldwide.
            Each project showcases different technologies and solutions.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "relative px-6 py-2.5 font-mono text-sm rounded-xl transition-all duration-300 overflow-hidden group",
                activeCategory === category
                  ? "text-background font-semibold"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {activeCategory === category && (
                <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[category]}`} />
              )}
              <span className="relative z-10">
                {category === "All" ? "[*] All" : `[${category}]`}
              </span>
            </button>
          ))}
        </div>

        {/* Project count */}
        <div className="text-center mb-8">
          <span className="text-sm font-mono text-muted-foreground">
            Showing <span className="text-primary">{filteredProjects.length}</span> projects
          </span>
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={`${project.title}-${index}`}
              title={project.title}
              url={project.url}
              category={project.category}
              description={project.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;