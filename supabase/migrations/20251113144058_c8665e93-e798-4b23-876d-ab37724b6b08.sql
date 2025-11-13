-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_history_paused BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create csv_uploads table to store upload history
CREATE TABLE public.csv_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  equipment_data JSONB NOT NULL,
  stats JSONB NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_csv_uploads_user_id_uploaded_at ON public.csv_uploads(user_id, uploaded_at DESC);

-- Enable RLS
ALTER TABLE public.csv_uploads ENABLE ROW LEVEL SECURITY;

-- CSV uploads policies
CREATE POLICY "Users can view their own uploads"
  ON public.csv_uploads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own uploads"
  ON public.csv_uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads"
  ON public.csv_uploads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to maintain only last 5 uploads per user
CREATE OR REPLACE FUNCTION public.cleanup_old_uploads()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.csv_uploads
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id FROM public.csv_uploads
    WHERE user_id = NEW.user_id
    ORDER BY uploaded_at DESC
    LIMIT 5
  );
  RETURN NEW;
END;
$$;

-- Trigger to cleanup old uploads after insert
CREATE TRIGGER cleanup_uploads_after_insert
  AFTER INSERT ON public.csv_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_old_uploads();