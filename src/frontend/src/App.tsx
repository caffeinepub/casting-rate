import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Bell,
  Bookmark,
  Cake,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  Facebook,
  Film,
  Heart,
  HelpCircle,
  History,
  Instagram,
  Loader2,
  Medal,
  Menu,
  MessageSquare,
  Mic,
  Music,
  Play,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Tv,
  Twitter,
  User,
  UserCircle,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Actor,
  type FeaturedTrailer,
  type Movie,
  type PodcastEpisode,
  type Show,
  type UpcomingMovie,
  actorsData,
  featuredTrailers,
  moviesData,
  ottColors,
  podcastEpisodes,
  showsData,
  upcomingMovies,
} from "./data/panIndiaData";
import { useActor } from "./hooks/useActor";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatReviewCount(n?: number): string {
  if (n === undefined || n === null) return "";
  if (n >= 1000) {
    return `(${(n / 1000).toFixed(1)}k reviews)`;
  }
  return `(${n} reviews)`;
}

// ── Hooks ──────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── Star Rating (display only) ───────────────────────────────────────────────

function StarRating({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.floor(rating)
              ? "fill-amber-500 text-amber-500"
              : i - 0.5 <= rating
                ? "fill-amber-300 text-amber-300"
                : "text-sand fill-none"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-dm text-chestnut font-semibold">
        {rating}
      </span>
      {reviewCount !== undefined && (
        <span className="ml-1 text-xs font-dm text-chestnut">
          {formatReviewCount(reviewCount)}
        </span>
      )}
    </div>
  );
}

// ── User Rating Widget ───────────────────────────────────────────────────────

interface RatingSummary {
  count: bigint;
  average: number;
}

function UserRatingWidget({ entityId }: { entityId: string }) {
  const { actor, isFetching: actorFetching } = useActor();
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!actor || actorFetching) return;
    let cancelled = false;
    async function load() {
      if (!actor) return;
      setLoading(true);
      try {
        const [sum, userRating] = await Promise.all([
          actor.getRating(entityId),
          actor.getUserRating(entityId),
        ]);
        if (!cancelled) {
          setSummary(sum);
          if (userRating !== null && userRating !== undefined) {
            setSelected(Number(userRating));
          }
        }
      } catch {
        // silently ignore backend errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [entityId, actor, actorFetching]);

  const handleRate = async (star: number) => {
    if (submitting || !actor) return;
    setSelected(star);
    setSubmitting(true);
    try {
      await actor.submitRating(entityId, BigInt(star));
      const updated = await actor.getRating(entityId);
      setSummary(updated);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      // silently ignore
    } finally {
      setSubmitting(false);
    }
  };

  const displayStar = hovered || selected;

  return (
    <div
      data-ocid="rating.panel"
      className="rounded-2xl bg-warm-beige border border-sand p-4"
    >
      <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-3">
        Rate This
      </p>

      {/* Clickable stars */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            data-ocid={`rating.toggle.${star}`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleRate(star)}
            disabled={submitting}
            aria-label={`Rate ${star} out of 5`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-sm transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= displayStar
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-clay"
              }`}
            />
          </button>
        ))}

        {submitting && (
          <Loader2 className="w-4 h-4 ml-2 animate-spin text-sienna" />
        )}
        {submitted && !submitting && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="ml-2 text-xs font-dm text-sienna font-semibold"
          >
            Thanks!
          </motion.span>
        )}
      </div>

      {/* Community average */}
      {loading ? (
        <div
          data-ocid="rating.loading_state"
          className="h-4 w-32 bg-sand rounded animate-pulse"
        />
      ) : summary ? (
        <div className="flex items-center gap-2 text-xs font-dm text-chestnut">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span>
            <span className="font-semibold text-espresso">
              {summary.average > 0 ? summary.average.toFixed(1) : "—"}
            </span>{" "}
            community avg ·{" "}
            <span className="font-semibold text-espresso">
              {Number(summary.count)}
            </span>{" "}
            {Number(summary.count) === 1 ? "rating" : "ratings"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ── Image with fallback ──────────────────────────────────────────────────────

function SafeImage({
  src,
  alt,
  className,
  fallbackLetter,
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackLetter?: string;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div
      className={`${className} flex items-center justify-center bg-sand text-chestnut font-playfair font-bold`}
    >
      <span className="text-4xl">{fallbackLetter ?? alt[0]}</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

// ── OTT Badge ───────────────────────────────────────────────────────────────

function OttBadge({ platform }: { platform: string }) {
  const cls = ottColors[platform] ?? "bg-clay text-cream";
  return (
    <span
      className={`text-[10px] font-dm font-semibold px-2 py-0.5 rounded-full ${cls}`}
    >
      {platform}
    </span>
  );
}

// ── Box Office Badge ─────────────────────────────────────────────────────────

type BoxOfficeStatus =
  | "Blockbuster"
  | "Super Hit"
  | "Hit"
  | "Average"
  | "Flop"
  | "Disaster";

const boxOfficeColors: Record<BoxOfficeStatus, string> = {
  Blockbuster: "bg-yellow-500 text-black",
  "Super Hit": "bg-green-600 text-white",
  Hit: "bg-emerald-500 text-white",
  Average: "bg-blue-500 text-white",
  Flop: "bg-red-500 text-white",
  Disaster: "bg-gray-600 text-white",
};

function BoxOfficeBadge({ status }: { status: BoxOfficeStatus }) {
  const cls = boxOfficeColors[status] ?? "bg-clay text-cream";
  return (
    <span
      className={`text-[10px] font-dm font-bold px-2 py-0.5 rounded-full ${cls}`}
    >
      {status}
    </span>
  );
}

// ── Industry Badge ───────────────────────────────────────────────────────────

const industryColors: Record<string, string> = {
  Bollywood: "bg-sienna/20 text-sienna border-sienna/30",
  Tamil: "bg-gold/20 text-chestnut border-gold/30",
  Telugu: "bg-crimson-warm/20 text-crimson-warm border-crimson-warm/30",
  Malayalam: "bg-chestnut/20 text-chestnut border-chestnut/30",
  Kannada: "bg-deep-amber/20 text-espresso border-deep-amber/30",
};

function IndustryBadge({ industry }: { industry: string }) {
  const cls =
    industryColors[industry] ?? "bg-warm-beige text-chestnut border-sand";
  return (
    <span
      className={`text-[10px] font-dm font-semibold px-2 py-0.5 rounded-full border ${cls}`}
    >
      {industry}
    </span>
  );
}

// ── YouTube Trailer Embed ─────────────────────────────────────────────────────

function YoutubeTrailer({ youtubeId }: { youtubeId: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-3">
      <Button
        data-ocid="movie.trailer_button"
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-dm font-semibold text-sm transition-colors ${
          visible
            ? "bg-espresso hover:bg-chestnut text-cream"
            : "bg-red-600 hover:bg-red-700 text-white"
        }`}
      >
        {visible ? (
          <>
            <X className="w-4 h-4" />
            Hide Trailer
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-white" />
            Watch Trailer
          </>
        )}
      </Button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden rounded-xl"
          >
            <div
              className="relative w-full rounded-xl overflow-hidden bg-black"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title="Movie Trailer"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────────────

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filter: string;
  setFilter: (v: string) => void;
  industryFilter: string;
  setIndustryFilter: (v: string) => void;
  wishlistCount: number;
  onWishlistOpen: () => void;
  onSignInOpen: () => void;
}

function Navbar({
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
  industryFilter,
  setIndustryFilter,
  wishlistCount,
  onWishlistOpen,
  onSignInOpen,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      icon: UserCircle,
      label: "Profile",
      action: () => {
        onSignInOpen();
        setMenuOpen(false);
      },
    },
    { icon: History, label: "History", action: () => setMenuOpen(false) },
    { icon: Settings, label: "Settings", action: () => setMenuOpen(false) },
    {
      icon: MessageSquare,
      label: "Feedback",
      action: () => setMenuOpen(false),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => setMenuOpen(false),
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-espresso/95 backdrop-blur-md border-b border-clay/30 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src="/assets/generated/casting-rate-logo.dim_400x200.png"
            alt="Casting Rate"
            className="h-9 w-auto object-contain"
          />
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs sm:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clay pointer-events-none" />
          <input
            data-ocid="navbar.search_input"
            type="text"
            placeholder="Search actors, movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-espresso/60 border border-clay/40 rounded-lg text-sm text-cream placeholder:text-clay/70 focus:outline-none focus:ring-1 focus:ring-gold/60 font-dm"
          />
        </div>

        {/* Content Filter Dropdown */}
        <div className="relative hidden sm:block">
          <select
            data-ocid="navbar.filter_select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none bg-espresso/60 border border-clay/40 rounded-lg text-sm text-cream px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-gold/60 font-dm cursor-pointer"
          >
            <option value="all">All</option>
            <option value="actors">Actors</option>
            <option value="movies">Movies</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-clay pointer-events-none" />
        </div>

        {/* Industry Filter Dropdown */}
        <div className="relative hidden md:block">
          <select
            data-ocid="navbar.industry_select"
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="appearance-none bg-espresso/60 border border-clay/40 rounded-lg text-sm text-cream px-3 py-2 pr-7 focus:outline-none focus:ring-1 focus:ring-gold/60 font-dm cursor-pointer"
          >
            <option value="all">All Industries</option>
            <option value="Bollywood">Bollywood</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Kannada">Kannada</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-clay pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Wishlist */}
          <button
            type="button"
            data-ocid="navbar.wishlist_button"
            onClick={onWishlistOpen}
            className="relative p-2 rounded-full hover:bg-clay/20 transition-colors text-cream"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-espresso text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Sign In */}
          <Button
            data-ocid="navbar.signin_button"
            onClick={onSignInOpen}
            size="sm"
            className="bg-gold hover:bg-amber-warm text-espresso font-dm font-semibold text-xs px-4 rounded-lg"
          >
            Sign In
          </Button>

          {/* Menu Button */}
          <div className="relative">
            <button
              type="button"
              data-ocid="navbar.menu_button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-clay/20 transition-colors text-cream"
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 cursor-default appearance-none bg-transparent border-0"
                    onClick={() => setMenuOpen(false)}
                  />
                  <motion.div
                    data-ocid="navbar.dropdown_menu"
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute top-12 right-0 z-50 w-52 bg-card rounded-2xl shadow-modal border border-sand overflow-hidden"
                  >
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-gold via-amber-warm to-sienna" />
                    <div className="py-2">
                      {menuItems.map(({ icon: Icon, label, action }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={action}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-dm font-medium text-espresso hover:bg-warm-beige transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-chestnut flex-shrink-0" />
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-sand mx-4 mb-1" />
                    <p className="px-4 pb-3 text-[10px] font-dm text-chestnut/60">
                      Casting Rate v2.0 · 2026
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}

// ── Hero Trailer Carousel ────────────────────────────────────────────────────

function HeroTrailerCarousel({ trailers }: { trailers: FeaturedTrailer[] }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const startAuto = useCallback(() => {
    if (playing) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % trailers.length);
    }, 9000);
  }, [playing, trailers.length]);

  const stopAuto = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  // Track visibility of hero carousel
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.5,
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-play after 8s of no scrolling while in view
  useEffect(() => {
    if (!inView || playing) return;

    const resetTimer = () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = setTimeout(() => {
        stopAuto();
        setPlaying(true);
      }, 8000);
    };

    resetTimer();
    window.addEventListener("scroll", resetTimer, { passive: true });

    return () => {
      window.removeEventListener("scroll", resetTimer);
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [inView, playing, stopAuto]);

  // When user closes the player, clear autoplay timer so it can restart
  const handleClosePlayer = useCallback(() => {
    setPlaying(false);
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    startAuto();
  }, [startAuto]);

  const go = (dir: 1 | -1) => {
    stopAuto();
    setPlaying(false);
    setCurrent((c) => (c + dir + trailers.length) % trailers.length);
  };

  const trailer = trailers[current];

  return (
    <div
      ref={containerRef}
      data-ocid="hero.trailer.panel"
      className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl"
      style={{ aspectRatio: "16/7" }}
      onMouseEnter={stopAuto}
      onMouseLeave={() => {
        if (!playing) startAuto();
      }}
    >
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.div
            key={`player-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailer.youtubeId}?autoplay=1&rel=0`}
              title={trailer.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              type="button"
              data-ocid="hero.trailer.close_button"
              onClick={handleClosePlayer}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={`thumb-${current}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* YouTube thumbnail */}
            <img
              src={`https://img.youtube.com/vi/${trailer.youtubeId}/maxresdefault.jpg`}
              alt={trailer.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://img.youtube.com/vi/${trailer.youtubeId}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pb-12 sm:pb-6">
              <div className="flex items-center gap-2 mb-1">
                <IndustryBadge industry={trailer.industry} />
                <OttBadge platform={trailer.ottPlatform} />
                <span className="text-xs text-white/70 font-dm">
                  {trailer.year}
                </span>
              </div>
              <h3 className="font-playfair text-xl sm:text-3xl font-bold text-white leading-tight">
                {trailer.title}
              </h3>
              <p className="font-crimson text-white/75 text-sm sm:text-base mt-1 leading-snug line-clamp-1">
                {trailer.tagline}
              </p>
            </div>

            {/* Play button */}
            <button
              type="button"
              data-ocid="hero.trailer.play_button"
              onClick={() => {
                stopAuto();
                setPlaying(true);
              }}
              className="absolute inset-0 flex items-center justify-center group"
              aria-label={`Play ${trailer.title} trailer`}
            >
              <span className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center group-hover:bg-red-600/80 group-hover:border-red-400 transition-all duration-300 shadow-2xl">
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white text-white ml-1" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prev / Next arrows */}
      {!playing && (
        <>
          <button
            type="button"
            data-ocid="hero.trailer.pagination_prev"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Previous trailer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            data-ocid="hero.trailer.pagination_next"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label="Next trailer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {!playing && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {trailers.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                stopAuto();
                setCurrent(i);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-white"
                  : "w-2 h-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to trailer ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const movies = useCountUp(500, 2000, started);
  const actors = useCountUp(200, 2000, started);
  const awards = useCountUp(1000, 2200, started);
  const otts = useCountUp(15, 1200, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: movies, suffix: "+", label: "Movies" },
    { value: actors, suffix: "+", label: "Actors" },
    { value: awards, suffix: "+", label: "Awards" },
    { value: otts, suffix: "+", label: "OTT Platforms" },
  ];

  return (
    <section
      ref={ref}
      className="relative hero-gradient noise-overlay overflow-hidden py-20 sm:py-28"
    >
      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] right-[-80px] w-[400px] h-[400px] rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full bg-sienna/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-warm/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-dm font-semibold mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            India's Premier Pan India Film Database
          </div>
          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-cream leading-tight mb-4">
            Now Showing — <span className="italic text-gold">Top Trailers</span>
          </h1>
          <p className="font-crimson text-base sm:text-lg text-clay max-w-xl mx-auto mb-8 leading-relaxed">
            Watch trailers of the biggest Pan India blockbusters. Click play or
            use arrows to browse.
          </p>

          {/* Trailer Carousel */}
          <HeroTrailerCarousel trailers={featuredTrailers} />
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto"
        >
          {stats.map(({ value, suffix, label }) => (
            <div
              key={label}
              className="flex flex-col items-center p-4 sm:p-6 rounded-2xl bg-white/5 border border-gold/15 backdrop-blur-sm"
            >
              <span className="font-playfair text-3xl sm:text-4xl font-bold text-gold">
                {value}
                {suffix}
              </span>
              <span className="font-dm text-xs sm:text-sm text-clay mt-1">
                {label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Industry tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {["Bollywood", "Tamil", "Telugu", "Malayalam", "Kannada"].map(
            (ind) => (
              <span
                key={ind}
                className={`text-xs font-dm font-semibold px-3 py-1.5 rounded-full border ${industryColors[ind] ?? "bg-warm-beige text-chestnut border-sand"}`}
              >
                {ind}
              </span>
            ),
          )}
        </motion.div>
      </div>
    </section>
  );
}

// ── Actor Card ───────────────────────────────────────────────────────────────

interface ActorCardProps {
  actor: Actor;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onViewProfile: () => void;
}

function ActorCard({
  actor,
  index,
  isWishlisted,
  onToggleWishlist,
  onViewProfile,
}: ActorCardProps) {
  return (
    <motion.article
      data-ocid={`actor.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
      className="group relative bg-card rounded-2xl shimmer-border card-hover shadow-card flex flex-col"
      style={{ overflow: "visible" }}
    >
      {/* Photo */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-sand rounded-t-2xl">
        <SafeImage
          src={actor.photoUrl}
          alt={actor.name}
          fallbackLetter={actor.name[0]}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />

        {/* Wishlist toggle */}
        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? "fill-red-400 text-red-400" : "text-white"}`}
          />
        </button>

        {/* Industry badge */}
        <div className="absolute top-3 left-3">
          <IndustryBadge industry={actor.industry} />
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
          <Star className="w-3 h-3 fill-gold text-gold" />
          <span className="text-xs font-dm text-white font-semibold">
            {actor.rating}
          </span>
          {actor.reviewCount !== undefined && (
            <span className="text-[10px] font-dm text-white/70">
              {formatReviewCount(actor.reviewCount)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-playfair text-lg font-bold text-foreground leading-tight">
            {actor.name}
          </h3>
          <p className="text-xs font-dm text-sienna font-medium mt-0.5">
            {actor.nickname}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mt-1">
          {actor.genre.split(", ").map((g) => (
            <span
              key={g}
              className="text-[11px] font-dm px-2 py-0.5 rounded-full bg-warm-beige text-espresso border border-sand"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-auto pt-2">
          <Award className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-dm text-chestnut font-medium">
            {actor.awards} Awards
          </span>
        </div>

        <Button
          data-ocid={`actor.view_button.${index}`}
          onClick={onViewProfile}
          className="mt-2 w-full bg-chestnut hover:bg-espresso text-cream font-dm font-semibold text-sm rounded-xl transition-colors"
        >
          View Profile
        </Button>
      </div>
    </motion.article>
  );
}

// ── Movie Card ───────────────────────────────────────────────────────────────

interface MovieCardProps {
  movie: Movie;
  index: number;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onViewDetails: () => void;
}

function MovieCard({
  movie,
  index,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
}: MovieCardProps) {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setShowTrailer(true);
    }, 7000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowTrailer(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <motion.article
      data-ocid={`movie.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
      className="group relative bg-card rounded-2xl shimmer-border card-hover shadow-card flex flex-col"
      style={{ overflow: "visible" }}
    >
      {/* Poster / Trailer area */}
      <div
        className="relative h-72 sm:h-80 overflow-hidden bg-sand rounded-t-2xl"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showTrailer ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${movie.trailerYoutubeId}?autoplay=1&mute=1&rel=0&loop=1&playlist=${movie.trailerYoutubeId}`}
              title={`${movie.title} Trailer`}
              allow="autoplay; encrypted-media"
              className="absolute inset-0 w-full h-full"
              style={{ border: "none" }}
            />
            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-dm font-bold backdrop-blur-sm pointer-events-none">
              <Play className="w-3 h-3 fill-white" /> Trailer
            </div>
          </>
        ) : (
          <>
            <SafeImage
              src={movie.posterUrl}
              alt={movie.title}
              fallbackLetter={movie.title[0]}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent" />

            {/* Wishlist */}
            <button
              type="button"
              onClick={onToggleWishlist}
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
            >
              <Bookmark
                className={`w-4 h-4 ${isWishlisted ? "fill-gold text-gold" : "text-white"}`}
              />
            </button>

            {/* Industry badge */}
            <div className="absolute top-3 left-3">
              <IndustryBadge industry={movie.industry} />
            </div>

            {/* Year badge */}
            <div className="absolute bottom-10 left-3 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-xs text-white font-dm font-semibold">
              {movie.year}
            </div>

            {/* Rating */}
            <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-gold text-gold" />
              <span className="text-xs font-dm text-white font-semibold">
                {movie.rating}
              </span>
              {movie.reviewCount !== undefined && (
                <span className="text-[10px] font-dm text-white/70">
                  {formatReviewCount(movie.reviewCount)}
                </span>
              )}
            </div>

            {/* Hover hint */}
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <span className="text-[9px] font-dm text-white/60 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                Hold 7s for trailer
              </span>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-playfair text-lg font-bold text-foreground leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <OttBadge platform={movie.ottPlatform} />
            <BoxOfficeBadge status={movie.boxOfficeStatus as BoxOfficeStatus} />
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genre.split(", ").map((g) => (
            <span
              key={g}
              className="text-[11px] font-dm px-2 py-0.5 rounded-full bg-warm-beige text-espresso border border-sand"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-auto pt-1">
          <Clock className="w-3.5 h-3.5 text-chestnut" />
          <span className="text-xs font-dm text-chestnut font-medium">
            {movie.runtime}
          </span>
        </div>

        <Button
          data-ocid={`movie.view_button.${index}`}
          onClick={onViewDetails}
          className="mt-2 w-full bg-chestnut hover:bg-espresso text-cream font-dm font-semibold text-sm rounded-xl transition-colors"
        >
          View Details
        </Button>
      </div>
    </motion.article>
  );
}

// ── Follow Button helpers ─────────────────────────────────────────────────────

function formatFollowers(id: number): string {
  const counts = [
    2.1, 4.8, 9.3, 15.7, 23.4, 31.2, 8.6, 12.1, 5.3, 18.9, 7.4, 22.1, 3.8, 11.5,
    6.2,
  ];
  const val = counts[id % counts.length];
  return `${val}M`;
}

function formatFollowing(id: number): string {
  const counts = [
    142, 87, 203, 56, 318, 94, 175, 231, 68, 412, 127, 89, 264, 73, 156,
  ];
  return `${counts[id % counts.length]}`;
}

function FollowButton({ actorId: _actorId }: { actorId: number }) {
  const [followed, setFollowed] = useState(false);
  return (
    <button
      type="button"
      data-ocid="actor.follow_button"
      onClick={() => setFollowed((f) => !f)}
      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-dm font-semibold transition-all ${
        followed
          ? "bg-chestnut text-cream border border-chestnut"
          : "bg-transparent text-chestnut border border-chestnut hover:bg-chestnut/10"
      }`}
    >
      {followed ? "Following ✓" : "+ Follow"}
    </button>
  );
}

// ── Actor Modal ───────────────────────────────────────────────────────────────

function ActorModal({
  actor,
  onClose,
}: {
  actor: Actor | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (actor) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [actor]);

  return (
    <AnimatePresence>
      {actor && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            data-ocid="actor.modal"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 bg-card rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide border border-sand"
          >
            {/* Close */}
            <button
              type="button"
              data-ocid="actor.modal.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-warm-beige hover:bg-sand text-chestnut transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header image */}
            <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-3xl bg-sand">
              <SafeImage
                src={actor.photoUrl}
                alt={actor.name}
                fallbackLetter={actor.name[0]}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
              <div className="absolute bottom-4 left-6 right-14">
                <div className="mb-1">
                  <IndustryBadge industry={actor.industry} />
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-cream">
                  {actor.name}
                </h2>
                <p className="text-gold font-crimson italic text-lg mt-0.5">
                  {actor.nickname}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Rating & Awards */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={actor.rating}
                    reviewCount={actor.reviewCount}
                  />
                </div>
                <div className="flex items-center gap-1.5 text-sm font-dm text-chestnut">
                  <Award className="w-4 h-4 text-gold" />
                  {actor.awards} Awards Won
                </div>
              </div>

              {/* Genre */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {actor.genre.split(", ").map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="font-dm text-xs bg-warm-beige text-espresso border-sand"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Biography
                </p>
                <p className="font-crimson text-base text-foreground leading-relaxed">
                  {actor.bio}
                </p>
              </div>

              {/* Upcoming Projects */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Upcoming Projects
                </p>
                <ul className="space-y-1.5">
                  {actor.upcomingProjects.map((project) => (
                    <li
                      key={project}
                      className="flex items-center gap-2 text-sm font-dm text-foreground"
                    >
                      <Film className="w-3.5 h-3.5 text-sienna flex-shrink-0" />
                      {project}
                    </li>
                  ))}
                </ul>
              </div>

              {/* User Rating */}
              <UserRatingWidget entityId={`actor-${actor.id}`} />

              {/* Follow Stats & Button */}
              <div className="rounded-2xl bg-warm-beige border border-sand p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider">
                    Fan Community
                  </p>
                  <FollowButton actorId={actor.id} />
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="font-playfair text-xl font-bold text-foreground">
                      {formatFollowers(actor.id)}
                    </p>
                    <p className="font-dm text-xs text-chestnut mt-0.5">
                      Followers
                    </p>
                  </div>
                  <div className="w-px bg-sand self-stretch" />
                  <div className="text-center">
                    <p className="font-playfair text-xl font-bold text-foreground">
                      {formatFollowing(actor.id)}
                    </p>
                    <p className="font-dm text-xs text-chestnut mt-0.5">
                      Following
                    </p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-3">
                  Social Links
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-dm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Instagram
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-dm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter/X
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-dm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Youtube className="w-3.5 h-3.5" /> YouTube
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Movie Modal ───────────────────────────────────────────────────────────────

function MovieModal({
  movie,
  onClose,
}: {
  movie: Movie | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (movie) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [movie]);

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            data-ocid="movie.modal"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 bg-card rounded-3xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide border border-sand"
          >
            {/* Close */}
            <button
              type="button"
              data-ocid="movie.modal.close_button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-warm-beige hover:bg-sand text-chestnut transition-colors z-20"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Poster header */}
            <div className="relative h-56 sm:h-72 overflow-hidden rounded-t-3xl bg-sand flex">
              <SafeImage
                src={movie.posterUrl}
                alt={movie.title}
                fallbackLetter={movie.title[0]}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent" />
              <div className="absolute bottom-4 left-6 right-12">
                <div className="mb-1 flex gap-2 flex-wrap">
                  <IndustryBadge industry={movie.industry} />
                </div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-cream">
                  {movie.title}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <OttBadge platform={movie.ottPlatform} />
                  <BoxOfficeBadge
                    status={movie.boxOfficeStatus as BoxOfficeStatus}
                  />
                  <span className="text-clay text-sm font-dm">
                    {movie.year}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Meta row */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-sm font-dm text-foreground">
                  <User className="w-4 h-4 text-sienna" />
                  <span className="text-chestnut">Director:</span>
                  <span className="font-semibold">{movie.director}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-dm text-foreground">
                  <Clock className="w-4 h-4 text-sienna" />
                  {movie.runtime}
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-sm font-dm font-semibold text-foreground">
                    {movie.rating}
                  </span>
                  {movie.reviewCount !== undefined && (
                    <span className="text-xs font-dm text-chestnut ml-1">
                      {formatReviewCount(movie.reviewCount)}
                    </span>
                  )}
                </div>
              </div>

              {/* Genre */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.split(", ").map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="font-dm text-xs bg-warm-beige text-espresso border-sand"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cast */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Cast
                </p>
                <p className="font-dm text-sm text-foreground">
                  {movie.cast.join(", ")}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Synopsis
                </p>
                <p className="font-crimson text-base text-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {/* Songs */}
              <div>
                <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-2">
                  Songs
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {movie.songs.map((song) => (
                    <li
                      key={song}
                      className="flex items-center gap-2 text-sm font-dm text-foreground"
                    >
                      <Music className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                      {song}
                    </li>
                  ))}
                </ul>
              </div>

              {/* YouTube Trailer */}
              <YoutubeTrailer youtubeId={movie.trailerYoutubeId} />

              {/* User Rating */}
              <UserRatingWidget entityId={`movie-${movie.id}`} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Sign In Modal ─────────────────────────────────────────────────────────────

function SignInModal({
  open,
  onClose,
}: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            data-ocid="signin.modal"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 bg-card rounded-3xl shadow-modal w-full max-w-md border border-sand overflow-hidden"
          >
            {/* Decorative top */}
            <div className="h-2 bg-gradient-to-r from-gold via-amber-warm to-sienna" />

            <div className="p-8">
              <button
                type="button"
                data-ocid="signin.modal.close_button"
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-warm-beige hover:bg-sand text-chestnut transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-8">
                <div className="flex items-center justify-center mx-auto mb-4">
                  <img
                    src="/assets/generated/casting-rate-logo.dim_400x200.png"
                    alt="Casting Rate"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <h2 className="font-playfair text-2xl font-bold text-foreground">
                  Welcome Back
                </h2>
                <p className="text-sm font-dm text-chestnut mt-1">
                  Sign in to Casting Rate
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-7 h-7 fill-green-500 text-green-500" />
                  </div>
                  <p className="font-dm font-semibold text-foreground">
                    Signed in successfully!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="signin-email"
                      className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider block mb-1.5"
                    >
                      Email
                    </label>
                    <Input
                      id="signin-email"
                      data-ocid="signin.input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="font-dm bg-warm-beige border-sand focus:ring-gold/50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signin-password"
                      className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider block mb-1.5"
                    >
                      Password
                    </label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="font-dm bg-warm-beige border-sand focus:ring-gold/50"
                    />
                  </div>
                  <Button
                    data-ocid="signin.submit_button"
                    type="submit"
                    className="w-full bg-chestnut hover:bg-espresso text-cream font-dm font-semibold py-3 rounded-xl"
                  >
                    Sign In
                  </Button>
                  <p className="text-center text-sm font-dm text-chestnut">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-chestnut font-semibold hover:text-espresso transition-colors"
                    >
                      Sign Up
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Wishlist Panel ────────────────────────────────────────────────────────────

interface WishlistPanelProps {
  open: boolean;
  onClose: () => void;
  wishlistedActors: number[];
  wishlistedMovies: number[];
  onRemoveActor: (id: number) => void;
  onRemoveMovie: (id: number) => void;
}

function WishlistPanel({
  open,
  onClose,
  wishlistedActors,
  wishlistedMovies,
  onRemoveActor,
  onRemoveMovie,
}: WishlistPanelProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const actors = actorsData.filter((a) => wishlistedActors.includes(a.id));
  const movies = moviesData.filter((m) => wishlistedMovies.includes(m.id));
  const isEmpty = actors.length === 0 && movies.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-espresso/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            data-ocid="wishlist.panel"
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="relative z-10 w-full max-w-md bg-card h-full flex flex-col border-l border-sand shadow-modal overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-sand bg-warm-beige">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-red-400 text-red-400" />
                <h2 className="font-playfair text-xl font-bold text-foreground">
                  Wishlist
                </h2>
                <span className="text-sm font-dm text-chestnut">
                  ({actors.length + movies.length})
                </span>
              </div>
              <button
                type="button"
                data-ocid="wishlist.close_button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-sand transition-colors text-chestnut"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6">
              {isEmpty && (
                <div
                  data-ocid="wishlist.empty_state"
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <Heart className="w-12 h-12 text-sand mb-3" />
                  <p className="font-dm text-chestnut text-sm">
                    Your wishlist is empty.
                  </p>
                  <p className="font-dm text-chestnut/70 text-xs mt-1">
                    Tap the heart icon on any actor or movie card.
                  </p>
                </div>
              )}

              {actors.length > 0 && (
                <div>
                  <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-3">
                    Actors
                  </p>
                  <div className="space-y-3">
                    {actors.map((actor) => (
                      <div
                        key={actor.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-warm-beige border border-sand"
                      >
                        <SafeImage
                          src={actor.photoUrl}
                          alt={actor.name}
                          fallbackLetter={actor.name[0]}
                          className="w-12 h-12 rounded-full object-cover object-top flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-dm text-sm font-semibold text-foreground truncate">
                            {actor.name}
                          </p>
                          <p className="font-dm text-xs text-sienna truncate">
                            {actor.nickname}
                          </p>
                          <IndustryBadge industry={actor.industry} />
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveActor(actor.id)}
                          className="p-1.5 rounded-full hover:bg-sand transition-colors text-clay flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {movies.length > 0 && (
                <div>
                  <p className="text-xs font-dm font-semibold text-chestnut uppercase tracking-wider mb-3">
                    Movies
                  </p>
                  <div className="space-y-3">
                    {movies.map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-warm-beige border border-sand"
                      >
                        <SafeImage
                          src={movie.posterUrl}
                          alt={movie.title}
                          fallbackLetter={movie.title[0]}
                          className="w-12 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-dm text-sm font-semibold text-foreground truncate">
                            {movie.title}
                          </p>
                          <p className="font-dm text-xs text-chestnut">
                            {movie.year}
                          </p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            <OttBadge platform={movie.ottPlatform} />
                            <IndustryBadge industry={movie.industry} />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveMovie(movie.id)}
                          className="p-1.5 rounded-full hover:bg-sand transition-colors text-clay flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Recently Visited Section ──────────────────────────────────────────────────

type VisitedItem =
  | { kind: "actor"; data: Actor }
  | { kind: "movie"; data: Movie };

interface RecentlyVisitedProps {
  items: VisitedItem[];
  onSelectActor: (a: Actor) => void;
  onSelectMovie: (m: Movie) => void;
}

function RecentlyVisited({
  items,
  onSelectActor,
  onSelectMovie,
}: RecentlyVisitedProps) {
  return (
    <section
      data-ocid="recently.visited.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <Eye className="w-5 h-5 text-sienna" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Recently <span className="text-sienna">Visited</span>
        </h2>
      </motion.div>

      {items.length === 0 ? (
        <div
          data-ocid="recently.visited.empty_state"
          className="flex flex-col items-center justify-center py-10 rounded-2xl bg-warm-beige border border-sand text-center"
        >
          <Eye className="w-10 h-10 text-sand mb-3" />
          <p className="font-dm text-sm text-chestnut">No items added</p>
          <p className="font-dm text-xs text-chestnut/70 mt-1">
            Browse actors and movies to see them here.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {items.map((item, idx) => {
            if (item.kind === "actor") {
              const actor = item.data;
              return (
                <motion.button
                  key={`actor-${actor.id}-${idx}`}
                  type="button"
                  data-ocid={`recently.visited.item.${idx + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => onSelectActor(actor)}
                  className="flex-shrink-0 w-36 text-left group hover:scale-105 transition-transform duration-300"
                  style={{ willChange: "transform" }}
                >
                  <div className="relative h-44 rounded-xl overflow-hidden bg-sand mb-2">
                    <SafeImage
                      src={actor.photoUrl}
                      alt={actor.name}
                      fallbackLetter={actor.name[0]}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <IndustryBadge industry={actor.industry} />
                    </div>
                  </div>
                  <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                    {actor.name}
                  </p>
                  <p className="font-dm text-[10px] text-sienna truncate mt-0.5">
                    {actor.nickname}
                  </p>
                </motion.button>
              );
            }
            const movie = item.data;
            return (
              <motion.button
                key={`movie-${movie.id}-${idx}`}
                type="button"
                data-ocid={`recently.visited.item.${idx + 1}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => onSelectMovie(movie)}
                className="flex-shrink-0 w-36 text-left group hover:scale-105 transition-transform duration-300"
                style={{ willChange: "transform" }}
              >
                <div className="relative h-44 rounded-xl overflow-hidden bg-sand mb-2">
                  <SafeImage
                    src={movie.posterUrl}
                    alt={movie.title}
                    fallbackLetter={movie.title[0]}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <BoxOfficeBadge
                      status={movie.boxOfficeStatus as BoxOfficeStatus}
                    />
                  </div>
                </div>
                <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                  {movie.title}
                </p>
                <p className="font-dm text-[10px] text-chestnut mt-0.5">
                  {movie.year}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer className="bg-espresso text-cream mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/assets/generated/casting-rate-logo.dim_400x200.png"
                alt="Casting Rate"
                className="h-10 w-auto object-contain brightness-90"
              />
            </div>
            <p className="font-crimson text-clay text-sm leading-relaxed">
              Celebrating the magic of Pan India cinema — one star, one story at
              a time. Bollywood · Tamil · Telugu · Malayalam · Kannada
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-dm text-xs font-semibold text-clay uppercase tracking-wider mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {["Home", "Actors", "Movies", "Wishlist"].map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    className="font-dm text-sm text-clay hover:text-gold transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="font-dm text-xs font-semibold text-clay uppercase tracking-wider mb-4">
              Follow Us
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: "Instagram" },
                { Icon: Twitter, label: "Twitter" },
                { Icon: Youtube, label: "YouTube" },
                { Icon: Facebook, label: "Facebook" },
              ].map(({ Icon, label }) => (
                <button
                  type="button"
                  key={label}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-clay/20 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-clay/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-dm text-xs text-clay/70">
            © {year} Casting Rate | Powered by{" "}
            <span className="text-gold font-semibold">kartavya co.</span>
          </p>
          <p className="font-dm text-xs text-clay/50">
            Built with{" "}
            <a
              href={caffeineUrl}
              className="text-gold/70 hover:text-gold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Industry Filter Pills (mobile) ────────────────────────────────────────────

function IndustryFilterPills({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  const industries = [
    "all",
    "Bollywood",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {industries.map((ind) => (
        <button
          key={ind}
          type="button"
          data-ocid="industry.filter.tab"
          onClick={() => onChange(ind)}
          className={`text-xs font-dm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            selected === ind
              ? "bg-chestnut text-cream border-chestnut"
              : "bg-warm-beige text-chestnut border-sand hover:bg-sand"
          }`}
        >
          {ind === "all" ? "All Industries" : ind}
        </button>
      ))}
    </div>
  );
}

// ── Genre Filter Pills ────────────────────────────────────────────────────────

function extractAllGenres(): string[] {
  const genreSet = new Set<string>();
  for (const item of [...actorsData, ...moviesData]) {
    for (const g of item.genre.split(", ")) {
      const trimmed = g.trim();
      if (trimmed) genreSet.add(trimmed);
    }
  }
  return Array.from(genreSet).sort();
}

const ALL_GENRES = extractAllGenres();

function GenreFilterPills({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        key="all"
        type="button"
        data-ocid="genre.filter.tab"
        onClick={() => onChange("all")}
        className={`text-xs font-dm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
          selected === "all"
            ? "bg-sienna text-cream border-sienna"
            : "bg-warm-beige text-sienna border-sand hover:bg-sand"
        }`}
      >
        All Genres
      </button>
      {ALL_GENRES.map((genre) => (
        <button
          key={genre}
          type="button"
          data-ocid="genre.filter.tab"
          onClick={() => onChange(genre)}
          className={`text-xs font-dm font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            selected === genre
              ? "bg-sienna text-cream border-sienna"
              : "bg-warm-beige text-sienna border-sand hover:bg-sand"
          }`}
        >
          {genre}
        </button>
      ))}
    </div>
  );
}

// ── Birthday Today Section ────────────────────────────────────────────────────

function BirthdayTodaySection({
  onSelectActor,
}: {
  onSelectActor: (a: Actor) => void;
}) {
  const today = new Date();
  const todayMonth = today.getMonth() + 1; // 1-12
  const todayDay = today.getDate();

  const birthdayStars = actorsData.filter((actor) => {
    const [, monthStr, dayStr] = actor.birthDate.split("-");
    return (
      Number.parseInt(monthStr, 10) === todayMonth &&
      Number.parseInt(dayStr, 10) === todayDay
    );
  });

  const currentYear = today.getFullYear();

  return (
    <section
      data-ocid="birthday.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <Cake className="w-5 h-5 text-gold" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Birthday <span className="text-gold">Today</span>{" "}
          <span className="text-xl">🎂</span>
        </h2>
        {birthdayStars.length > 0 && (
          <span className="text-xs font-dm text-chestnut bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
            {birthdayStars.length} star{birthdayStars.length > 1 ? "s" : ""}
          </span>
        )}
      </motion.div>

      {birthdayStars.length === 0 ? (
        <div
          data-ocid="birthday.empty_state"
          className="flex flex-col items-center justify-center py-10 rounded-2xl bg-warm-beige border border-sand text-center"
        >
          <Cake className="w-10 h-10 text-sand mb-3" />
          <p className="font-dm text-sm text-chestnut">No items added</p>
          <p className="font-dm text-xs text-chestnut/70 mt-1">
            No stars have birthdays today — check back tomorrow!
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {birthdayStars.map((actor, idx) => {
            const birthYear = Number.parseInt(
              actor.birthDate.split("-")[0],
              10,
            );
            const deathYear = actor.deathDate
              ? Number.parseInt(actor.deathDate.split("-")[0], 10)
              : null;
            const age = deathYear
              ? deathYear - birthYear
              : currentYear - birthYear;
            const isDeceased = !!actor.deathDate;

            return (
              <motion.button
                key={actor.id}
                type="button"
                data-ocid={`birthday.item.${idx + 1}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07 }}
                onClick={() => onSelectActor(actor)}
                className="flex-shrink-0 w-40 text-left group"
              >
                {/* Photo */}
                <div className="relative h-48 rounded-xl overflow-hidden bg-sand mb-2 ring-2 ring-gold/40 group-hover:ring-gold transition-all duration-300">
                  <SafeImage
                    src={actor.photoUrl}
                    alt={actor.name}
                    fallbackLetter={actor.name[0]}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />

                  {/* Birthday candles overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-gold/90 text-espresso rounded-full px-2 py-0.5 text-[10px] font-dm font-bold shadow">
                    🎂 {age}
                  </div>

                  {/* Industry badge */}
                  <div className="absolute bottom-2 left-2">
                    <IndustryBadge industry={actor.industry} />
                  </div>

                  {/* In Memoriam overlay */}
                  {isDeceased && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] font-dm font-bold px-1.5 py-0.5 rounded-full bg-gray-800/80 text-gray-200">
                        In Memoriam
                      </span>
                    </div>
                  )}
                </div>

                {/* Name & info */}
                <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                  {actor.name}
                </p>
                <p className="font-dm text-[10px] text-sienna truncate mt-0.5">
                  {actor.nickname}
                </p>
                {isDeceased ? (
                  <p className="font-dm text-[10px] text-chestnut mt-0.5">
                    {birthYear} – {deathYear}
                  </p>
                ) : (
                  <p className="font-dm text-[10px] text-gold font-semibold mt-0.5">
                    Turns {age} today! 🎉
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── Top Rated Section ─────────────────────────────────────────────────────────

interface TopRatedSectionProps {
  setSelectedActor: (actor: Actor) => void;
  setSelectedMovie: (movie: Movie) => void;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <Medal className="w-4 h-4 flex-shrink-0 text-yellow-500 fill-yellow-400" />
    );
  if (rank === 2)
    return (
      <Medal className="w-4 h-4 flex-shrink-0 text-slate-400 fill-slate-300" />
    );
  if (rank === 3)
    return (
      <Medal className="w-4 h-4 flex-shrink-0 text-amber-700 fill-amber-600" />
    );
  return (
    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[11px] font-dm font-bold text-chestnut">
      {rank}
    </span>
  );
}

function TopRatedSection({
  setSelectedActor,
  setSelectedMovie,
}: TopRatedSectionProps) {
  const topActors = [...actorsData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
  const topMovies = [...moviesData]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <section
      data-ocid="toprated.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 flex items-center gap-3"
      >
        <Trophy className="w-6 h-6 text-gold" />
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
          Top <span className="text-gold">Rated</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Actors Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl overflow-hidden border border-sand shadow-card"
        >
          <div className="bg-espresso px-5 py-3">
            <p className="font-dm text-xs font-bold uppercase tracking-widest text-gold">
              🎭 Top Actors
            </p>
          </div>
          <div className="p-3 divide-y divide-sand/50">
            {topActors.map((actor, i) => (
              <button
                key={actor.id}
                type="button"
                data-ocid={`toprated.actor.item.${i + 1}`}
                onClick={() => setSelectedActor(actor)}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-warm-beige transition-colors text-left group"
              >
                <RankIcon rank={i + 1} />
                <SafeImage
                  src={actor.photoUrl}
                  alt={actor.name}
                  fallbackLetter={actor.name[0]}
                  className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0 ring-2 ring-sand group-hover:ring-gold/40 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-sm font-semibold text-foreground truncate leading-tight">
                    {actor.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <IndustryBadge industry={actor.industry} />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span className="text-xs font-dm font-semibold text-foreground">
                    {actor.rating}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Movies Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card rounded-2xl overflow-hidden border border-sand shadow-card"
        >
          <div className="bg-espresso px-5 py-3">
            <p className="font-dm text-xs font-bold uppercase tracking-widest text-gold">
              🎬 Top Films
            </p>
          </div>
          <div className="p-3 divide-y divide-sand/50">
            {topMovies.map((movie, i) => (
              <button
                key={movie.id}
                type="button"
                data-ocid={`toprated.movie.item.${i + 1}`}
                onClick={() => setSelectedMovie(movie)}
                className="w-full flex items-center gap-3 py-3 px-2 rounded-xl hover:bg-warm-beige transition-colors text-left group"
              >
                <RankIcon rank={i + 1} />
                <SafeImage
                  src={movie.posterUrl}
                  alt={movie.title}
                  fallbackLetter={movie.title[0]}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 ring-2 ring-sand group-hover:ring-gold/40 transition-all"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-dm text-sm font-semibold text-foreground truncate leading-tight">
                    {movie.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <IndustryBadge industry={movie.industry} />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                  <span className="text-xs font-dm font-semibold text-foreground">
                    {movie.rating}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Back To Top Button ────────────────────────────────────────────────────────

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          data-ocid="backtotop.button"
          onClick={handleClick}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-chestnut hover:bg-espresso text-cream shadow-lg flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ── Releasing Soon Section ────────────────────────────────────────────────────

function ReleasingSoonSection() {
  const today = new Date();

  const sorted = [...upcomingMovies].sort(
    (a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime(),
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysUntil = (dateStr: string) => {
    const ms = new Date(dateStr).getTime() - today.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    if (days < 0) return "Released";
    if (days === 0) return "Today!";
    if (days === 1) return "Tomorrow";
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.ceil(days / 7)}w away`;
    if (days < 365) return `${Math.ceil(days / 30)}mo away`;
    return `${Math.ceil(days / 365)}yr away`;
  };

  return (
    <section
      data-ocid="releasing.soon.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <CalendarClock className="w-5 h-5 text-gold" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Releasing <span className="text-gold">Soon</span>
        </h2>
        <span className="text-xs font-dm text-chestnut bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
          {sorted.length} upcoming
        </span>
      </motion.div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {sorted.map((film, idx) => (
          <motion.div
            key={film.id}
            data-ocid={`releasing.soon.item.${idx + 1}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            className="flex-shrink-0 w-48 rounded-2xl overflow-hidden border border-sand shadow-card bg-card group"
          >
            {/* Poster area */}
            <div
              className={`relative h-56 bg-gradient-to-br ${film.posterGradient} flex items-end p-3`}
            >
              <div className="absolute top-3 left-3">
                <IndustryBadge industry={film.industry} />
              </div>

              {/* Countdown chip */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-dm font-bold px-2 py-1 rounded-full">
                {daysUntil(film.releaseDate)}
              </div>

              {/* Film icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Film className="w-20 h-20 text-white" />
              </div>

              <div className="relative z-10">
                <p className="font-playfair text-white font-bold text-base leading-tight">
                  {film.title}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {film.genre.split(", ").map((g) => (
                    <span
                      key={g}
                      className="text-[9px] font-dm px-1.5 py-0.5 rounded bg-white/20 text-white/90"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-dm text-chestnut">
                <CalendarClock className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                {formatDate(film.releaseDate)}
              </div>
              <p className="text-xs font-dm text-foreground truncate">
                <span className="text-chestnut">Dir:</span> {film.director}
              </p>
              <p className="text-xs font-dm text-chestnut truncate">
                {film.cast.slice(0, 2).join(", ")}
                {film.cast.length > 2 ? ` +${film.cast.length - 2}` : ""}
              </p>
              <Button
                data-ocid={`releasing.soon.notify_button.${idx + 1}`}
                size="sm"
                className="w-full bg-warm-beige hover:bg-sand border border-sand text-chestnut font-dm font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                Notify Me
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Casting Rate Originals Podcast Section ────────────────────────────────────

function PodcastSection({ episodes }: { episodes: PodcastEpisode[] }) {
  const [playingId, setPlayingId] = useState<number | null>(null);

  return (
    <section
      data-ocid="podcast.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-6 flex items-center gap-3 flex-wrap"
      >
        <Mic className="w-6 h-6 text-sienna" />
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-foreground">
          Casting Rate <span className="text-sienna">Originals</span>
        </h2>
        <span className="text-xs font-dm font-semibold text-sienna bg-sienna/10 border border-sienna/20 px-3 py-1 rounded-full">
          PODCAST
        </span>
      </motion.div>

      <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
        {episodes.map((ep, idx) => (
          <motion.div
            key={ep.id}
            data-ocid={`podcast.item.${idx + 1}`}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.07 }}
            className="flex-shrink-0 w-64 rounded-2xl overflow-hidden border border-sand shadow-card bg-card"
          >
            {/* Thumbnail */}
            <div
              className="relative h-36 flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${ep.gradientFrom}, ${ep.gradientTo})`,
              }}
            >
              {playingId === ep.id ? (
                <div className="absolute inset-0">
                  <iframe
                    src={`https://www.youtube.com/embed/${ep.youtubeId}?autoplay=1&rel=0`}
                    title={ep.title}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Mic className="w-24 h-24 text-white" />
                  </div>
                  <div className="relative z-10 text-center px-4">
                    <p className="text-white/60 font-dm text-xs font-semibold uppercase tracking-widest mb-1">
                      Episode {ep.episodeNumber}
                    </p>
                    <p className="text-white font-playfair font-bold text-sm leading-snug line-clamp-2">
                      {ep.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`podcast.play_button.${idx + 1}`}
                    onClick={() => setPlayingId(ep.id)}
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 border border-white/30 flex items-center justify-center transition-all"
                    aria-label={`Play episode ${ep.episodeNumber}`}
                  >
                    <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                  </button>
                </>
              )}
            </div>

            {/* Episode info */}
            <div className="p-4 space-y-2">
              {playingId === ep.id && (
                <button
                  type="button"
                  data-ocid={`podcast.close_button.${idx + 1}`}
                  onClick={() => setPlayingId(null)}
                  className="w-full flex items-center justify-center gap-1.5 py-1 text-xs font-dm text-chestnut hover:text-espresso transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Stop
                </button>
              )}
              <p className="font-dm text-sm font-semibold text-foreground leading-snug line-clamp-2">
                {ep.title}
              </p>
              <p className="font-dm text-xs text-chestnut line-clamp-2 leading-snug">
                {ep.description}
              </p>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-xs font-dm text-chestnut">
                  <Clock className="w-3 h-3" />
                  {ep.duration}
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {ep.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] font-dm px-1.5 py-0.5 rounded-full bg-sienna/10 text-sienna border border-sienna/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-[10px] font-dm text-chestnut">
                {"Host: "}
                <span className="text-foreground font-semibold">{ep.host}</span>
              </p>
              {ep.guest && (
                <p className="text-[10px] font-dm text-chestnut">
                  {"Feat: "}
                  <span className="text-sienna font-semibold">{ep.guest}</span>
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ── Trending in India Section ─────────────────────────────────────────────────

const trendingInIndiaTitles = [
  "Stree 2",
  "Kalki 2898 AD",
  "Amaran",
  "Pushpa: The Rule",
  "Singham Again",
  "The GOAT",
  "Lucky Baskhar",
  "Devara",
  "Fighter",
  "KGF Chapter 2",
];

interface TrendingInIndiaSectionProps {
  onViewDetails: (movie: Movie) => void;
}

function TrendingInIndiaSection({
  onViewDetails,
}: TrendingInIndiaSectionProps) {
  // Pick trending movies by title match, fill remaining from highest-rated
  const trendingByTitle = trendingInIndiaTitles
    .map((t) => moviesData.find((m) => m.title === t))
    .filter(Boolean) as Movie[];

  const remainingIds = new Set(trendingByTitle.map((m) => m.id));
  const fillerMovies = [...moviesData]
    .filter((m) => !remainingIds.has(m.id))
    .sort((a, b) => b.rating - a.rating);

  const trending = [...trendingByTitle, ...fillerMovies].slice(0, 10);

  return (
    <section
      data-ocid="trending.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <TrendingUp className="w-5 h-5 text-sienna" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Trending <span className="text-sienna">in India</span>
        </h2>
        <span className="text-xs font-dm font-semibold text-sienna bg-sienna/10 border border-sienna/20 px-2 py-0.5 rounded-full">
          Now
        </span>
      </motion.div>

      {trending.length === 0 ? (
        <div
          data-ocid="trending.empty_state"
          className="flex flex-col items-center justify-center py-10 rounded-2xl bg-warm-beige border border-sand text-center"
        >
          <Film className="w-10 h-10 text-sand mb-3" />
          <p className="font-dm text-sm text-chestnut">No items added</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3 scrollbar-hide flex gap-4">
          {trending.map((movie, idx) => (
            <motion.button
              key={movie.id}
              type="button"
              data-ocid={`trending.item.${idx + 1}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewDetails(movie)}
              className="flex-shrink-0 w-44 text-left group relative"
            >
              {/* Rank badge */}
              <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-full bg-espresso/90 backdrop-blur-sm flex items-center justify-center">
                <span
                  className={`font-dm font-bold text-xs ${idx < 3 ? "text-gold" : "text-clay"}`}
                >
                  {idx + 1}
                </span>
              </div>

              {/* Trending fire badge for top 3 */}
              {idx < 3 && (
                <div className="absolute top-2 left-11 z-10">
                  <span className="text-base">🔥</span>
                </div>
              )}

              {/* Poster */}
              <div className="relative h-60 rounded-xl overflow-hidden bg-sand mb-2">
                <SafeImage
                  src={movie.posterUrl}
                  alt={movie.title}
                  fallbackLetter={movie.title[0]}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
                {/* Badges */}
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
                  <IndustryBadge industry={movie.industry} />
                  <OttBadge platform={movie.ottPlatform} />
                </div>
                <div className="absolute top-2 right-2">
                  <BoxOfficeBadge
                    status={movie.boxOfficeStatus as BoxOfficeStatus}
                  />
                </div>
              </div>

              <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                {movie.title}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-gold text-gold" />
                <span className="font-dm text-[10px] text-gold font-semibold">
                  {movie.rating}
                </span>
                <span className="font-dm text-[10px] text-chestnut ml-1">
                  {movie.year}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Top 10 Shows Section ──────────────────────────────────────────────────────

function Top10ShowsSection() {
  const top10 = [...showsData].sort((a, b) => b.rating - a.rating).slice(0, 10);

  return (
    <section
      data-ocid="top10shows.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <Tv className="w-5 h-5 text-sienna" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Top 10 <span className="text-sienna">Shows</span>
        </h2>
        <span className="text-xs font-dm font-semibold text-sienna bg-sienna/10 border border-sienna/20 px-2 py-0.5 rounded-full">
          OTT
        </span>
      </motion.div>

      {top10.length === 0 ? (
        <div
          data-ocid="top10shows.empty_state"
          className="flex flex-col items-center justify-center py-10 rounded-2xl bg-warm-beige border border-sand text-center"
        >
          <Tv className="w-10 h-10 text-sand mb-3" />
          <p className="font-dm text-sm text-chestnut">No items added</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3 scrollbar-hide flex gap-4">
          {top10.map((show, idx) => (
            <motion.div
              key={show.id}
              data-ocid={`top10shows.item.${idx + 1}`}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="flex-shrink-0 w-52 rounded-2xl overflow-hidden border border-sand shadow-card bg-card group"
            >
              {/* Gradient poster */}
              <div
                className={`relative h-36 bg-gradient-to-br ${show.posterGradient} flex items-end p-3`}
              >
                {/* Rank badge */}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span
                    className={`font-dm font-bold text-xs ${idx < 3 ? "text-gold" : "text-white/70"}`}
                  >
                    {idx + 1}
                  </span>
                </div>

                {/* Platform badge */}
                <div className="absolute top-2 right-2">
                  <OttBadge platform={show.platform} />
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-15">
                  <Tv className="w-16 h-16 text-white" />
                </div>

                <div className="relative z-10">
                  <p className="font-playfair text-white font-bold text-sm leading-tight line-clamp-2">
                    {show.title}
                  </p>
                  <p className="text-white/60 font-dm text-[10px] mt-0.5">
                    {show.seasons} Season{show.seasons > 1 ? "s" : ""} ·{" "}
                    {show.year}
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-gold text-gold" />
                  <span className="font-dm text-xs font-semibold text-foreground">
                    {show.rating}
                  </span>
                  {show.reviewCount && (
                    <span className="font-dm text-[10px] text-chestnut ml-1">
                      {formatReviewCount(show.reviewCount)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {show.genre
                    .split(", ")
                    .slice(0, 2)
                    .map((g) => (
                      <span
                        key={g}
                        className="text-[9px] font-dm px-1.5 py-0.5 rounded-full bg-warm-beige text-chestnut border border-sand"
                      >
                        {g}
                      </span>
                    ))}
                </div>

                <p className="font-dm text-[10px] text-chestnut line-clamp-2 leading-snug">
                  {show.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Top Picks For You Section ─────────────────────────────────────────────────

interface TopPicksForYouProps {
  recentlyVisited: VisitedItem[];
  onSelectActor: (a: Actor) => void;
  onSelectMovie: (m: Movie) => void;
}

function TopPicksForYouSection({
  recentlyVisited,
  onSelectActor,
  onSelectMovie,
}: TopPicksForYouProps) {
  // Derive preferred genres from visited items
  const preferredGenres = new Set<string>();
  for (const item of recentlyVisited) {
    const genres = item.data.genre.split(", ");
    for (const g of genres) {
      const trimmed = g.trim();
      if (trimmed) preferredGenres.add(trimmed);
    }
  }

  // IDs of already-visited items to exclude
  const visitedActorIds = new Set(
    recentlyVisited.filter((i) => i.kind === "actor").map((i) => i.data.id),
  );
  const visitedMovieIds = new Set(
    recentlyVisited.filter((i) => i.kind === "movie").map((i) => i.data.id),
  );

  // Collect recommendations
  const recommendedActors: Array<{ kind: "actor"; data: Actor }> =
    preferredGenres.size > 0
      ? actorsData
          .filter(
            (a) =>
              !visitedActorIds.has(a.id) &&
              a.genre.split(", ").some((g) => preferredGenres.has(g.trim())),
          )
          .slice(0, 4)
          .map((a) => ({ kind: "actor" as const, data: a }))
      : [];

  const recommendedMovies: Array<{ kind: "movie"; data: Movie }> =
    preferredGenres.size > 0
      ? moviesData
          .filter(
            (m) =>
              !visitedMovieIds.has(m.id) &&
              m.genre.split(", ").some((g) => preferredGenres.has(g.trim())),
          )
          .slice(0, 4)
          .map((m) => ({ kind: "movie" as const, data: m }))
      : [];

  const picks = [...recommendedActors, ...recommendedMovies].slice(0, 8);

  const isEmpty = picks.length === 0;

  return (
    <section
      data-ocid="toppicks.section"
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-5 flex items-center gap-3"
      >
        <Sparkles className="w-5 h-5 text-gold" />
        <h2 className="font-playfair text-2xl font-bold text-foreground">
          Top Picks <span className="text-gold">For You</span>
        </h2>
        <span className="text-xs font-dm font-semibold text-gold bg-gold/10 border border-gold/20 px-2 py-0.5 rounded-full">
          Personalized
        </span>
      </motion.div>

      {isEmpty ? (
        <div
          data-ocid="toppicks.empty_state"
          className="flex flex-col items-center justify-center py-10 rounded-2xl bg-warm-beige border border-sand text-center"
        >
          <Sparkles className="w-10 h-10 text-sand mb-3" />
          <p className="font-dm text-sm text-chestnut">No items added</p>
          <p className="font-dm text-xs text-chestnut/70 mt-1">
            Start exploring to get personalized picks!
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-3 scrollbar-hide flex gap-4">
          {picks.map((pick, idx) => {
            if (pick.kind === "actor") {
              const actor = pick.data;
              return (
                <motion.button
                  key={`actor-${actor.id}`}
                  type="button"
                  data-ocid={`toppicks.item.${idx + 1}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => onSelectActor(actor)}
                  className="flex-shrink-0 w-40 text-left group hover:scale-105 transition-transform duration-300"
                  style={{ willChange: "transform" }}
                >
                  <div className="relative h-52 rounded-xl overflow-hidden bg-sand mb-2">
                    <SafeImage
                      src={actor.photoUrl}
                      alt={actor.name}
                      fallbackLetter={actor.name[0]}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
                    <div className="absolute top-2 left-2">
                      <IndustryBadge industry={actor.industry} />
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-[10px] font-dm text-white font-semibold">
                        {actor.rating}
                      </span>
                    </div>
                  </div>
                  <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                    {actor.name}
                  </p>
                  <p className="font-dm text-[10px] text-sienna truncate mt-0.5">
                    {actor.nickname}
                  </p>
                </motion.button>
              );
            }

            const movie = pick.data;
            return (
              <motion.button
                key={`movie-${movie.id}`}
                type="button"
                data-ocid={`toppicks.item.${idx + 1}`}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => onSelectMovie(movie)}
                className="flex-shrink-0 w-40 text-left group hover:scale-105 transition-transform duration-300"
                style={{ willChange: "transform" }}
              >
                <div className="relative h-52 rounded-xl overflow-hidden bg-sand mb-2">
                  <SafeImage
                    src={movie.posterUrl}
                    alt={movie.title}
                    fallbackLetter={movie.title[0]}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" />
                  <div className="absolute top-2 left-2">
                    <IndustryBadge industry={movie.industry} />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <OttBadge platform={movie.ottPlatform} />
                  </div>
                  <div className="absolute bottom-7 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <span className="text-[10px] font-dm text-white font-semibold">
                      {movie.rating}
                    </span>
                  </div>
                </div>
                <p className="font-dm text-xs font-semibold text-foreground truncate leading-tight">
                  {movie.title}
                </p>
                <p className="font-dm text-[10px] text-chestnut mt-0.5">
                  {movie.year}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ── See All Overlay ───────────────────────────────────────────────────────────

interface SeeAllOverlayProps {
  open: boolean;
  onClose: () => void;
  title: string;
  kind: "actor" | "movie";
  items: Actor[] | Movie[];
  onSelectActor: (a: Actor) => void;
  onSelectMovie: (m: Movie) => void;
  wishlistedActors: number[];
  wishlistedMovies: number[];
  onToggleActorWishlist: (id: number) => void;
  onToggleMovieWishlist: (id: number) => void;
}

function SeeAllOverlay({
  open,
  onClose,
  title,
  kind,
  items,
  onSelectActor,
  onSelectMovie,
  wishlistedActors,
  wishlistedMovies,
  onToggleActorWishlist,
  onToggleMovieWishlist,
}: SeeAllOverlayProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-espresso/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            data-ocid="seeall.panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="relative z-10 mt-auto w-full max-h-[88vh] bg-espresso border-t border-clay/30 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Gold top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-gold/60 via-amber-warm to-gold/60 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-clay/25 flex-shrink-0">
              <div className="flex items-center gap-3">
                {kind === "actor" ? (
                  <User className="w-5 h-5 text-gold" />
                ) : (
                  <Film className="w-5 h-5 text-gold" />
                )}
                <h2 className="font-playfair text-xl font-bold text-cream">
                  {title}
                </h2>
                <span className="text-xs font-dm text-clay bg-clay/10 border border-clay/20 px-2 py-0.5 rounded-full">
                  {items.length} total
                </span>
              </div>
              <button
                type="button"
                data-ocid="seeall.close_button"
                onClick={onClose}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-clay/20 hover:bg-clay/40 text-cream flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hint text */}
            <p className="px-5 pt-3 pb-1 text-xs font-dm text-clay/60 flex-shrink-0">
              Scroll horizontally to explore all{" "}
              {kind === "actor" ? "actors" : "films"} →
            </p>

            {/* Horizontal scroll row */}
            <div className="flex-1 overflow-hidden px-5 pb-6">
              {items.length === 0 ? (
                <div
                  data-ocid="seeall.empty_state"
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  {kind === "actor" ? (
                    <User className="w-10 h-10 text-clay/30 mb-3" />
                  ) : (
                    <Film className="w-10 h-10 text-clay/30 mb-3" />
                  )}
                  <p className="font-dm text-sm text-clay/60">No items added</p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide h-full items-start pt-2">
                  {kind === "actor"
                    ? (items as Actor[]).map((actor, idx) => {
                        const isWl = wishlistedActors.includes(actor.id);
                        return (
                          <motion.div
                            key={actor.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                            className="flex-shrink-0 w-36 group hover:scale-105 transition-transform duration-300"
                            style={{ willChange: "transform" }}
                          >
                            {/* Portrait card */}
                            <button
                              type="button"
                              data-ocid={`seeall.actor.item.${idx + 1}`}
                              onClick={() => {
                                onSelectActor(actor);
                                onClose();
                              }}
                              className="relative w-full h-44 rounded-xl overflow-hidden bg-clay/20 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                              <SafeImage
                                src={actor.photoUrl}
                                alt={actor.name}
                                fallbackLetter={actor.name[0]}
                                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 to-transparent" />
                              <div className="absolute bottom-2 left-2">
                                <IndustryBadge industry={actor.industry} />
                              </div>
                              {/* Wishlist */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleActorWishlist(actor.id);
                                }}
                                aria-label={
                                  isWl
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                              >
                                <Heart
                                  className={`w-3 h-3 ${isWl ? "fill-red-400 text-red-400" : "text-white"}`}
                                />
                              </button>
                            </button>
                            <p className="font-dm text-xs font-semibold text-cream truncate leading-tight mt-1.5 px-0.5">
                              {actor.name}
                            </p>
                            <p className="font-dm text-[10px] text-clay truncate mt-0.5 px-0.5">
                              {actor.nickname}
                            </p>
                          </motion.div>
                        );
                      })
                    : (items as Movie[]).map((movie, idx) => {
                        const isWl = wishlistedMovies.includes(movie.id);
                        return (
                          <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                            className="flex-shrink-0 w-36 group hover:scale-105 transition-transform duration-300"
                            style={{ willChange: "transform" }}
                          >
                            <button
                              type="button"
                              data-ocid={`seeall.movie.item.${idx + 1}`}
                              onClick={() => {
                                onSelectMovie(movie);
                                onClose();
                              }}
                              className="relative w-full h-44 rounded-xl overflow-hidden bg-clay/20 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                            >
                              <SafeImage
                                src={movie.posterUrl}
                                alt={movie.title}
                                fallbackLetter={movie.title[0]}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-espresso/75 to-transparent" />
                              <div className="absolute bottom-2 left-2">
                                <BoxOfficeBadge
                                  status={
                                    movie.boxOfficeStatus as BoxOfficeStatus
                                  }
                                />
                              </div>
                              {/* Wishlist */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleMovieWishlist(movie.id);
                                }}
                                aria-label={
                                  isWl
                                    ? "Remove from wishlist"
                                    : "Add to wishlist"
                                }
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                              >
                                <Bookmark
                                  className={`w-3 h-3 ${isWl ? "fill-gold text-gold" : "text-white"}`}
                                />
                              </button>
                            </button>
                            <p className="font-dm text-xs font-semibold text-cream truncate leading-tight mt-1.5 px-0.5">
                              {movie.title}
                            </p>
                            <p className="font-dm text-[10px] text-clay truncate mt-0.5 px-0.5">
                              {movie.year}
                            </p>
                          </motion.div>
                        );
                      })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [recentlyVisited, setRecentlyVisited] = useState<VisitedItem[]>([]);
  const [signInOpen, setSignInOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistedActors, setWishlistedActors] = useState<number[]>([]);
  const [wishlistedMovies, setWishlistedMovies] = useState<number[]>([]);
  const [showAllActors, setShowAllActors] = useState(false);
  const [showAllMovies, setShowAllMovies] = useState(false);

  const toggleActorWishlist = useCallback((id: number) => {
    setWishlistedActors((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const toggleMovieWishlist = useCallback((id: number) => {
    setWishlistedMovies((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const openActor = useCallback((actor: Actor) => {
    setSelectedActor(actor);
    setRecentlyVisited((prev) => {
      const filtered = prev.filter(
        (i) => !(i.kind === "actor" && i.data.id === actor.id),
      );
      return [{ kind: "actor" as const, data: actor }, ...filtered].slice(0, 8);
    });
  }, []);

  const openMovie = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setRecentlyVisited((prev) => {
      const filtered = prev.filter(
        (i) => !(i.kind === "movie" && i.data.id === movie.id),
      );
      return [{ kind: "movie" as const, data: movie }, ...filtered].slice(0, 8);
    });
  }, []);

  const q = searchQuery.toLowerCase();

  const filteredActors = actorsData.filter(
    (a) =>
      (filter === "all" || filter === "actors") &&
      (industryFilter === "all" || a.industry === industryFilter) &&
      (genreFilter === "all" || a.genre.includes(genreFilter)) &&
      a.name.toLowerCase().includes(q),
  );

  const filteredMovies = moviesData.filter(
    (m) =>
      (filter === "all" || filter === "movies") &&
      (industryFilter === "all" || m.industry === industryFilter) &&
      (genreFilter === "all" || m.genre.includes(genreFilter)) &&
      m.title.toLowerCase().includes(q),
  );

  // Reset "see all" when filters change
  // biome-ignore lint/correctness/useExhaustiveDependencies: setters are stable, filter values drive the reset
  useEffect(() => {
    setShowAllActors(false);
    setShowAllMovies(false);
  }, [filter, industryFilter, genreFilter, searchQuery]);

  // Always show 5 items in the grid; "See All" opens the overlay
  const displayedActors = filteredActors.slice(0, 5);
  const displayedMovies = filteredMovies.slice(0, 5);

  const showActors = filter === "all" || filter === "actors";
  const showMovies = filter === "all" || filter === "movies";

  const wishlistCount = wishlistedActors.length + wishlistedMovies.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filter={filter}
        setFilter={setFilter}
        industryFilter={industryFilter}
        setIndustryFilter={setIndustryFilter}
        wishlistCount={wishlistCount}
        onWishlistOpen={() => setWishlistOpen(true)}
        onSignInOpen={() => setSignInOpen(true)}
      />

      <main>
        <HeroSection />

        {/* Top Picks For You */}
        <TopPicksForYouSection
          recentlyVisited={recentlyVisited}
          onSelectActor={openActor}
          onSelectMovie={openMovie}
        />

        {/* Top Rated Section */}
        <TopRatedSection
          setSelectedActor={openActor}
          setSelectedMovie={openMovie}
        />

        {/* Birthday Today Section */}
        <BirthdayTodaySection onSelectActor={openActor} />

        {/* Releasing Soon Section */}
        <ReleasingSoonSection />

        {/* Trending in India */}
        <TrendingInIndiaSection onViewDetails={openMovie} />

        {/* Top 10 Shows */}
        <Top10ShowsSection />

        {/* Podcast Section */}
        <PodcastSection episodes={podcastEpisodes} />

        {/* Mobile industry pills */}
        <div className="md:hidden max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-2">
          <IndustryFilterPills
            selected={industryFilter}
            onChange={setIndustryFilter}
          />
        </div>

        {/* Genre Filter Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4">
          <GenreFilterPills selected={genreFilter} onChange={setGenreFilter} />
        </div>

        {/* Actors Section */}
        {showActors && (
          <section
            data-ocid="actors.section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-14"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8 flex flex-col sm:flex-row sm:items-end gap-4 justify-between"
            >
              <div>
                <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
                  Pan India <span className="text-sienna">Actors</span>
                </h2>
                <p className="font-dm text-sm text-chestnut mt-2">
                  {filteredActors.length} icons from Bollywood, Tamil, Telugu,
                  Malayalam & Kannada cinema.
                </p>
              </div>
            </motion.div>

            {filteredActors.length === 0 ? (
              <div
                data-ocid="actors.empty_state"
                className="text-center py-20 text-chestnut font-dm"
              >
                No actors found{searchQuery ? ` for "${searchQuery}"` : ""}
                {industryFilter !== "all" ? ` in ${industryFilter}` : ""}.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {displayedActors.map((actor, i) => (
                    <div
                      key={actor.id}
                      className={
                        displayedActors.length === 5 && i === 4
                          ? "col-span-2 max-w-sm mx-auto w-full"
                          : ""
                      }
                    >
                      <ActorCard
                        actor={actor}
                        index={i + 1}
                        isWishlisted={wishlistedActors.includes(actor.id)}
                        onToggleWishlist={() => toggleActorWishlist(actor.id)}
                        onViewProfile={() => openActor(actor)}
                      />
                    </div>
                  ))}
                </div>
                {filteredActors.length > 5 && (
                  <div className="flex justify-center mt-8">
                    <Button
                      data-ocid="actors.see_all_button"
                      onClick={() => setShowAllActors(true)}
                      className="bg-warm-beige hover:bg-sand border border-sand text-chestnut font-dm font-semibold px-8 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4" /> See All Actors (
                      {filteredActors.length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Divider */}
        {showActors && showMovies && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="h-px bg-gradient-to-r from-transparent via-sand to-transparent" />
          </div>
        )}

        {/* Movies Section */}
        {showMovies && (
          <section
            data-ocid="movies.section"
            className="max-w-7xl mx-auto px-4 sm:px-6 py-14"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-foreground">
                Pan India <span className="text-sienna">Films</span>
              </h2>
              <p className="font-dm text-sm text-chestnut mt-2">
                {filteredMovies.length} blockbusters spanning all major Indian
                industries.
              </p>
            </motion.div>

            {filteredMovies.length === 0 ? (
              <div
                data-ocid="movies.empty_state"
                className="text-center py-20 text-chestnut font-dm"
              >
                No movies found{searchQuery ? ` for "${searchQuery}"` : ""}
                {industryFilter !== "all" ? ` in ${industryFilter}` : ""}.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {displayedMovies.map((movie, i) => (
                    <div
                      key={movie.id}
                      className={
                        displayedMovies.length === 5 && i === 4
                          ? "col-span-2 max-w-sm mx-auto w-full"
                          : ""
                      }
                    >
                      <MovieCard
                        movie={movie}
                        index={i + 1}
                        isWishlisted={wishlistedMovies.includes(movie.id)}
                        onToggleWishlist={() => toggleMovieWishlist(movie.id)}
                        onViewDetails={() => openMovie(movie)}
                      />
                    </div>
                  ))}
                </div>
                {filteredMovies.length > 5 && (
                  <div className="flex justify-center mt-8">
                    <Button
                      data-ocid="movies.see_all_button"
                      onClick={() => setShowAllMovies(true)}
                      className="bg-warm-beige hover:bg-sand border border-sand text-chestnut font-dm font-semibold px-8 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4" /> See All Films (
                      {filteredMovies.length})
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      {/* Recently Visited */}
      <RecentlyVisited
        items={recentlyVisited}
        onSelectActor={openActor}
        onSelectMovie={openMovie}
      />

      <Footer />

      {/* Modals */}
      <ActorModal
        actor={selectedActor}
        onClose={() => setSelectedActor(null)}
      />
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
      <WishlistPanel
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        wishlistedActors={wishlistedActors}
        wishlistedMovies={wishlistedMovies}
        onRemoveActor={(id) =>
          setWishlistedActors((prev) => prev.filter((x) => x !== id))
        }
        onRemoveMovie={(id) =>
          setWishlistedMovies((prev) => prev.filter((x) => x !== id))
        }
      />

      {/* See All Actors Overlay */}
      <SeeAllOverlay
        open={showAllActors}
        onClose={() => setShowAllActors(false)}
        title="All Actors"
        kind="actor"
        items={filteredActors}
        onSelectActor={openActor}
        onSelectMovie={openMovie}
        wishlistedActors={wishlistedActors}
        wishlistedMovies={wishlistedMovies}
        onToggleActorWishlist={toggleActorWishlist}
        onToggleMovieWishlist={toggleMovieWishlist}
      />

      {/* See All Films Overlay */}
      <SeeAllOverlay
        open={showAllMovies}
        onClose={() => setShowAllMovies(false)}
        title="All Films"
        kind="movie"
        items={filteredMovies}
        onSelectActor={openActor}
        onSelectMovie={openMovie}
        wishlistedActors={wishlistedActors}
        wishlistedMovies={wishlistedMovies}
        onToggleActorWishlist={toggleActorWishlist}
        onToggleMovieWishlist={toggleMovieWishlist}
      />

      {/* Back to Top */}
      <BackToTopButton />
    </div>
  );
}
