# Casting Rate

## Current State
A Pan India film database with:
- Actors and movies data in `panIndiaData.ts` (35+ actors, 36+ movies)
- Actor/Movie grids with cards, modals, wishlist, search/filter
- Top Rated leaderboard, genre filter, industry filter, recently visited section
- Box office status badges, YouTube trailers embedded in modals
- "Recently Visited" section at bottom of page
- Footer with "Powered by kartavya co."

Actor interface currently lacks `birthDate` and `deathDate` fields.

## Requested Changes (Diff)

### Add
- `birthDate` field (string, format "YYYY-MM-DD") to the `Actor` interface in `panIndiaData.ts`
- `deathDate` field (optional string, format "YYYY-MM-DD") to the `Actor` interface for deceased stars
- Birthday data (real approximate birthdates) for all existing actors
- "Birthday Today" section that shows actors whose birth month+day matches today's date (March 4)
  - Shows actor photo, name, nickname, age (current year - birth year), and death date if applicable
  - Horizontal scrollable row of cards similar to "Recently Visited"
  - Uses Cake/Gift icon and festive styling
  - If no birthdays today, section is hidden (returns null)
  - Section appears after Top Rated and before the filters/grids

### Modify
- `panIndiaData.ts`: Add `birthDate` to all actors with real approximate dates; add `deathDate` for any deceased actors

### Remove
- Nothing removed

## Implementation Plan
1. Update `Actor` interface to add `birthDate: string` and `deathDate?: string`
2. Add birthdate (and deathdate where applicable) to all 35+ actors in `actorsData`
3. Create `BirthdayTodaySection` component in `App.tsx` that:
   - Filters actors by today's month+day
   - Shows a horizontal scrollable row of birthday cards
   - Each card shows: photo, name, nickname, age, industry badge, and "(died YYYY)" if applicable
   - Returns null if no birthdays today
4. Insert `BirthdayTodaySection` in the main render after `TopRatedSection`
