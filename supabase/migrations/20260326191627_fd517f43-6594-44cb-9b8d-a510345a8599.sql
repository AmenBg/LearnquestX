
-- Quiz matches for multiplayer
CREATE TABLE public.quiz_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'waiting',
  match_type text NOT NULL DEFAULT '1v1',
  question_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  max_players integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

ALTER TABLE public.quiz_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.quiz_matches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create matches" ON public.quiz_matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update matches" ON public.quiz_matches FOR UPDATE TO authenticated USING (true);

-- Match players
CREATE TABLE public.match_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.quiz_matches(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  player_name text NOT NULL DEFAULT 'Player',
  score integer NOT NULL DEFAULT 0,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  joined_at timestamptz NOT NULL DEFAULT now(),
  finished boolean NOT NULL DEFAULT false
);

ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match players" ON public.match_players FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can join matches" ON public.match_players FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own match data" ON public.match_players FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable realtime for multiplayer
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
