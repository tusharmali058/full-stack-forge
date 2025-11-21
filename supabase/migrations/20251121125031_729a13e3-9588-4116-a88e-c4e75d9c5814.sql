-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  agency_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own customers"
  ON public.customers FOR ALL
  USING (auth.uid() = user_id);

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  travel_start_date DATE NOT NULL,
  travel_end_date DATE NOT NULL,
  number_of_adults INTEGER NOT NULL DEFAULT 1,
  number_of_children INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own quotations"
  ON public.quotations FOR ALL
  USING (auth.uid() = user_id);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('hotel', 'activity', 'transport', 'meal', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items in their quotations"
  ON public.quotation_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.quotations
      WHERE quotations.id = quotation_items.quotation_id
      AND quotations.user_id = auth.uid()
    )
  );

-- Create function to update profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();