ALTER TYPE "public"."membership_tier" ADD VALUE 'free' BEFORE 'standard';--> statement-breakpoint
CREATE TABLE "athlete_team_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"is_primary" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"nationality" text,
	"country_code" text,
	"birth_year" integer,
	"height_cm" integer,
	"current_team_id" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"country" text,
	"city" text,
	"lat" double precision,
	"lon" double precision,
	"website" text,
	"founded_year" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "rulesets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"description" text,
	"points_for_takedown" integer,
	"points_for_sweep" integer,
	"points_for_pass" integer,
	"points_for_mount" integer,
	"points_for_back" integer,
	"has_overtime_rules" integer DEFAULT 0,
	"overtime_rules_description" text,
	"match_duration_minutes" integer,
	"submission_only" integer DEFAULT 0,
	"gi" integer DEFAULT 1,
	"other_rules" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"year" integer NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"location" text,
	"country" text,
	"country_code" text,
	"ruleset_id" uuid,
	"edition" text,
	"website" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weight_classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" text NOT NULL,
	"min_weight_kg" integer,
	"max_weight_kg" integer,
	"gender" text NOT NULL,
	"division" text,
	"belt_level" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"weight_class_id" uuid NOT NULL,
	"athlete1_id" uuid NOT NULL,
	"athlete2_id" uuid NOT NULL,
	"winner_id" uuid,
	"result" text NOT NULL,
	"submission_type" text,
	"submission_category" text,
	"athlete1_final_score" integer DEFAULT 0,
	"athlete2_final_score" integer DEFAULT 0,
	"athlete1_advantages" integer DEFAULT 0,
	"athlete2_advantages" integer DEFAULT 0,
	"athlete1_penalties" integer DEFAULT 0,
	"athlete2_penalties" integer DEFAULT 0,
	"duration_seconds" integer,
	"round" text,
	"match_number" integer,
	"match_date" timestamp with time zone,
	"video_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"athlete_id" uuid NOT NULL,
	"technique_id" uuid,
	"event_type" text NOT NULL,
	"event_timestamp" integer,
	"points_awarded" integer DEFAULT 0,
	"advantages_awarded" integer DEFAULT 0,
	"penalties_awarded" integer DEFAULT 0,
	"position" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technique_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_category_id" uuid,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "techniques" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"category_id" uuid NOT NULL,
	"aliases" text[],
	"description" text,
	"tags" text[],
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "membership_tier" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "athlete_team_history" ADD CONSTRAINT "athlete_team_history_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athlete_team_history" ADD CONSTRAINT "athlete_team_history_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_current_team_id_teams_id_fk" FOREIGN KEY ("current_team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_ruleset_id_rulesets_id_fk" FOREIGN KEY ("ruleset_id") REFERENCES "public"."rulesets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_classes" ADD CONSTRAINT "weight_classes_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_weight_class_id_weight_classes_id_fk" FOREIGN KEY ("weight_class_id") REFERENCES "public"."weight_classes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_athlete1_id_athletes_id_fk" FOREIGN KEY ("athlete1_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_athlete2_id_athletes_id_fk" FOREIGN KEY ("athlete2_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_athletes_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_events" ADD CONSTRAINT "match_events_technique_id_techniques_id_fk" FOREIGN KEY ("technique_id") REFERENCES "public"."techniques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "techniques" ADD CONSTRAINT "techniques_category_id_technique_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."technique_categories"("id") ON DELETE no action ON UPDATE no action;