-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: cricket_management
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Dumping data for table `coaches`
--

LOCK TABLES `coaches` WRITE;
/*!40000 ALTER TABLE `coaches` DISABLE KEYS */;
INSERT INTO `coaches` VALUES (16,'Rahul','Dravid','Head Coach',10,16),(17,'Andrew','McDonald','Head Coach',12,17),(18,'Brendon','McCullum','Head Coach',8,18),(19,'Grant','Bradburn','Head Coach',9,19),(20,'Mark','Boucher','Head Coach',11,20),(21,'Mahela','Jayawardene','Head Coach',14,21),(22,'Stephen','Fleming','Head Coach',15,22),(23,'Aaqib','Javed','Head Coach',7,23),(24,'Mickey','Arthur','Head Coach',13,24),(25,'Greg','Shipperd','Head Coach',9,25),(26,'David','Hussey','Head Coach',8,26),(27,'Khaled','Mahmud','Head Coach',6,27),(28,'Trevor','Bayliss','Head Coach',12,28),(29,'Phil','Simmons','Head Coach',10,29),(30,'Chandrakant','Pandit','Head Coach',11,30);
/*!40000 ALTER TABLE `coaches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `match_umpires`
--

LOCK TABLES `match_umpires` WRITE;
/*!40000 ALTER TABLE `match_umpires` DISABLE KEYS */;
INSERT INTO `match_umpires` VALUES (1,1,'On-field'),(1,2,'Third Umpire'),(2,3,'On-field'),(2,4,'Third Umpire'),(3,5,'On-field'),(3,6,'Third Umpire'),(4,7,'On-field'),(4,8,'Third Umpire'),(5,9,'On-field'),(5,10,'Third Umpire'),(6,1,'On-field'),(6,3,'Third Umpire'),(7,2,'On-field'),(7,4,'Third Umpire'),(8,5,'On-field'),(8,7,'Third Umpire'),(9,6,'On-field'),(9,8,'Third Umpire'),(10,2,'Third Umpire'),(10,9,'On-field'),(11,3,'On-field'),(11,5,'Third Umpire'),(12,4,'On-field'),(12,6,'Third Umpire'),(13,7,'On-field'),(13,9,'Third Umpire'),(14,8,'On-field'),(14,10,'Third Umpire'),(15,1,'On-field'),(15,4,'Third Umpire');
/*!40000 ALTER TABLE `match_umpires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `matches`
--

LOCK TABLES `matches` WRITE;
/*!40000 ALTER TABLE `matches` DISABLE KEYS */;
INSERT INTO `matches` VALUES (1,1,1,16,17,'2023-10-10','2023-10-10 14:00:00','2023-10-10 21:00:00',16),(2,1,3,18,19,'2023-10-12','2023-10-12 14:00:00','2023-10-12 21:00:00',18),(3,1,5,20,21,'2023-10-14','2023-10-14 14:00:00','2023-10-14 21:00:00',21),(4,2,6,21,22,'2024-03-25','2024-03-25 19:00:00','2024-03-25 23:00:00',21),(5,2,7,23,24,'2024-03-27','2024-03-27 19:00:00','2024-03-27 23:00:00',24),(6,2,2,25,26,'2024-03-29','2024-03-29 19:00:00','2024-03-29 23:00:00',25),(7,3,4,23,24,'2024-02-10','2024-02-10 18:00:00','2024-02-10 22:00:00',23),(8,3,8,27,24,'2024-02-12','2024-02-12 18:00:00','2024-02-12 22:00:00',24),(9,3,9,27,23,'2024-02-14','2024-02-14 18:00:00','2024-02-14 22:00:00',27),(10,4,2,25,26,'2024-01-05','2024-01-05 17:00:00','2024-01-05 21:00:00',26),(11,4,1,17,18,'2024-01-07','2024-01-07 17:00:00','2024-01-07 21:00:00',17),(12,4,3,19,20,'2024-01-09','2024-01-09 17:00:00','2024-01-09 21:00:00',19),(13,5,10,28,29,'2023-09-05','2023-09-05 15:00:00','2023-09-05 20:00:00',29),(14,5,5,16,30,'2023-09-07','2023-09-07 15:00:00','2023-09-07 20:00:00',16),(15,5,6,17,21,'2023-09-09','2023-09-09 15:00:00','2023-09-09 20:00:00',21),(16,2,7,22,25,'2024-04-02','2024-04-02 19:00:00','2024-04-02 23:00:00',22),(17,3,4,23,30,'2024-02-20','2024-02-20 18:00:00','2024-02-20 22:00:00',30),(18,4,1,26,27,'2024-01-15','2024-01-15 17:00:00','2024-01-15 21:00:00',27),(19,5,10,28,16,'2023-09-12','2023-09-12 15:00:00','2023-09-12 20:00:00',28),(20,1,3,18,20,'2023-10-20','2023-10-20 14:00:00','2023-10-20 21:00:00',20);
/*!40000 ALTER TABLE `matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `player_statistics`
--

LOCK TABLES `player_statistics` WRITE;
/*!40000 ALTER TABLE `player_statistics` DISABLE KEYS */;
INSERT INTO `player_statistics` VALUES (1,1,1,85,130.50,0,0.00,1),(2,2,1,10,90.00,3,4.20,0),(3,3,1,45,110.00,0,0.00,2),(4,4,2,60,125.30,0,0.00,0),(5,5,2,12,95.00,2,3.80,1),(6,6,2,70,135.20,0,0.00,1),(7,7,3,40,120.50,0,0.00,0),(8,8,3,55,118.00,1,5.20,1),(9,9,3,15,85.00,3,4.60,0),(10,10,4,92,140.80,0,0.00,1),(11,11,4,8,70.00,4,3.50,0),(12,12,4,33,105.40,0,0.00,2),(13,13,5,75,132.70,0,0.00,0),(14,14,5,22,98.30,2,4.90,1),(15,15,5,48,115.60,0,0.00,0),(16,16,6,66,128.40,0,0.00,1),(17,17,6,18,92.00,3,4.30,0),(18,18,6,54,121.70,0,0.00,2),(19,19,7,30,100.50,1,5.00,1),(20,20,7,80,138.20,0,0.00,0);
/*!40000 ALTER TABLE `player_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'KL','Rahul','Batsman','Right-hand','None','Indian',16),(2,'Hardik','Pandya','All-Rounder','Right-hand','Right-arm medium','Indian',16),(3,'Glenn','Maxwell','All-Rounder','Right-hand','Off-spin','Australian',17),(4,'Pat','Cummins','Bowler','Right-hand','Right-arm fast','Australian',17),(5,'Jonny','Bairstow','Batsman','Right-hand','None','English',18),(6,'Mark','Wood','Bowler','Right-hand','Right-arm fast','English',18),(7,'Babar','Azam','Batsman','Right-hand','None','Pakistani',19),(8,'Shaheen','Afridi','Bowler','Left-hand','Left-arm fast','Pakistani',19),(9,'Quinton','de Kock','Wicketkeeper','Left-hand','None','South African',20),(10,'Kagiso','Rabada','Bowler','Left-hand','Right-arm fast','South African',20),(11,'Ishan','Kishan','Wicketkeeper','Left-hand','None','Indian',21),(12,'Suryakumar','Yadav','Batsman','Right-hand','None','Indian',21),(13,'MS','Dhoni','Wicketkeeper','Right-hand','None','Indian',22),(14,'Ravindra','Jadeja','All-Rounder','Left-hand','Left-arm spin','Indian',22),(15,'Fakhar','Zaman','Batsman','Left-hand','None','Pakistani',23),(16,'Haris','Rauf','Bowler','Right-hand','Right-arm fast','Pakistani',23),(17,'Imad','Wasim','All-Rounder','Left-hand','Left-arm spin','Pakistani',24),(18,'Mohammad','Amir','Bowler','Left-hand','Left-arm fast','Pakistani',24),(19,'Moises','Henriques','All-Rounder','Right-hand','Right-arm medium','Australian',25),(20,'Sean','Abbott','Bowler','Right-hand','Right-arm fast','Australian',25),(21,'Marcus','Stoinis','All-Rounder','Right-hand','Right-arm medium','Australian',26),(22,'Adam','Zampa','Bowler','Right-hand','Leg-spin','Australian',26),(23,'Shakib','Al Hasan','All-Rounder','Left-hand','Left-arm spin','Bangladeshi',27),(24,'Mustafizur','Rahman','Bowler','Left-hand','Left-arm fast','Bangladeshi',27),(25,'Jason','Holder','All-Rounder','Right-hand','Right-arm fast','West Indian',28),(26,'Shimron','Hetmyer','Batsman','Left-hand','None','West Indian',28),(27,'Sunil','Narine','All-Rounder','Left-hand','Off-spin','West Indian',29),(28,'Kieron','Pollard','All-Rounder','Right-hand','Medium','West Indian',29),(29,'Kane','Williamson','Batsman','Right-hand','None','New Zealander',30),(30,'Trent','Boult','Bowler','Right-hand','Left-arm fast','New Zealander',30);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `team_statistics`
--

LOCK TABLES `team_statistics` WRITE;
/*!40000 ALTER TABLE `team_statistics` DISABLE KEYS */;
INSERT INTO `team_statistics` VALUES (1,16,1,9,7,2,14,1.25),(2,17,1,9,5,4,10,0.75),(3,18,1,9,4,5,8,0.45),(4,19,2,14,9,5,18,1.10),(5,20,2,14,7,7,14,0.80),(6,21,2,14,6,8,12,0.30),(7,22,3,10,6,4,12,0.95),(8,23,3,10,5,5,10,0.40),(9,24,3,10,3,7,6,-0.20),(10,25,4,12,8,4,16,1.05),(11,26,4,12,6,6,12,0.55),(12,27,4,12,4,8,8,-0.10),(13,28,5,5,4,1,8,1.50),(14,29,5,5,2,3,4,-0.30),(15,30,5,5,1,4,2,-0.75);
/*!40000 ALTER TABLE `team_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (16,'India National Team','New Delhi',1932,15,3),(17,'Australia National Team','Sydney',1877,15,3),(18,'England National Team','London',1877,15,3),(19,'Pakistan National Team','Lahore',1952,15,3),(20,'South Africa National Team','Cape Town',1889,15,3),(21,'Mumbai Indians','Mumbai',2008,15,3),(22,'Chennai Super Kings','Chennai',2008,15,3),(23,'Lahore Qalandars','Lahore',2016,15,3),(24,'Karachi Kings','Karachi',2016,15,3),(25,'Sydney Sixers','Sydney',2011,15,3),(26,'Melbourne Stars','Melbourne',2011,15,3),(27,'Dhaka Dominators','Dhaka',2012,15,3),(28,'Barbados Royals','Bridgetown',2013,15,3),(29,'Trinbago Knight Riders','Port of Spain',2013,15,3),(30,'Kolkata Knight Riders','Kolkata',2008,15,3);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tournaments`
--

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
INSERT INTO `tournaments` VALUES (1,'ICC World Cup','ODI','2023-10-01','2023-11-20'),(2,'IPL 2024','T20','2024-03-20','2024-05-30'),(3,'PSL 2024','T20','2024-02-15','2024-03-20'),(4,'BBL 2024','T20','2024-12-01','2025-01-20'),(5,'Asia Cup','ODI','2024-08-01','2024-08-30');
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `umpires`
--

LOCK TABLES `umpires` WRITE;
/*!40000 ALTER TABLE `umpires` DISABLE KEYS */;
INSERT INTO `umpires` VALUES (1,'Aleem','Dar','Pakistani',20),(2,'Kumar','Dharmasena','Sri Lankan',15),(3,'Rod','Tucker','Australian',12),(4,'Michael','Gough','English',14),(5,'Marais','Erasmus','South African',16),(6,'Nitin','Menon','Indian',10),(7,'Paul','Reiffel','Australian',13),(8,'Bruce','Oxenford','Australian',18),(9,'Richard','Kettleborough','English',17),(10,'Chris','Gaffaney','New Zealand',11);
/*!40000 ALTER TABLE `umpires` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `venues`
--

LOCK TABLES `venues` WRITE;
/*!40000 ALTER TABLE `venues` DISABLE KEYS */;
INSERT INTO `venues` VALUES (1,'Eden Gardens','Kolkata','India',68000),(2,'MCG','Melbourne','Australia',100000),(3,'Lords','London','England',30000),(4,'Gaddafi Stadium','Lahore','Pakistan',27000),(5,'Newlands','Cape Town','South Africa',25000),(6,'Wankhede Stadium','Mumbai','India',33000),(7,'Chinnaswamy Stadium','Bangalore','India',40000),(8,'National Stadium','Karachi','Pakistan',34000),(9,'Sher-e-Bangla','Dhaka','Bangladesh',25000),(10,'Kensington Oval','Bridgetown','Barbados',28000);
/*!40000 ALTER TABLE `venues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-22 20:52:48
