-- Add password_changed_at column for session invalidation
-- When password is changed, this timestamp is updated
-- Auth system checks if JWT was issued before this timestamp
-- and invalidates the session if it was

ALTER TABLE "users" ADD COLUMN "password_changed_at" timestamptz;
