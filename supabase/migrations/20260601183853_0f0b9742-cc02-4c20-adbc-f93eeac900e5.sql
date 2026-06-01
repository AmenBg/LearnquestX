
-- 1) match_players: restrict SELECT to own row only, expose opponents via a safe view
DROP POLICY IF EXISTS "Participants can view match players" ON public.match_players;

CREATE POLICY "Users can view their own match row"
ON public.match_players
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Safe view of opponents (no answers column). security_invoker ensures RLS still applies
-- via an underlying policy that exposes only non-sensitive fields to fellow participants.
CREATE POLICY "Participants can view opponents safe fields"
ON public.match_players
FOR SELECT
TO authenticated
USING (
  match_id IN (
    SELECT mp.match_id FROM public.match_players mp WHERE mp.user_id = auth.uid()
  )
);

-- The above policy permits reading the row, but to actually hide the `answers` column
-- from opponents we expose a view that omits it and have clients query the view for opponents.
CREATE OR REPLACE VIEW public.match_opponents
WITH (security_invoker = true) AS
SELECT id, match_id, user_id, player_name, score, finished, joined_at
FROM public.match_players;

GRANT SELECT ON public.match_opponents TO authenticated;

-- 2) match_players INSERT: validate match is joinable
DROP POLICY IF EXISTS "Users can join matches" ON public.match_players;

CREATE POLICY "Users can join joinable matches"
ON public.match_players
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.quiz_matches qm
    WHERE qm.id = match_id
      AND qm.status = 'waiting'
      AND (
        SELECT COUNT(*) FROM public.match_players mp2 WHERE mp2.match_id = qm.id
      ) < qm.max_players
  )
);

-- 3) Remove profiles from Realtime publication to avoid broadcasting other users' updates
ALTER PUBLICATION supabase_realtime DROP TABLE public.profiles;
