
-- Search for "Invalid conversation" in function definitions
SELECT proname, prosrc 
FROM pg_proc 
WHERE prosrc ILIKE '%Invalid conversation%';
