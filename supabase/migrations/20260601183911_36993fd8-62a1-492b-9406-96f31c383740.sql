
-- Remove the policy that still exposed the answers column to participants
DROP POLICY IF EXISTS "Participants can view opponents safe fields" ON public.match_players;

-- Replace the view with a SECURITY DEFINER function that returns only safe fields
DROP VIEW IF EXISTS public.match_opponents;

CREATE OR REPLACE FUNCTION public.get_match_opponents(p_match_id uuid)
RETURNS TABLE (
  id uuid,
  match_id uuid,
  user_id uuid,
  player_name text,
  score integer,
  finished boolean,
  joined_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mp.id, mp.match_id, mp.user_id, mp.player_name, mp.score, mp.finished, mp.joined_at
  FROM public.match_players mp
  WHERE mp.match_id = p_match_id
    AND EXISTS (
      SELECT 1 FROM public.match_players me
      WHERE me.match_id = p_match_id AND me.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.get_match_opponents(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_match_opponents(uuid) TO authenticated;
