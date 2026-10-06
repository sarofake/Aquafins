-- Migration 007: Contact Messages Table
create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text not null,
  phone       text not null,
  email       text default '',
  topic       text default 'General Inquiry',
  message     text not null,
  status      text not null default 'unread',
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.contact_messages enable row level security;

-- Allow insert policy for public submission
create policy "Allow public contact message submission"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);
