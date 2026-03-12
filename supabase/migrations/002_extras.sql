-- ============================================================
-- MIGRATION 002 — Fonctions manquantes + Chat + PWA
-- À exécuter dans l'éditeur SQL de Supabase APRÈS 001_init.sql
-- ============================================================

-- ============================================================
-- Fonction : incrémenter les stats d'un joueur en fin de partie
-- ============================================================
CREATE OR REPLACE FUNCTION increment_player_stats(p_player_id UUID, p_points INT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    total_score  = total_score + p_points,
    games_played = games_played + 1,
    updated_at   = NOW()
  WHERE id = p_player_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TABLE : chat_messages — Messages dans la salle d'attente
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id    UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_room ON chat_messages(room_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_read" ON chat_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM room_players
      WHERE room_id = chat_messages.room_id AND player_id = auth.uid()
    )
  );

CREATE POLICY "chat_insert" ON chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = player_id);

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ============================================================
-- Vue : leaderboard global
-- ============================================================
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.total_score,
  p.games_played,
  CASE WHEN p.games_played > 0
    THEN ROUND(p.total_score::NUMERIC / p.games_played, 1)
    ELSE 0
  END AS avg_score_per_game
FROM profiles p
ORDER BY p.total_score DESC;
