# Plink

Plink is a personal project I built for my friend group to make sharing hangout memories easier.

## Current Status

Plink is in active development and currently tested through Expo Go with my own Supabase backend. At the moment, it is not packaged for public self-serve testing.

## What the App Does

- Create and join **Parties** (group spaces)
- Create **time-bound Links** inside parties
- Share posts and media inside each link
- Manage members and permissions around shared spaces
- Keep group memories organized in one place

## Key Features (So Far)

- Auth flow with profile gating
- Party and Link membership model
- Link detail experience with media + post feed
- Staged media uploads with progress feedback
- Signed/private media access patterns via Supabase Storage
- Quick-access center button to access active link/create a link from any screen

## Tech Stack

- Expo / React Native
- TypeScript
- React Navigation
- Supabase (Auth, Postgres, Storage)
- NativeWind

## Next Steps / To-Do

- [ ] Real-time updates for posts and media
- [ ] Push notifications for link activity
- [ ] Better discovery/search across parties and links
- [ ] Richer link metadata and previews
- [ ] Offline-friendly caching and retry flows
- [ ] Public testing/reproducible setup docs once architecture stabilizes
