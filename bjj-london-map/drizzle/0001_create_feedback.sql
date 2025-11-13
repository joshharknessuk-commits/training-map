create table if not exists feedback (
    id uuid primary key default gen_random_uuid(),
    name text,
    email text,
    message text not null,
    created_at timestamptz not null default now()
);
