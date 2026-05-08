-- Initialize base hierarchical tables from blueprint
CREATE TABLE IF NOT EXISTS public.enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  global_branding_color TEXT DEFAULT '#8806bc',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID REFERENCES enterprises(id) NOT NULL,
  name TEXT NOT NULL,
  local_pricing_multiplier FLOAT DEFAULT 1.0,
  stripe_subscription_id TEXT,
  stripe_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  tenancy_id UUID REFERENCES tenancies(id) NOT NULL,
  is_enterprise_admin BOOLEAN DEFAULT false,
  role TEXT CHECK (role IN ('franchise_owner', 'admin', 'photographer')),
  full_name TEXT,
  email TEXT,
  region TEXT,
  equipment TEXT,
  deliverable_products JSONB DEFAULT '[]',
  internal_notes TEXT,
  internal_pay_rate NUMERIC
);

-- Enable RLS
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Simplified for initialization)
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
