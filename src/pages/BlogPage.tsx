import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { blogApi } from '../api';
import type { BlogPost } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { BlogCardSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const BlogPage: React.FC = () => {
  useDocumentTitle('Decor Inspiration & Guides | WallArt Blog');

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      try {
        const res = await blogApi.getAll(1, 20);
        setPosts(res.posts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const featuredPost = posts.find((p) => p.featured) || posts[0];

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Blog Hero */}
      <div className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> WallArt Journal
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Inspiration & Styling Guides
          </h1>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto font-light leading-relaxed">
            Discover creative tips on wall sticker placement, interior styling trends, nursery ideas, and easy installation hacks.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Breadcrumb items={[{ label: 'Blog & Articles' }]} />

        {/* Categories Bar */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-charcoal/70 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Highlight (if on All) */}
        {selectedCategory === 'All' && featuredPost && !loading && (
          <div className="mt-8 mb-12">
            <Link
              to={`/blog/${featuredPost.slug}`}
              className="group grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden bg-white border border-stone-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto overflow-hidden">
                <img
                  src={featuredPost.featuredImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-charcoal/60 mb-3">
                    <span className="text-xs uppercase font-bold text-terracotta tracking-wider">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featuredPost.readingTime} min read
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal group-hover:text-terracotta transition leading-snug">
                    {featuredPost.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal/70 mt-3 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-stone-100 mt-6">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={featuredPost.author.avatar}
                      alt={featuredPost.author.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                    <div className="text-xs font-semibold text-charcoal">
                      {featuredPost.author.name}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-terracotta flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Post Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-200 hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="relative aspect-16/10 overflow-hidden bg-stone-100 block"
                  >
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-charcoal/80 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-charcoal/60 mb-2">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <span>{post.readingTime} min read</span>
                      </div>
                      <Link to={`/blog/${post.slug}`}>
                        <h3 className="font-serif font-bold text-lg text-charcoal group-hover:text-terracotta transition line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-charcoal/70 mt-2 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-6 border-t border-stone-100">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-charcoal font-medium">
                          {post.author.name}
                        </span>
                      </div>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="text-xs font-bold text-terracotta flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
