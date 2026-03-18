import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Eye, ArrowRight, Clock3 } from "lucide-react";
import { getFeaturedPosts, getPublishedPosts } from "@/lib/blogStorage";
import type { BlogPost } from "@/types/blog";

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([getFeaturedPosts(3), getPublishedPosts()]).then(([featured, published]) => {
      if (!mounted) return;
      setPosts(featured.length > 0 ? featured : published.slice(0, 3));
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="blog" className="section-shell py-20 px-4 relative overflow-hidden">
      <div className="section-divider" />
      <div className="absolute inset-0 cyber-grid opacity-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-2">// BLOG</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-gradient">Latest Articles</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Insights about web performance, animation systems, and modern product engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="p-6 rounded-2xl bg-card/70 border border-border backdrop-blur-sm hover:border-primary/40 transition-all duration-300"
            >
              <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{post.excerpt}</p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-mono">
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

              <div className="flex flex-wrap gap-2 mb-5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-md border border-border bg-background/60 text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-neon-cyan transition-colors"
              >
                Read article
                <ArrowRight className="w-4 h-4" />
              </Link>
            </article>
          ))}
        </div>

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
