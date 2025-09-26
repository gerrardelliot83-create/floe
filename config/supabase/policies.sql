-- Row Level Security Policies
-- Privacy-first approach - users only see their own data

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quick_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Cards policies
CREATE POLICY "Users can view own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- Smart spaces policies
CREATE POLICY "Users can view own smart spaces" ON public.smart_spaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own smart spaces" ON public.smart_spaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own smart spaces" ON public.smart_spaces
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own smart spaces" ON public.smart_spaces
  FOR DELETE USING (auth.uid() = user_id);

-- Highlights policies
CREATE POLICY "Users can view own highlights" ON public.highlights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own highlights" ON public.highlights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own highlights" ON public.highlights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own highlights" ON public.highlights
  FOR DELETE USING (auth.uid() = user_id);

-- OCR results policies
CREATE POLICY "Users can view own ocr results" ON public.ocr_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = ocr_results.card_id
      AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert ocr results for own cards" ON public.ocr_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = ocr_results.card_id
      AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ocr results for own cards" ON public.ocr_results
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = ocr_results.card_id
      AND cards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ocr results for own cards" ON public.ocr_results
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = ocr_results.card_id
      AND cards.user_id = auth.uid()
    )
  );

-- Quick captures policies
CREATE POLICY "Users can view own quick captures" ON public.quick_captures
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quick captures" ON public.quick_captures
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quick captures" ON public.quick_captures
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quick captures" ON public.quick_captures
  FOR DELETE USING (auth.uid() = user_id);

-- Search sessions policies
CREATE POLICY "Users can view own search sessions" ON public.search_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search sessions" ON public.search_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search sessions" ON public.search_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own search sessions" ON public.search_sessions
  FOR DELETE USING (auth.uid() = user_id);