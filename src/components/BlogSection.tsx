import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Eye, ArrowRight, Clock3, ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/blogStorage";
import type { BlogPost } from "@/types/blog";

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getFeaturedPosts(3), getPublishedPosts()]).then(([featured, published]) => {
      if (!mounted) return;
      const selected = published.slice(0, 8);
      const fallback = featured.length > 0 ? featured : published;
      const finalPosts = selected.length > 0 ? selected : fallback.slice(0, 6);
      setPosts(finalPosts);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (posts.length <= 1) return;
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % posts.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [posts.length, isPaused]);

  useEffect(() => {
    if (activeIndex < posts.length) return;
    setActiveIndex(0);
  }, [activeIndex, posts.length]);

  const activePost = useMemo(() => posts[activeIndex], [posts, activeIndex]);

  const handlePrev = () => {
    if (posts.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const handleNext = () => {
    if (posts.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % posts.length);
  };

  const handleSlideAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (posts.length <= 1) return;

    const target = event.target as HTMLElement;
    if (target.closest("a, button")) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const midpoint = bounds.width / 2;

    if (clickX < midpoint) {
      handlePrev();
      return;
    }
    handleNext();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (posts.length <= 1) return;
    if (touchStartXRef.current === null) return;

    const touchEndX = event.changedTouches[0]?.clientX;
    if (typeof touchEndX !== "number") {
      touchStartXRef.current = null;
      return;
    }

    const deltaX = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < 35) return;
    if (deltaX > 0) {
      handlePrev();
      return;
    }
    handleNext();
  };

  return (
    <section id="blog" className="section-shell py-20 px-4 relative overflow-hidden">
      <div className="section-divider" />
      <div className="absolute inset-0 cyber-grid opacity-10" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-neon-cyan/20 blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-2">// BLOG</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-gradient">Sliding Blog Showcase</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore featured writing in an interactive stream with smart previews and direct jumps to each article.
          </p>
        </div>

        {posts.length > 0 ? (
          <>
            <div
              className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card/60 backdrop-blur-xl"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={handleSlideAreaClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "ArrowLeft") handlePrev();
                if (event.key === "ArrowRight") handleNext();
              }}
              aria-label="Click left side for previous post and right side for next post"
            >
              <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="h-9 w-9 rounded-full border border-border bg-background/70 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center justify-center"
                  aria-label="Previous blog slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNext}
                  className="h-9 w-9 rounded-full border border-border bg-background/70 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors inline-flex items-center justify-center"
                  aria-label="Next blog slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {posts.map((post) => (
                  <article key={post.id} className="min-w-full p-5 md:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7 items-stretch">
                      <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl border border-border/70 bg-background/40 h-full flex flex-col justify-between">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-primary font-mono mb-3">Featured Story</p>
                        <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{post.title}</h3>
                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {post.tags.slice(0, 5).map((tag) => (
                            <span key={`${post.id}-${tag}`} className="text-xs px-2.5 py-1 rounded-full border border-border/70 bg-background/60 text-muted-foreground">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/40 text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                        >
                          Read full article
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>

                      <div className="p-5 md:p-6 rounded-2xl border border-border/70 bg-background/30 h-full flex flex-col justify-between">
                        <p className="text-xs text-muted-foreground font-mono mb-4">Article Stats</p>
                        <div className="space-y-3 text-sm">
                          <p className="inline-flex items-center gap-2 text-muted-foreground">
                            <CalendarDays className="w-4 h-4 text-primary" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                          <p className="inline-flex items-center gap-2 text-muted-foreground">
                            <Clock3 className="w-4 h-4 text-primary" />
                            {post.readingTimeMinutes} min read
                          </p>
                          <p className="inline-flex items-center gap-2 text-muted-foreground">
                            <Eye className="w-4 h-4 text-primary" />
                            {post.views} views
                          </p>
                        </div>

                        <div className="mt-6 border-t border-border/60 pt-4">
                          <p className="text-xs text-muted-foreground font-mono">Author</p>
                          <p className="text-sm text-foreground mt-1">{post.authorName}</p>
                          <p className="text-xs text-muted-foreground mt-3">Auto sliding every few seconds. You can still navigate manually.</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {posts.map((post, idx) => (
                <button
                  key={`dot-${post.id}`}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to blog slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all ${idx === activeIndex ? "w-7 bg-primary" : "w-2.5 bg-border hover:bg-primary/60"}`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl border border-border bg-card/60 text-center">
            <p className="text-sm text-muted-foreground">No blog posts found yet.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
          >
            View all blogs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
