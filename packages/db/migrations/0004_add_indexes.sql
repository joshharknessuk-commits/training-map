-- Add indexes to gyms table
create index if not exists gyms_borough_idx on gyms(borough);
create index if not exists gyms_lat_lon_idx on gyms(lat, lon);

-- Add indexes to users table
create index if not exists users_stripe_customer_id_idx on users(stripe_customer_id);
create index if not exists users_membership_status_idx on users(membership_status);

-- Add indexes to check_ins table
create index if not exists check_ins_user_id_idx on check_ins(user_id);
create index if not exists check_ins_open_mat_id_idx on check_ins(open_mat_id);
create index if not exists check_ins_qr_slug_idx on check_ins(qr_slug);
create index if not exists check_ins_created_at_idx on check_ins(created_at);

-- Add indexes to gym_payouts table
create index if not exists gym_payouts_gym_id_idx on gym_payouts(gym_id);
create index if not exists gym_payouts_status_scheduled_for_idx on gym_payouts(status, scheduled_for);

-- Add indexes to open_mats table
create index if not exists open_mats_gym_id_idx on open_mats(gym_id);
create index if not exists open_mats_status_starts_at_idx on open_mats(status, starts_at);
