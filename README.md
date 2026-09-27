# NYCrave

**New York, one craving at a time.**

NYCrave is a mobile-first guide to New York City for locals and visitors: where to eat, what to sip, what to see, where to shop, where to take the photo, and which park to end the day in, plus a planner that builds a whole day around what is actually open.

**Live site: [nycrave.vercel.app](https://nycrave.vercel.app)** · English and Vietnamese

![NYCrave home page: "The next stop is dumplings in Chinatown" beside a photo of dim sum on a subway-map background](docs/screenshots/home-desktop.jpg)

## Overview

- **Real places, honestly sourced.** Every restaurant, bar, museum, shop, photo spot and park is checked against its official website, with licensed photos and credits.
- **Live, in New York time.** Every place shows whether it is open right now, including late-night hours past midnight.
- **Plans, not just lists.** Design My Day turns a mood, a budget and a starting point into a timed route with walking and subway time between stops.
- **Built like the subway.** Each section is a line with its own color, and the whole site looks like a food magazine that fell for the subway map.

## Features

| | |
| --- | --- |
| 🔴 **Eat** · 🟠 **Sip** · 🔵 **Explore** · 🟣 **Shop** · 🟡 **Photo spots** · 🟢 **Parks & piers** | Browse by cuisine, dish, drink or shop type, with filters for open now, free, borough, neighborhood, price, vibe and dietary needs, as a list or a map |
| **Smart search** | Plain phrases in English or Vietnamese: "dumplings in Chinatown", "late night pizza", "trà sữa", "bảo tàng miễn phí" |
| **City map** | Every place on one map, with line toggles, *Open now*, *Free* and *Near me* |
| **Design My Day** | A timed day from breakfast to a nightcap, within budget, with the train to take between stops; swap stops, share, add to calendar or open the route in Google Maps |
| **Ready-made days** | A classic first day, a food crawl, Brooklyn by the water, art and museums, date night, and a $50 day |
| **Ask NYCrave** | A free helper on every page that answers "where can I get…", "is … open now?", "plan a day in …" and "how do I get from JFK…" from NYCrave's own places and tips |
| **Place pages** | Photos, live hours, must-try items, tickets, nearest subway stations, directions, and today's golden hour for photo spots |
| **Neighborhood guides** | Every neighborhood with its places, subway lines and a *Plan a day starting here* button |
| **Tourist tips** | Airports, the subway and OMNY, tipping with a bill calculator, safety, and the city through the seasons |
| **Works like an app** | Installable, saved places work offline, shareable saved lists, light and dark mode, holiday and weather notices |

## Screenshots

| Design My Day | City map |
| --- | --- |
| ![A planned day: a timeline of stops with times, travel and costs beside a route map](docs/screenshots/my-day-desktop.jpg) | ![Every place as a subway bullet on one map](docs/screenshots/map-desktop.jpg) |
| **Place page** | **Eat, in dark mode** |
| ![Katz's Delicatessen place page with photos, live hours and must-try dishes](docs/screenshots/place-desktop.jpg) | ![The Eat page in dark mode with cuisine tiles and filters](docs/screenshots/eat-desktop-dark.jpg) |

## How to use it

1. **Search or browse.** Type a craving on the home page, tap a mood, or pick a line.
2. **Narrow it down.** Turn on *Open now*, pick a neighborhood, or tap *Near me*.
3. **Open a place** for its hours, what to order and how to get there. Tap the heart to save it.
4. **Plan the day** in *My Day*, or start from a ready-made day. Swap anything, then share it.
5. **Ask NYCrave** anything along the way, and add the site to your home screen.

## Built with

Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · next-intl · MapLibre and OpenStreetMap · Open-Meteo · MTA open data · Vitest · optional Supabase, Google Places and Claude

```bash
npm install
npm run dev        # http://localhost:3000
```

Everything runs without keys; optional services are listed in [.env.example](.env.example).

---

Photos are from Wikimedia Commons under free licenses; every photographer is credited on the site's *Photo credits* page. Map data © OpenStreetMap contributors. NYCrave is an independent project, not affiliated with the MTA or any venue listed.
