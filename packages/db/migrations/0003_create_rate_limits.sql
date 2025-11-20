create table if not exists rate_limits (
    key text primary key,
    count integer not null default 1,
    first_request timestamptz not null default now(),
    expires_at timestamptz not null
);

-- Add index for efficient cleanup of expired entries
create index if not exists rate_limits_expires_at_idx on rate_limits(expires_at);
