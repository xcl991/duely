-- Add push_subscriptions table to production MySQL database
-- Run this on your production VPS

CREATE TABLE IF NOT EXISTS `push_subscriptions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `endpoint` VARCHAR(500) NOT NULL,
  `p256dh` VARCHAR(191) NOT NULL,
  `auth` VARCHAR(191) NOT NULL,
  `userAgent` TEXT,
  `deviceName` VARCHAR(191) DEFAULT 'Browser',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE KEY `push_subscriptions_endpoint_key` (`endpoint`),
  KEY `push_subscriptions_userId_idx` (`userId`),
  KEY `push_subscriptions_endpoint_idx` (`endpoint`),

  CONSTRAINT `push_subscriptions_userId_fkey`
    FOREIGN KEY (`userId`)
    REFERENCES `User` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
