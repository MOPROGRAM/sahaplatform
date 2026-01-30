-- Create a stored procedure to increment ad views atomically
CREATE OR REPLACE FUNCTION increment_ad_views(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads
  SET views = views + 1
  WHERE id = ad_id;
END;
$$;
