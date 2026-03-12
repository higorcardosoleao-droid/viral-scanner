CREATE TABLE `generated_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int,
	`theme` varchar(500) NOT NULL,
	`script` text,
	`audioUrl` varchar(500),
	`videoUrl` varchar(500),
	`status` enum('processing','ready','failed') NOT NULL DEFAULT 'processing',
	`duration` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `generated_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`assetUrl` varchar(500) NOT NULL,
	`assetType` enum('image','video') NOT NULL,
	`source` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`scriptStructure` text NOT NULL,
	`styleConfig` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `video_templates_id` PRIMARY KEY(`id`)
);
