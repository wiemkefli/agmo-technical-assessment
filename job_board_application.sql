-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.43 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.13.0.7147
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for job_board_application
CREATE DATABASE IF NOT EXISTS `job_board_application` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `job_board_application`;

-- Dumping structure for table job_board_application.applications
CREATE TABLE IF NOT EXISTS `applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint unsigned NOT NULL,
  `applicant_id` bigint unsigned NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'submitted',
  `resume_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_original_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_mime` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_size` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_job_id_applicant_id_unique` (`job_id`,`applicant_id`),
  KEY `applications_job_id_created_at_index` (`job_id`,`created_at`),
  KEY `applications_applicant_id_created_at_index` (`applicant_id`,`created_at`),
  CONSTRAINT `applications_applicant_id_foreign` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `applications_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.applications: ~23 rows (approximately)
INSERT IGNORE INTO `applications` (`id`, `job_id`, `applicant_id`, `message`, `status`, `resume_path`, `resume_original_name`, `resume_mime`, `resume_size`, `created_at`, `updated_at`) VALUES
	(1, 1, 7, 'Aspernatur saepe sunt nulla voluptas qui nihil. Soluta culpa vitae unde non.', 'shortlisted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(2, 1, 8, 'Unde perferendis at quae rerum suscipit id aut ut. Autem sunt laboriosam officia vitae debitis assumenda.', 'shortlisted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(3, 1, 11, 'Veniam error officiis quibusdam a adipisci quas. Et perspiciatis laudantium excepturi.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(4, 2, 11, 'Quibusdam ut eveniet qui rerum distinctio. Molestiae optio quia doloribus.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(5, 6, 6, 'Ducimus adipisci eveniet totam perspiciatis doloribus. Vero id dolore magnam impedit hic minima ut.', 'reviewed', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(6, 6, 9, 'Numquam sint voluptas rem. Velit recusandae repellat alias eum officiis.', 'reviewed', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(7, 6, 11, 'Cumque voluptas sapiente consequatur qui eos expedita. Alias nisi porro quia cupiditate incidunt.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(8, 7, 11, 'Sit dolorum explicabo laudantium animi ullam ipsum autem. Incidunt quam mollitia accusamus cumque.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(9, 7, 12, 'Explicabo consequuntur est alias ab. Voluptatum reiciendis non voluptas molestiae.', 'shortlisted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(10, 8, 6, 'Aut tenetur et praesentium praesentium unde eos. Pariatur non consectetur sapiente velit excepturi.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(11, 8, 10, 'Maiores illum in sint molestias. Ullam aut iure praesentium temporibus consequatur magnam.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(12, 9, 7, 'Libero similique id est et atque. Reiciendis unde veritatis ea porro et pariatur dignissimos tenetur.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(13, 9, 12, 'Modi et in dolor sed laboriosam. Officia aut aliquid et nostrum voluptatem nihil.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(14, 11, 11, 'Fugiat sit reprehenderit dolores saepe ut et. Qui est esse tempora.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(15, 12, 7, 'Placeat nam ratione odio commodi. Quia exercitationem facilis deleniti eius.', 'reviewed', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(16, 13, 2, 'Magnam minima voluptatem similique magni. Atque nihil inventore voluptas explicabo amet ea numquam.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(17, 14, 6, 'Voluptatem tenetur adipisci et voluptas sed commodi. Tempora quisquam reiciendis eius animi et at minima.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(18, 14, 10, 'Consequatur delectus omnis ea odit at doloremque. Error reiciendis id eum quaerat eius cumque.', 'rejected', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(19, 14, 11, 'Ipsum corporis consequatur saepe necessitatibus non. Enim quam tempora et.', 'reviewed', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(20, 16, 13, 'Voluptatem aut qui quam ut perspiciatis ex eos. Ipsum et fuga quasi eligendi.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(21, 17, 7, 'Dolorum consequatur dignissimos quisquam magnam cum. Iste a quis sint ipsam saepe.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(22, 18, 12, 'Officia adipisci animi laboriosam natus hic. Expedita sit laborum dolores aut aut vero aut cumque.', 'submitted', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(23, 19, 2, 'Accusamus labore delectus doloribus non sit ut hic. Harum nulla quam dicta tenetur.', 'reviewed', NULL, NULL, NULL, NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08');

-- Dumping structure for table job_board_application.cache
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.cache: ~0 rows (approximately)

-- Dumping structure for table job_board_application.cache_locks
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.cache_locks: ~0 rows (approximately)

-- Dumping structure for table job_board_application.failed_jobs
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.failed_jobs: ~0 rows (approximately)

-- Dumping structure for table job_board_application.job_batches
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.job_batches: ~0 rows (approximately)

-- Dumping structure for table job_board_application.jobs
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `employer_id` bigint unsigned NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salary_range` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_remote` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_status_created_at_index` (`status`,`created_at`),
  KEY `jobs_employer_id_created_at_index` (`employer_id`,`created_at`),
  KEY `jobs_employer_id_status_created_at_index` (`employer_id`,`status`,`created_at`),
  CONSTRAINT `jobs_employer_id_foreign` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.jobs: ~20 rows (approximately)
INSERT IGNORE INTO `jobs` (`id`, `employer_id`, `title`, `description`, `location`, `salary_range`, `is_remote`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
	(1, 3, 'Casting Machine Operator', 'Consequatur omnis sed pariatur et maiores ad. Architecto qui nisi consequatur iure voluptatem animi. Harum ad consequuntur necessitatibus est quisquam iure dolore. Ipsa corporis assumenda nesciunt est nisi. Minus quia hic accusantium corrupti.\n\nAut qui velit provident sapiente. Itaque laborum et aut dolor perspiciatis voluptas voluptas. Est saepe fugiat odio consequatur alias omnis consequatur.\n\nSoluta illum cum voluptas autem. Velit eum eaque nihil ab omnis illo et modi. Voluptatem at corporis eos sit magni.', 'Beattymouth', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(2, 3, 'Locksmith', 'Vero ex ea aliquam minus non ipsum aut. Accusantium omnis numquam id magni et dolor velit. Perspiciatis molestiae occaecati ea vel rerum.\n\nDistinctio excepturi ab expedita autem. Delectus nihil debitis asperiores facilis consectetur qui et fugit. Neque ut dolor fuga et aut impedit deserunt. Quaerat vitae minus delectus exercitationem.\n\nIpsa earum omnis aut amet voluptatum. Non reiciendis ut vitae rerum in est. Rerum eos rerum ducimus sequi aspernatur in alias. Sit corrupti vero dolorem iure. Architecto quas nesciunt itaque tempora veniam.', 'East Helenland', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(3, 3, 'Travel Agent', 'Inventore culpa dolor enim tempora quia quo sed non. Nulla dolorum modi quis aut quia veniam nesciunt. Nihil tempora non itaque rerum nihil et.\n\nEst ut ut aut vel. Reprehenderit omnis sequi est vel. Ratione molestiae repellat aut illum qui. Et et nesciunt assumenda rerum.\n\nNon eum optio vitae ad iure fuga provident. Molestias eos eum rerum sed eos architecto eum qui. Dolor repellendus quod necessitatibus et facilis.', 'Hirtheport', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(4, 3, 'Geoscientists', 'Non laborum id ea eveniet ut maxime. Et debitis eos corrupti recusandae officia non. At dolorum molestias tempore.\n\nSapiente vel nihil excepturi qui. Odio ut qui qui architecto in. Quis consequuntur tenetur velit explicabo. Cupiditate tenetur illum maiores ut cupiditate aut architecto.\n\nSapiente incidunt explicabo veritatis culpa sit quasi. Ea ut maxime perspiciatis et exercitationem maxime qui. Occaecati assumenda sed quisquam nihil. Laborum qui omnis corrupti tempore molestiae vel rerum.', NULL, '8000-12000 MYR', 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(5, 3, 'Construction Driller', 'Earum voluptate doloremque ut illum numquam consequatur animi et. Voluptatem placeat necessitatibus culpa.\n\nDeserunt aperiam repellat dolorem. Aut et a suscipit aut non exercitationem perferendis.\n\nModi sunt in est fugit culpa incidunt vel. Aut iste rerum tempora cumque.', 'Sengerland', NULL, 1, 'draft', NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(6, 4, 'Architectural Drafter OR Civil Drafter', 'Maxime qui quis nobis vel aliquid. Dolor magnam assumenda enim quo repudiandae repudiandae.\n\nDolor omnis nostrum consequuntur autem mollitia. Perspiciatis accusamus sit reprehenderit ut asperiores vero non. Omnis consequatur sed corporis fuga dignissimos fuga vero optio. Ut suscipit eveniet earum tempore aut qui.\n\nQuia ea in a id et. Molestiae fuga rerum alias explicabo voluptas molestiae tenetur. Voluptatem repellendus porro nostrum optio. Recusandae est aspernatur molestiae quis ab deserunt ut.', NULL, '8000-12000 MYR', 1, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(7, 4, 'Animal Breeder', 'Itaque consequuntur eius officia voluptatem. Et consequatur cupiditate aut consequatur expedita ut quia. Exercitationem suscipit omnis minima atque sed sunt a.\n\nNihil odio aut totam nam eos. Accusantium omnis voluptate quia blanditiis enim minus itaque. Excepturi eveniet libero dolor nemo et iure autem a.\n\nAb libero voluptatem explicabo nulla. Ipsam qui molestias eligendi unde minima id dolorem dolores. Laudantium at consequatur vel sunt autem tenetur ut quidem.', 'Lake Gaylordshire', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(8, 4, 'Janitorial Supervisor', 'Nemo numquam officiis quis atque. Est nobis veritatis eos odio iusto iure officia sit.\n\nNeque amet illo eveniet eius est atque praesentium. Dolorem officiis culpa ratione magnam qui ducimus. Itaque vel at ab quas et fuga. Occaecati laudantium recusandae eum. Soluta dolore velit culpa reiciendis.\n\nHarum ipsa tenetur et quo enim voluptatum. Sed aut optio officia nobis vitae illum aliquam. Quisquam atque sunt at aut labore.', 'Lake Justusview', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(9, 4, 'Geologist', 'Quia voluptatum eligendi optio qui vel distinctio exercitationem. Debitis cumque unde ea id minus et sed.\n\nEt esse ut eius ut voluptas dolorem. Vitae reiciendis aspernatur ipsum doloremque est. Qui eligendi et ut aut.\n\nPorro ut aut sed rem. Quas aut excepturi velit. Dolorem aut rem qui quia quo voluptatum doloribus aut.', 'North Laisha', NULL, 1, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(10, 4, 'Petroleum Engineer', 'Incidunt est rerum voluptate pariatur voluptatibus reiciendis velit ab. Velit sunt dolor nemo quia. Accusamus nam quidem ut. Tenetur veritatis voluptatem tenetur incidunt quos magnam vero.\n\nIn in voluptate harum expedita error et labore. Laborum facilis esse amet. Totam quos ut hic dolor id.\n\nOdit cum aliquid minus delectus. Recusandae veniam aspernatur et tempora error ea. Harum ut est facere a quam. Dolor sunt soluta quidem vel. Ut quia vero consequatur et incidunt ea harum.', 'New Willastad', NULL, 0, 'draft', NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(11, 5, 'Environmental Engineering Technician', 'Provident qui at laborum cumque sunt eos eos. Voluptates facilis earum inventore aut eaque. Ut voluptatem omnis est quae. Facilis officiis maiores error sit et ex sunt et. Voluptas quisquam nesciunt atque excepturi aut rerum voluptatibus nulla.\n\nPorro consequatur id itaque non perferendis et aperiam. Eum ut quia sit distinctio voluptatum omnis. Qui voluptas dicta quaerat tenetur perferendis sapiente. Non laudantium vel qui ut occaecati ad laborum.\n\nEa rerum est animi cumque. Ipsam laboriosam cum ut tempora. Saepe possimus sunt enim. Eius aut rerum nam et minima. Facilis minus quod dolores laborum nisi neque quia.', NULL, NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(12, 5, 'Middle School Teacher', 'Quibusdam non veritatis omnis id. Natus maxime nihil nihil libero doloribus saepe. Est officia et quia.\n\nQuam cupiditate amet voluptatibus ad magni ut ut. Rerum dolores vel libero veritatis. Et id commodi maxime ratione non qui aut ratione. Temporibus asperiores distinctio ea modi odio.\n\nAliquam laborum dicta autem vitae. Dolores ex quod molestias quia quibusdam et. Velit nemo reprehenderit non sit eius.', 'New Loren', 'Negotiable', 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(13, 5, 'Central Office and PBX Installers', 'Soluta est voluptatibus ex consequatur voluptates maiores dolores. Veniam eius fugit reprehenderit blanditiis quae ullam libero. Consequatur eos est nesciunt facilis.\n\nNisi voluptatem sint at adipisci similique. Harum animi omnis enim omnis sed laborum consectetur dolores. Praesentium accusamus ab quam beatae. Id quia aut perspiciatis ratione.\n\nMolestiae aperiam saepe fugit ad fugiat dolor non. Eveniet dignissimos facere ea. Maiores eaque mollitia velit omnis sed molestiae.', 'Burdettetown', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(14, 5, 'HR Specialist', 'Non in dolores dicta. Sed est voluptatem eligendi optio. Animi quia qui aut vel natus sed tempora magnam.\n\nMolestiae rerum eveniet perferendis sit. Facere est quis nam. Rerum quas beatae qui commodi voluptatem voluptatum quas.\n\nMaiores ut commodi consequatur quo amet. Quo dolorem animi voluptatum sunt deleniti. Molestias et quaerat deserunt velit optio quas. Qui aut asperiores odio quo.', NULL, NULL, 1, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(15, 5, 'Business Operations Specialist', 'Quos consectetur voluptas aliquam assumenda sit consequatur sed. Totam nesciunt asperiores nobis consequatur eum id vitae. Harum enim dolor quia.\n\nVeritatis odit consectetur quod nostrum. Ipsa est iusto inventore magni nostrum deleniti. Reiciendis sit expedita facilis accusamus beatae laborum debitis. Omnis qui est tempore quisquam quo. Corrupti provident repellat quis nisi necessitatibus.\n\nAb occaecati corrupti voluptatum ut. Tenetur deserunt tempore nostrum consequuntur odio dolorem est. Optio nemo labore ullam. Maxime officia vel a esse.', NULL, '3000-5000 MYR', 1, 'draft', NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(16, 1, 'Physical Therapist Assistant', 'Iure et quisquam voluptatum at. Occaecati distinctio iure ut et quis officiis odit. Consequatur voluptatem qui quo consequatur. Eius sint perferendis laborum.\n\nOdit dolorem magnam molestiae quia. Quidem quidem quidem nostrum autem veritatis necessitatibus at ut. Est ea eligendi nemo mollitia aperiam voluptates reiciendis. Ullam voluptatem sunt accusantium voluptatem velit expedita molestias.\n\nCorrupti qui fuga assumenda vero. Voluptatum quibusdam enim aut est sed. Aut et animi officia nam dolores quia ipsum autem.', 'East Reva', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(17, 1, 'Electrotyper', 'Dolor sunt omnis earum sit deleniti. Commodi repellat deleniti perspiciatis culpa perferendis dolor. Nam magnam sunt in sint modi et a perspiciatis. Sed et illum ea ea.\n\nIn omnis fuga est occaecati quaerat amet. Consequatur nisi nobis voluptate eum laudantium. Labore vitae aut consequatur enim deserunt aperiam. Magni illum voluptas minus qui.\n\nPossimus ipsam reiciendis sint nisi ea voluptas inventore eveniet. Et nesciunt non voluptas. Sapiente aut est qui explicabo qui.', NULL, '5000-8000 MYR', 1, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(18, 1, 'Painting Machine Operator', 'Labore totam repudiandae consequatur impedit. Eos commodi animi eos adipisci doloremque. Aliquam et iure quo in. Esse impedit rem eaque a libero sunt.\n\nEaque error cupiditate fugit et. Nemo fuga voluptas itaque necessitatibus sit. Qui vero eos et ad praesentium sequi.\n\nDoloribus id sint veritatis explicabo. Vitae possimus rerum ut esse. Earum exercitationem eos modi quis.', 'Kubbury', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(19, 1, 'Command Control Center Specialist', 'Et nisi numquam dolor sit cumque quia voluptas. Et nisi pariatur non est ducimus. Velit aut natus est perspiciatis modi est facilis. Et fuga omnis et suscipit praesentium.\n\nExercitationem consequatur fuga est fuga. Earum tempora qui aperiam eius. Tenetur sed enim quasi et accusamus aspernatur.\n\nLaboriosam totam saepe maiores explicabo. Reprehenderit ut sunt saepe fugit qui. Sed accusamus et enim quis ullam et voluptatibus expedita. Facere sunt distinctio quas laborum id consequuntur dolores ipsa.', 'South Jolie', NULL, 0, 'published', '2025-12-11 22:45:08', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(20, 1, 'Loan Officer', 'Inventore et possimus ad quia voluptas suscipit. Delectus cupiditate sed illum temporibus fuga possimus inventore. Consequatur voluptas rem eveniet sint. Natus recusandae aperiam rerum et officiis ullam quidem. Molestiae sit quidem qui animi sit.\n\nSit repudiandae aut quis natus. Ea cumque consectetur commodi odio. Est et voluptas ullam aliquam et sed officiis. Iusto est velit doloremque dolores.\n\nDeserunt a quia nam sunt. Odio distinctio provident sit fugiat et et minus. Est quidem autem accusamus nobis autem et. Neque corrupti sunt quis consequuntur aliquam.', NULL, '8000-12000 MYR', 0, 'draft', NULL, '2025-12-11 22:45:08', '2025-12-11 22:45:08');

-- Dumping structure for table job_board_application.migrations
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.migrations: ~6 rows (approximately)
INSERT IGNORE INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2025_12_12_062126_add_role_to_users_table', 1),
	(5, '2025_12_12_062127_create_jobs_table', 1),
	(6, '2025_12_12_062128_create_applications_table', 1);

-- Dumping structure for table job_board_application.password_reset_tokens
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.password_reset_tokens: ~0 rows (approximately)

-- Dumping structure for table job_board_application.queue_jobs
CREATE TABLE IF NOT EXISTS `queue_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `queue_jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.queue_jobs: ~0 rows (approximately)

-- Dumping structure for table job_board_application.sessions
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.sessions: ~0 rows (approximately)

-- Dumping structure for table job_board_application.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'applicant',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table job_board_application.users: ~13 rows (approximately)
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'Demo Employer', 'employer@example.com', '2025-12-11 22:45:07', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'employer', 'EpYP5n0Yka', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(2, 'Demo Applicant', 'applicant@example.com', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', '7pSzRS1eaV', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(3, 'Eldon Oberbrunner', 'connor62@example.com', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'employer', 'OpNJtxSN6S', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(4, 'Rene Schiller', 'joan06@example.com', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'employer', '1KL0WA6HGo', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(5, 'Reginald Altenwerth', 'judson.green@example.org', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'employer', 'SPR3bQUFMb', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(6, 'Isadore Kovacek I', 'erobel@example.org', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'bzidCvCsGx', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(7, 'Ismael Rowe II', 'ecasper@example.org', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'ntB8qihmkx', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(8, 'Enos Fadel DDS', 'towne.garrett@example.com', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'tXXMVoUZfY', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(9, 'Shanon Kutch', 'osinski.augustus@example.net', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'u0SjQ1Nepp', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(10, 'Reynold Jenkins', 'arolfson@example.com', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', '0E3U51hVpO', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(11, 'Margarette Mraz II', 'ona.gleason@example.net', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'nOXS5EnKeD', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(12, 'Heidi Harvey', 'murray.gabrielle@example.org', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'XmVRmzrqee', '2025-12-11 22:45:08', '2025-12-11 22:45:08'),
	(13, 'Erick Moore', 'abner46@example.net', '2025-12-11 22:45:08', '$2y$12$zHPitqnf6N09wD83897yfeyC68tU3oQxsG9vyU8UWXPptczaxthnO', 'applicant', 'eVFPVuuvzl', '2025-12-11 22:45:08', '2025-12-11 22:45:08');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
