
-- 1. Create a leaderboard view exposing only safe columns
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT user_id, name, xp, level, streak, country
FROM public.profiles;

-- 2. Enable RLS on the view
ALTER VIEW public.leaderboard_view SET (security_invoker = true);

-- 3. Drop the overly broad leaderboard read policy on profiles
DROP POLICY IF EXISTS "Authenticated leaderboard read" ON public.profiles;

-- 4. Restrict match_players SELECT to participants of the same match
DROP POLICY IF EXISTS "Anyone can view match players" ON public.match_players;

CREATE POLICY "Participants can view match players"
  ON public.match_players FOR SELECT
  TO authenticated
  USING (
    match_id IN (SELECT mp.match_id FROM public.match_players mp WHERE mp.user_id = auth.uid())
  );
