CREATE DATABASE  IF NOT EXISTS `rozi_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rozi_db`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: rozi_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conversation_messages`
--

DROP TABLE IF EXISTS `conversation_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_conversation_messages_conv` (`conversation_id`,`created_at`),
  CONSTRAINT `conversation_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_messages`
--

LOCK TABLES `conversation_messages` WRITE;
/*!40000 ALTER TABLE `conversation_messages` DISABLE KEYS */;
INSERT INTO `conversation_messages` VALUES (16,7,'user','How much did I spend on fuel this week?','2026-07-31 09:55:47'),(17,7,'assistant','You spent Rs. 1600 on fuel this week.','2026-07-31 09:55:49'),(18,8,'user','What\'s my net profit this month?','2026-08-03 11:46:47'),(19,8,'assistant','Your net profit this month is Rs. 800.','2026-08-03 11:46:48'),(20,8,'user','Okay great','2026-08-03 11:46:57'),(21,8,'assistant','Is there anything else you\'d like to know about your earnings or fuel costs?','2026-08-03 11:46:58'),(22,9,'user','What\'s my net profit this month?','2026-08-05 20:47:58'),(23,9,'assistant','Your net profit this month is Rs. 800.','2026-08-05 20:47:59'),(24,9,'user','tell me about all earnings that I completed till last month','2026-08-05 20:48:22'),(25,9,'assistant','Your total earnings for last month are Rs. 10513. Here\'s the breakdown by platform: \n- Careem: Rs. 5100 \n- Indrive: Rs. 2623 \n- Foodpanda: Rs. 1860 \n- Bykea: Rs. 930','2026-08-05 20:48:24'),(26,10,'user','How much did I earn this week?','2026-08-05 21:09:11'),(27,10,'assistant','You earned a total of Rs. 900 this week. The breakdown is as follows: \n- Bykea: Rs. 500 \n- Foodpanda: Rs. 200 \n- Indrive: Rs. 200','2026-08-05 21:09:12'),(28,10,'user','Great!','2026-08-05 21:09:24'),(29,10,'assistant','You earned a total of Rs. 900 this week. The breakdown is as follows: \n- Bykea: Rs. 500 \n- Foodpanda: Rs. 200 \n- Indrive: Rs. 200','2026-08-05 21:09:24'),(30,10,'user','Okay','2026-08-05 21:09:32'),(31,10,'assistant','I\'m happy to help you with any other questions about your earnings or fuel costs. Is there anything else you\'d like to know?','2026-08-05 21:09:32'),(32,10,'user','whats your name?','2026-08-05 21:09:40'),(33,10,'assistant','My name is Rozi Assistant. I\'m a helpful AI assistant for ride-hailing and delivery captains in Pakistan who use the Rozi app to track their earnings and fuel costs.','2026-08-05 21:09:41'),(34,10,'user','Good','2026-08-05 21:09:51'),(35,10,'assistant','I\'m glad you think so. If you have any other questions or need help with anything else, feel free to ask!','2026-08-05 21:09:52'),(36,11,'user','Hi Rozi? how are you','2026-08-12 22:23:09'),(37,11,'assistant','I\'m doing well, thanks for asking. How can I help you today? Do you need to check your earnings or fuel summary for a specific period?','2026-08-12 22:23:10'),(38,11,'user','tell me the todays rides and expense and profit margins','2026-08-12 22:23:36'),(39,11,'assistant','Your total earnings for today are Rs. 2020, with a breakdown of Rs. 1200 from Careem, Rs. 500 from Bykea, Rs. 200 from Foodpanda, and Rs. 120 from Indrive. Your total fuel spend for today is Rs. 700. Your net profit for today is Rs. 1320.','2026-08-12 22:23:37'),(40,11,'user','thank you','2026-08-12 22:23:52'),(41,11,'assistant','You\'re welcome. If you need to check your earnings or fuel summary for a different period, just let me know. Have a great day and safe driving!','2026-08-12 22:23:52'),(42,12,'user','How much did I spend on fuel this week?','2026-08-12 22:24:07'),(43,12,'assistant','You spent Rs. 700 on fuel this week.','2026-08-12 22:24:08');
/*!40000 ALTER TABLE `conversation_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) DEFAULT 'New Conversation',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (6,3,'New Conversation','2026-07-31 09:55:13','2026-07-31 09:55:13'),(7,3,'How much did I spend on fuel this week?','2026-07-31 09:55:44','2026-07-31 09:55:49'),(8,3,'What\'s my net profit this month?','2026-08-03 11:46:43','2026-08-03 11:46:58'),(9,3,'What\'s my net profit this month?','2026-08-05 20:47:55','2026-08-05 20:48:24'),(10,3,'How much did I earn this week?','2026-08-05 21:09:11','2026-08-05 21:09:52'),(11,3,'Hi Rozi? how are you','2026-08-12 22:23:00','2026-08-12 22:23:52'),(12,3,'How much did I spend on fuel this week?','2026-08-12 22:24:07','2026-08-12 22:24:08');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `device_tokens`
--

DROP TABLE IF EXISTS `device_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `device_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `fcm_token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `fcm_token` (`fcm_token`),
  KEY `idx_device_tokens_user` (`user_id`),
  CONSTRAINT `device_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=246 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `device_tokens`
--

LOCK TABLES `device_tokens` WRITE;
/*!40000 ALTER TABLE `device_tokens` DISABLE KEYS */;
INSERT INTO `device_tokens` VALUES (39,3,'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ1ZkBnbWFpbC5jb20iLCJpYXQiOjE3ODM0MjQ4MzAsImV4cCI6MTc4NDAyOTYzMH0.JLoX4v7In0n-Q_IgO0455s47HFimzKJsJCgvH9g4rzs','2026-07-07 11:48:28'),(241,3,'fNIExwQ36hR0jSrl8HVoBc:APA91bHsi9bUmtJqQW2XOkCxBdYZWvL5vGyo0xsNMaVof6akxsDb0-w1r3Y37iF9pIhD56evsWyvzftceUnh_6roulG1BpL80yjHmp7G45E2gZ361Kd7sgQ','2026-08-12 22:20:19');
/*!40000 ALTER TABLE `device_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `earnings`
--

DROP TABLE IF EXISTS `earnings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `earnings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `platform_id` int NOT NULL,
  `date` date NOT NULL,
  `gross_amount` decimal(10,2) NOT NULL,
  `ride_count` int DEFAULT '0',
  `hours_worked` decimal(4,2) DEFAULT '0.00',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `platform_id` (`platform_id`),
  CONSTRAINT `earnings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `earnings_ibfk_2` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `earnings`
--

LOCK TABLES `earnings` WRITE;
/*!40000 ALTER TABLE `earnings` DISABLE KEYS */;
INSERT INTO `earnings` VALUES (2,3,12,'2026-06-26',2000.00,2,4.00,'Its a very hard day','2026-06-26 13:26:21'),(3,3,12,'2026-06-27',2000.00,2,4.00,'Good Earning','2026-06-27 10:09:04'),(4,3,14,'2026-06-28',700.00,8,5.00,'Good Earning','2026-06-28 22:23:30'),(5,3,16,'2026-06-28',3000.00,10,8.00,'Taken max rides','2026-06-28 22:23:59'),(6,3,15,'2026-06-28',300.00,2,2.00,NULL,'2026-06-28 22:24:12'),(7,3,14,'2026-06-29',500.00,4,3.00,'Good day','2026-06-29 10:52:19'),(8,3,15,'2026-07-06',200.00,1,1.00,NULL,'2026-07-06 08:40:03'),(9,3,12,'2026-07-06',800.00,2,4.00,NULL,'2026-07-06 09:29:19'),(10,3,12,'2026-07-06',400.00,1,2.00,'one person only','2026-07-06 09:30:47'),(11,3,14,'2026-07-06',160.00,2,2.00,'Delivered food carefully','2026-07-06 09:49:06'),(12,3,16,'2026-07-06',800.00,2,2.00,NULL,'2026-07-06 09:49:53'),(13,3,14,'2026-07-07',300.00,2,3.00,NULL,'2026-07-07 09:58:00'),(14,3,16,'2026-07-07',500.00,1,1.00,NULL,'2026-07-07 10:26:42'),(15,3,15,'2026-07-07',150.00,1,1.00,NULL,'2026-07-07 10:28:03'),(16,3,16,'2026-07-07',323.00,1,1.00,NULL,'2026-07-07 10:42:18'),(17,3,12,'2026-07-07',200.00,1,1.00,NULL,'2026-07-07 10:43:29'),(18,3,14,'2026-07-07',200.00,1,1.00,NULL,'2026-07-07 10:49:39'),(19,3,14,'2026-07-07',200.00,1,1.00,'it was a great experience','2026-07-07 10:52:58'),(20,3,14,'2026-07-07',300.00,2,2.00,NULL,'2026-07-07 11:04:43'),(21,3,14,'2026-07-07',500.00,4,4.00,NULL,'2026-07-07 11:06:55'),(22,3,12,'2026-07-07',200.00,1,1.00,NULL,'2026-07-07 11:15:29'),(23,3,15,'2026-07-07',200.00,1,1.00,NULL,'2026-07-07 11:32:24'),(24,3,15,'2026-07-07',80.00,1,1.00,NULL,'2026-07-07 11:35:49'),(25,3,12,'2026-07-07',500.00,3,4.00,'Thunder test','2026-07-07 11:57:13'),(26,3,14,'2026-07-16',200.00,1,2.00,NULL,'2026-07-16 12:14:09'),(27,5,26,'2026-07-26',100.00,1,1.00,NULL,'2026-07-26 22:22:55'),(28,5,24,'2026-07-26',1200.00,1,2.00,'Good Ride','2026-07-26 22:23:49'),(29,3,15,'2026-07-26',300.00,2,3.00,NULL,'2026-07-26 22:29:12'),(30,3,12,'2026-07-29',1000.00,1,2.00,NULL,'2026-07-29 22:20:54'),(31,3,12,'2026-07-29',2000.00,3,5.00,NULL,'2026-07-29 22:21:15'),(33,3,12,'2026-08-01',1000.00,1,1.50,NULL,'2026-08-01 21:24:39'),(34,3,14,'2026-08-03',200.00,1,1.00,'Got a good tip','2026-08-03 11:45:10'),(35,3,16,'2026-08-05',200.00,1,1.00,NULL,'2026-08-05 20:34:31'),(36,3,15,'2026-08-05',500.00,1,2.00,NULL,'2026-08-05 21:03:55'),(37,3,12,'2026-08-12',1200.00,1,2.00,'Good day','2026-08-12 22:20:52'),(38,3,15,'2026-08-12',500.00,1,1.00,NULL,'2026-08-12 22:21:14'),(39,3,14,'2026-08-12',200.00,1,1.00,NULL,'2026-08-12 22:21:26'),(40,3,16,'2026-08-12',120.00,1,1.00,NULL,'2026-08-12 22:21:39');
/*!40000 ALTER TABLE `earnings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_logs`
--

DROP TABLE IF EXISTS `fuel_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `liters` decimal(5,2) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fuel_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_logs`
--

LOCK TABLES `fuel_logs` WRITE;
/*!40000 ALTER TABLE `fuel_logs` DISABLE KEYS */;
INSERT INTO `fuel_logs` VALUES (1,3,'2026-06-26',500.00,3.50,'Petrol pump near Johar Town','2026-06-26 13:27:25'),(2,3,'2026-06-26',1000.00,4.00,'Expensive Petrol','2026-06-26 13:28:14'),(4,3,'2026-06-27',700.00,2.20,'Near Thokar Niaz Baig','2026-06-27 10:13:53'),(5,3,'2026-06-29',150.00,0.50,NULL,'2026-06-29 10:52:47'),(6,3,'2026-07-06',600.00,2.00,NULL,'2026-07-06 09:51:01'),(7,3,'2026-07-26',150.00,0.50,NULL,'2026-07-26 22:29:42'),(8,3,'2026-07-29',1200.00,3.00,NULL,'2026-07-29 22:21:34'),(9,3,'2026-07-30',400.00,3.20,'Shell','2026-07-30 21:24:05'),(10,3,'2026-08-01',300.00,0.90,'Shell Pump','2026-08-01 21:25:10'),(11,3,'2026-08-03',100.00,NULL,'PSO Pump, Ichra','2026-08-03 11:45:32'),(12,3,'2026-08-05',200.00,0.70,NULL,'2026-08-05 20:34:49'),(13,3,'2026-08-12',700.00,2.00,'Faisal Town, shell','2026-08-12 22:22:03');
/*!40000 ALTER TABLE `fuel_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) DEFAULT 'general',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,'Earnings Added','You logged Rs. 200 from Bykea.','earnings_alert',1,'2026-07-06 08:40:03'),(2,3,'Earnings Added','You logged Rs. 800 from Careem.','earnings_alert',1,'2026-07-06 09:29:19'),(3,3,'Earnings Added','You logged Rs. 400 from Careem.','earnings_alert',1,'2026-07-06 09:30:47'),(4,3,'Earnings Added','You logged Rs. 160 from Foodpanda.','earnings_alert',1,'2026-07-06 09:49:06'),(5,3,'Earnings Added','You logged Rs. 800 from Indrive.','earnings_alert',1,'2026-07-06 09:49:53'),(6,3,'Earnings Added','You logged Rs. 300 from Foodpanda.','earnings_alert',1,'2026-07-07 09:58:00'),(7,3,'Earnings Added','You logged Rs. 500 from Indrive.','earnings_alert',1,'2026-07-07 10:26:42'),(8,3,'Earnings Added','You logged Rs. 150 from Bykea.','earnings_alert',1,'2026-07-07 10:28:03'),(9,3,'Earnings Added','You logged Rs. 323 from Indrive.','earnings_alert',1,'2026-07-07 10:42:18'),(10,3,'Earnings Added','You logged Rs. 200 from Careem.','earnings_alert',1,'2026-07-07 10:43:29'),(11,3,'Earnings Added','You logged Rs. 200 from Foodpanda.','earnings_alert',1,'2026-07-07 10:49:39'),(12,3,'Earnings Added','You logged Rs. 200 from Foodpanda.','earnings_alert',1,'2026-07-07 10:52:58'),(13,3,'Earnings Added','You logged Rs. 300 from Foodpanda.','earnings_alert',1,'2026-07-07 11:04:43'),(14,3,'Earnings Added','You logged Rs. 500 from Foodpanda.','earnings_alert',1,'2026-07-07 11:06:55'),(15,3,'Earnings Added','You logged Rs. 200 from Careem.','earnings_alert',1,'2026-07-07 11:15:29'),(16,3,'Earnings Added','You logged Rs. 200 from Bykea.','earnings_alert',1,'2026-07-07 11:32:24'),(17,3,'Earnings Added','You logged Rs. 80 from Bykea.','earnings_alert',1,'2026-07-07 11:35:49'),(18,3,'Earnings Added','You logged Rs. 500 from Careem.','earnings_alert',1,'2026-07-07 11:57:13'),(19,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-16 11:23:56'),(20,3,'Earnings Added','You logged Rs. 200 from Foodpanda.','earnings_alert',1,'2026-07-16 12:14:09'),(21,3,'Weekly Summary','This week: Rs. 200 earned from 1 rides, Rs. 0 fuel cost, Rs. 200 net profit.','weekly_summary',1,'2026-07-16 12:20:25'),(22,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-17 12:26:16'),(23,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-18 16:07:57'),(24,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-19 20:19:46'),(25,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-26 21:09:23'),(26,5,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',0,'2026-07-26 22:22:04'),(27,5,'Earnings Added','You logged Rs. 100 from Foodpanda.','earnings_alert',0,'2026-07-26 22:22:55'),(28,5,'Earnings Added','You logged Rs. 1200 from Careem.','earnings_alert',0,'2026-07-26 22:23:49'),(29,3,'Earnings Added','You logged Rs. 300 from Bykea.','earnings_alert',1,'2026-07-26 22:29:12'),(30,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-29 10:17:52'),(31,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-07-29 21:13:48'),(32,3,'Earnings Added','You logged Rs. 1000 from Careem.','earnings_alert',1,'2026-07-29 22:20:54'),(33,3,'Earnings Added','You logged Rs. 2000 from Careem.','earnings_alert',1,'2026-07-29 22:21:15'),(34,3,'Earnings Added','You logged Rs. 1000 from Indrive.','earnings_alert',1,'2026-07-30 21:23:46'),(35,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-08-01 21:23:08'),(36,3,'Earnings Added','You logged Rs. 1000 from Careem.','earnings_alert',1,'2026-08-01 21:24:39'),(37,3,'Earnings Added','You logged Rs. 200 from Foodpanda.','earnings_alert',1,'2026-08-03 11:45:10'),(38,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',1,'2026-08-05 20:33:19'),(39,3,'Earnings Added','You logged Rs. 200 from Indrive.','earnings_alert',1,'2026-08-05 20:34:31'),(40,3,'Earnings Added','You logged Rs. 500 from Bykea.','earnings_alert',1,'2026-08-05 21:03:55'),(41,3,'Fuel Log Reminder','You haven\'t logged fuel in a few days — don\'t forget to track it!','fuel_reminder',0,'2026-08-12 22:20:14'),(42,3,'Earnings Added','You logged Rs. 1200 from Careem.','earnings_alert',0,'2026-08-12 22:20:52'),(43,3,'Earnings Added','You logged Rs. 500 from Bykea.','earnings_alert',0,'2026-08-12 22:21:14'),(44,3,'Earnings Added','You logged Rs. 200 from Foodpanda.','earnings_alert',0,'2026-08-12 22:21:26'),(45,3,'Earnings Added','You logged Rs. 120 from Indrive.','earnings_alert',0,'2026-08-12 22:21:39');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platforms`
--

DROP TABLE IF EXISTS `platforms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `platforms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('ride','delivery','both') DEFAULT 'ride',
  `color` varchar(7) DEFAULT '#6366f1',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `platforms_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platforms`
--

LOCK TABLES `platforms` WRITE;
/*!40000 ALTER TABLE `platforms` DISABLE KEYS */;
INSERT INTO `platforms` VALUES (1,1,'Indrive','ride','#22c55e',1,'2026-06-14 11:53:51'),(2,1,'Careem','both','#1db954',1,'2026-06-14 11:53:51'),(3,1,'Yango','ride','#f59e0b',1,'2026-06-14 11:53:51'),(4,1,'Foodpanda','delivery','#ec4899',1,'2026-06-14 11:53:51'),(5,1,'Bykea','both','#3b82f6',1,'2026-06-14 11:53:51'),(6,2,'Indrive','ride','#22c55e',1,'2026-06-21 13:09:31'),(7,2,'Careem','both','#1db954',1,'2026-06-21 13:09:31'),(8,2,'Yango','ride','#f59e0b',1,'2026-06-21 13:09:31'),(9,2,'Foodpanda','delivery','#ec4899',1,'2026-06-21 13:09:31'),(10,2,'Bykea','both','#3b82f6',1,'2026-06-21 13:09:31'),(12,3,'Careem','both','#1db954',1,'2026-06-22 21:39:40'),(14,3,'Foodpanda','delivery','#ec4899',1,'2026-06-22 21:39:40'),(15,3,'Bykea','both','#3b82f6',1,'2026-06-22 21:39:40'),(16,3,'Indrive','ride','#6366f1',1,'2026-06-26 13:14:25'),(18,4,'Indrive','ride','#22c55e',1,'2026-06-29 10:33:29'),(19,4,'Careem','both','#1db954',1,'2026-06-29 10:33:29'),(20,4,'Yango','ride','#f59e0b',1,'2026-06-29 10:33:29'),(21,4,'Foodpanda','delivery','#ec4899',1,'2026-06-29 10:33:29'),(22,4,'Bykea','both','#3b82f6',1,'2026-06-29 10:33:29'),(23,5,'Indrive','ride','#22c55e',1,'2026-07-26 22:22:03'),(24,5,'Careem','both','#1db954',1,'2026-07-26 22:22:03'),(25,5,'Yango','ride','#f59e0b',1,'2026-07-26 22:22:03'),(26,5,'Foodpanda','delivery','#ec4899',1,'2026-07-26 22:22:03'),(27,5,'Bykea','both','#3b82f6',1,'2026-07-26 22:22:03');
/*!40000 ALTER TABLE `platforms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'PKR',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `profile_picture` varchar(500) DEFAULT NULL,
  `tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
  `rating` decimal(3,2) DEFAULT '0.00',
  `acceptance_rate` decimal(5,2) DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `google_id` (`google_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test Rider','test@rozi.com',NULL,'$2b$10$placeholder','PKR','2026-06-14 11:34:23',NULL,NULL,NULL,'bronze',0.00,0.00,1),(2,'Umer Farooq','umer@rozi.com',NULL,'$2b$12$EiaP.YQGn4WqJYY0CtjDb.3pXBszfRQcSUchT8zsmyva7Z7G06cqy','PKR','2026-06-21 13:09:31',NULL,NULL,NULL,'bronze',0.00,0.00,1),(3,'Umer Farooq','uf@gmail.com',NULL,'$2b$12$oAArVcMVuybR70XBNGHZletn05zPAalbOM/ZtpPyZ1PfNyws0wGZm','PKR','2026-06-22 21:39:40','0333 11111111',27,'https://res.cloudinary.com/dealdygig/image/upload/v1785100320/rozi/avatars/trann10fbt71enxntyyz.jpg','bronze',0.00,0.00,1),(4,'Ali','ali@gmail.com',NULL,'$2b$12$tBj.nHbBcvbL8t7wpLOgWeFfCefKcQcyNhnA1.m/64sdWSZ9oAIo2','PKR','2026-06-29 10:33:29',NULL,NULL,NULL,'bronze',0.00,0.00,1),(5,'Umer Farooq','iamumerfarooq43@gmail.com','117120179201970207597',NULL,'PKR','2026-07-26 22:22:03',NULL,NULL,'https://lh3.googleusercontent.com/a/ACg8ocKeNTFYaLXE8JyBLetFP1LfZ28_zoJPsWoN7gin_CsAdxyAQGhqKA=s96-c','bronze',0.00,0.00,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19  5:28:51
