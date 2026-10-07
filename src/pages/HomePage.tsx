import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Star, Check, Sparkles, Shield, Wrench, Home } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeletons';
import { blogApi, reviewApi, categoryApi, subcategoryApi } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useIntersectionObserver } from '../hooks';
import type { Product, Review, BlogPost, Subcategory, Category } from '../types';

// ─────────────────────────────────────────
// Section wrapper with animation on scroll
// ─────────────────────────────────────────
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.08 });
  return (
    <section
      ref={ref}
      className={`${className} transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
    </section>
  );
}


const kidsCategories = [
  { name: 'Dinosaurs', emoji: '🦕' },
  { name: 'Space', emoji: '🚀' },
  { name: 'Animals', emoji: '🦁' },
  { name: 'Princess', emoji: '👸' },
  { name: 'Sports', emoji: '⚽' },
  { name: 'Cars', emoji: '🚗' },
  { name: 'Ocean', emoji: '🐠' },
  { name: 'Alphabet', emoji: '🔤' },
];

const nurseryCategories = [
  { name: 'Baby Animals', emoji: '🐣' },
  { name: 'Growth Charts', emoji: '📏' },
  { name: 'Names', emoji: '✨' },
  { name: 'Stars & Moon', emoji: '🌙' },
  { name: 'Woodland', emoji: '🦊' },
  { name: 'Rainbows', emoji: '🌈' },
];

const features = [
  {
    icon: <Sparkles size={24} />,
    title: 'Removable',
    description: 'Easy to install and remove without any sticky residue or mess.',
  },
  {
    icon: <Shield size={24} />,
    title: 'No Wall Damage',
    description: 'Designed for worry-free decorating — walls stay pristine.',
  },
  {
    icon: <Wrench size={24} />,
    title: 'Easy Installation',
    description: 'Transform your room in minutes with our simple peel-and-stick system.',
  },
  {
    icon: <Home size={24} />,
    title: 'Made for Every Room',
    description: 'Beautiful decor for kids, adults, families, and every space.',
  },
];

// ─────────────────────────────────────────
// HOMEPAGE
// ─────────────────────────────────────────
export default function HomePage() {
  useDocumentTitle('WallArt — Transform Your Walls', '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [roomCategories, setRoomCategories] = useState<Subcategory[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    Promise.all([
      reviewApi.getAll(8),
      blogApi.getFeatured(3),
      categoryApi.getAll(true),
    ]).then(([revs, posts, cats]) => {
      setReviews(revs);
      setBlogPosts(posts);
      setCategories(cats);

      const interiorCat = cats.find((c) => c.slug === 'interior' || c.name.toLowerCase() === 'interior');
      if (interiorCat) {
        subcategoryApi.getByCategory(interiorCat.categoryId || interiorCat.id).then(setRoomCategories);
      }
    });
  }, []);


  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=85"
            alt="Beautifully decorated modern room with artistic wall decals"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        </div>

        <div className="relative z-10 container-custom py-24">
          <div className="max-w-xl">
            <span className="inline-block text-terracotta-light text-sm font-semibold tracking-widest uppercase mb-4 animate-fade-in-up">
              Premium Wall Decals
            </span>
            <h1 className="section-title text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              Bring Your Walls to Life
            </h1>
            <p className="text-white/80 text-lg leading-relaxed mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              Beautiful removable wall decals designed to transform every room.
              Easy to apply, easy to remove — no damage, no regrets.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <Link to="/shop" className="btn-terracotta px-8 py-4 text-sm font-bold tracking-widest">
                SHOP NOW
              </Link>
              <Link to="/customize" className="btn-secondary border-white text-white hover:bg-white hover:text-charcoal px-8 py-4 text-sm font-bold tracking-widest">
                CREATE YOUR OWN
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
              {['50,000+ Happy Customers', 'Free Shipping $200+', '30-Day Returns'].map((text) => (
                <div key={text} className="flex items-center gap-1.5 text-white/80 text-sm">
                  <Check size={14} className="text-terracotta-light" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-3 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ── SHOP BY ROOM ── */}
      <AnimatedSection className="py-16 md:py-24 bg-warm-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Shop By Room</h2>
            <p className="section-subtitle">
              Find the perfect decal for every space in your home
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4">
            {roomCategories.map((room) => (
              <Link
                key={room.subcategoryId}
                to={`/category/interior/${room.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] md:aspect-[4/5] cursor-pointer"
              >
                <img
                  src={room.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80'}
                  alt={room.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="text-sm font-semibold leading-tight line-clamp-1">{room.name}</p>
                  <p className="text-xs text-white/70 group-hover:text-terracotta-light transition-colors mt-0.5">
                    Shop →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── SHOP BY STYLE ── */}
      <AnimatedSection className="py-16 md:py-24 bg-beige/40">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Shop By Style</h2>
            <p className="section-subtitle">
              From botanical to geometric — find your aesthetic
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id || cat.slug}
                to={`/category/${cat.slug}`}
                className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer"
              >
                <img
                  src={cat.imageUrl || cat.image || 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80'}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-xl font-bold text-white drop-shadow-lg text-center px-2">
                    {cat.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>



      {/* ── CUSTOM WALL DECALS CTA ── */}
      <AnimatedSection className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1400&q=80"
            alt="Custom personalized wall lettering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-charcoal/75" />
        </div>
        <div className="relative z-10 container-custom text-center text-white">
          <span className="inline-block text-terracotta-light text-sm font-bold tracking-widest uppercase mb-4">
            Personalize Your Space
          </span>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">Make It Personal</h2>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Create a wall decal made just for you. Choose your name, quote,
            color, font and size — then watch the magic happen.
          </p>
          <Link to="/customize" className="btn-terracotta px-10 py-4 text-sm font-bold tracking-widest">
            CREATE YOUR DECAL →
          </Link>
        </div>
      </AnimatedSection>

      {/* ── KIDS COLLECTION ── */}
      <AnimatedSection className="py-16 md:py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-terracotta text-sm font-bold tracking-widest uppercase mb-3">
                Kids Collection
              </span>
              <h2 className="section-title mb-4">Make Their Room Magical</h2>
              <p className="section-subtitle mb-8">
                Spark imagination and joy with our vibrant kids collection.
                Safe, removable, and utterly adorable.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {kidsCategories.map(({ name, emoji }) => (
                  <Link
                    key={name}
                    to={`/shop?theme=${name.toLowerCase()}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-medium text-charcoal shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all border border-border/50"
                  >
                    <span>{emoji}</span>
                    {name}
                  </Link>
                ))}
              </div>
              <Link to="/category/kids" className="btn-terracotta">
                SHOP KIDS COLLECTION
              </Link>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <img
                  src="https://images.unsplash.com/photo-1558618047-f96f5b6d26f2?w=500&q=80"
                  alt="Kids room with colorful dinosaur wall decals"
                  className="rounded-2xl object-cover aspect-[4/5] w-full"
                />
                <div className="space-y-3 mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=500&q=80"
                    alt="Safari animal wall decals"
                    className="rounded-2xl object-cover aspect-square w-full"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80"
                    alt="Kids room space theme"
                    className="rounded-2xl object-cover aspect-square w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── NURSERY ── */}
      <AnimatedSection className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1566041510639-8d5a4f5bf39f?w=800&q=80"
                alt="Beautiful nursery with soft wall decals"
                className="rounded-2xl object-cover w-full aspect-[4/3]"
              />
            </div>
            <div className="order-1 lg:order-2">
              <span className="inline-block text-forest text-sm font-bold tracking-widest uppercase mb-3">
                Nursery Collection
              </span>
              <h2 className="section-title mb-4">Beautiful Beginnings</h2>
              <p className="section-subtitle mb-8">
                Create a gentle, magical space for your little one.
                Our nursery decals are soft, safe, and perfectly sweet.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {nurseryCategories.map(({ name, emoji }) => (
                  <Link
                    key={name}
                    to={`/shop?theme=${name.toLowerCase().replace(/\s/g, '-')}`}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-full text-sm font-medium text-charcoal hover:bg-pink-100 transition-colors border border-pink-100"
                  >
                    <span>{emoji}</span>
                    {name}
                  </Link>
                ))}
              </div>
              <Link to="/category/nursery" className="btn-primary">
                SHOP NURSERY
              </Link>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── WHY WALLART ── */}
      <AnimatedSection className="py-16 md:py-24 bg-beige/40">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Why WallArt?</h2>
            <p className="section-subtitle">
              Premium quality you can feel confident about
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 text-center shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 border border-border/40"
              >
                <div className="w-14 h-14 bg-terracotta/10 text-terracotta rounded-xl flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ── CUSTOMER REVIEWS ── */}
      <AnimatedSection className="py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className="star-filled" />
              ))}
            </div>
            <h2 className="section-title mb-3">Loved by 50,000+ Customers</h2>
            <p className="section-subtitle">Real stories from real customers</p>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.slice(reviewIndex, reviewIndex + 3).map((review) => (
                <div
                  key={review.id}
                  className="bg-beige/30 rounded-xl p-6 border border-border/50 hover:shadow-medium transition-all duration-300"
                >
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} size={14} className="star-filled" />
                    ))}
                  </div>
                  <p className="font-semibold text-charcoal mb-2 text-sm">"{review.title}"</p>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    "{review.content}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-terracotta/20 rounded-full flex items-center justify-center text-sm font-semibold text-terracotta">
                        {(review.customerName || review.author || 'C')[0]}
                      </div>
                      <span className="text-sm font-medium text-charcoal">{review.customerName || review.author || 'Verified Buyer'}</span>
                    </div>
                    {review.verified && (
                      <span className="badge-verified">
                        <Check size={10} className="mr-1" /> Verified
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setReviewIndex(Math.max(0, reviewIndex - 3))}
                disabled={reviewIndex === 0}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setReviewIndex(Math.min(reviews.length - 3, reviewIndex + 3))}
                disabled={reviewIndex + 3 >= reviews.length}
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-charcoal hover:text-white hover:border-charcoal transition-colors disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ── BLOG ── */}
      <AnimatedSection className="py-16 md:py-24 bg-beige/40">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title mb-2">From Our Blog</h2>
              <p className="section-subtitle">Ideas, inspiration and how-to guides</p>
            </div>
            <Link to="/blog" className="btn-ghost hidden md:flex">
              View All Articles <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold text-terracotta tracking-wider uppercase mb-2">
                    {post.category}
                  </p>
                  <h3 className="font-serif text-lg font-semibold text-charcoal line-clamp-2 group-hover:text-terracotta transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-text-light">
                    <span>{post.author.name}</span>
                    <span>·</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Link to="/blog" className="btn-secondary">View All Articles</Link>
          </div>
        </div>
      </AnimatedSection>

      {/* ── NEWSLETTER ── */}
      <AnimatedSection className="py-16 md:py-24 bg-charcoal text-white">
        <div className="container-custom text-center">
          <span className="inline-block text-terracotta-light text-sm font-bold tracking-widest uppercase mb-4">
            Join Our Community
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">Get Inspired</h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Join our community for decorating ideas, new collections,
            exclusive offers, and first access to sales.
          </p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-2 text-terracotta-light text-lg font-semibold">
              <Check size={20} />
              Thank you for subscribing! Check your inbox for a welcome gift.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-terracotta text-sm"
              />
              <button type="submit" className="btn-terracotta px-6 py-3.5 whitespace-nowrap">
                SUBSCRIBE
              </button>
            </form>
          )}
          <p className="text-white/40 text-xs mt-4">
            No spam, ever. Unsubscribe at any time.
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
