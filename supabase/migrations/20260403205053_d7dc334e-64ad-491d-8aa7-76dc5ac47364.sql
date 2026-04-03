-- Recreate leaderboard_view as security definer so it can show all users' safe data
-- while profiles RLS remains locked down to own-row access
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view
WITH (security_barrier = true)
AS SELECT user_id, name, xp, level, streak, country
FROM public.profiles;

-- Grant access only to authenticated users
GRANT SELECT ON public.leaderboard_view TO authenticated;
REVOKE ALL ON public.leaderboard_view FROM anon;