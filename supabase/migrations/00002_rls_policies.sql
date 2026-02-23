-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- User Bikes
ALTER TABLE public.user_bikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bikes"
  ON public.user_bikes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bikes"
  ON public.user_bikes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bikes"
  ON public.user_bikes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bikes"
  ON public.user_bikes FOR DELETE USING (auth.uid() = user_id);

-- User Badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.user_badges FOR SELECT USING (true);

-- Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

-- Spots
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active spots are viewable by everyone"
  ON public.spots FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create spots"
  ON public.spots FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own spots"
  ON public.spots FOR UPDATE USING (auth.uid() = created_by);

-- Spot Categories
ALTER TABLE public.spot_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spot categories are viewable by everyone"
  ON public.spot_categories FOR SELECT USING (true);

CREATE POLICY "Spot creators can manage categories"
  ON public.spot_categories FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.spots WHERE id = spot_id AND created_by = auth.uid())
  );

CREATE POLICY "Spot creators can delete categories"
  ON public.spot_categories FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.spots WHERE id = spot_id AND created_by = auth.uid())
  );

-- Spot Photos
ALTER TABLE public.spot_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spot photos are viewable by everyone"
  ON public.spot_photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON public.spot_photos FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete own photos"
  ON public.spot_photos FOR DELETE USING (auth.uid() = uploaded_by);

-- Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Review Photos
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Review photos are viewable by everyone"
  ON public.review_photos FOR SELECT USING (true);

CREATE POLICY "Review authors can add photos"
  ON public.review_photos FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid())
  );

-- Collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public/unlisted collections are viewable"
  ON public.collections FOR SELECT USING (
    visibility IN ('public', 'unlisted') OR user_id = auth.uid()
  );

CREATE POLICY "Users can create own collections"
  ON public.collections FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON public.collections FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON public.collections FOR DELETE USING (auth.uid() = user_id);

-- Collection Items
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection items viewable if collection is accessible"
  ON public.collection_items FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE id = collection_id
      AND (visibility IN ('public', 'unlisted') OR user_id = auth.uid())
    )
  );

CREATE POLICY "Collection owners can add items"
  ON public.collection_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Collection owners can update items"
  ON public.collection_items FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

CREATE POLICY "Collection owners can delete items"
  ON public.collection_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.collections WHERE id = collection_id AND user_id = auth.uid())
  );

-- Routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public/unlisted routes are viewable"
  ON public.routes FOR SELECT USING (
    visibility IN ('public', 'unlisted') OR user_id = auth.uid()
  );

CREATE POLICY "Users can create own routes"
  ON public.routes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes"
  ON public.routes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON public.routes FOR DELETE USING (auth.uid() = user_id);

-- Route Stops
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Route stops viewable if route is accessible"
  ON public.route_stops FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.routes
      WHERE id = route_id
      AND (visibility IN ('public', 'unlisted') OR user_id = auth.uid())
    )
  );

CREATE POLICY "Route owners can manage stops"
  ON public.route_stops FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND user_id = auth.uid())
  );

CREATE POLICY "Route owners can update stops"
  ON public.route_stops FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND user_id = auth.uid())
  );

CREATE POLICY "Route owners can delete stops"
  ON public.route_stops FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.routes WHERE id = route_id AND user_id = auth.uid())
  );

-- Spot Advisories
ALTER TABLE public.spot_advisories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active advisories are viewable by everyone"
  ON public.spot_advisories FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create advisories"
  ON public.spot_advisories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own advisories"
  ON public.spot_advisories FOR UPDATE USING (auth.uid() = user_id);

-- Parking Verifications
ALTER TABLE public.parking_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verifications are viewable by everyone"
  ON public.parking_verifications FOR SELECT USING (true);

CREATE POLICY "Authenticated users can verify"
  ON public.parking_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own verification"
  ON public.parking_verifications FOR UPDATE USING (auth.uid() = user_id);
