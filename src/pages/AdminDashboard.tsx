import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { BarChart3, Plus, Trash2, Save, Eye, LogOut, CalendarDays, Bot, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  deletePostAsync,
  duplicatePostAsync,
  ensureBlogsStoredInFirestore,
  getAllPosts,
  getBlogOverview,
  savePostAsync,
  togglePostFeaturedAsync,
  togglePostPublishedAsync,
} from "@/lib/blogStorage";
import { getVisitorAnalytics } from "@/lib/visitorAnalytics";
import { signOutAdmin, trackFirebaseEvent } from "@/lib/firebase";
import { ADMIN_LOGIN_PATH } from "@/lib/adminRoute";
import type { BlogOverview, BlogPost } from "@/types/blog";

type PostForm = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  authorName: string;
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
};

type PostStatusFilter = "all" | "published" | "draft" | "featured";
type PostSortOption = "updated" | "created" | "views" | "title";
type GenerationMode = "tech" | "client-centric" | "mixed";

const AUTO_SCHEDULED_PREFIX = "auto-scheduled-";
const FOCUS_KEYWORDS = ["salman hafiz", "wordpress developer", "frontend developer", "wordpress frontend development"];
const AI_GENERATED_TAG = "AI Generated";
const AVAILABLE_TOPICS = [
  "WordPress",
  "WordPress Customization",
  "WooCommerce",
  "Elementor",
  "Rank Math",
  "React",
  "JavaScript",
  "Frontend",
  "AI",
  "Crypto",
  "SEO",
  "SEO Content Writing",
  "Web Performance",
  "Security",
  "SaaS",
  "Ecommerce",
  "Firebase",
];

type GeneratedAIPost = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
};

const emptyForm: PostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tags: "",
  authorName: "Salman",
  featured: false,
  metaTitle: "",
  metaDescription: "",
  published: true,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [overview, setOverview] = useState<BlogOverview | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatusFilter>("all");
  const [sortBy, setSortBy] = useState<PostSortOption>("updated");
  const [syncingFirestore, setSyncingFirestore] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("mixed");
  const [generationCount, setGenerationCount] = useState(10);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["WordPress", "Frontend", "AI", "Crypto"]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("Salman Hafiz");
  const [secondaryKeywords, setSecondaryKeywords] = useState("WordPress developer, frontend developer, WordPress frontend development");
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const refreshData = async () => {
    const [postsData, overviewData] = await Promise.all([getAllPosts(), getBlogOverview()]);
    setPosts(postsData);
    setOverview(overviewData);
  };

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [postsData, overviewData] = await Promise.all([getAllPosts(), getBlogOverview()]);
      if (!mounted) return;
      setPosts(postsData);
      setOverview(overviewData);
      setLoadingPosts(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSyncFirestore = async () => {
    setSyncingFirestore(true);
    setSyncStatus("");
    try {
      const synced = await ensureBlogsStoredInFirestore();
      setSyncStatus(`Firestore synced successfully: ${synced} posts.`);
      await refreshData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Firestore sync error";
      setSyncStatus(`Firestore sync failed: ${message}`);
    } finally {
      setSyncingFirestore(false);
    }
  };

  const getGenerationPayload = (action: "generate" | "health-check") => {
    const normalizedSecondary = secondaryKeywords
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    const keywordSet = Array.from(new Set([primaryKeyword.trim(), ...normalizedSecondary].filter(Boolean)));

    return {
      action,
      count: generationCount,
      mode: generationMode,
      topics: selectedTopics,
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords: normalizedSecondary,
      keywords: keywordSet,
    };
  };

  const generateAIBlogPosts = async (action: "generate" | "health-check") => {
    const payload = getGenerationPayload(action);

    const tryEndpoint = async (url: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      const data = (() => {
        try {
          return raw ? JSON.parse(raw) : {};
        } catch {
          return { error: raw || "Non-JSON response" };
        }
      })();
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Endpoint not found at ${url}. If you are running local dev, use Netlify dev so serverless functions are available.`);
        }
        throw new Error(data?.error || `Request failed at ${url} with status ${response.status}.`);
      }
      return data;
    };

    try {
      return await tryEndpoint("/.netlify/functions/generate-blog-posts");
    } catch (firstError) {
      try {
        return await tryEndpoint("/api/generate-blog-posts");
      } catch (secondError) {
        try {
          if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
            return await tryEndpoint("http://localhost:3001/api/generate-blog-posts");
          }
        } catch (thirdError) {
          try {
            return await tryEndpoint("https://salmanhafiz.me/.netlify/functions/generate-blog-posts");
          } catch (fourthError) {
            const firstMessage = firstError instanceof Error ? firstError.message : "Unknown Netlify function error";
            const secondMessage = secondError instanceof Error ? secondError.message : "Unknown API route error";
            const thirdMessage = thirdError instanceof Error ? thirdError.message : "Unknown local server error";
            const fourthMessage = fourthError instanceof Error ? fourthError.message : "Unknown production fallback error";
            throw new Error(`${firstMessage} | Fallback failed: ${secondMessage} | Local server failed: ${thirdMessage} | Production fallback failed: ${fourthMessage}`);
          }
        }

        const firstMessage = firstError instanceof Error ? firstError.message : "Unknown Netlify function error";
        const secondMessage = secondError instanceof Error ? secondError.message : "Unknown API route error";
        throw new Error(`${firstMessage} | Fallback failed: ${secondMessage}. If local, run both: npm run server and npm run dev.`);
      }
    }
  };

  const handleTestAIConnection = async () => {
    setTestingAI(true);
    setAiStatus("");
    try {
      const data = (await generateAIBlogPosts("health-check")) as { ok?: boolean; model?: string; provider?: string; error?: string };
      if (data.ok) {
        setAiStatus(`AI connection is working. Provider: ${data.provider || "configured"} | Model: ${data.model || "configured model"}.`);
      } else {
        setAiStatus(`GPT API check failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown connection error";
      setAiStatus(`GPT API check failed: ${message}`);
    } finally {
      setTestingAI(false);
    }
  };

  const handleGenerateAIPosts = async () => {
    setGeneratingAI(true);
    setAiStatus("");
    try {
      const data = (await generateAIBlogPosts("generate")) as { posts?: GeneratedAIPost[] };
      const generated = Array.isArray(data.posts) ? data.posts : [];

      if (generated.length === 0) {
        setAiStatus("AI returned no posts. Please try again.");
        return;
      }

      const now = new Date();
      const spacingDays = Math.max(1, Math.floor(30 / Math.max(1, generationCount)));
      const saveJobs = generated.map((post, index) => {
        const scheduled = new Date(now);
        scheduled.setDate(now.getDate() + index * spacingDays);
        const normalizedSecondary = secondaryKeywords
          .split(",")
          .map((keyword) => keyword.trim())
          .filter(Boolean);

        return savePostAsync({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          tags: Array.from(new Set([...(post.tags || []), AI_GENERATED_TAG, ...selectedTopics, primaryKeyword.trim(), ...normalizedSecondary])),
          authorName: "Salman Hafiz",
          featured: index === 0,
          published: true,
          publishedAt: scheduled.toISOString(),
          metaTitle: post.metaTitle || `${post.title} | Salman Hafiz`,
          metaDescription: post.metaDescription || post.excerpt,
        });
      });

      await Promise.all(saveJobs);
      await refreshData();
      void trackFirebaseEvent("admin_ai_posts_generated", { count: generated.length });
      setAiStatus(`AI generated and scheduled ${generated.length} posts successfully with SEO keywords and selected topics.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown AI generation error";
      setAiStatus(`AI generation failed: ${message}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  const analytics = useMemo(() => getVisitorAnalytics(), [posts]);

  const totalPostViews = posts.reduce((sum, post) => sum + post.views, 0);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

    const byStatus = posts.filter((post) => {
      if (statusFilter === "published") return post.published;
      if (statusFilter === "draft") return !post.published;
      if (statusFilter === "featured") return post.featured;
      return true;
    });

    const bySearch = normalizedQuery
      ? byStatus.filter((post) => {
          const haystack = [post.title, post.slug, post.excerpt, post.tags.join(" "), post.authorName, post.metaTitle || "", post.metaDescription || ""]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : byStatus;

    return [...bySearch].sort((a, b) => {
      if (sortBy === "views") return b.views - a.views;
      if (sortBy === "created") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });
  }, [posts, deferredSearchQuery, statusFilter, sortBy]);

  const postCounts = useMemo(
    () => ({
      all: posts.length,
      published: posts.filter((post) => post.published).length,
      draft: posts.filter((post) => !post.published).length,
      featured: posts.filter((post) => post.featured).length,
    }),
    [posts]
  );

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic]));
  };

  const addCustomTopic = () => {
    const value = customTopicInput.trim();
    if (!value) return;
    setSelectedTopics((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setCustomTopicInput("");
  };

  const autoScheduleOverview = useMemo(() => {
    const now = Date.now();
    const autoPosts = posts.filter((post) => post.id.startsWith(AUTO_SCHEDULED_PREFIX));
    const livePosts = autoPosts.filter((post) => {
      if (!post.published) return false;
      if (!post.publishedAt) return true;
      const publishedAt = Date.parse(post.publishedAt);
      if (Number.isNaN(publishedAt)) return true;
      return publishedAt <= now;
    });
    const upcomingPosts = autoPosts.filter((post) => {
      if (!post.published || !post.publishedAt) return false;
      const publishedAt = Date.parse(post.publishedAt);
      return !Number.isNaN(publishedAt) && publishedAt > now;
    });
    const nextUpcoming = [...upcomingPosts].sort((a, b) => Date.parse(a.publishedAt || "") - Date.parse(b.publishedAt || ""))[0];
    const impressions = autoPosts.reduce((sum, post) => sum + post.views, 0);

    const keywordCoverageCount = autoPosts.filter((post) => {
      const text = [post.title, post.excerpt, post.metaTitle || "", post.metaDescription || "", post.tags.join(" "), post.content]
        .join(" ")
        .toLowerCase();
      return FOCUS_KEYWORDS.every((keyword) => text.includes(keyword));
    }).length;

    return {
      total: autoPosts.length,
      live: livePosts.length,
      upcoming: upcomingPosts.length,
      impressions,
      keywordCoverageCount,
      nextUpcomingTitle: nextUpcoming?.title,
      nextUpcomingDate: nextUpcoming?.publishedAt,
    };
  }, [posts]);

  const aiMonitor = useMemo(() => {
    const aiPosts = posts.filter((post) => post.tags.some((tag) => tag.toLowerCase() === AI_GENERATED_TAG.toLowerCase()));
    const now = Date.now();
    const liveCount = aiPosts.filter((post) => {
      if (!post.published) return false;
      if (!post.publishedAt) return true;
      const publishedAt = Date.parse(post.publishedAt);
      return Number.isNaN(publishedAt) ? true : publishedAt <= now;
    }).length;
    const upcomingCount = aiPosts.filter((post) => {
      if (!post.published || !post.publishedAt) return false;
      const publishedAt = Date.parse(post.publishedAt);
      return !Number.isNaN(publishedAt) && publishedAt > now;
    }).length;
    const impressions = aiPosts.reduce((sum, post) => sum + post.views, 0);
    const keywordCoverage = aiPosts.filter((post) => {
      const haystack = [post.title, post.excerpt, post.content, post.metaTitle || "", post.metaDescription || "", post.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      const primary = primaryKeyword.trim().toLowerCase();
      const secondary = secondaryKeywords
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
      return [primary, ...secondary].every((keyword) => haystack.includes(keyword));
    }).length;

    return {
      total: aiPosts.length,
      live: liveCount,
      upcoming: upcomingCount,
      impressions,
      keywordCoverage,
    };
  }, [posts, primaryKeyword, secondaryKeywords]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const action = form.id ? "update" : "create";

    const saved = await savePostAsync({
      id: form.id,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      authorName: form.authorName,
      readingTimeMinutes: Math.max(1, Math.ceil(form.content.trim().split(/\s+/).filter(Boolean).length / 200)),
      featured: form.featured,
      metaTitle: form.metaTitle,
      metaDescription: form.metaDescription,
      published: form.published,
    });

    await refreshData();
    setForm(emptyForm);
    void trackFirebaseEvent("admin_post_save", { action, post_slug: saved.slug });

    if (!saved) return;
  };

  const handleEdit = (post: BlogPost) => {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tags: post.tags.join(", "),
      authorName: post.authorName,
      featured: post.featured,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      published: post.published,
    });
  };

  const handleDelete = async (id: string) => {
    const post = posts.find((item) => item.id === id);
    const confirmed = window.confirm(`Delete post \"${post?.title || "this post"}\"? This action cannot be undone.`);
    if (!confirmed) return;
    await deletePostAsync(id);
    await refreshData();
    void trackFirebaseEvent("admin_post_delete", { post_id: id, post_slug: post?.slug || "" });
  };

  const handleDuplicate = async (id: string) => {
    const duplicated = await duplicatePostAsync(id);
    await refreshData();
    void trackFirebaseEvent("admin_post_duplicate", { source_post_id: id, duplicated_post_id: duplicated?.id || "" });
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    await togglePostPublishedAsync(id, published);
    await refreshData();
    void trackFirebaseEvent("admin_post_publish_toggle", { post_id: id, published });
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    await togglePostFeaturedAsync(id, featured);
    await refreshData();
    void trackFirebaseEvent("admin_post_featured_toggle", { post_id: id, featured });
  };

  const topPages = Object.entries(analytics.pageViews)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const dailyVisits = Object.entries(analytics.dailyVisits)
    .sort((a, b) => (a[0] > b[0] ? 1 : -1))
    .slice(-7);

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate(ADMIN_LOGIN_PATH, { replace: true });
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16 px-4 section-shell relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-3">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage blog content and monitor visitor activity.</p>
            {loadingPosts ? <p className="text-xs text-muted-foreground font-mono mt-2">Syncing posts from Firebase...</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleSyncFirestore}
                disabled={syncingFirestore}
                className="px-4 py-2 rounded-lg border border-primary/40 text-sm text-primary hover:bg-primary/10 disabled:opacity-70"
              >
                {syncingFirestore ? "Syncing Firestore..." : "Force Sync to Firestore"}
              </button>
              {syncStatus ? <p className="text-xs text-muted-foreground font-mono">{syncStatus}</p> : null}
            </div>
            <button
              onClick={handleSignOut}
              className="mt-4 px-4 py-2 rounded-lg border border-border hover:border-primary/40 text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-xl border border-border bg-card/70">
              <p className="text-xs text-muted-foreground font-mono mb-1">Total Posts</p>
              <p className="text-2xl font-bold text-primary">{overview?.totalPosts ?? posts.length}</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card/70">
              <p className="text-xs text-muted-foreground font-mono mb-1">Published / Draft</p>
              <p className="text-2xl font-bold text-neon-cyan">{overview?.publishedPosts ?? 0} / {overview?.draftPosts ?? 0}</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card/70">
              <p className="text-xs text-muted-foreground font-mono mb-1">Featured / Views</p>
              <p className="text-2xl font-bold text-neon-purple">{overview?.featuredPosts ?? 0} / {overview?.totalViews ?? totalPostViews}</p>
            </div>
            <div className="p-5 rounded-xl border border-border bg-card/70">
              <p className="text-xs text-muted-foreground font-mono mb-1">Unique Visitors</p>
              <p className="text-2xl font-bold text-neon-green">{analytics.uniqueVisitors}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="p-6 rounded-2xl border border-border bg-card/70">
              <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Pages
              </h2>
              <div className="space-y-2">
                {topPages.length === 0 && <p className="text-sm text-muted-foreground">No page visits yet.</p>}
                {topPages.map(([path, views]) => (
                  <div key={path} className="flex justify-between text-sm border-b border-border/50 pb-2">
                    <span className="text-muted-foreground truncate">{path}</span>
                    <span className="text-primary font-mono">{views}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-border bg-card/70">
              <h2 className="text-lg font-semibold mb-4 inline-flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Last 7 Days Visits
              </h2>
              <div className="space-y-2">
                {dailyVisits.length === 0 && <p className="text-sm text-muted-foreground">No daily data yet.</p>}
                {dailyVisits.map(([day, count]) => (
                  <div key={day} className="flex justify-between text-sm border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">{day}</span>
                    <span className="text-neon-cyan font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card/70 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Auto Schedule Workflow
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs text-muted-foreground font-mono">30-day cycle • 10 posts target</p>
                <button
                  onClick={handleTestAIConnection}
                  disabled={testingAI}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-primary disabled:opacity-70"
                >
                  {testingAI ? "Testing GPT API..." : "Test GPT API"}
                </button>
                <button
                  onClick={handleGenerateAIPosts}
                  disabled={generatingAI}
                  className="px-3 py-1.5 rounded-lg border border-primary/40 text-xs text-primary hover:bg-primary/10 disabled:opacity-70"
                >
                  {generatingAI ? "Generating AI Posts..." : `Generate ${generationCount} AI Posts`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl border border-border/70 bg-background/40 space-y-3">
                <p className="text-sm font-medium text-foreground">Generation Controls</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={generationMode}
                    onChange={(e) => setGenerationMode(e.target.value as GenerationMode)}
                    className="px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                  >
                    <option value="mixed">Mode: Mixed</option>
                    <option value="tech">Mode: Tech</option>
                    <option value="client-centric">Mode: Client-Centric</option>
                  </select>
                  <select
                    value={generationCount}
                    onChange={(e) => setGenerationCount(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                  >
                    <option value={5}>Posts: 5</option>
                    <option value={10}>Posts: 10</option>
                    <option value={15}>Posts: 15</option>
                  </select>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Topic Selection</p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          selectedTopics.includes(topic)
                            ? "border-primary text-primary bg-primary/10"
                            : "border-border text-muted-foreground hover:text-primary"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={customTopicInput}
                      onChange={(e) => setCustomTopicInput(e.target.value)}
                      placeholder="Add custom topic"
                      className="w-full px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                    />
                    <button onClick={addCustomTopic} className="px-3 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:text-primary">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border/70 bg-background/40 space-y-3">
                <p className="text-sm font-medium text-foreground">SEO Keyword Strategy</p>
                <input
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="Primary keyword"
                  className="w-full px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                />
                <textarea
                  value={secondaryKeywords}
                  onChange={(e) => setSecondaryKeywords(e.target.value)}
                  placeholder="Secondary keywords, comma separated"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  GPT will use this keyword strategy for SEO-friendly titles, headings, and meta descriptions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">Auto Scheduled</p>
                <p className="text-xl font-bold text-primary">{autoScheduleOverview.total}</p>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">Live / Upcoming</p>
                <p className="text-xl font-bold text-neon-cyan">
                  {autoScheduleOverview.live} / {autoScheduleOverview.upcoming}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">Workflow Impressions</p>
                <p className="text-xl font-bold text-neon-purple">{autoScheduleOverview.impressions}</p>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">Keyword Coverage</p>
                <p className="text-xl font-bold text-neon-green">
                  {autoScheduleOverview.keywordCoverageCount} / {autoScheduleOverview.total || 0}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-sm font-medium inline-flex items-center gap-2 text-foreground">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  Next Scheduled Publish
                </p>
                {autoScheduleOverview.nextUpcomingDate ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">{autoScheduleOverview.nextUpcomingTitle}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{new Date(autoScheduleOverview.nextUpcomingDate).toLocaleString()}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">No upcoming scheduled posts in current cycle.</p>
                )}
              </div>

              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-sm font-medium inline-flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Focus Keywords
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  Salman Hafiz, WordPress developer, frontend developer, WordPress frontend development
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  These keywords are injected into automated posts for stronger SEO impressions and click-through opportunities.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">AI Generated</p>
                <p className="text-xl font-bold text-primary">{aiMonitor.total}</p>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-background/40">
                <p className="text-xs text-muted-foreground font-mono mb-1">AI Live / Upcoming</p>
                <p className="text-xl font-bold text-neon-cyan">
                  {aiMonitor.live} / {aiMonitor.upcoming}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border/70 bg-background/40 md:col-span-2">
                <p className="text-xs text-muted-foreground font-mono mb-1">AI Workflow Impressions</p>
                <p className="text-xl font-bold text-neon-purple">{aiMonitor.impressions}</p>
                <p className="text-xs text-muted-foreground mt-1">Keyword Coverage: {aiMonitor.keywordCoverage} / {aiMonitor.total || 0}</p>
              </div>
            </div>

            {aiStatus ? <p className="text-xs text-muted-foreground font-mono mt-3">{aiStatus}</p> : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="p-6 rounded-2xl border border-border bg-card/70 space-y-4">
              <h2 className="text-lg font-semibold inline-flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                {form.id ? "Edit Post" : "Create New Post"}
              </h2>

              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Title"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
                required
              />
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="Slug (optional)"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
              />
              <input
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Excerpt"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
                required
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Content"
                rows={8}
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
                required
              />
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags: react, gsap, performance"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
              />
              <input
                value={form.authorName}
                onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
                placeholder="Author name"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
              />
              <input
                value={form.metaTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="SEO title (optional)"
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
              />
              <textarea
                value={form.metaDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="SEO description (optional)"
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
              />

              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                  />
                  Published
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  />
                  Featured
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground inline-flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Post
                </button>
                {form.id && (
                  <button type="button" onClick={() => setForm(emptyForm)} className="px-4 py-2 rounded-lg border border-border">
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="p-6 rounded-2xl border border-border bg-card/70">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold">All Posts</h2>
                <p className="text-xs text-muted-foreground font-mono">
                  Showing {filteredPosts.length} of {posts.length}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === "all" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  All ({postCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === "published" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  Published ({postCounts.published})
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === "draft" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  Draft ({postCounts.draft})
                </button>
                <button
                  onClick={() => setStatusFilter("featured")}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    statusFilter === "featured" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground hover:text-primary"
                  }`}
                >
                  Featured ({postCounts.featured})
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-4">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, tag, slug, author, SEO meta"
                  className="w-full px-4 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as PostSortOption)}
                  className="px-3 py-2 rounded-lg bg-background/70 border border-border focus:outline-none focus:border-primary text-sm"
                >
                  <option value="updated">Sort: Recently Updated</option>
                  <option value="created">Sort: Recently Created</option>
                  <option value="views">Sort: Most Viewed</option>
                  <option value="title">Sort: Title A-Z</option>
                </select>
              </div>

              <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-xl border border-border/70 bg-background/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-foreground">{post.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">/{post.slug}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.published ? "Published" : "Draft"} • {post.featured ? "Featured" : "Standard"} • {post.views} views • {post.readingTimeMinutes} min read
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Updated: {new Date(post.updatedAt).toLocaleDateString()}</p>
                        {post.tags.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {post.tags.slice(0, 5).map((tag) => (
                              <span key={`${post.id}-${tag}`} className="text-[11px] px-2 py-0.5 rounded-full border border-border/70 text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 5 ? <span className="text-[11px] text-muted-foreground">+{post.tags.length - 5} more</span> : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button onClick={() => handleEdit(post)} className="text-xs px-2 py-1 rounded border border-primary/40 text-primary">
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(post.id, !post.published)}
                          className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary"
                        >
                          {post.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(post.id, !post.featured)}
                          className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary"
                        >
                          {post.featured ? "Unfeature" : "Feature"}
                        </button>
                        <button
                          onClick={() => handleDuplicate(post.id)}
                          className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-primary"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-xs px-2 py-1 rounded border border-red-500/40 text-red-400 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredPosts.length === 0 ? <p className="text-sm text-muted-foreground">No posts match your search.</p> : null}
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default AdminDashboard;
