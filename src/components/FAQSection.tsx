import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    q: "What services do you offer as a React & WordPress developer?",
    a: "I build fast, SEO-optimized websites and web apps using React/TypeScript and custom WordPress solutions (themes, plugins, WooCommerce). I also handle performance optimization, Core Web Vitals, GA4/GTM, and full-stack work when needed.",
  },
  {
    q: "How do you improve SEO and site performance?",
    a: "I focus on technical SEO (clean HTML, schema, sitemaps, robots), Core Web Vitals (LCP, CLS, INP), image optimization, code-splitting, caching/CDN, and content structure. I also integrate GA4 and Tag Manager to measure results.",
  },
  {
    q: "What's your typical project process?",
    a: "Discovery and scope → design/architecture → development → performance & SEO passes → analytics setup → launch and a brief support window. I maintain clear communication and milestones throughout.",
  },
  {
    q: "Do you work worldwide and remotely?",
    a: "Yes — I work with clients worldwide, fully remote, and adapt to your timezone for meetings and deliverables.",
  },
  {
    q: "What is the usual timeline and pricing?",
    a: "Timelines depend on scope: simple landing pages in 1–2 weeks; full sites/apps 3–8+ weeks. Pricing is project-based with clear estimates after a meeting.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-2">// FAQs</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">\Frequently Asked Questions/</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answers to common questions about React, WordPress, SEO, performance, and how I work.
          </p>
        </div>

        <div className="bg-card/70 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left text-foreground">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{item.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
