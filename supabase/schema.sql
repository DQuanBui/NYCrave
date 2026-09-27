-- NYCrave schema. Mirrors types/place.ts (zod is the source of truth).
-- Enum-like arrays are stored as text[] and validated in the app layer with zod,
-- so adding a cuisine or vibe tag does not need a migration.

create type place_category as enum (
  'restaurant', 'drink', 'attraction', 'shopping', 'photo_spot', 'park_pier'
);

create type borough as enum ('manhattan', 'brooklyn', 'queens', 'bronx', 'staten_island');

create table places (
  id                  text primary key,
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null,
  category            place_category not null,
  cuisines            text[] not null default '{}',
  dish_types          text[] not null default '{}',
  drink_types         text[] not null default '{}',
  shop_types          text[] not null default '{}',
  dietary             text[] not null default '{}',
  borough             borough not null,
  neighborhood        text not null,
  address             text not null,
  lat                 double precision not null check (lat between 40.4 and 41),
  lng                 double precision not null check (lng between -74.3 and -73.6),
  price_level         smallint not null check (price_level between 1 and 4),
  is_free             boolean not null default false,
  -- { priceRange: { min, max }, bookingUrl?, notes? }
  ticket_info         jsonb,
  -- { sun: [{ open: 'HH:MM', close: 'HH:MM' }], mon: [...], ... }; close <= open runs past midnight
  hours               jsonb not null,
  must_try            text[] not null default '{}',
  editorial_take      text not null default '',
  vibe_tags           text[] not null default '{}',
  best_time_to_visit  text,
  time_needed_minutes integer check (time_needed_minutes > 0),
  -- [{ url, alt, width, height, source, attribution? }]
  photos              jsonb not null default '[]',
  -- { bestLight: [...], tips: [...] }
  photo_spot          jsonb,
  -- { activities: [...], amenities: [...], seasonalNotes? }
  park                jsonb,
  trending_score      real check (trending_score between 0 and 100),
  google_place_id     text unique,
  website             text,
  phone               text,
  verified            boolean not null default false,
  verification_notes  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index places_category_idx on places (category);
create index places_borough_idx on places (borough);
create index places_cuisines_idx on places using gin (cuisines);
create index places_dish_types_idx on places using gin (dish_types);
create index places_drink_types_idx on places using gin (drink_types);
create index places_vibe_tags_idx on places using gin (vibe_tags);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger places_set_updated_at before update on places
  for each row execute function set_updated_at();

-- Public read; writes go through the service role (admin page) only.
alter table places enable row level security;
create policy "places are publicly readable" on places for select using (true);

-- Visitor reports ("closed", "wrong hours", ...). Inserted and read by the server
-- with the service role only; there are no public policies.
create table reports (
  id          bigint generated always as identity primary key,
  place_id    text not null references places (id) on delete cascade,
  kind        text not null check (kind in ('closed', 'hours', 'location', 'photo', 'other')),
  note        text check (char_length(note) <= 500),
  resolved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index reports_open_idx on reports (resolved, created_at desc);
alter table reports enable row level security;

-- Visitor feedback about the site (rating, features used, optional comment).
-- Inserted and read by the server with the service role only; no public policies.
create table feedback (
  id          bigint generated always as identity primary key,
  rating      smallint not null check (rating between 1 and 5),
  features    text[] not null default '{}',
  comment     text check (char_length(comment) <= 1000),
  locale      text not null,
  created_at  timestamptz not null default now()
);

create index feedback_created_idx on feedback (created_at desc);
alter table feedback enable row level security;
