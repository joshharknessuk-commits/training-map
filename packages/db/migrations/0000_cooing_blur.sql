CREATE TYPE "public"."membership_status" AS ENUM('active', 'grace', 'paused', 'past_due', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."membership_tier" AS ENUM('standard', 'pro', 'academy');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'gym_admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."open_mat_status" AS ENUM('scheduled', 'live', 'complete', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payout_status" AS ENUM('pending', 'processing', 'paid', 'failed');--> statement-breakpoint
CREATE TYPE "public"."belt_rank" AS ENUM('white', 'blue', 'purple', 'brown', 'black', 'coral', 'red');--> statement-breakpoint
CREATE TYPE "public"."weight_class" AS ENUM('rooster', 'light_feather', 'feather', 'light', 'middle', 'medium_heavy', 'heavy', 'super_heavy', 'ultra_heavy');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('scheduled', 'ongoing', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."class_type" AS ENUM('gi', 'nogi', 'open_mat', 'competition_training', 'fundamentals', 'advanced', 'beginners', 'all_levels', 'drilling', 'sparring', 'women_only', 'kids');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('confirmed', 'pending', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending', 'refunded', 'free');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('booking_created', 'class_attended', 'gym_visited', 'belt_promotion', 'connection_made', 'achievement_unlocked', 'review_posted');--> statement-breakpoint
CREATE TYPE "public"."gym_role" AS ENUM('owner', 'manager', 'instructor', 'staff');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"lat" double precision NOT NULL,
	"lon" double precision NOT NULL,
	"borough" text,
	"website" text,
	"extra_websites" text[],
	"osm_url" text,
	"nearest_transport" text,
	"tags" jsonb,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text,
	"first_name" text,
	"last_name" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"email_verified" timestamp with time zone,
	"stripe_customer_id" text,
	"membership_status" "membership_status" DEFAULT 'grace' NOT NULL,
	"membership_tier" "membership_tier" DEFAULT 'standard' NOT NULL,
	"active_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "open_mats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "open_mat_status" DEFAULT 'scheduled' NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"capacity" integer,
	"qr_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "open_mats_qr_slug_unique" UNIQUE("qr_slug")
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"open_mat_id" uuid NOT NULL,
	"qr_slug" text NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gym_payouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"status" "payout_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text,
	"bio" text,
	"belt_rank" "belt_rank",
	"stripes" integer DEFAULT 0,
	"weight_kg" integer,
	"weight_class" "weight_class",
	"years_training" integer,
	"home_gym_id" uuid,
	"avatar_url" text,
	"instagram_handle" text,
	"preferred_training_times" text[],
	"training_goals" text[],
	"is_public" integer DEFAULT 1 NOT NULL,
	"city" text DEFAULT 'London',
	"postcode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"instructor_name" text,
	"class_type" "class_type" NOT NULL,
	"day_of_week" "day_of_week",
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"specific_date" timestamp with time zone,
	"capacity" integer NOT NULL,
	"current_bookings" integer DEFAULT 0 NOT NULL,
	"price_per_session" double precision NOT NULL,
	"is_free_for_members" integer DEFAULT 0 NOT NULL,
	"status" "class_status" DEFAULT 'scheduled' NOT NULL,
	"is_recurring" integer DEFAULT 1 NOT NULL,
	"is_active" integer DEFAULT 1 NOT NULL,
	"min_belt_rank" text,
	"max_capacity" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"booking_date" timestamp with time zone NOT NULL,
	"booking_status" "booking_status" DEFAULT 'confirmed' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"amount_paid" double precision DEFAULT 0 NOT NULL,
	"stripe_payment_intent_id" text,
	"checked_in_at" timestamp with time zone,
	"user_notes" text,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"status" "connection_status" DEFAULT 'accepted' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activity_feed" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"gym_id" uuid,
	"class_id" uuid,
	"booking_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"metadata" text,
	"is_public" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gym_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gym_id" uuid NOT NULL,
	"role" "gym_role" DEFAULT 'staff' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gym_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gym_id" uuid NOT NULL,
	"description" text,
	"facilities" text[],
	"amenities" text[],
	"logo_url" text,
	"cover_image_url" text,
	"gallery_images" text[],
	"phone" text,
	"email" text,
	"instagram_handle" text,
	"facebook_url" text,
	"drop_in_price" integer,
	"monthly_membership_price" integer,
	"has_free_trial" integer DEFAULT 0 NOT NULL,
	"requires_gi_for_gi_class" integer DEFAULT 1 NOT NULL,
	"allows_drop_ins" integer DEFAULT 1 NOT NULL,
	"covid_policies" text,
	"total_members" integer DEFAULT 0,
	"avg_class_size" integer DEFAULT 0,
	"is_verified" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gym_profiles_gym_id_unique" UNIQUE("gym_id")
);
--> statement-breakpoint
ALTER TABLE "open_mats" ADD CONSTRAINT "open_mats_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_open_mat_id_open_mats_id_fk" FOREIGN KEY ("open_mat_id") REFERENCES "public"."open_mats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_payouts" ADD CONSTRAINT "gym_payouts_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_feed" ADD CONSTRAINT "activity_feed_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_admins" ADD CONSTRAINT "gym_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_admins" ADD CONSTRAINT "gym_admins_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gym_profiles" ADD CONSTRAINT "gym_profiles_gym_id_gyms_id_fk" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id") ON DELETE cascade ON UPDATE no action;