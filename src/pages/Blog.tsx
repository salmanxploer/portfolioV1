import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, Eye, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getFeaturedPosts, getPublishedPosts, getPostsByTag, searchPublishedPosts } from "@/lib/blogStorage";
import type { BlogPost } from "@/types/blog";

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("");

  useEffect(() => {
    let mounted = true;
    void Promise.all([getPublishedPosts(), getFeaturedPosts(3)]).then(([published, featured]) => {
      if (!mounted) return;
      setPosts(published);
      setFeaturedPosts(featured);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const searched = await searchPublishedPosts(searchQuery);
      const filtered = activeTag ? await getPostsByTag(activeTag) : searched;
      const finalPosts = activeTag ? filtered.filter((post) => searched.some((s) => s.id === post.id)) : searched;
      if (!mounted) return;
      setPosts(finalPosts);
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [searchQuery, activeTag]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    posts.forEach((post) => post.tags.forEach((tag) => allTags.add(tag)));
    return Array.from(allTags).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16 px-4 section-shell relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">Blog</h1>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Practical articles on frontend architecture, animation systems, and performance tuning.
          </p>

          {featuredPosts.length > 0 ? (
            <div className="mb-10 p-6 rounded-2xl border border-primary/30 bg-primary/5">
              <p className="text-xs font-mono text-primary mb-2">FEATURED</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="p-4 rounded-xl border border-border/70 bg-card/50 hover:border-primary/40 transition-colors">
                    <h2 className="font-semibold mb-2 line-clamp-2">{post.title}</h2>
                    <p className="text-xs text-muted-foreground">By {post.authorName}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-8 space-y-4">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search articles by title, tag, excerpt"
              className="w-full px-4 py-3 rounded-xl bg-card/70 border border-border focus:outline-none focus:border-primary"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("")}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeTag === "" ? "border-primary/60 text-primary bg-primary/10" : "border-border text-muted-foreground"
                }`}
              >
                All tags
              </button>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    activeTag === tag ? "border-primary/60 text-primary bg-primary/10" : "border-border text-muted-foreground"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="p-6 rounded-2xl bg-card/70 border border-border backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-3">{post.title}</h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5 font-mono">
                  <span>{post.authorName}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    {post.readingTimeMinutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {post.views}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`} className="text-primary hover:text-neon-cyan transition-colors font-medium">
                  Read more
                </Link>
              </article>
            ))}
          </div>
          {posts.length === 0 ? <p className="text-sm text-muted-foreground">No posts found for your current search/filter.</p> : null}
        </div>
      </section>
      <Footer />
    </main>
  );
};

export default Blog;
