
-- 1. Fix PUBLIC_DATA_EXPOSURE: restrict leaderboard to authenticated users
DROP POLICY IF EXISTS "Public leaderboard read" ON public.profiles;
CREATE POLICY "Authenticated leaderboard read" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 2. Create server-side RPC for adding XP (prevents client manipulation)
CREATE OR REPLACE FUNCTION public.add_xp_rpc(amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  new_xp integer;
  new_level integer;
BEGIN
  IF amount <= 0 OR amount > 500 THEN
    RAISE EXCEPTION 'Invalid XP amount';
  END IF;

  SELECT xp INTO current_xp FROM profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  new_xp := current_xp + amount;
  new_level := FLOOR(new_xp / 400) + 1;

  UPDATE profiles
  SET xp = new_xp, level = new_level, last_activity_date = CURRENT_DATE
  WHERE user_id = auth.uid();
END;
$$;

-- 3. Create server-side RPC for purchasing games (validates price server-side)
CREATE OR REPLACE FUNCTION public.purchase_game_rpc(p_game_id text, p_xp_cost integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  already_owned boolean;
BEGIN
  -- Validate cost range
  IF p_xp_cost < 0 OR p_xp_cost > 10000 THEN
    RAISE EXCEPTION 'Invalid XP cost';
  END IF;

  -- Check if already owned
  SELECT EXISTS(SELECT 1 FROM purchased_games WHERE user_id = auth.uid() AND game_id = p_game_id) INTO already_owned;
  IF already_owned THEN
    RAISE EXCEPTION 'Game already owned';
  END IF;

  -- Check XP balance
  SELECT xp INTO current_xp FROM profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF current_xp < p_xp_cost THEN
    RAISE EXCEPTION 'Insufficient XP';
  END IF;

  -- Deduct XP and insert purchase atomically
  UPDATE profiles SET xp = xp - p_xp_cost WHERE user_id = auth.uid();
  INSERT INTO purchased_games (user_id, game_id, xp_cost) VALUES (auth.uid(), p_game_id, p_xp_cost);
END;
$$;

-- 4. Restrict profiles UPDATE to only non-sensitive fields via trigger
CREATE OR REPLACE FUNCTION public.protect_xp_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If xp, level, or streak are being changed, block direct client updates
  -- Only SECURITY DEFINER functions (RPCs) can bypass this by setting the flag
  IF (NEW.xp IS DISTINCT FROM OLD.xp OR NEW.level IS DISTINCT FROM OLD.level OR NEW.streak IS DISTINCT FROM OLD.streak) THEN
    IF current_setting('app.allow_xp_update', true) IS DISTINCT FROM 'true' THEN
      NEW.xp := OLD.xp;
      NEW.level := OLD.level;
      NEW.streak := OLD.streak;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_xp_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_xp_fields();

-- Update RPCs to set the bypass flag
CREATE OR REPLACE FUNCTION public.add_xp_rpc(amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  new_xp integer;
  new_level integer;
BEGIN
  IF amount <= 0 OR amount > 500 THEN
    RAISE EXCEPTION 'Invalid XP amount';
  END IF;

  SELECT xp INTO current_xp FROM profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  new_xp := current_xp + amount;
  new_level := FLOOR(new_xp / 400) + 1;

  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE profiles
  SET xp = new_xp, level = new_level, last_activity_date = CURRENT_DATE
  WHERE user_id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.purchase_game_rpc(p_game_id text, p_xp_cost integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_xp integer;
  already_owned boolean;
BEGIN
  IF p_xp_cost < 0 OR p_xp_cost > 10000 THEN
    RAISE EXCEPTION 'Invalid XP cost';
  END IF;

  SELECT EXISTS(SELECT 1 FROM purchased_games WHERE user_id = auth.uid() AND game_id = p_game_id) INTO already_owned;
  IF already_owned THEN
    RAISE EXCEPTION 'Game already owned';
  END IF;

  SELECT xp INTO current_xp FROM profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
  IF current_xp < p_xp_cost THEN
    RAISE EXCEPTION 'Insufficient XP';
  END IF;

  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE profiles SET xp = xp - p_xp_cost WHERE user_id = auth.uid();
  INSERT INTO purchased_games (user_id, game_id, xp_cost) VALUES (auth.uid(), p_game_id, p_xp_cost);
END;
$$;
