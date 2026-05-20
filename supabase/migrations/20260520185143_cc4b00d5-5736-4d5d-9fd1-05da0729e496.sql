
-- 1) Fix SECURITY DEFINER view: recreate leaderboard_view as SECURITY INVOKER
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE(user_id uuid, name text, xp integer, level integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id, name, xp, level
  FROM public.profiles
  ORDER BY level DESC, xp DESC
  LIMIT GREATEST(1, LEAST(p_limit, 100));
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated, anon;

-- 2) Restrict realtime channel subscriptions via RLS on realtime.messages
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read own realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated users can read own realtime topics"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  -- Match channels: only participants
  (
    realtime.topic() LIKE 'match:%'
    AND EXISTS (
      SELECT 1 FROM public.match_players mp
      WHERE mp.match_id::text = split_part(realtime.topic(), ':', 2)
        AND mp.user_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'profile:%'
    AND split_part(realtime.topic(), ':', 2) = auth.uid()::text
  )
  OR (
    realtime.topic() LIKE 'user:' || auth.uid()::text || '%'
  )
);

DROP POLICY IF EXISTS "Authenticated users can send to own realtime topics" ON realtime.messages;
CREATE POLICY "Authenticated users can send to own realtime topics"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  (
    realtime.topic() LIKE 'match:%'
    AND EXISTS (
      SELECT 1 FROM public.match_players mp
      WHERE mp.match_id::text = split_part(realtime.topic(), ':', 2)
        AND mp.user_id = auth.uid()
    )
  )
  OR (
    realtime.topic() LIKE 'profile:%'
    AND split_part(realtime.topic(), ':', 2) = auth.uid()::text
  )
  OR (
    realtime.topic() LIKE 'user:' || auth.uid()::text || '%'
  )
);
