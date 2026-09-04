-- Padh.AI + integrated DocuMind schema
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  file_name text not null,
  file_path text,
  file_url text,
  plagiarism_score double precision default 0,
  content text default '',
  created_at timestamptz not null default now()
);

create index if not exists documents_created_at_idx
  on public.documents (created_at desc);

create index if not exists documents_user_id_idx
  on public.documents (user_id);

-- Storage bucket used by the backend.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do update set public = true;

-- The backend uses the service-role key for Storage uploads and database writes.
-- Do not expose SUPABASE_SERVICE_KEY in the frontend.
