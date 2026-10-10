CREATE TABLE `exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`muscle_group` text NOT NULL,
	`equipment` text,
	`is_custom` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`split_day_id` text,
	`split_day_name` text,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	`notes` text,
	`duration_seconds` integer,
	`total_volume` real,
	`pr_count` integer DEFAULT 0,
	FOREIGN KEY (`split_day_id`) REFERENCES `split_days`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `set_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`set_number` integer NOT NULL,
	`weight` real,
	`reps` integer,
	`rpe` real,
	`is_pr` integer DEFAULT false,
	`completed_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `split_day_exercises` (
	`id` text PRIMARY KEY NOT NULL,
	`split_day_id` text NOT NULL,
	`exercise_id` text NOT NULL,
	`order` integer NOT NULL,
	`target_sets` integer,
	`target_reps` text,
	`rest_seconds` integer DEFAULT 90,
	`notes` text,
	FOREIGN KEY (`split_day_id`) REFERENCES `split_days`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `split_days` (
	`id` text PRIMARY KEY NOT NULL,
	`split_id` text NOT NULL,
	`name` text NOT NULL,
	`day_order` integer NOT NULL,
	`is_rest_day` integer DEFAULT false,
	FOREIGN KEY (`split_id`) REFERENCES `splits`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `splits` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_preset` integer DEFAULT false,
	`is_active` integer DEFAULT false,
	`schedule` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `streak_history` (
	`day_key` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`session_id` text,
	`xp_earned` integer DEFAULT 0,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `streak_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`current_streak` integer DEFAULT 0,
	`longest_streak` integer DEFAULT 0,
	`last_log_day_key` text,
	`freezes_available` integer DEFAULT 0,
	`freezes_used` integer DEFAULT 0,
	`xp` integer DEFAULT 0,
	`level` integer DEFAULT 1,
	`total_sessions` integer DEFAULT 0,
	`total_volume` real DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `xp_events` (
	`id` text PRIMARY KEY NOT NULL,
	`event_type` text NOT NULL,
	`xp_amount` integer NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
