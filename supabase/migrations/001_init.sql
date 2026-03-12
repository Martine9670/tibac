-- ============================================================
-- PETIT BAC - Supabase Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: profiles
-- Extends Supabase Auth users
-- ============================================================
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  avatar_url   TEXT,
  total_score  INT DEFAULT 0,
  games_played INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: categories
-- Default and custom categories (Prénom, Pays, Animal...)
-- ============================================================
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,        -- e.g. "Prénom", "Pays", "Animal"
  emoji      TEXT,                 -- e.g. "👤", "🌍", "🐘"
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, emoji, is_default) VALUES
  ('Prénom',    '👤', TRUE),
  ('Pays',      '🌍', TRUE),
  ('Animal',    '🐘', TRUE),
  ('Métier',    '💼', TRUE),
  ('Fruit/Légume', '🍎', TRUE),
  ('Marque',    '🏷️', TRUE),
  ('Film/Série','🎬', TRUE),
  ('Ville',     '🏙️', TRUE);

-- ============================================================
-- TABLE: rooms
-- A game lobby/room
-- ============================================================
CREATE TABLE rooms (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          TEXT UNIQUE NOT NULL,          -- 4-6 char join code e.g. "BAC42"
  host_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'waiting'
                  CHECK (status IN ('waiting', 'playing', 'finished')),
  max_players   INT DEFAULT 8,
  round_count   INT DEFAULT 5,                 -- total rounds to play
  time_limit    INT DEFAULT 60,                -- seconds per round (0 = unlimited)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: room_categories
-- Which categories are active for a given room
-- ============================================================
CREATE TABLE room_categories (
  room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, category_id)
);

-- ============================================================
-- TABLE: room_players
-- Players currently in a room
-- ============================================================
CREATE TABLE room_players (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_ready   BOOLEAN DEFAULT FALSE,
  is_online  BOOLEAN DEFAULT TRUE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (room_id, player_id)
);

-- ============================================================
-- TABLE: rounds
-- Each round within a room (one letter per round)
-- ============================================================
CREATE TABLE rounds (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INT NOT NULL,                    -- 1, 2, 3...
  letter       CHAR(1) NOT NULL,                -- e.g. 'B'
  status       TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'voting', 'finished')),
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  ended_at     TIMESTAMPTZ,
  winner_id    UUID REFERENCES profiles(id),    -- who called "Bac!"
  UNIQUE (room_id, round_number)
);

-- ============================================================
-- TABLE: answers
-- Each player's answers for a round
-- ============================================================
CREATE TABLE answers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id    UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  value       TEXT,                              -- the answer text (NULL = skipped)
  is_valid    BOOLEAN,                           -- NULL = not yet voted on
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (round_id, player_id, category_id)
);

-- ============================================================
-- TABLE: votes
-- Players vote on each other's answers
-- ============================================================
CREATE TABLE votes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id  UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  voter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_valid   BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (answer_id, voter_id)
);

-- ============================================================
-- TABLE: scores
-- Score per player per round (computed after voting)
-- ============================================================
CREATE TABLE scores (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id     UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  player_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points       INT NOT NULL DEFAULT 0,
  bac_bonus    INT NOT NULL DEFAULT 0,          -- bonus for calling "Bac!" first
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (round_id, player_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_room_players_room    ON room_players(room_id);
CREATE INDEX idx_room_players_player  ON room_players(player_id);
CREATE INDEX idx_rounds_room          ON rounds(room_id);
CREATE INDEX idx_answers_round        ON answers(round_id);
CREATE INDEX idx_answers_player       ON answers(player_id);
CREATE INDEX idx_votes_answer         ON votes(answer_id);
CREATE INDEX idx_scores_round         ON scores(round_id);
CREATE INDEX idx_scores_player        ON scores(player_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players   ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds         ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores         ENABLE ROW LEVEL SECURITY;

-- profiles: readable by all, writable only by owner
CREATE POLICY "profiles_read"   ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- rooms: readable by all authenticated users
CREATE POLICY "rooms_read"   ON rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- room_players: readable by all, insert/delete by player themselves
CREATE POLICY "room_players_read"   ON room_players FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "room_players_insert" ON room_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "room_players_update" ON room_players FOR UPDATE TO authenticated USING (auth.uid() = player_id);
CREATE POLICY "room_players_delete" ON room_players FOR DELETE TO authenticated USING (auth.uid() = player_id);

-- rounds: readable by room members
CREATE POLICY "rounds_read" ON rounds FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM room_players WHERE room_id = rounds.room_id AND player_id = auth.uid())
);

-- answers: readable by room members, writable by the answering player
CREATE POLICY "answers_read" ON answers FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM rounds r
    JOIN room_players rp ON rp.room_id = r.room_id
    WHERE r.id = answers.round_id AND rp.player_id = auth.uid()
  )
);
CREATE POLICY "answers_insert" ON answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = player_id);
CREATE POLICY "answers_update" ON answers FOR UPDATE TO authenticated USING (auth.uid() = player_id);

-- votes: readable by room members, writable by the voter
CREATE POLICY "votes_read" ON votes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "votes_insert" ON votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

-- scores: readable by all authenticated users
CREATE POLICY "scores_read" ON scores FOR SELECT TO authenticated USING (TRUE);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime on key tables
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE answers;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Player_' || LEFT(NEW.id::TEXT, 6)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Compute score after voting phase ends
CREATE OR REPLACE FUNCTION compute_round_scores(p_round_id UUID)
RETURNS VOID AS $$
DECLARE
  rec RECORD;
  pts INT;
BEGIN
  -- For each answer in the round
  FOR rec IN
    SELECT
      a.player_id,
      a.category_id,
      a.value,
      COUNT(DISTINCT a2.player_id) FILTER (
        WHERE LOWER(TRIM(a2.value)) = LOWER(TRIM(a.value))
          AND a2.is_valid = TRUE
      ) AS same_count,
      a.is_valid
    FROM answers a
    LEFT JOIN answers a2 ON a2.round_id = a.round_id
                         AND a2.category_id = a.category_id
                         AND a2.id != a.id
    WHERE a.round_id = p_round_id
    GROUP BY a.player_id, a.category_id, a.value, a.is_valid
  LOOP
    IF rec.is_valid = TRUE THEN
      -- Unique answer = 2pts, shared = 1pt
      pts := CASE WHEN rec.same_count = 0 THEN 2 ELSE 1 END;
    ELSE
      pts := 0;
    END IF;

    -- Upsert into scores
    INSERT INTO scores (round_id, player_id, points)
    VALUES (p_round_id, rec.player_id, pts)
    ON CONFLICT (round_id, player_id)
    DO UPDATE SET points = scores.points + pts;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
