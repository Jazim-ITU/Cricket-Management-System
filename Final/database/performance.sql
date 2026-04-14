USE cricket_management;

-- =========================================================
-- QUERY 1: Filter Players by Nationality
-- =========================================================

-- BEFORE INDEX
EXPLAIN ANALYZE
SELECT *
FROM Players
WHERE nationality = 'Indian';


-- CREATE INDEX
CREATE INDEX idx_players_nationality
ON Players(nationality);


-- AFTER INDEX
EXPLAIN ANALYZE
SELECT *
FROM Players
WHERE nationality = 'Indian';



-- =========================================================
-- QUERY 2: Filter Tournaments by Format
-- =========================================================

-- BEFORE INDEX
EXPLAIN ANALYZE
SELECT *
FROM Tournaments
WHERE format = 'T20';


-- CREATE INDEX
CREATE INDEX idx_tournaments_format
ON Tournaments(format);


-- AFTER INDEX
EXPLAIN ANALYZE
SELECT *
FROM Tournaments
WHERE format = 'T20';



-- =========================================================
-- QUERY 3: Filter Matches by Match Date
-- =========================================================

-- BEFORE INDEX
EXPLAIN ANALYZE
SELECT *
FROM Matches
WHERE match_date = '2024-03-25';


-- CREATE INDEX
CREATE INDEX idx_matches_date_perf
ON Matches(match_date);


-- AFTER INDEX
EXPLAIN ANALYZE
SELECT *
FROM Matches
WHERE match_date = '2024-03-25';

-- QUERY 4 BEFORE INDEX
EXPLAIN ANALYZE
SELECT 
    p.first_name,
    p.last_name,
    ps.runs_scored,
    ps.wickets_taken,
    ps.strike_rate
FROM Player_Statistics ps
JOIN Players p ON ps.player_id = p.player_id
WHERE ps.player_id = 5
AND ps.match_id = 10;

CREATE INDEX idx_player_match 
ON Player_Statistics(player_id, match_id);

-- QUERY 4 AFTER INDEX
EXPLAIN ANALYZE
SELECT 
    p.first_name,
    p.last_name,
    ps.runs_scored,
    ps.wickets_taken,
    ps.strike_rate
FROM Player_Statistics ps
JOIN Players p ON ps.player_id = p.player_id
WHERE ps.player_id = 5
AND ps.match_id = 10;