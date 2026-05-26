
-- 1. Game catalog (canonical prices)
CREATE TABLE public.game_catalog (
  game_id text PRIMARY KEY,
  xp_cost integer NOT NULL CHECK (xp_cost >= 0)
);
GRANT SELECT ON public.game_catalog TO anon, authenticated;
GRANT ALL ON public.game_catalog TO service_role;
ALTER TABLE public.game_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Catalog readable by anyone" ON public.game_catalog FOR SELECT USING (true);

INSERT INTO public.game_catalog (game_id, xp_cost) VALUES
  ('shadow-memory', 500), ('memory-grid-pro', 650), ('brain-tracker', 600), ('hidden-object', 500),
  ('speed-logic', 600), ('brain-shift', 700), ('pattern-escape', 650), ('code-signal', 800),
  ('hidden-logic', 700), ('logic-circuit', 750),
  ('quick-reflex', 400), ('number-trap', 500), ('reaction-zone', 450), ('shape-storm', 500),
  ('word-clash', 550), ('word-search', 500), ('word-chain', 600),
  ('fast-math-duel', 600), ('geometry-builder', 650), ('number-grid', 600),
  ('mind-switch', 700), ('speed-builder', 650), ('mind-control', 750),
  ('strategy-shift', 800), ('puzzle-rush', 700),
  ('chess', 1000);

-- 2. Replace purchase RPC: drop client-supplied price
DROP FUNCTION IF EXISTS public.purchase_game_rpc(text, integer);

CREATE OR REPLACE FUNCTION public.purchase_game_rpc(p_game_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  canonical_cost integer;
  current_xp integer;
  already_owned boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT xp_cost INTO canonical_cost FROM public.game_catalog WHERE game_id = p_game_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown game'; END IF;

  SELECT EXISTS(SELECT 1 FROM public.purchased_games WHERE user_id = auth.uid() AND game_id = p_game_id) INTO already_owned;
  IF already_owned THEN RAISE EXCEPTION 'Game already owned'; END IF;

  SELECT xp INTO current_xp FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF current_xp < canonical_cost THEN RAISE EXCEPTION 'Insufficient XP'; END IF;

  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE public.profiles SET xp = xp - canonical_cost WHERE user_id = auth.uid();
  INSERT INTO public.purchased_games (user_id, game_id, xp_cost) VALUES (auth.uid(), p_game_id, canonical_cost);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.purchase_game_rpc(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_game_rpc(text) TO authenticated;

-- 3. Lock down purchased_games direct writes (only RPC can insert via SECURITY DEFINER)
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchased_games;
REVOKE INSERT, UPDATE, DELETE ON public.purchased_games FROM authenticated, anon, PUBLIC;

-- 4. Daily XP cap to prevent farming
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS xp_today integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_today_date date;

-- Protect new fields from direct client tampering
CREATE OR REPLACE FUNCTION public.protect_xp_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (NEW.xp IS DISTINCT FROM OLD.xp
      OR NEW.level IS DISTINCT FROM OLD.level
      OR NEW.streak IS DISTINCT FROM OLD.streak
      OR NEW.xp_today IS DISTINCT FROM OLD.xp_today
      OR NEW.xp_today_date IS DISTINCT FROM OLD.xp_today_date) THEN
    IF current_setting('app.allow_xp_update', true) IS DISTINCT FROM 'true' THEN
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.streak := OLD.streak;
      NEW.xp_today := OLD.xp_today;
      NEW.xp_today_date := OLD.xp_today_date;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_xp_fields_trg ON public.profiles;
CREATE TRIGGER protect_xp_fields_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_xp_fields();

CREATE OR REPLACE FUNCTION public.add_xp_rpc(amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_xp integer;
  today_xp integer;
  today_date date;
  new_xp integer;
  new_level integer;
  capped integer;
  daily_cap constant integer := 1000;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF amount <= 0 OR amount > 500 THEN RAISE EXCEPTION 'Invalid XP amount'; END IF;

  SELECT xp, xp_today, xp_today_date
    INTO current_xp, today_xp, today_date
    FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  IF today_date IS NULL OR today_date <> CURRENT_DATE THEN
    today_xp := 0;
  END IF;

  capped := LEAST(amount, GREATEST(0, daily_cap - today_xp));
  IF capped <= 0 THEN RETURN; END IF;

  new_xp := current_xp + capped;
  new_level := FLOOR(new_xp / 400) + 1;

  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE public.profiles
  SET xp = new_xp,
      level = new_level,
      last_activity_date = CURRENT_DATE,
      xp_today = today_xp + capped,
      xp_today_date = CURRENT_DATE
  WHERE user_id = auth.uid();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.add_xp_rpc(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_xp_rpc(integer) TO authenticated;

-- 5. Leaderboard: authenticated only
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO authenticated;

-- 6. exercise_history: block direct edits/deletes (defense in depth)
REVOKE UPDATE, DELETE ON public.exercise_history FROM authenticated, anon, PUBLIC;
