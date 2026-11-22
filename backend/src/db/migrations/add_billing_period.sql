ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS billing_period text NOT NULL DEFAULT 'monthly'
  CHECK (billing_period IN ('monthly', 'annual'));

NOTIFY pgrst, 'reload schema';
