CREATE DATABASE  IF NOT EXISTS `cricket_management` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `cricket_management`;
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
-- Table structure for table `coaches`
--

DROP TABLE IF EXISTS `coaches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coaches` (
  `coach_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `specialization` varchar(100) NOT NULL,
  `experience_years` int DEFAULT '0',
  `team_id` int DEFAULT NULL,
  PRIMARY KEY (`coach_id`),
  UNIQUE KEY `team_id` (`team_id`),
  KEY `idx_coaches_team` (`team_id`),
  CONSTRAINT `coaches_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `prevent_multiple_coach_assignment` BEFORE UPDATE ON `coaches` FOR EACH ROW BEGIN
    IF NEW.team_id IS NOT NULL THEN
        IF (SELECT COUNT(*) FROM Coaches 
            WHERE team_id = NEW.team_id AND coach_id != NEW.coach_id) > 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Team already has a coach assigned';
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Temporary view structure for view `match_details`
--

DROP TABLE IF EXISTS `match_details`;
/*!50001 DROP VIEW IF EXISTS `match_details`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `match_details` AS SELECT 
 1 AS `match_id`,
 1 AS `team1`,
 1 AS `team2`,
 1 AS `venue_name`,
 1 AS `match_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `match_umpires`
--

DROP TABLE IF EXISTS `match_umpires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `match_umpires` (
  `match_id` int NOT NULL,
  `umpire_id` int NOT NULL,
  `role` enum('On-field','Third Umpire','TV Umpire','Reserve') NOT NULL,
  PRIMARY KEY (`match_id`,`umpire_id`),
  KEY `umpire_id` (`umpire_id`),
  KEY `idx_match_umpires` (`match_id`,`umpire_id`),
  CONSTRAINT `match_umpires_ibfk_1` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`),
  CONSTRAINT `match_umpires_ibfk_2` FOREIGN KEY (`umpire_id`) REFERENCES `umpires` (`umpire_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `matches`
--

DROP TABLE IF EXISTS `matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matches` (
  `match_id` int NOT NULL AUTO_INCREMENT,
  `tournament_id` int NOT NULL,
  `venue_id` int NOT NULL,
  `team1_id` int NOT NULL,
  `team2_id` int NOT NULL,
  `match_date` date NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `winner_team_id` int DEFAULT NULL,
  PRIMARY KEY (`match_id`),
  KEY `venue_id` (`venue_id`),
  KEY `team1_id` (`team1_id`),
  KEY `team2_id` (`team2_id`),
  KEY `winner_team_id` (`winner_team_id`),
  KEY `idx_matches_tournament` (`tournament_id`),
  KEY `idx_matches_date` (`match_date`),
  CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`),
  CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`venue_id`),
  CONSTRAINT `matches_ibfk_3` FOREIGN KEY (`team1_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `matches_ibfk_4` FOREIGN KEY (`team2_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `matches_ibfk_5` FOREIGN KEY (`winner_team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `matches_chk_1` CHECK ((`end_time` > `start_time`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `player_performance`
--

DROP TABLE IF EXISTS `player_performance`;
/*!50001 DROP VIEW IF EXISTS `player_performance`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `player_performance` AS SELECT 
 1 AS `player_id`,
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `nationality`,
 1 AS `total_runs`,
 1 AS `total_wickets`,
 1 AS `avg_strike_rate`,
 1 AS `avg_economy`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `player_statistics`
--

DROP TABLE IF EXISTS `player_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `player_statistics` (
  `stat_id` int NOT NULL AUTO_INCREMENT,
  `player_id` int NOT NULL,
  `match_id` int NOT NULL,
  `runs_scored` int DEFAULT '0',
  `strike_rate` decimal(5,2) DEFAULT '0.00',
  `wickets_taken` int DEFAULT '0',
  `economy` decimal(5,2) DEFAULT '0.00',
  `catches` int DEFAULT '0',
  PRIMARY KEY (`stat_id`),
  KEY `match_id` (`match_id`),
  KEY `idx_player_stats_player` (`player_id`),
  CONSTRAINT `player_statistics_ibfk_1` FOREIGN KEY (`player_id`) REFERENCES `players` (`player_id`),
  CONSTRAINT `player_statistics_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `matches` (`match_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `player_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `role` enum('Batsman','Bowler','All-Rounder','Wicketkeeper') NOT NULL,
  `batting_style` varchar(50) DEFAULT NULL,
  `bowling_style` varchar(50) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `team_id` int NOT NULL,
  PRIMARY KEY (`player_id`),
  KEY `idx_players_team` (`team_id`),
  KEY `idx_players_nationality` (`nationality`),
  CONSTRAINT `players_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `check_player_limit` BEFORE INSERT ON `players` FOR EACH ROW BEGIN
    DECLARE player_count INT;
    DECLARE max_limit INT;

    SELECT COUNT(*) INTO player_count
    FROM Players
    WHERE team_id = NEW.team_id;

    SELECT max_players INTO max_limit
    FROM Teams
    WHERE team_id = NEW.team_id;

    IF player_count >= max_limit THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Team player limit exceeded';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `team_statistics`
--

DROP TABLE IF EXISTS `team_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_statistics` (
  `team_stat_id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `tournament_id` int NOT NULL,
  `matches_played` int DEFAULT '0',
  `matches_won` int DEFAULT '0',
  `matches_lost` int DEFAULT '0',
  `points` int DEFAULT '0',
  `net_runrate` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`team_stat_id`),
  KEY `team_id` (`team_id`),
  KEY `tournament_id` (`tournament_id`),
  CONSTRAINT `team_statistics_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `team_statistics_ibfk_2` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `founded_year` year NOT NULL,
  `max_players` int NOT NULL DEFAULT '15',
  `max_coaches` int NOT NULL DEFAULT '3',
  PRIMARY KEY (`team_id`),
  UNIQUE KEY `team_name` (`team_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `tournament_standings`
--

DROP TABLE IF EXISTS `tournament_standings`;
/*!50001 DROP VIEW IF EXISTS `tournament_standings`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `tournament_standings` AS SELECT 
 1 AS `team_name`,
 1 AS `matches_played`,
 1 AS `matches_won`,
 1 AS `points`,
 1 AS `net_runrate`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments` (
  `tournament_id` int NOT NULL AUTO_INCREMENT,
  `tournament_name` varchar(150) NOT NULL,
  `format` enum('T20','ODI','Test') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  PRIMARY KEY (`tournament_id`),
  KEY `idx_tournaments_format` (`format`),
  CONSTRAINT `tournaments_chk_1` CHECK ((`end_date` >= `start_date`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `umpires`
--

DROP TABLE IF EXISTS `umpires`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `umpires` (
  `umpire_id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `nationality` varchar(100) NOT NULL,
  `experience_years` int DEFAULT '0',
  PRIMARY KEY (`umpire_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `venues`
--

DROP TABLE IF EXISTS `venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venues` (
  `venue_id` int NOT NULL AUTO_INCREMENT,
  `venue_name` varchar(150) NOT NULL,
  `city` varchar(100) NOT NULL,
  `country` varchar(100) NOT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`venue_id`),
  CONSTRAINT `venues_chk_1` CHECK ((`capacity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'cricket_management'
--

--
-- Final view structure for view `match_details`
--

/*!50001 DROP VIEW IF EXISTS `match_details`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `match_details` AS select `m`.`match_id` AS `match_id`,`t1`.`team_name` AS `team1`,`t2`.`team_name` AS `team2`,`v`.`venue_name` AS `venue_name`,`m`.`match_date` AS `match_date` from (((`matches` `m` join `teams` `t1` on((`m`.`team1_id` = `t1`.`team_id`))) join `teams` `t2` on((`m`.`team2_id` = `t2`.`team_id`))) join `venues` `v` on((`m`.`venue_id` = `v`.`venue_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `player_performance`
--

/*!50001 DROP VIEW IF EXISTS `player_performance`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `player_performance` AS select `p`.`player_id` AS `player_id`,`p`.`first_name` AS `first_name`,`p`.`last_name` AS `last_name`,`p`.`nationality` AS `nationality`,sum(`ps`.`runs_scored`) AS `total_runs`,sum(`ps`.`wickets_taken`) AS `total_wickets`,avg(`ps`.`strike_rate`) AS `avg_strike_rate`,avg(`ps`.`economy`) AS `avg_economy` from (`players` `p` left join `player_statistics` `ps` on((`p`.`player_id` = `ps`.`player_id`))) group by `p`.`player_id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tournament_standings`
--

/*!50001 DROP VIEW IF EXISTS `tournament_standings`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `tournament_standings` AS select `t`.`team_name` AS `team_name`,`ts`.`matches_played` AS `matches_played`,`ts`.`matches_won` AS `matches_won`,`ts`.`points` AS `points`,`ts`.`net_runrate` AS `net_runrate` from (`team_statistics` `ts` join `teams` `t` on((`ts`.`team_id` = `t`.`team_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-21 13:53:25
