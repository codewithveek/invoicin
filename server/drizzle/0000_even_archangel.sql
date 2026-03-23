CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`access_token_expires_at` timestamp,
	`refresh_token_expires_at` timestamp,
	`scope` varchar(255),
	`id_token` text,
	`password` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`address` text,
	`phone` varchar(50),
	`company` varchar(255),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_events` (
	`id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`meta` json,
	`actor` varchar(20) DEFAULT 'user',
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `invoice_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoice_templates` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`items` json NOT NULL,
	`currency` varchar(10) DEFAULT 'USD',
	`terms` varchar(100),
	`notes` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `invoice_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` varchar(36) NOT NULL,
	`link_id` varchar(32) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`type` varchar(20) DEFAULT 'standard',
	`status` varchar(20) DEFAULT 'draft',
	`client_name` varchar(255) NOT NULL,
	`client_email` varchar(255),
	`client_address` text,
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0',
	`tax_type` varchar(20),
	`tax_rate` decimal(5,2),
	`tax_amount` decimal(12,2) DEFAULT '0',
	`deposit` decimal(5,2) DEFAULT '0',
	`total` decimal(12,2) NOT NULL,
	`home_rate` decimal(12,2),
	`home_total` decimal(14,2),
	`home_currency` varchar(10),
	`issue_date` date NOT NULL,
	`due_date` date,
	`paid_date` date,
	`items` json NOT NULL,
	`notes` text,
	`terms` varchar(255),
	`amount_paid` decimal(12,2) DEFAULT '0',
	`reminders_sent` int DEFAULT 0,
	`last_reminder_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_link_id_unique` UNIQUE(`link_id`),
	CONSTRAINT `invoices_link_idx` UNIQUE(`link_id`)
);
--> statement-breakpoint
CREATE TABLE `notification_prefs` (
	`user_id` varchar(36) NOT NULL,
	`invoice_viewed` boolean DEFAULT true,
	`invoice_downloaded` boolean DEFAULT true,
	`invoice_paid` boolean DEFAULT true,
	`overdue_reminders` boolean DEFAULT false,
	`reminder_day_1` boolean DEFAULT true,
	`reminder_day_7` boolean DEFAULT true,
	`reminder_day_14` boolean DEFAULT true,
	`weekly_summary` boolean DEFAULT false,
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_prefs_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `partial_payments` (
	`id` varchar(36) NOT NULL,
	`invoice_id` varchar(36) NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(10) NOT NULL,
	`note` text,
	`paid_date` date NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `partial_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`ip_address` varchar(255),
	`user_agent` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`image` varchar(500),
	`business_name` varchar(255),
	`address` text,
	`phone` varchar(50),
	`logo_url` varchar(500),
	`default_currency` varchar(10) DEFAULT 'USD',
	`home_currency` varchar(10) DEFAULT 'NGN',
	`default_terms` varchar(100) DEFAULT 'Net 14',
	`default_notes` text,
	`email_verified` boolean DEFAULT false,
	`plan` varchar(20) DEFAULT 'free',
	`onboarded` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_email_idx` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `clients_user_idx` ON `clients` (`user_id`);--> statement-breakpoint
CREATE INDEX `clients_email_idx` ON `clients` (`email`);--> statement-breakpoint
CREATE INDEX `events_invoice_idx` ON `invoice_events` (`invoice_id`);--> statement-breakpoint
CREATE INDEX `events_type_idx` ON `invoice_events` (`type`);--> statement-breakpoint
CREATE INDEX `events_created_idx` ON `invoice_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `templates_user_idx` ON `invoice_templates` (`user_id`);--> statement-breakpoint
CREATE INDEX `invoices_user_idx` ON `invoices` (`user_id`);--> statement-breakpoint
CREATE INDEX `invoices_status_idx` ON `invoices` (`status`);--> statement-breakpoint
CREATE INDEX `invoices_client_idx` ON `invoices` (`client_id`);--> statement-breakpoint
CREATE INDEX `invoices_due_date_idx` ON `invoices` (`due_date`);--> statement-breakpoint
CREATE INDEX `partial_invoice_idx` ON `partial_payments` (`invoice_id`);