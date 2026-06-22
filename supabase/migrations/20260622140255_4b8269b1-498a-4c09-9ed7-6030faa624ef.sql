INSERT INTO public.game_catalog (game_id, xp_cost) VALUES
  ('cube-runner-3d', 1500),
  ('orbit-shooter-3d', 1600),
  ('color-cube-match-3d', 1400)
ON CONFLICT (game_id) DO UPDATE SET xp_cost = EXCLUDED.xp_cost;