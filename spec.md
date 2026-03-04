# Casting Rate

## Current State
Full Pan India film database with actors and movies across Bollywood, Tamil, Telugu, Malayalam, and Kannada industries. Features: search/filter, top rated leaderboard, birthday today section, recently visited, genre filter, industry filter, box office status badges, YouTube trailers in modals, user star ratings, wishlist, sign in modal, back to top button.

## Requested Changes (Diff)

### Add
- **Hero Trailer Carousel**: Replace the static hero tagline area with an auto-playing carousel of top running film trailers (YouTube embeds). Users can switch between trailers using prev/next arrow buttons. Carousel cycles through 5-6 featured movies with their YouTube IDs. Shows movie title, year, OTT platform. Prev/next arrows visible on hover.
- **Releasing Soon Section**: A horizontal scroll section showing upcoming movies with their expected release dates. Each card shows: movie poster (placeholder/gradient), title, release date, industry badge, and a "Notify Me" button. Data is static with ~8 upcoming Pan India films for 2025-2026.
- **Casting Rate Originals Podcast Section**: A visually distinct section with 5-6 podcast episode cards in a horizontal scroll. Each card shows: episode number, title, thumbnail (styled gradient), host name, duration, a play button. Clicking play shows an inline YouTube embed (use YouTube video IDs of real Bollywood/cinema discussion videos). Section header with a microphone icon.

### Modify
- Hero section: Replace "Where Stars Shine Brightest" tagline area with the trailer carousel component. Keep the stats and industry pills below.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `upcomingMovies` data array and `podcastEpisodes` data array to `panIndiaData.ts`
2. Build `HeroTrailerCarousel` component inside `App.tsx` - cycles through featured movie YouTube IDs with prev/next arrows, auto-advances every 8s
3. Build `ReleasingSoonSection` component - horizontal scroll of upcoming movie cards with release dates
4. Build `CastingRatePodcastSection` component - horizontal scroll of podcast episode cards with inline YouTube player
5. Integrate all three sections into the main App render flow
6. Validate build
