# Backend Documentation - Saha Platform

## Overview
The Saha platform uses Supabase as its backend database and authentication provider. All data operations are performed client-side using the Supabase JavaScript client.

## Database Schema

### Ads Table
```sql
CREATE TABLE ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  category TEXT,
  location TEXT,
  images_urls TEXT[],
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read ads
CREATE POLICY "Anyone can view ads" ON ads FOR SELECT USING (true);

-- Only authenticated users can insert ads
CREATE POLICY "Authenticated users can insert ads" ON ads FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Supabase Storage
- **Bucket Name**: `ads-images`
- **Public Access**: Enabled for reading images
- **File Upload**: Images are uploaded via client-side code using `supabase.storage.from('ads-images').upload()`

## Authentication
- Uses Supabase Auth for user registration and login
- JWT tokens are managed automatically by Supabase client
- User sessions are stored in localStorage

## API Flow

### Fetching Ads
```typescript
const { data, error } = await supabase
  .from('ads')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(20);
```

### Creating Ads
1. Upload images to Supabase Storage
2. Get public URLs for uploaded images
3. Insert ad record with image URLs array

### Authentication
```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Register
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name } },
});
```

## Adding New Tables
1. Create table in Supabase Dashboard or via SQL
2. Enable RLS if needed
3. Create policies for access control
4. Update `database.types.ts` with new table types
5. Update client code to use new table

## Environment Variables
Set in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Error Handling
All Supabase operations include error handling. Network issues are caught and displayed to users.

## Performance Optimization
- All queries are optimized with proper indexing
- Images are served from Supabase CDN
- Client-side caching is handled by Supabase