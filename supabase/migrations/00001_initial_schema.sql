-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  home_prefecture TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_bikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  displacement_cc INTEGER,
  bike_type TEXT CHECK (bike_type IN (
    'touring', 'adventure', 'sport', 'cruiser',
    'naked', 'off-road', 'scooter', 'other'
  )),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE public.categories (
  id SERIAL PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SPOTS
-- ============================================================

CREATE TABLE public.spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  formatted_address TEXT,
  prefecture TEXT,
  city TEXT,
  google_place_id TEXT,
  website_url TEXT,
  phone TEXT,

  -- Parking info (the differentiator)
  parking_large_bike TEXT NOT NULL DEFAULT 'unknown'
    CHECK (parking_large_bike IN ('ok', 'ng', 'unknown')),
  parking_spots_estimate INTEGER,
  parking_surface TEXT CHECK (parking_surface IN (
    'paved', 'gravel', 'dirt', 'grass', 'mixed'
  )),
  parking_slope TEXT CHECK (parking_slope IN (
    'flat', 'slight', 'steep'
  )),
  parking_covered BOOLEAN,
  parking_free BOOLEAN,
  parking_notes TEXT,

  -- Metadata
  best_season TEXT[],
  operating_hours JSONB,
  access_notes TEXT,

  -- Aggregated stats
  average_rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verification_count INTEGER DEFAULT 0,
  verification_tier TEXT DEFAULT 'unverified'
    CHECK (verification_tier IN (
      'unverified', 'rider_verified', 'community_trusted', 'well_established'
    )),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX spots_location_idx ON public.spots USING GIST (location);
CREATE INDEX spots_prefecture_idx ON public.spots (prefecture);
CREATE INDEX spots_parking_idx ON public.spots (parking_large_bike);
CREATE INDEX spots_rating_idx ON public.spots (average_rating DESC);
CREATE INDEX spots_created_by_idx ON public.spots (created_by);
CREATE INDEX spots_lat_lng_idx ON public.spots (latitude, longitude);

-- ============================================================
-- SPOT <-> CATEGORY (many-to-many)
-- ============================================================

CREATE TABLE public.spot_categories (
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (spot_id, category_id)
);

CREATE INDEX spot_categories_category_idx ON public.spot_categories (category_id);

-- ============================================================
-- SPOT PHOTOS
-- ============================================================

CREATE TABLE public.spot_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX spot_photos_spot_idx ON public.spot_photos (spot_id);

-- ============================================================
-- REVIEWS
-- ============================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  visit_date DATE,
  parking_accurate BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(spot_id, user_id)
);

CREATE INDEX reviews_spot_idx ON public.reviews (spot_id);
CREATE INDEX reviews_user_idx ON public.reviews (user_id);

-- ============================================================
-- REVIEW PHOTOS
-- ============================================================

CREATE TABLE public.review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- COLLECTIONS
-- ============================================================

CREATE TABLE public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_path TEXT,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'unlisted', 'public')),
  forked_from UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  fork_count INTEGER DEFAULT 0,
  spot_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX collections_user_idx ON public.collections (user_id);
CREATE INDEX collections_visibility_idx ON public.collections (visibility)
  WHERE visibility = 'public';

-- ============================================================
-- COLLECTION ITEMS
-- ============================================================

CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  note TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, spot_id)
);

CREATE INDEX collection_items_collection_idx
  ON public.collection_items (collection_id, sort_order);

-- ============================================================
-- ROUTES
-- ============================================================

CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'unlisted', 'public')),
  total_distance_km NUMERIC(8,1),
  estimated_duration_minutes INTEGER,
  google_maps_url TEXT,
  route_polyline TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX routes_user_idx ON public.routes (user_id);

-- ============================================================
-- ROUTE STOPS
-- ============================================================

CREATE TABLE public.route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  spot_id UUID REFERENCES public.spots(id) ON DELETE SET NULL,
  custom_name TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  stop_type TEXT NOT NULL DEFAULT 'stop'
    CHECK (stop_type IN ('origin', 'destination', 'stop', 'via')),
  sort_order INTEGER NOT NULL,
  notes TEXT,
  UNIQUE(route_id, sort_order)
);

CREATE INDEX route_stops_route_idx ON public.route_stops (route_id, sort_order);

-- ============================================================
-- SPOT ADVISORIES
-- ============================================================

CREATE TABLE public.spot_advisories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  advisory_type TEXT NOT NULL CHECK (advisory_type IN (
    'road_closure', 'construction', 'weather', 'seasonal_closure', 'other'
  )),
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'warning', 'danger')),
  starts_at DATE,
  expires_at DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX spot_advisories_spot_idx ON public.spot_advisories (spot_id)
  WHERE is_active = true;

-- ============================================================
-- PARKING VERIFICATIONS
-- ============================================================

CREATE TABLE public.parking_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES public.spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  parking_large_bike TEXT NOT NULL
    CHECK (parking_large_bike IN ('ok', 'ng', 'unknown')),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(spot_id, user_id)
);

-- ============================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- ============================================================

-- Update spot stats on review change
CREATE OR REPLACE FUNCTION update_spot_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.spots SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
    ),
    review_count = (
      SELECT COUNT(*) FROM public.reviews WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_spot_stats();

-- Update verification tier
CREATE OR REPLACE FUNCTION update_verification_tier()
RETURNS TRIGGER AS $$
DECLARE
  v_count INTEGER;
  v_tier TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.parking_verifications
  WHERE spot_id = COALESCE(NEW.spot_id, OLD.spot_id);

  v_tier := CASE
    WHEN v_count >= 25 THEN 'well_established'
    WHEN v_count >= 10 THEN 'community_trusted'
    WHEN v_count >= 3  THEN 'rider_verified'
    ELSE 'unverified'
  END;

  UPDATE public.spots SET
    verification_count = v_count,
    verification_tier = v_tier,
    updated_at = now()
  WHERE id = COALESCE(NEW.spot_id, OLD.spot_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_verification_change
  AFTER INSERT OR DELETE ON public.parking_verifications
  FOR EACH ROW EXECUTE FUNCTION update_verification_tier();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Rider'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update collection spot_count
CREATE OR REPLACE FUNCTION update_collection_spot_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.collections SET
    spot_count = (
      SELECT COUNT(*) FROM public.collection_items
      WHERE collection_id = COALESCE(NEW.collection_id, OLD.collection_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.collection_id, OLD.collection_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_collection_item_change
  AFTER INSERT OR DELETE ON public.collection_items
  FOR EACH ROW EXECUTE FUNCTION update_collection_spot_count();
