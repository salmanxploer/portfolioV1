import ProjectCard from "./ProjectCard";
import { useState } from "react";
import { cn } from "@/lib/utils";

const projects = {
  WordPress: [
    { title: "RH Auto Repair", url: "https://rhautorepair.com/", description: "Auto repair service website" },
    { title: "Elitice Education", url: "https://eliticeducation.org/", description: "Educational institution platform" },
    { title: "Blissful Touch", url: "https://blissfultouch.ca/", description: "Wellness & spa services" },
    { title: "Puff Picks", url: "https://puffpicks.com/", description: "E-commerce product showcase" },
    { title: "Rides On Time", url: "https://ridesontime.com/", description: "Transportation services" },
    { title: "The Busy Builders", url: "https://thebusybuilders.com/", description: "Construction company website" },
    { title: "Quirky Cart", url: "https://quirky-cart.com/", description: "Unique e-commerce platform" },
    { title: "Junk Car Buyers Dallas", url: "https://junkcarbuyersdallas.com/", description: "Auto buying service" },
  ],
  Laravel: [
    { title: "Cashing Carz", url: "https://cashingcarz.com/", description: "Vehicle cash buying platform" },
    { title: "Cash Carzz", url: "https://cashcarzz.com/", description: "Quick cash for cars service" },
  ],
  React: [
    { title: "BUBT Cafe", url: "https://bubt-cafe.netlify.app/", description: "University cafe ordering system" },
    { title: "Alpha Travel", url: "https://alpha-travel-svo.netlify.app/", description: "Travel booking platform" },
    { title: "Tea Land", url: "https://tea-land-svo.netlify.app/", description: "Tea shop e-commerce" },
    { title: "Disable Site", url: "https://disabesite-svo.netlify.app/", description: "Accessibility-focused platform" },
    { title: "G3 Architects", url: "https://g3-architects-svo.netlify.app/", description: "Architecture firm showcase" },
  ],
};

const categories = ["All", "WordPress", "Laravel", "React"] as const;
type Category = typeof categories[number];

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
    <section id="projects" className="py-20 px-4 bg-background relative">
      {/* Section decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-2">// PORTFOLIO</p>
          <h2 className="text-3xl md:text-4xl font-bold glow-text mb-4">
            &lt;Projects /&gt;
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A collection of websites and applications I've built for clients worldwide
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-6 py-2 font-mono text-sm border rounded-lg transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-primary-foreground border-primary glow-border"
                  : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {category === "All" ? "[*]" : `[${category}]`}
            </button>
          ))}
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
