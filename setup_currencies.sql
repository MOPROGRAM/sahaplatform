-- Insert SAR currency if it doesn't exist
INSERT INTO public.currencies (code, symbol, name, name_ar, name_en, is_active)
SELECT 'SAR', 'ر.س', 'Saudi Riyal', 'ريال سعودي', 'Saudi Riyal', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.currencies WHERE code = 'SAR'
);

-- Insert USD currency if it doesn't exist
INSERT INTO public.currencies (code, symbol, name, name_ar, name_en, is_active)
SELECT 'USD', '$', 'US Dollar', 'دولار أمريكي', 'US Dollar', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.currencies WHERE code = 'USD'
);

-- Insert default country (Saudi Arabia) if it doesn't exist, linked to SAR
WITH sar_currency AS (
    SELECT id FROM public.currencies WHERE code = 'SAR' LIMIT 1
)
INSERT INTO public.countries (name, name_ar, name_en, code, phone_code, currency_id, is_active)
SELECT 'Saudi Arabia', 'المملكة العربية السعودية', 'Saudi Arabia', 'SA', '+966', sar_currency.id, true
FROM sar_currency
WHERE NOT EXISTS (
    SELECT 1 FROM public.countries WHERE code = 'SA'
);
