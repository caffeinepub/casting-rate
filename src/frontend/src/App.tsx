import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Award,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Facebook,
  Film,
  Heart,
  Instagram,
  Loader2,
  Medal,
  Music,
  Play,
  Search,
  Sparkles,
  Star,
  Trophy,
  Twitter,
  User,
  X,
  Youtube,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Actor,
  type Movie,
  actorsData,
  moviesData,
  ottColors,
} from "./data/panIndiaData";
import { useActor } from "./hooks/useActor";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
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
      <span className="ml-1 text-xs font-dm text-muted-foreground">
        {rating}
      </span>
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
      <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
        <div className="flex items-center gap-2 text-xs font-dm text-muted-foreground">
          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
          <span>
            <span className="font-semibold text-foreground">
              {summary.average > 0 ? summary.average.toFixed(1) : "—"}
            </span>{" "}
            community avg ·{" "}
            <span className="font-semibold text-foreground">
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

          {/* Profile */}
          <button
            type="button"
            className="p-2 rounded-full hover:bg-clay/20 transition-colors text-cream"
            aria-label="Profile"
          >
            <User className="w-5 h-5" />
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
        </div>
      </nav>
    </header>
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-dm font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            India's Premier Pan India Film Database
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-cream leading-tight mb-4">
            Where Stars Shine{" "}
            <span className="italic text-gold">Brightest</span>
          </h1>
          <p className="font-crimson text-lg sm:text-xl text-clay max-w-2xl mx-auto mb-12 leading-relaxed">
            Explore the magic of Pan India cinema — discover your favourite
            actors, iconic movies from Bollywood, Tamil, Telugu, Malayalam &
            Kannada industries, and the stories that captivated billions.
          </p>
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
      className="group relative bg-card rounded-2xl overflow-hidden shimmer-border card-hover shadow-card flex flex-col"
    >
      {/* Photo */}
      <div className="relative h-64 sm:h-72 overflow-hidden bg-sand">
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
              className="text-[11px] font-dm px-2 py-0.5 rounded-full bg-warm-beige text-chestnut border border-sand"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-auto pt-2">
          <Award className="w-3.5 h-3.5 text-gold" />
          <span className="text-xs font-dm text-muted-foreground">
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
  return (
    <motion.article
      data-ocid={`movie.item.${index}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
      className="group relative bg-card rounded-2xl overflow-hidden shimmer-border card-hover shadow-card flex flex-col"
    >
      {/* Poster */}
      <div className="relative h-72 sm:h-80 overflow-hidden bg-sand">
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
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
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
        </div>
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
              className="text-[11px] font-dm px-2 py-0.5 rounded-full bg-warm-beige text-chestnut border border-sand"
            >
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1 mt-auto pt-1">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-dm text-muted-foreground">
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
                  <StarRating rating={actor.rating} />
                </div>
                <div className="flex items-center gap-1.5 text-sm font-dm text-chestnut">
                  <Award className="w-4 h-4 text-gold" />
                  {actor.awards} Awards Won
                </div>
              </div>

              {/* Genre */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {actor.genre.split(", ").map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="font-dm text-xs bg-warm-beige text-chestnut border-sand"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Biography
                </p>
                <p className="font-crimson text-base text-foreground leading-relaxed">
                  {actor.bio}
                </p>
              </div>

              {/* Upcoming Projects */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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

              {/* Social */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Follow
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
                  <span className="text-muted-foreground">Director:</span>
                  <span className="font-semibold">{movie.director}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-dm text-foreground">
                  <Clock className="w-4 h-4 text-sienna" />
                  {movie.runtime}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="text-sm font-dm font-semibold text-foreground">
                    {movie.rating}
                  </span>
                </div>
              </div>

              {/* Genre */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Genre
                </p>
                <div className="flex flex-wrap gap-2">
                  {movie.genre.split(", ").map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="font-dm text-xs bg-warm-beige text-chestnut border-sand"
                    >
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Cast */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Cast
                </p>
                <p className="font-dm text-sm text-foreground">
                  {movie.cast.join(", ")}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Synopsis
                </p>
                <p className="font-crimson text-base text-foreground leading-relaxed">
                  {movie.description}
                </p>
              </div>

              {/* Songs */}
              <div>
                <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
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
                <p className="text-sm font-dm text-muted-foreground mt-1">
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
                      className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5"
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
                      className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5"
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
                  <p className="text-center text-sm font-dm text-muted-foreground">
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
                <span className="text-sm font-dm text-muted-foreground">
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
                  <p className="font-dm text-muted-foreground text-sm">
                    Your wishlist is empty.
                  </p>
                  <p className="font-dm text-muted-foreground text-xs mt-1">
                    Tap the heart icon on any actor or movie card.
                  </p>
                </div>
              )}

              {actors.length > 0 && (
                <div>
                  <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                  <p className="text-xs font-dm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                          <p className="font-dm text-xs text-muted-foreground">
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
  if (items.length === 0) return null;

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
                className="flex-shrink-0 w-36 text-left group"
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
              className="flex-shrink-0 w-36 text-left group"
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
              <p className="font-dm text-[10px] text-muted-foreground mt-0.5">
                {movie.year}
              </p>
            </motion.button>
          );
        })}
      </div>
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
    <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[11px] font-dm font-bold text-muted-foreground">
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

        {/* Top Rated Section */}
        <TopRatedSection
          setSelectedActor={openActor}
          setSelectedMovie={openMovie}
        />

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
                <p className="font-dm text-sm text-muted-foreground mt-2">
                  {filteredActors.length} icons from Bollywood, Tamil, Telugu,
                  Malayalam & Kannada cinema.
                </p>
              </div>
            </motion.div>

            {filteredActors.length === 0 ? (
              <div
                data-ocid="actors.empty_state"
                className="text-center py-20 text-muted-foreground font-dm"
              >
                No actors found{searchQuery ? ` for "${searchQuery}"` : ""}
                {industryFilter !== "all" ? ` in ${industryFilter}` : ""}.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredActors.map((actor, i) => (
                  <ActorCard
                    key={actor.id}
                    actor={actor}
                    index={i + 1}
                    isWishlisted={wishlistedActors.includes(actor.id)}
                    onToggleWishlist={() => toggleActorWishlist(actor.id)}
                    onViewProfile={() => openActor(actor)}
                  />
                ))}
              </div>
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
              <p className="font-dm text-sm text-muted-foreground mt-2">
                {filteredMovies.length} blockbusters spanning all major Indian
                industries.
              </p>
            </motion.div>

            {filteredMovies.length === 0 ? (
              <div
                data-ocid="movies.empty_state"
                className="text-center py-20 text-muted-foreground font-dm"
              >
                No movies found{searchQuery ? ` for "${searchQuery}"` : ""}
                {industryFilter !== "all" ? ` in ${industryFilter}` : ""}.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                {filteredMovies.map((movie, i) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={i + 1}
                    isWishlisted={wishlistedMovies.includes(movie.id)}
                    onToggleWishlist={() => toggleMovieWishlist(movie.id)}
                    onViewDetails={() => openMovie(movie)}
                  />
                ))}
              </div>
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

      {/* Back to Top */}
      <BackToTopButton />
    </div>
  );
}
