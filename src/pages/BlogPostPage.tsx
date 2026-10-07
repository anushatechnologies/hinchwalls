import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Share2, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { blogApi } from '../api';
import type { BlogPost } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { PageSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle(post ? `${post.title} | WallArt Blog` : 'Article');

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = await blogApi.getBySlug(slug);
        setPost(found);
        const all = await blogApi.getAll(1, 4);
        setRecentPosts(all.posts.filter((p) => p.slug !== slug).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Article link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <PageSkeleton />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Article Not Found</h2>
        <Link
          to="/blog"
          className="inline-block px-6 py-2.5 bg-terracotta text-white rounded-full text-xs font-semibold"
        >
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'Blog', href: '/blog' },
            { label: post.category, href: '/blog' },
            { label: post.title },
          ]}
        />

        <div className="mt-6 mb-8 text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta px-3 py-1 rounded-full bg-terracotta/10 inline-block mb-3">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-charcoal leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-4 mt-6 text-xs text-charcoal/60">
            <div className="flex items-center gap-2">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
              />
              <span className="font-semibold text-charcoal">{post.author.name}</span>
            </div>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {post.publishedAt}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {post.readingTime} min read
            </span>
          </div>
        </div>

        {/* Featured Banner Image */}
        <div className="rounded-3xl overflow-hidden shadow-xl aspect-16/9 bg-stone-100 mb-12 border border-stone-200">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-stone max-w-none bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs text-charcoal/90 leading-relaxed text-sm sm:text-base">
          <div className="space-y-6">
            <p className="text-lg font-light leading-relaxed italic text-charcoal/80 border-l-4 border-terracotta pl-4">
              {post.excerpt}
            </p>

            <h2 className="text-2xl font-serif font-bold text-charcoal mt-8">
              Why Decals are Revolutionizing Modern Walls
            </h2>
            <p>
              Wall decals have transitioned from basic kids stickers into architectural interior accents. Modern matte finishes create an authentic hand-painted mural aesthetic without the permanent commitment or damage of traditional wallpapers and stencils.
            </p>

            <h3 className="text-xl font-serif font-bold text-charcoal mt-6">
              1. Preparation is Everything
            </h3>
            <p>
              Before applying peel-and-stick decals, wipe down the target surface with a dry microfiber cloth to remove dust particles. Avoid household chemical sprays, as they leave microscopic silicone residues that reduce adhesive grab.
            </p>

            <div className="p-6 bg-beige/50 rounded-2xl border border-stone-200 my-6">
              <h4 className="font-serif font-bold text-charcoal text-sm mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-terracotta" /> WallArt Pro Tip:
              </h4>
              <p className="text-xs text-charcoal/80 mb-0">
                If your room has newly painted walls, wait 2 to 3 weeks before decal application. Modern low-VOC paints outgas water vapor for weeks, which can cause bubbles beneath fresh vinyl!
              </p>
            </div>

            <h3 className="text-xl font-serif font-bold text-charcoal mt-6">
              2. Visual Balance and Eye-Level Alignment
            </h3>
            <p>
              Always test your composition with low-tack blue painter's tape before peeling the protective backing. Stand 8 feet back to evaluate line of sight from doorways and reading chairs.
            </p>

            <h3 className="text-xl font-serif font-bold text-charcoal mt-6">
              3. Effortless Clean Removal
            </h3>
            <p>
              When redecorating or moving home, warm the edge of the decal using a hair dryer on low heat for 10 seconds. The medical-grade adhesive softens, peeling cleanly off in one smooth pull without peeling wall paint.
            </p>
          </div>

          {/* Tags & Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-8 mt-10 border-t border-stone-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-charcoal uppercase tracking-wider">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-stone-100 text-charcoal/70"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-charcoal hover:border-terracotta hover:text-terracotta transition flex items-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Article
            </button>
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200 mt-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta block">
              Written By
            </span>
            <h3 className="text-base font-serif font-bold text-charcoal mt-0.5">
              {post.author.name}
            </h3>
            <p className="text-xs text-charcoal/70 mt-1">{post.author.bio}</p>
          </div>
        </div>

        {/* Recent Articles */}
        {recentPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-stone-200">
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">
              More Stories You Might Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentPosts.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-stone-200 hover:shadow-md transition flex flex-col group"
                >
                  <div className="aspect-16/10 overflow-hidden bg-stone-100">
                    <img
                      src={p.featuredImage}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-serif font-bold text-sm text-charcoal group-hover:text-terracotta line-clamp-2">
                      {p.title}
                    </h4>
                    <span className="text-[11px] text-terracotta font-semibold mt-3 flex items-center gap-1">
                      Read story <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
