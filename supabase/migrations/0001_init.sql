-- 1. Tworzenie tabeli
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marka TEXT NOT NULL,
    model TEXT NOT NULL,
    vin TEXT NOT NULL,
    email TEXT,
    wheels_data JSONB NOT NULL
);

-- 2. Włączenie Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Explicit Grants (Dopuszczenie API do tabeli dla roli anon, tylko INSERT)
GRANT INSERT ON TABLE public.reports TO anon;

-- 4. RLS Policy (Tylko dodawanie dla anonimowych użytkowników)
CREATE POLICY "Zezwól na INSERT dla anon" ON public.reports FOR INSERT TO anon WITH CHECK (true);

-- 5. Ochrona integralności JSONB (CHECK constraint)
-- Weryfikuje: obiekt główny, 4 klucze kół, każde koło jest obiektem z wymaganymi polami
ALTER TABLE public.reports
ADD CONSTRAINT check_wheels_data_structure
CHECK (
  jsonb_typeof(wheels_data) = 'object'
  AND jsonb_typeof(wheels_data -> 'FL') = 'object'
  AND jsonb_typeof(wheels_data -> 'FR') = 'object'
  AND jsonb_typeof(wheels_data -> 'RL') = 'object'
  AND jsonb_typeof(wheels_data -> 'RR') = 'object'
  AND wheels_data -> 'FL' ?& array['brand', 'size', 'tread_depth', 'dot', 'rating']
  AND wheels_data -> 'FR' ?& array['brand', 'size', 'tread_depth', 'dot', 'rating']
  AND wheels_data -> 'RL' ?& array['brand', 'size', 'tread_depth', 'dot', 'rating']
  AND wheels_data -> 'RR' ?& array['brand', 'size', 'tread_depth', 'dot', 'rating']
);
