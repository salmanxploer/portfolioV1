import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Eye, Clock3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPostBySlug, getPostsByTag, incrementPostViewAsync } from "@/lib/blogStorage";
import { trackFirebaseEvent } from "@/lib/firebase";
import type { BlogPost as BlogPostType } from "@/types/blog";

type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ordered-item"; text: string; number: string }
  | { type: "unordered-item"; text: string }
  | { type: "paragraph"; text: string };

const parseContentBlocks = (content: string): ContentBlock[] => {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (line.startsWith("## ")) {
        return { type: "h3", text: line.slice(3).trim() } as ContentBlock;
      }
      if (line.startsWith("# ")) {
        return { type: "h2", text: line.slice(2).trim() } as ContentBlock;
      }
      if (/^\d+\.\s+/.test(line)) {
        const match = line.match(/^(\d+)\.\s+(.*)$/);
        return {
          type: "ordered-item",
          number: match?.[1] || "1",
          text: match?.[2]?.trim() || line,
        } as ContentBlock;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return { type: "unordered-item", text: line.slice(2).trim() } as ContentBlock;
      }
      return { type: "paragraph", text: line } as ContentBlock;
    });
};

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

          <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed">
            {parseContentBlocks(post.content).map((block, idx) => {
              if (block.type === "h2") {
                return (
                  <h2 key={`block-${idx}`} className="text-2xl md:text-3xl font-semibold mt-8 mb-3 text-foreground">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "h3") {
                return (
                  <h3 key={`block-${idx}`} className="text-xl md:text-2xl font-semibold mt-6 mb-2 text-foreground/95">
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "ordered-item") {
                return (
                  <p key={`block-${idx}`} className="pl-4 border-l border-border/60 mb-2 text-foreground/90">
                    {block.number}. {block.text}
                  </p>
                );
              }
              if (block.type === "unordered-item") {
                return (
                  <p key={`block-${idx}`} className="pl-4 border-l border-border/60 mb-2 text-foreground/90">
                    - {block.text}
                  </p>
                );
              }
              return (
                <p key={`block-${idx}`} className="mb-4 text-foreground/90">
                  {block.text}
                </p>
              );
            })}
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
