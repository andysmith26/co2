-- profiles.sql
-- This migration creates the profiles table for user profile data

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS for profiles table
alter table profiles enable row level security;

-- Create RLS policy for profiles
create policy "Users can view their own profile" 
on profiles for select 
using (auth.uid() = id);

create policy "Users can update their own profile" 
on profiles for update 
using (auth.uid() = id);

create policy "Users can insert their own profile" 
on profiles for insert 
with check (auth.uid() = id);

-- Create function to handle new user profiles
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();