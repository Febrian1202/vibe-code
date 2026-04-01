CREATE TABLE `session` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`user_id` serial AUTO_INCREMENT NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
