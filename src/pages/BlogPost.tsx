import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Eye, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, getPostsByTag, incrementPostViewAsync } from "@/lib/blogStorage";
import { trackFirebaseEvent } from "@/lib/firebase";
import type { BlogPost as BlogPostType } from "@/types/blog";

const BlogPost = () => {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<BlogPostType | undefined>(undefined);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let mounted = true;

    const loadPost = async () => {
      setLoading(true);
      await incrementPostViewAsync(slug);
      const data = await getPostBySlug(slug);
      if (!mounted) return;
      setPost(data);
      if (data?.tags?.[0]) {
        const byTag = await getPostsByTag(data.tags[0]);
        if (!mounted) return;
        setRelatedPosts(byTag.filter((item) => item.id !== data.id).slice(0, 3));
      } else {
        setRelatedPosts([]);
      }
      setLoading(false);
      void trackFirebaseEvent("blog_post_view", { slug });
    };

    void loadPost();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-muted-foreground font-mono">Loading article...</div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-28 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-muted-foreground">Post not found.</p>
            <Link to="/blog" className="text-primary mt-4 inline-block">Back to blog</Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <article className="pt-28 pb-16 px-4 section-shell relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">{post.title}</h1>

          <div className="flex items-center gap-5 text-xs text-muted-foreground mb-8 font-mono">
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

          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-1 rounded-md border border-border bg-card/70 text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {relatedPosts.length > 0 ? (
            <div className="mt-12 pt-8 border-t border-border/60">
              <h2 className="text-xl font-semibold mb-4">Related articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {relatedPosts.map((item) => (
                  <Link key={item.id} to={`/blog/${item.slug}`} className="p-4 rounded-xl border border-border bg-card/60 hover:border-primary/40 transition-colors">
                    <h3 className="font-medium mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>
      <Footer />
    </main>
  );
};

export default BlogPost;
