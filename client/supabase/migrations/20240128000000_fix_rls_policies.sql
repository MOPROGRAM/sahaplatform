-- Enable RLS on core tables if not already enabled
alter table if exists users enable row level security;
alter table if exists ads enable row level security;
alter table if exists cities enable row level security;
alter table if exists currencies enable row level security;
alter table if exists countries enable row level security;

-- Drop existing policies if they conflict (optional, but safer for a "fix it now" script)
drop policy if exists "Public read access" on users;
drop policy if exists "Public read access" on ads;
drop policy if exists "Public read access" on cities;
drop policy if exists "Public read access" on currencies;
drop policy if exists "Public read access" on countries;

-- Create "SELECT for everyone" policies
create policy "Public read access"
  on users for select
  using ( true );

create policy "Public read access"
  on ads for select
  using ( true );

create policy "Public read access"
  on cities for select
  using ( true );

create policy "Public read access"
  on currencies for select
  using ( true );

create policy "Public read access"
  on countries for select
  using ( true );
