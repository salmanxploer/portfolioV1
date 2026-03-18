import type { BlogDraft, BlogOverview, BlogPost } from "@/types/blog";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const BLOG_STORAGE_KEY = "portfolio.blog.posts";
const BLOG_COLLECTION = "blogPosts";
const DEFAULT_AUTHOR_NAME = "Salman Hafiz";
const AUTO_SCHEDULED_PREFIX = "auto-scheduled";
const AUTO_SCHEDULE_DAYS = 30;
const AUTO_POSTS_PER_CYCLE = 10;

const AUTO_KEYWORDS = ["Salman Hafiz", "WordPress developer", "frontend developer", "WordPress frontend development"];

type AutoTopicTemplate = {
  topic: string;
  angle: string;
  stack: string[];
  tags: string[];
};

const AUTO_TOPIC_TEMPLATES: AutoTopicTemplate[] = [
  {
    topic: "AI-assisted WordPress content workflows",
    angle: "using AI safely for research, outlines, and publishing pipelines",
    stack: ["WordPress", "SEO", "Editorial Workflow", "Automation"],
    tags: ["WordPress", "AI", "Content Strategy", "SEO"],
  },
  {
    topic: "Core Web Vitals in 2026",
    angle: "practical frontend fixes that improve LCP, CLS, and INP",
    stack: ["Performance", "Lighthouse", "Caching", "CDN"],
    tags: ["Web Performance", "Core Web Vitals", "Frontend"],
  },
  {
    topic: "Headless WordPress architecture",
    angle: "when to choose headless and when to stay with classic themes",
    stack: ["WordPress", "REST API", "React", "Headless CMS"],
    tags: ["Headless WordPress", "React", "Architecture"],
  },
  {
    topic: "Schema markup for service businesses",
    angle: "structured data patterns to improve CTR in search",
    stack: ["Technical SEO", "Schema", "Local SEO", "WordPress"],
    tags: ["SEO", "Schema Markup", "Local SEO"],
  },
  {
    topic: "WooCommerce conversion optimization",
    angle: "high-impact checkout improvements for better sales",
    stack: ["WooCommerce", "UX", "Checkout", "Analytics"],
    tags: ["WooCommerce", "Ecommerce", "Conversion Rate"],
  },
  {
    topic: "Modern frontend component systems",
    angle: "building reusable UI systems for long-term scalability",
    stack: ["React", "TypeScript", "Design System", "Tailwind"],
    tags: ["Frontend Development", "React", "UI Architecture"],
  },
  {
    topic: "Technical SEO audits for WordPress",
    angle: "a repeatable process to find issues before rankings drop",
    stack: ["WordPress", "SEO Audit", "Crawling", "Indexing"],
    tags: ["Technical SEO", "WordPress", "Search Visibility"],
  },
  {
    topic: "Firebase-powered blog workflows",
    angle: "secure admin publishing with real-time data and analytics",
    stack: ["Firebase", "Firestore", "Auth", "Analytics"],
    tags: ["Firebase", "Admin Dashboard", "Web App"],
  },
  {
    topic: "Programmatic internal linking",
    angle: "topic clusters that improve crawl depth and relevance",
    stack: ["Content SEO", "Internal Linking", "Taxonomy", "WordPress"],
    tags: ["SEO", "Content Clusters", "WordPress"],
  },
  {
    topic: "Accessibility-first frontend patterns",
    angle: "inclusive UI practices that improve UX and SEO together",
    stack: ["Accessibility", "Semantic HTML", "WCAG", "Frontend"],
    tags: ["Accessibility", "Frontend", "UX"],
  },
  {
    topic: "Local SEO landing page systems",
    angle: "city-based service pages without thin-content risk",
    stack: ["WordPress", "Local SEO", "Content Strategy", "Schema"],
    tags: ["Local SEO", "WordPress", "Lead Generation"],
  },
  {
    topic: "Entity-based SEO for personal brands",
    angle: "how developers can build stronger topical authority",
    stack: ["SEO", "Brand Strategy", "Knowledge Graph", "Content"],
    tags: ["Personal Branding", "SEO", "Authority Building"],
  },
];

const createIsoDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

type SeedPostInput = {
  id: string;
  title: string;
  project: string;
  stack: string[];
  tags: string[];
  focusAreas: string[];
  challenge: string;
  outcome: string;
  featured?: boolean;
  createdDaysAgo: number;
  seoTitle?: string;
  seoDescription?: string;
};

const buildLongProjectContent = (seed: SeedPostInput) =>
  [
    `## Project Overview: ${seed.project}`,
    `This post is a deep dive into the work done by Salman Hafiz on the ${seed.project} project, focusing on high-quality WordPress frontend development and strategic implementation. The primary goal was not just to build a feature, but to deliver a production-ready system that balances performance, user experience, and long-term maintainability.`,
    "",
    `### Core Technologies & Architecture`,
    `The technical foundation for this project included: **${seed.stack.join(
      ", "
    )}**. Salman Hafiz adopted a modular architecture, ensuring that each component was reusable and decoupled. This approach is critical for scalable WordPress frontend development, as it allows for rapid iteration and prevents complex dependencies that can slow down future updates.`,
    "",
    `### Key Focus Areas & Challenges`,
    `The main focus was on **${seed.focusAreas.join(
      ", "
    )}**. A significant challenge was **${
      seed.challenge
    }**. Salman Hafiz addressed this by first creating a baseline implementation to validate the core logic. Subsequent performance profiling revealed bottlenecks, which were systematically eliminated through code optimization and asset-light rendering techniques. This ensures a smooth experience even on less powerful devices.`,
    "",
    `### User Experience & Final Outcome`,
    `From a UX perspective, every interaction was designed to be intuitive. Clear visual cues, logical user flows, and consistent feedback mechanisms were implemented to build user trust. The final result was **${seed.outcome}**. This project stands as a testament to how thoughtful WordPress frontend development, guided by Salman Hafiz's principles, can solve real-world business problems effectively.`,
  ].join("\n");

const seedPostInputs: SeedPostInput[] = [
  // SEO-Optimized Project Posts
  {
    id: "seed-rh-auto-repair",
    title: "WordPress Frontend Development for RH Auto Repair's Booking System",
    project: "RH Auto Repair",
    stack: ["WordPress", "Custom Theme", "Booking Workflow", "Local SEO"],
    tags: ["WordPress", "Salman Hafiz", "Frontend Development", "Case Study"],
    focusAreas: ["service discovery", "booking conversion", "local SEO"],
    challenge: "integrating a seamless booking flow without sacrificing page speed",
    outcome: "a high-performance booking system that increased qualified leads for Salman Hafiz's client",
    featured: true,
    createdDaysAgo: 3,
  },
  {
    id: "seed-elitice-education",
    title: "Structuring a Scalable Course Platform with WordPress: A Salman Hafiz Project",
    project: "Elitice Education",
    stack: ["WordPress", "Course CMS", "Form Automation", "Content Strategy"],
    tags: ["WordPress", "Education", "CMS", "Salman Hafiz"],
    focusAreas: ["information architecture", "course discovery", "enrollment UX"],
    challenge: "organizing a vast library of academic content into intuitive pathways",
    outcome: "a streamlined platform that simplifies course browsing and student applications",
    createdDaysAgo: 5,
  },
  {
    id: "seed-blissful-touch",
    title: "Conversion-Driven WordPress Development for Blissful Touch Wellness",
    project: "Blissful Touch",
    stack: ["WordPress", "Appointment Booking", "Service Packages", "Brand UX"],
    tags: ["WordPress Development", "Wellness", "Booking", "Salman Hafiz"],
    focusAreas: ["brand consistency", "service upsells", "mobile-first booking"],
    challenge: "maintaining a minimalist UI while showcasing a wide range of services",
    outcome: "an elegant, high-converting appointment flow, a key project by Salman Hafiz",
    createdDaysAgo: 7,
  },
  {
    id: "seed-puff-picks",
    title: "Optimizing WooCommerce Checkout: A Frontend Development Case Study by Salman Hafiz",
    project: "Puff Picks",
    stack: ["WordPress", "WooCommerce", "Custom Filters", "Checkout UX"],
    tags: ["WooCommerce", "Frontend Development", "Ecommerce", "Salman Hafiz"],
    focusAreas: ["catalog filtering", "cart confidence", "checkout friction reduction"],
    challenge: "simplifying the path from product discovery to successful purchase",
    outcome: "a smoother, faster checkout process with a measurable uplift in conversions",
    createdDaysAgo: 9,
  },
  {
    id: "seed-cashing-carz",
    title: "Building a Real-Time Vehicle Valuation Engine with Laravel - A Salman Hafiz Backend Project",
    project: "Cashing Carz",
    stack: ["Laravel", "API Integration", "Validation", "Queue Processing"],
    tags: ["Laravel", "Backend", "API", "Salman Hafiz"],
    focusAreas: ["data integrity", "API response speed", "workflow reliability"],
    challenge: "ensuring fast, accurate vehicle valuations with robust backend validation",
    outcome: "a highly reliable valuation pipeline delivering instant, trustworthy results",
    featured: true,
    createdDaysAgo: 19,
  },
  {
    id: "seed-disable-site",
    title: "Accessibility-First React Development: A Salman Hafiz Guide to Inclusive Design",
    project: "Disable Site",
    stack: ["React", "WCAG", "Semantic HTML", "Keyboard Navigation"],
    tags: ["Accessibility", "React", "WCAG", "Salman Hafiz", "Frontend Development"],
    focusAreas: ["screen-reader compatibility", "keyboard navigation", "semantic HTML"],
    challenge: "embedding WCAG standards deeply into a modern React application",
    outcome: "a highly inclusive interface that exceeds compliance checklists, showcasing Salman Hafiz's commitment to accessibility",
    featured: true,
    createdDaysAgo: 29,
  },
  {
    id: "seed-portfolio-system",
    title: "How Salman Hafiz Built This Portfolio with React, TypeScript, and Firebase",
    project: "Salman Dev Realm End-to-End Build",
    stack: ["Vite", "React", "TypeScript", "Tailwind", "Firebase"],
    tags: ["Portfolio", "System Design", "React", "Salman Hafiz", "Frontend Development"],
    focusAreas: ["design system coherence", "developer velocity", "full-stack integration"],
    challenge: "unifying ambitious design goals with production-grade functionality and performance",
    outcome: "a scalable portfolio platform that serves as both a personal showcase and a product-ready base",
    featured: true,
    createdDaysAgo: 41,
  },
  // New SEO & Content Marketing Posts
  {
    id: "seed-wordpress-philosophy",
    title: "Salman Hafiz on Modern WordPress Frontend Development Philosophy",
    project: "Client Success Strategy",
    stack: ["WordPress", "React", "Headless", "Performance"],
    tags: ["WordPress Frontend Development", "Salman Hafiz", "Strategy", "Web Performance"],
    focusAreas: ["client goals alignment", "technology selection", "future-proofing"],
    challenge: "choosing the right tool (Headless vs. Monolithic) for different client needs",
    outcome: "a clear framework for delivering high-value WordPress solutions that last",
    createdDaysAgo: 2,
    seoTitle: "WordPress Frontend Development | The Philosophy of Salman Hafiz",
    seoDescription: "Discover Salman Hafiz's expert philosophy on modern WordPress frontend development, from headless architecture to performance optimization for client success.",
  },
  {
    id: "seed-client-communication",
    title: "Effective Client Communication: A Developer's Guide by Salman Hafiz",
    project: "Client Approach",
    stack: ["Project Management", "Communication Tools", "Requirement Gathering"],
    tags: ["Client Management", "Salman Hafiz", "Soft Skills", "Consulting"],
    focusAreas: ["understanding requirements", "managing expectations", "delivering feedback"],
    challenge: "translating complex technical concepts into clear business value for clients",
    outcome: "stronger client partnerships and smoother project delivery cycles",
    createdDaysAgo: 6,
    seoTitle: "Client Communication for Developers | A Guide by Salman Hafiz",
    seoDescription: "Learn effective client communication strategies for developers. Salman Hafiz shares his approach to requirement gathering, expectation management, and building trust.",
  },
  {
    id: "seed-seo-for-developers",
    title: "Technical SEO for WordPress Developers: Insights from Salman Hafiz",
    project: "SEO & Performance",
    stack: ["WordPress", "Technical SEO", "Core Web Vitals", "Schema Markup"],
    tags: ["SEO", "WordPress", "Web Vitals", "Salman Hafiz", "Frontend Development"],
    focusAreas: ["on-page optimization", "structured data", "site speed"],
    challenge: "integrating deep SEO practices directly into the development workflow",
    outcome: "websites that are not only well-built but also primed for high Google rankings",
    featured: true,
    createdDaysAgo: 10,
    seoTitle: "Technical SEO for WordPress Developers | Insights from Salman Hafiz",
    seoDescription: "A guide by Salman Hafiz on technical SEO for WordPress developers. Learn to improve Google rankings with Core Web Vitals, schema markup, and on-page optimizations.",
  },
  // Other existing posts (condensed for brevity, should be updated similarly)
  {
    id: "seed-blissful-touch-condensed",
    title: "Blissful Touch: A WordPress UX Case Study by Salman Hafiz",
    project: "Blissful Touch",
    stack: ["WordPress", "Booking", "UX"],
    tags: ["WordPress", "Salman Hafiz", "UX"],
    focusAreas: ["booking flow", "mobile UX"],
    challenge: "minimalist UI vs. service variety",
    outcome: "improved appointment booking",
    createdDaysAgo: 12,
  },
  {
    id: "seed-puff-picks-condensed",
    title: "Puff Picks: WooCommerce Optimization by Salman Hafiz",
    project: "Puff Picks",
    stack: ["WooCommerce", "UX"],
    tags: ["WooCommerce", "Salman Hafiz"],
    focusAreas: ["checkout flow"],
    challenge: "reducing purchase friction",
    outcome: "smoother conversion path",
    createdDaysAgo: 14,
  },
  {
    id: "seed-rides-on-time-condensed",
    title: "Rides On Time: WordPress for Fleet Services by Salman Hafiz",
    project: "Rides On Time",
    stack: ["WordPress", "Lead Gen"],
    tags: ["WordPress", "Salman Hafiz"],
    focusAreas: ["quote intent"],
    challenge: "presenting operational depth clearly",
    outcome: "more precise quote submissions",
    createdDaysAgo: 16,
  },
  {
    id: "seed-busy-builders-condensed",
    title: "Busy Builders: A WordPress Portfolio by Salman Hafiz",
    project: "The Busy Builders",
    stack: ["WordPress", "Portfolio"],
    tags: ["WordPress", "Salman Hafiz"],
    focusAreas: ["project credibility"],
    challenge: "balancing visuals and performance",
    outcome: "a stronger project showcase",
    createdDaysAgo: 18,
  },
  {
    id: "seed-quirky-cart-condensed",
    title: "Quirky Cart: Custom WooCommerce UX by Salman Hafiz",
    project: "Quirky Cart",
    stack: ["WooCommerce", "Branding"],
    tags: ["WooCommerce", "Salman Hafiz"],
    focusAreas: ["brand feel", "payment flow"],
    challenge: "playful design vs. usability",
    outcome: "a unique and dependable store",
    createdDaysAgo: 20,
  },
  {
    id: "seed-junk-car-buyers-condensed",
    title: "Junk Car Buyers: A WordPress Lead Funnel by Salman Hafiz",
    project: "Junk Car Buyers Dallas",
    stack: ["WordPress", "Local SEO"],
    tags: ["WordPress", "Salman Hafiz"],
    focusAreas: ["fast forms", "lead quality"],
    challenge: "maximizing lead detail, minimizing abandonment",
    outcome: "faster, better-qualified leads",
    createdDaysAgo: 22,
  },
  {
    id: "seed-cash-carzz-condensed",
    title: "Cash Carzz: A Secure Laravel Offer Engine by Salman Hafiz",
    project: "Cash Carzz",
    stack: ["Laravel", "Security"],
    tags: ["Laravel", "Salman Hafiz"],
    focusAreas: ["conversion quality", "admin tools"],
    challenge: "preventing spam while keeping forms simple",
    outcome: "higher quality leads",
    createdDaysAgo: 24,
  },
  {
    id: "seed-bubt-cafe-condensed",
    title: "BUBT Cafe: A React Ordering System by Salman Hafiz",
    project: "BUBT Cafe",
    stack: ["React", "State Management"],
    tags: ["React", "Salman Hafiz"],
    focusAreas: ["cart logic", "mobile speed"],
    challenge: "fast UI with frequent state updates",
    outcome: "a smooth ordering journey",
    createdDaysAgo: 26,
  },
  {
    id: "seed-alpha-travel-condensed",
    title: "Alpha Travel: A React Search UX by Salman Hafiz",
    project: "Alpha Travel",
    stack: ["React", "Search"],
    tags: ["React", "Salman Hafiz"],
    focusAreas: ["search relevance", "comparison flow"],
    challenge: "making broad options easy to compare",
    outcome: "more efficient destination discovery",
    createdDaysAgo: 28,
  },
  {
    id: "seed-tea-land-condensed",
    title: "Tea Land: A React Customization UI by Salman Hafiz",
    project: "Tea Land",
    stack: ["React", "Ecommerce"],
    tags: ["React", "Salman Hafiz"],
    focusAreas: ["variant clarity", "add-to-cart confidence"],
    challenge: "showing depth without confusion",
    outcome: "cleaner variant selection",
    createdDaysAgo: 30,
  },
  {
    id: "seed-g3-architects-condensed",
    title: "G3 Architects: A Performance-Focused React Site by Salman Hafiz",
    project: "G3 Architects",
    stack: ["React", "Performance"],
    tags: ["React", "Salman Hafiz"],
    focusAreas: ["asset optimization", "visual immersion"],
    challenge: "heavy visuals on mobile",
    outcome: "strong impact with fast loading",
    createdDaysAgo: 32,
  },
];

const starterPosts: BlogPost[] = seedPostInputs.map((seed) => {
  const createdAt = createIsoDaysAgo(seed.createdDaysAgo);
  const content = buildLongProjectContent(seed);
  const readingTimeMinutes = Math.max(4, Math.ceil(content.split(/\s+/).length / 200));
  const baseTitle = seed.title;
  const seoTitle = seed.seoTitle || `${baseTitle} | Salman Hafiz`;
  const seoDescription =
    seed.seoDescription ||
    `A deep dive by Salman Hafiz into the ${seed.project} project, covering ${seed.focusAreas.join(
      ", "
    )}. Learn about the challenges and outcomes of this ${seed.stack[0]} project.`;

  return {
    id: seed.id,
    title: baseTitle,
    slug: slugify(baseTitle),
    excerpt: seoDescription,
    content,
    coverImage: "",
    tags: seed.tags,
    authorName: DEFAULT_AUTHOR_NAME,
    readingTimeMinutes,
    featured: Boolean(seed.featured),
    published: true,
    publishedAt: createdAt,
    metaTitle: seoTitle,
    metaDescription: seoDescription,
    createdAt,
    updatedAt: createdAt,
    views: 0,
  };
});

const getCycleIndex = (date = new Date()): number => {
  const cycleMs = AUTO_SCHEDULE_DAYS * 24 * 60 * 60 * 1000;
  return Math.floor(date.getTime() / cycleMs);
};

const getCycleStart = (cycleIndex: number): Date => {
  const cycleMs = AUTO_SCHEDULE_DAYS * 24 * 60 * 60 * 1000;
  return new Date(cycleIndex * cycleMs);
};

const buildAutoPostTitle = (topic: string, cycleStart: Date, index: number) => {
  const month = cycleStart.toLocaleString("en-US", { month: "long", year: "numeric" });
  return `${topic}: Salman Hafiz WordPress Developer Guide #${index + 1} (${month})`;
};

const buildAutoPostContent = (title: string, topic: AutoTopicTemplate, scheduleDateIso: string) =>
  [
    `# ${title}`,
    "",
    `This scheduled article by Salman Hafiz covers ${topic.topic} with a practical lens for business growth and search visibility. If you are looking for a WordPress developer and frontend developer who understands both code quality and ranking strategy, this guide is for you.`,
    "",
    `## Why This Topic Matters Right Now`,
    `In 2026, ${topic.angle} is directly tied to traffic quality, user engagement, and conversion rate. Strong WordPress frontend development is no longer just design quality. It now includes technical SEO, measurable performance, and structured content systems that help pages rank faster and hold position.`,
    "",
    `## Implementation Stack`,
    `Recommended stack for this workflow: ${topic.stack.join(", ")}.`,
    "",
    `## Practical Framework by Salman Hafiz`,
    "1. Define the business intent and search intent before implementation.",
    "2. Build lightweight, semantic frontend components for speed and crawlability.",
    "3. Add keyword-focused headings naturally without stuffing.",
    "4. Connect technical SEO basics: schema, internal links, and clean URL structure.",
    "5. Track impressions and click-through rate, then iterate based on real performance.",
    "",
    `## Focus Keywords Included`,
    `${AUTO_KEYWORDS.join(", ")}.`,
    "",
    `## Scheduled Publish`,
    `This post is automatically scheduled for ${new Date(scheduleDateIso).toUTCString()} as part of the 30-day, 10-post publishing cycle.`,
  ].join("\n");

const createScheduledPost = (cycleIndex: number, slotIndex: number, usedSlugs: Set<string>): BlogPost => {
  const cycleStart = getCycleStart(cycleIndex);
  const scheduleDate = new Date(cycleStart);
  scheduleDate.setUTCDate(scheduleDate.getUTCDate() + slotIndex * 3);

  const topic = AUTO_TOPIC_TEMPLATES[(cycleIndex * AUTO_POSTS_PER_CYCLE + slotIndex) % AUTO_TOPIC_TEMPLATES.length];
  const title = buildAutoPostTitle(topic.topic, cycleStart, slotIndex);
  const baseSlug = slugify(`${title}-${cycleIndex}-${slotIndex + 1}`);

  let slug = baseSlug;
  let bump = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${bump}`;
    bump += 1;
  }
  usedSlugs.add(slug);

  const publishedAt = scheduleDate.toISOString();
  const content = buildAutoPostContent(title, topic, publishedAt);
  const nowIso = new Date().toISOString();
  const baseTags = normalizeTags([...topic.tags, ...AUTO_KEYWORDS]);

  return {
    id: `${AUTO_SCHEDULED_PREFIX}-${cycleIndex}-${slotIndex + 1}`,
    title,
    slug,
    excerpt: `Scheduled tech SEO post by Salman Hafiz on ${topic.topic}, focused on WordPress developer and frontend developer search intent.`,
    content,
    coverImage: "",
    tags: baseTags,
    authorName: DEFAULT_AUTHOR_NAME,
    readingTimeMinutes: Math.max(4, calculateReadingTime(content)),
    featured: slotIndex === 0,
    published: true,
    publishedAt,
    metaTitle: `${title} | Salman Hafiz WordPress Developer`,
    metaDescription: `Tech-focused scheduled post by Salman Hafiz about ${topic.topic}. Built for WordPress frontend development visibility and higher click-through from search.`,
    createdAt: nowIso,
    updatedAt: nowIso,
    views: 0,
  };
};

const ensureAutomatedScheduledPosts = (posts: BlogPost[]): BlogPost[] => {
  const cycleIndex = getCycleIndex(new Date());
  const existingCyclePosts = posts.filter((post) => post.id.startsWith(`${AUTO_SCHEDULED_PREFIX}-${cycleIndex}-`));
  if (existingCyclePosts.length >= AUTO_POSTS_PER_CYCLE) {
    return sortPosts(posts);
  }

  const usedSlugs = new Set(posts.map((post) => post.slug));
  const existingSlots = new Set(
    existingCyclePosts
      .map((post) => Number(post.id.split("-").pop()))
      .filter((slot) => Number.isInteger(slot) && slot >= 1 && slot <= AUTO_POSTS_PER_CYCLE)
  );

  const nextPosts: BlogPost[] = [];
  for (let slot = 1; slot <= AUTO_POSTS_PER_CYCLE; slot += 1) {
    if (existingSlots.has(slot)) continue;
    nextPosts.push(createScheduledPost(cycleIndex, slot - 1, usedSlugs));
  }

  if (nextPosts.length === 0) return sortPosts(posts);
  return sortPosts([...posts, ...nextPosts]);
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];
  return Array.from(new Set(tags.map((tag) => String(tag).trim()).filter(Boolean)));
};

const calculateReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const normalizePost = (raw: Partial<BlogPost> & { id: string }): BlogPost => {
  const now = new Date().toISOString();
  const title = String(raw.title || "Untitled Post").trim();
  const content = String(raw.content || "");
  return {
    id: raw.id,
    title,
    slug: slugify(String(raw.slug || title || raw.id)),
    excerpt: String(raw.excerpt || ""),
    content,
    coverImage: String(raw.coverImage || ""),
    tags: normalizeTags(raw.tags),
    authorName: String(raw.authorName || DEFAULT_AUTHOR_NAME),
    readingTimeMinutes: Number(raw.readingTimeMinutes || calculateReadingTime(content)),
    featured: Boolean(raw.featured),
    published: Boolean(raw.published),
    publishedAt: raw.published ? String(raw.publishedAt || raw.createdAt || now) : undefined,
    metaTitle: String(raw.metaTitle || title),
    metaDescription: String(raw.metaDescription || raw.excerpt || ""),
    createdAt: String(raw.createdAt || now),
    updatedAt: String(raw.updatedAt || now),
    views: Number(raw.views || 0),
  };
};

const parsePosts = (raw: string | null): BlogPost[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Array<Partial<BlogPost> & { id: string }>;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((post) => normalizePost(post));
  } catch {
    return [];
  }
};

const persistPosts = (posts: BlogPost[]) => {
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
};

const sortPosts = (posts: BlogPost[]) => [...posts].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

const mapFirestorePosts = (docs: Awaited<ReturnType<typeof getDocs>>["docs"]): BlogPost[] =>
  docs.map((snap) => normalizePost({ id: snap.id, ...(snap.data() as Partial<BlogPost>) }));

const syncLocalPostsToFirestore = async (posts: BlogPost[]) => {
  await Promise.all(
    posts.map((post) =>
      setDoc(doc(db, BLOG_COLLECTION, post.id), {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        coverImage: post.coverImage || "",
        tags: post.tags,
        authorName: post.authorName,
        readingTimeMinutes: post.readingTimeMinutes,
        featured: post.featured,
        published: post.published,
        publishedAt: post.publishedAt || null,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        views: post.views,
      })
    )
  );
};

export const ensureBlogSeed = () => {
  if (typeof window === "undefined") return;
  const existing = parsePosts(localStorage.getItem(BLOG_STORAGE_KEY));
  if (existing.length === 0) {
    persistPosts(ensureAutomatedScheduledPosts(starterPosts));
    return;
  }

  const existingIds = new Set(existing.map((post) => post.id));
  const existingSlugs = new Set(existing.map((post) => post.slug));
  const missingSeeds = starterPosts.filter((post) => !existingIds.has(post.id) && !existingSlugs.has(post.slug));
  const merged = missingSeeds.length > 0 ? sortPosts([...existing, ...missingSeeds]) : existing;
  const withScheduled = ensureAutomatedScheduledPosts(merged);
  if (withScheduled.length !== existing.length || missingSeeds.length > 0) {
    persistPosts(withScheduled);
  }
};

export const ensureBlogsStoredInFirestore = async () => {
  const posts = getLocalAllPosts();
  if (posts.length === 0) return 0;

  try {
    await syncLocalPostsToFirestore(posts);
  } catch (error) {
    console.error("[blogStorage] Failed to sync blogs to Firestore.", error);
    throw error;
  }

  return posts.length;
};

const getLocalAllPosts = (): BlogPost[] => {
  ensureBlogSeed();
  const posts = parsePosts(localStorage.getItem(BLOG_STORAGE_KEY));
  return sortPosts(posts);
};

const isPostLive = (post: BlogPost, now = Date.now()): boolean => {
  if (!post.published) return false;
  if (!post.publishedAt) return true;
  const publishedAtMs = Date.parse(post.publishedAt);
  if (Number.isNaN(publishedAtMs)) return true;
  return publishedAtMs <= now;
};

const getLocalPublishedPosts = (): BlogPost[] => {
  const now = Date.now();
  return getLocalAllPosts().filter((post) => isPostLive(post, now));
};

const getLocalPostBySlug = (slug: string): BlogPost | undefined =>
  getLocalAllPosts().find((post) => post.slug === slug);

const makeUniqueSlug = (baseSlug: string, posts: BlogPost[], currentId?: string) => {
  const normalizedBase = slugify(baseSlug || "post");
  const used = new Set(posts.filter((post) => post.id !== currentId).map((post) => post.slug));
  if (!used.has(normalizedBase)) return normalizedBase;

  let suffix = 2;
  let candidate = `${normalizedBase}-${suffix}`;
  while (used.has(candidate)) {
    suffix += 1;
    candidate = `${normalizedBase}-${suffix}`;
  }
  return candidate;
};

export const savePost = (draft: BlogDraft): BlogPost => {
  const posts = getLocalAllPosts();
  const now = new Date().toISOString();

  if (draft.id) {
    const idx = posts.findIndex((post) => post.id === draft.id);
    if (idx >= 0) {
      const updated = normalizePost({
        ...posts[idx],
        ...draft,
        slug: makeUniqueSlug(draft.slug || draft.title || posts[idx].title, posts, draft.id),
        readingTimeMinutes: draft.readingTimeMinutes || calculateReadingTime(draft.content || posts[idx].content),
        publishedAt: draft.published ? draft.publishedAt || posts[idx].publishedAt || now : undefined,
        updatedAt: now,
      });
      posts[idx] = updated;
      persistPosts(posts);
      return updated;
    }
  }

  const created = normalizePost({
    id: `post-${createId()}`,
    title: draft.title,
    slug: makeUniqueSlug(draft.slug || draft.title, posts),
    excerpt: draft.excerpt,
    content: draft.content,
    coverImage: draft.coverImage,
    tags: draft.tags,
    authorName: draft.authorName || DEFAULT_AUTHOR_NAME,
    readingTimeMinutes: draft.readingTimeMinutes || calculateReadingTime(draft.content),
    featured: Boolean(draft.featured),
    published: draft.published,
    publishedAt: draft.published ? draft.publishedAt || now : undefined,
    metaTitle: draft.metaTitle || draft.title,
    metaDescription: draft.metaDescription || draft.excerpt,
    createdAt: now,
    updatedAt: now,
    views: 0,
  });

  persistPosts([created, ...posts]);
  return created;
};

export const deletePost = (id: string) => {
  const posts = getLocalAllPosts().filter((post) => post.id !== id);
  persistPosts(posts);
};

export const incrementPostView = (slug: string) => {
  const posts = getLocalAllPosts();
  const idx = posts.findIndex((post) => post.slug === slug);
  if (idx < 0) return;
  posts[idx] = {
    ...posts[idx],
    views: posts[idx].views + 1,
    updatedAt: posts[idx].updatedAt,
  };
  persistPosts(posts);
};

export const getAllPosts = async (): Promise<BlogPost[]> => {
  const localPosts = getLocalAllPosts();
  if (localPosts.length > 0) {
    // Keep blog UI fast by returning local data immediately.
    void syncLocalPostsToFirestore(localPosts).catch((error) => {
      console.error("[blogStorage] Background Firestore sync failed.", error);
    });
    return localPosts;
  }

  try {
    const snapshot = await getDocs(collection(db, BLOG_COLLECTION));
    const posts = sortPosts(mapFirestorePosts(snapshot.docs));
    if (posts.length > 0) {
      const existingIds = new Set(posts.map((post) => post.id));
      const existingSlugs = new Set(posts.map((post) => post.slug));
      const missingSeeds = starterPosts.filter((post) => !existingIds.has(post.id) && !existingSlugs.has(post.slug));
      const merged = ensureAutomatedScheduledPosts(sortPosts([...posts, ...missingSeeds]));

      if (missingSeeds.length > 0) {
        await syncLocalPostsToFirestore(missingSeeds).catch(() => undefined);
      }

      const missingScheduled = merged.filter((post) => post.id.startsWith(AUTO_SCHEDULED_PREFIX) && !existingIds.has(post.id));
      if (missingScheduled.length > 0) {
        await syncLocalPostsToFirestore(missingScheduled).catch(() => undefined);
      }

      persistPosts(merged);
      return merged;
    }
    return [];
  } catch {
    return [];
  }
};

export const getPublishedPosts = async (): Promise<BlogPost[]> => {
  const posts = await getAllPosts();
  const now = Date.now();
  return posts.filter((post) => isPostLive(post, now));
};

export const getFeaturedPosts = async (take = 3): Promise<BlogPost[]> => {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.featured).slice(0, take);
};

export const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  const normalizedTag = tag.trim().toLowerCase();
  if (!normalizedTag) return getPublishedPosts();
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.tags.some((item) => item.toLowerCase() === normalizedTag));
};

export const searchPublishedPosts = async (queryText: string): Promise<BlogPost[]> => {
  const queryValue = queryText.trim().toLowerCase();
  const posts = await getPublishedPosts();
  if (!queryValue) return posts;

  return posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.content, post.tags.join(" ")].join(" ").toLowerCase();
    return haystack.includes(queryValue);
  });
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  try {
    const q = query(collection(db, BLOG_COLLECTION), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    const posts = mapFirestorePosts(snapshot.docs);
    if (posts.length > 0) {
      return isPostLive(posts[0]) ? posts[0] : undefined;
    }
    const localPost = getLocalPostBySlug(slug);
    return localPost && isPostLive(localPost) ? localPost : undefined;
  } catch {
    const localPost = getLocalPostBySlug(slug);
    return localPost && isPostLive(localPost) ? localPost : undefined;
  }
};

export const savePostAsync = async (draft: BlogDraft): Promise<BlogPost> => {
  const localSaved = savePost(draft);

  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, BLOG_COLLECTION, localSaved.id), {
      title: localSaved.title,
      slug: localSaved.slug,
      excerpt: localSaved.excerpt,
      content: localSaved.content,
      coverImage: localSaved.coverImage || "",
      tags: localSaved.tags,
      authorName: localSaved.authorName,
      readingTimeMinutes: localSaved.readingTimeMinutes,
      featured: localSaved.featured,
      published: localSaved.published,
      publishedAt: localSaved.publishedAt || null,
      metaTitle: localSaved.metaTitle || "",
      metaDescription: localSaved.metaDescription || "",
      createdAt: localSaved.createdAt,
      updatedAt: draft.id ? now : localSaved.updatedAt,
      views: localSaved.views,
    });
    return localSaved;
  } catch {
    return localSaved;
  }
};

export const deletePostAsync = async (id: string) => {
  deletePost(id);
  try {
    await deleteDoc(doc(db, BLOG_COLLECTION, id));
  } catch {
    // Keep local delete as fallback when Firestore is unavailable.
  }
};

export const incrementPostViewAsync = async (slug: string) => {
  incrementPostView(slug);
  try {
    const q = query(collection(db, BLOG_COLLECTION), where("slug", "==", slug), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.docs.length === 0) return;
    await updateDoc(doc(db, BLOG_COLLECTION, snapshot.docs[0].id), {
      views: increment(1),
    });
  } catch {
    // Local fallback already applied.
  }
};

export const togglePostPublishedAsync = async (id: string, published: boolean) => {
  const posts = getLocalAllPosts();
  const idx = posts.findIndex((post) => post.id === id);
  if (idx < 0) return;

  const now = new Date().toISOString();
  posts[idx] = normalizePost({
    ...posts[idx],
    published,
    publishedAt: published ? posts[idx].publishedAt || now : undefined,
    updatedAt: now,
  });
  persistPosts(posts);

  try {
    await updateDoc(doc(db, BLOG_COLLECTION, id), {
      published,
      publishedAt: published ? posts[idx].publishedAt || now : null,
      updatedAt: now,
    });
  } catch {
    // Local fallback already applied.
  }
};

export const togglePostFeaturedAsync = async (id: string, featured: boolean) => {
  const posts = getLocalAllPosts();
  const idx = posts.findIndex((post) => post.id === id);
  if (idx < 0) return;

  const now = new Date().toISOString();
  posts[idx] = normalizePost({
    ...posts[idx],
    featured,
    updatedAt: now,
  });
  persistPosts(posts);

  try {
    await updateDoc(doc(db, BLOG_COLLECTION, id), {
      featured,
      updatedAt: now,
    });
  } catch {
    // Local fallback already applied.
  }
};

export const duplicatePostAsync = async (id: string): Promise<BlogPost | undefined> => {
  const source = getLocalAllPosts().find((post) => post.id === id);
  if (!source) return undefined;

  const duplicated = await savePostAsync({
    title: `${source.title} Copy`,
    slug: `${source.slug}-copy`,
    excerpt: source.excerpt,
    content: source.content,
    coverImage: source.coverImage,
    tags: source.tags,
    authorName: source.authorName,
    readingTimeMinutes: source.readingTimeMinutes,
    featured: false,
    published: false,
    metaTitle: source.metaTitle,
    metaDescription: source.metaDescription,
  });

  return duplicated;
};

export const getBlogOverview = async (): Promise<BlogOverview> => {
  const posts = await getAllPosts();
  const tagCounts = posts.reduce<Record<string, number>>((acc, post) => {
    post.tags.forEach((tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {});

  return {
    totalPosts: posts.length,
    publishedPosts: posts.filter((post) => post.published).length,
    draftPosts: posts.filter((post) => !post.published).length,
    featuredPosts: posts.filter((post) => post.featured).length,
    totalViews: posts.reduce((sum, post) => sum + post.views, 0),
    topTags: Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count })),
  };
};
