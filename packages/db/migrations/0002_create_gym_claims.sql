create table if not exists gym_claims (
    id uuid primary key default gen_random_uuid(),
    gym_id uuid not null references gyms(id) on delete cascade,
    claimant_name text not null,
    claimant_email text not null,
    proof_url text,
    message text,
    created_at timestamptz not null default now()
);

-- Add indexes
create index if not exists gym_claims_gym_id_idx on gym_claims(gym_id);
create index if not exists gym_claims_claimant_email_idx on gym_claims(claimant_email);
