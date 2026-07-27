
-- ============ TABLE ============
CREATE TABLE public.kingdom_states (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  town_hall_level int NOT NULL DEFAULT 1,
  wall_level int NOT NULL DEFAULT 0,
  watchtower_level int NOT NULL DEFAULT 0,
  barracks_level int NOT NULL DEFAULT 0,
  archery_level int NOT NULL DEFAULT 0,
  militia_count int NOT NULL DEFAULT 0,
  archer_count int NOT NULL DEFAULT 0,
  swordsman_count int NOT NULL DEFAULT 0,
  knight_count int NOT NULL DEFAULT 0,
  catapult_count int NOT NULL DEFAULT 0,
  wins int NOT NULL DEFAULT 0,
  losses int NOT NULL DEFAULT 0,
  last_raid_check timestamptz NOT NULL DEFAULT now(),
  last_player_attack timestamptz,
  scout_target jsonb,
  scouted_at timestamptz,
  battle_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kingdom_states TO authenticated;
GRANT ALL ON public.kingdom_states TO service_role;

ALTER TABLE public.kingdom_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own kingdom"
  ON public.kingdom_states FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_kingdom_states_updated_at
  BEFORE UPDATE ON public.kingdom_states
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public._kingdom_ensure(p_user uuid)
RETURNS public.kingdom_states
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE ks public.kingdom_states;
BEGIN
  SELECT * INTO ks FROM public.kingdom_states WHERE user_id = p_user;
  IF NOT FOUND THEN
    INSERT INTO public.kingdom_states(user_id) VALUES (p_user)
    RETURNING * INTO ks;
  END IF;
  RETURN ks;
END $$;

CREATE OR REPLACE FUNCTION public._kingdom_formation_power(
  militia int, archer int, swordsman int, knight int, catapult int,
  wall int, watch int, is_defender boolean
) RETURNS int
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  frontline numeric;
  ranged numeric;
  siege numeric;
BEGIN
  frontline := militia*2 + swordsman*8 + knight*18;
  ranged := archer*5;
  siege := catapult*40;
  IF is_defender THEN
    frontline := frontline * (1 + wall*0.15);
    IF wall >= 1 THEN ranged := ranged * 1.25; END IF;
    RETURN ROUND(frontline + ranged + siege + watch*30);
  END IF;
  RETURN ROUND(frontline + ranged + siege*1.3);
END $$;

CREATE OR REPLACE FUNCTION public._kingdom_spend_xp(p_user uuid, p_cost int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE cur_xp int;
BEGIN
  SELECT xp INTO cur_xp FROM public.profiles WHERE user_id = p_user FOR UPDATE;
  IF cur_xp IS NULL THEN RAISE EXCEPTION 'Profile not found'; END IF;
  IF cur_xp < p_cost THEN RAISE EXCEPTION 'Not enough XP (need %, have %)', p_cost, cur_xp; END IF;
  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE public.profiles SET xp = xp - p_cost WHERE user_id = p_user;
END $$;

CREATE OR REPLACE FUNCTION public._kingdom_award_xp(p_user uuid, p_amount int)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE new_xp int; new_level int;
BEGIN
  IF p_amount <= 0 THEN RETURN; END IF;
  SELECT xp + p_amount INTO new_xp FROM public.profiles WHERE user_id = p_user FOR UPDATE;
  new_level := FLOOR(new_xp / 400) + 1;
  PERFORM set_config('app.allow_xp_update', 'true', true);
  UPDATE public.profiles SET xp = new_xp, level = new_level, last_activity_date = CURRENT_DATE
    WHERE user_id = p_user;
END $$;

-- Building cost lookup: returns (cost, min_player_level, max_level)
CREATE OR REPLACE FUNCTION public._kingdom_building_next(
  p_building text, p_current_level int
) RETURNS TABLE(cost int, min_player_level int, is_max boolean)
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  IF p_building = 'town_hall' THEN
    IF p_current_level = 1 THEN RETURN QUERY SELECT 300, 5, false;
    ELSIF p_current_level = 2 THEN RETURN QUERY SELECT 900, 15, false;
    ELSIF p_current_level = 3 THEN RETURN QUERY SELECT 2000, 30, false;
    ELSE RETURN QUERY SELECT 0, 0, true; END IF;
  ELSIF p_building = 'watchtower' THEN
    IF p_current_level = 0 THEN RETURN QUERY SELECT 200, 6, false;
    ELSIF p_current_level = 1 THEN RETURN QUERY SELECT 500, 16, false;
    ELSE RETURN QUERY SELECT 0, 0, true; END IF;
  ELSIF p_building = 'barracks' THEN
    IF p_current_level = 0 THEN RETURN QUERY SELECT 150, 2, false;
    ELSIF p_current_level = 1 THEN RETURN QUERY SELECT 450, 12, false;
    ELSIF p_current_level = 2 THEN RETURN QUERY SELECT 1000, 25, false;
    ELSE RETURN QUERY SELECT 0, 0, true; END IF;
  ELSIF p_building = 'archery' THEN
    IF p_current_level = 0 THEN RETURN QUERY SELECT 150, 4, false;
    ELSIF p_current_level = 1 THEN RETURN QUERY SELECT 500, 18, false;
    ELSE RETURN QUERY SELECT 0, 0, true; END IF;
  ELSIF p_building = 'wall' THEN
    IF p_current_level = 0 THEN RETURN QUERY SELECT 150, 3, false;
    ELSIF p_current_level = 1 THEN RETURN QUERY SELECT 400, 8, false;
    ELSIF p_current_level = 2 THEN RETURN QUERY SELECT 900, 20, false;
    ELSE RETURN QUERY SELECT 0, 0, true; END IF;
  ELSE
    RAISE EXCEPTION 'Unknown building %', p_building;
  END IF;
END $$;

-- Unit lookup: cost, min_player_level, required building level check
CREATE OR REPLACE FUNCTION public._kingdom_unit_info(p_unit text)
RETURNS TABLE(cost int, min_player_level int, req_building text, req_level int)
LANGUAGE plpgsql IMMUTABLE
AS $$
BEGIN
  IF p_unit = 'militia' THEN RETURN QUERY SELECT 8, 1, NULL::text, 0;
  ELSIF p_unit = 'archer' THEN RETURN QUERY SELECT 15, 4, 'archery'::text, 1;
  ELSIF p_unit = 'swordsman' THEN RETURN QUERY SELECT 20, 2, 'barracks'::text, 1;
  ELSIF p_unit = 'knight' THEN RETURN QUERY SELECT 45, 12, 'barracks'::text, 2;
  ELSIF p_unit = 'catapult' THEN RETURN QUERY SELECT 120, 25, 'barracks'::text, 3;
  ELSE RAISE EXCEPTION 'Unknown unit %', p_unit; END IF;
END $$;

-- Generate a rival composition scaled to player level
CREATE OR REPLACE FUNCTION public._kingdom_generate_rival(p_player_level int)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  names text[] := ARRAY['Ashenvale Horde','Frostbane Legion','Crimson Talon Clan','Ironclad Dominion','Shadowmere Raiders'];
  scale numeric := GREATEST(1.0, p_player_level::numeric * 0.6);
  r jsonb;
BEGIN
  r := jsonb_build_object(
    'enemy', names[1 + floor(random()*array_length(names,1))::int],
    'militia', GREATEST(0, floor(scale * (8 + random()*12))::int),
    'archer', CASE WHEN p_player_level >= 4 THEN floor(scale * (2 + random()*6))::int ELSE 0 END,
    'swordsman', CASE WHEN p_player_level >= 3 THEN floor(scale * (1 + random()*5))::int ELSE 0 END,
    'knight', CASE WHEN p_player_level >= 10 THEN floor(scale * (0 + random()*3))::int ELSE 0 END,
    'catapult', CASE WHEN p_player_level >= 20 THEN floor(scale * (0 + random()*1.5))::int ELSE 0 END,
    'wall_level', LEAST(3, floor(p_player_level::numeric / 8)::int),
    'watchtower_level', LEAST(2, floor(p_player_level::numeric / 12)::int)
  );
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public._kingdom_row_to_json(ks public.kingdom_states)
RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$ SELECT to_jsonb(ks) $$;

-- ============ MAIN RPCS ============

CREATE OR REPLACE FUNCTION public.kingdom_resolve_raids_rpc()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ks public.kingdom_states;
  prof_level int;
  raids_due int;
  rival jsonb;
  rival_attack int;
  my_defense int;
  won boolean;
  log jsonb;
  entry jsonb;
  i int;
  loss_frac numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  ks := public._kingdom_ensure(auth.uid());
  SELECT level INTO prof_level FROM public.profiles WHERE user_id = auth.uid();
  prof_level := COALESCE(prof_level, 1);

  raids_due := FLOOR(EXTRACT(EPOCH FROM (now() - ks.last_raid_check)) / (6*3600))::int;
  IF raids_due <= 0 THEN RETURN to_jsonb(ks); END IF;
  raids_due := LEAST(raids_due, 3); -- cap catch-up

  log := ks.battle_log;
  FOR i IN 1..raids_due LOOP
    rival := public._kingdom_generate_rival(prof_level);
    rival_attack := public._kingdom_formation_power(
      (rival->>'militia')::int, (rival->>'archer')::int, (rival->>'swordsman')::int,
      (rival->>'knight')::int, (rival->>'catapult')::int,
      (rival->>'wall_level')::int, (rival->>'watchtower_level')::int, false);
    my_defense := public._kingdom_formation_power(
      ks.militia_count, ks.archer_count, ks.swordsman_count, ks.knight_count, ks.catapult_count,
      ks.wall_level, ks.watchtower_level, true);
    won := my_defense >= rival_attack;

    IF won THEN
      loss_frac := 0.10;
      ks.wins := ks.wins + 1;
    ELSE
      loss_frac := 0.35;
      ks.losses := ks.losses + 1;
    END IF;

    ks.militia_count := GREATEST(0, ks.militia_count - CEIL(ks.militia_count * loss_frac)::int);
    ks.archer_count := GREATEST(0, ks.archer_count - CEIL(ks.archer_count * loss_frac)::int);
    ks.swordsman_count := GREATEST(0, ks.swordsman_count - CEIL(ks.swordsman_count * loss_frac)::int);
    ks.knight_count := GREATEST(0, ks.knight_count - CEIL(ks.knight_count * loss_frac * 0.6)::int);
    ks.catapult_count := GREATEST(0, ks.catapult_count - CEIL(ks.catapult_count * loss_frac * 0.5)::int);

    entry := jsonb_build_object(
      'type','raid','enemy', rival->>'enemy','won', won,
      'attack_power', rival_attack, 'defense_power', my_defense,
      'xp_reward', 0, 'at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    );
    log := jsonb_build_array(entry) || log;
  END LOOP;

  IF jsonb_array_length(log) > 20 THEN
    log := (SELECT jsonb_agg(e) FROM (SELECT e FROM jsonb_array_elements(log) WITH ORDINALITY t(e, ord) ORDER BY ord LIMIT 20) x);
  END IF;

  UPDATE public.kingdom_states SET
    militia_count = ks.militia_count, archer_count = ks.archer_count,
    swordsman_count = ks.swordsman_count, knight_count = ks.knight_count, catapult_count = ks.catapult_count,
    wins = ks.wins, losses = ks.losses,
    last_raid_check = now(), battle_log = log
  WHERE user_id = auth.uid()
  RETURNING * INTO ks;
  RETURN to_jsonb(ks);
END $$;

CREATE OR REPLACE FUNCTION public.kingdom_build_rpc(p_building text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ks public.kingdom_states;
  cur_level int;
  info record;
  prof_level int;
  col text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_building NOT IN ('town_hall','wall','watchtower','barracks','archery') THEN
    RAISE EXCEPTION 'Unknown building';
  END IF;

  ks := public._kingdom_ensure(auth.uid());
  col := p_building || '_level';
  EXECUTE format('SELECT ($1).%I', col) INTO cur_level USING ks;

  SELECT * INTO info FROM public._kingdom_building_next(p_building, cur_level);
  IF info.is_max THEN RAISE EXCEPTION 'Already max level'; END IF;

  SELECT level INTO prof_level FROM public.profiles WHERE user_id = auth.uid();
  IF COALESCE(prof_level,1) < info.min_player_level THEN
    RAISE EXCEPTION 'Requires study level %', info.min_player_level;
  END IF;

  -- Non-town-hall buildings capped at town hall level
  IF p_building <> 'town_hall' AND (cur_level + 1) > ks.town_hall_level + 1 THEN
    RAISE EXCEPTION 'Upgrade Town Hall first';
  END IF;

  PERFORM public._kingdom_spend_xp(auth.uid(), info.cost);

  EXECUTE format('UPDATE public.kingdom_states SET %I = %I + 1 WHERE user_id = $1 RETURNING *', col, col)
    INTO ks USING auth.uid();
  RETURN to_jsonb(ks);
END $$;

CREATE OR REPLACE FUNCTION public.kingdom_train_rpc(p_unit text, p_quantity int)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ks public.kingdom_states;
  info record;
  prof_level int;
  building_level int;
  total_cost int;
  col text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 200 THEN
    RAISE EXCEPTION 'Invalid quantity';
  END IF;
  IF p_unit NOT IN ('militia','archer','swordsman','knight','catapult') THEN
    RAISE EXCEPTION 'Unknown unit';
  END IF;

  ks := public._kingdom_ensure(auth.uid());
  SELECT * INTO info FROM public._kingdom_unit_info(p_unit);

  SELECT level INTO prof_level FROM public.profiles WHERE user_id = auth.uid();
  IF COALESCE(prof_level,1) < info.min_player_level THEN
    RAISE EXCEPTION 'Requires study level %', info.min_player_level;
  END IF;

  IF info.req_building IS NOT NULL THEN
    EXECUTE format('SELECT ($1).%I', info.req_building || '_level') INTO building_level USING ks;
    IF building_level < info.req_level THEN
      RAISE EXCEPTION 'Requires % level %', info.req_building, info.req_level;
    END IF;
  END IF;

  total_cost := info.cost * p_quantity;
  PERFORM public._kingdom_spend_xp(auth.uid(), total_cost);

  col := p_unit || '_count';
  EXECUTE format('UPDATE public.kingdom_states SET %I = %I + $2 WHERE user_id = $1 RETURNING *', col, col)
    INTO ks USING auth.uid(), p_quantity;
  RETURN to_jsonb(ks);
END $$;

CREATE OR REPLACE FUNCTION public.kingdom_scout_rpc()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ks public.kingdom_states;
  prof_level int;
  rival jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  ks := public._kingdom_ensure(auth.uid());

  IF ks.scouted_at IS NOT NULL AND ks.scouted_at > now() - interval '2 minutes' THEN
    RAISE EXCEPTION 'Scouts still resting';
  END IF;

  SELECT level INTO prof_level FROM public.profiles WHERE user_id = auth.uid();
  rival := public._kingdom_generate_rival(COALESCE(prof_level,1));

  UPDATE public.kingdom_states
    SET scout_target = rival, scouted_at = now()
    WHERE user_id = auth.uid()
    RETURNING * INTO ks;
  RETURN to_jsonb(ks);
END $$;

CREATE OR REPLACE FUNCTION public.kingdom_attack_rpc()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  ks public.kingdom_states;
  prof_level int;
  target jsonb;
  my_attack int;
  their_defense int;
  won boolean;
  xp_reward int := 0;
  log jsonb;
  entry jsonb;
  loss_frac numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  ks := public._kingdom_ensure(auth.uid());

  IF ks.last_player_attack IS NOT NULL AND ks.last_player_attack > now() - interval '20 minutes' THEN
    RAISE EXCEPTION 'Army still recovering';
  END IF;

  IF (ks.militia_count + ks.archer_count + ks.swordsman_count + ks.knight_count + ks.catapult_count) = 0 THEN
    RAISE EXCEPTION 'You have no army to send';
  END IF;

  SELECT level INTO prof_level FROM public.profiles WHERE user_id = auth.uid();
  target := COALESCE(ks.scout_target, public._kingdom_generate_rival(COALESCE(prof_level,1)));

  my_attack := public._kingdom_formation_power(
    ks.militia_count, ks.archer_count, ks.swordsman_count, ks.knight_count, ks.catapult_count,
    ks.wall_level, ks.watchtower_level, false);
  their_defense := public._kingdom_formation_power(
    (target->>'militia')::int, (target->>'archer')::int, (target->>'swordsman')::int,
    (target->>'knight')::int, (target->>'catapult')::int,
    (target->>'wall_level')::int, (target->>'watchtower_level')::int, true);
  won := my_attack >= their_defense;

  IF won THEN
    xp_reward := LEAST(50, 15 + COALESCE(prof_level,1) * 2);
    loss_frac := 0.15;
    ks.wins := ks.wins + 1;
  ELSE
    loss_frac := 0.40;
    ks.losses := ks.losses + 1;
  END IF;

  ks.militia_count := GREATEST(0, ks.militia_count - CEIL(ks.militia_count * loss_frac)::int);
  ks.archer_count := GREATEST(0, ks.archer_count - CEIL(ks.archer_count * loss_frac)::int);
  ks.swordsman_count := GREATEST(0, ks.swordsman_count - CEIL(ks.swordsman_count * loss_frac)::int);
  ks.knight_count := GREATEST(0, ks.knight_count - CEIL(ks.knight_count * loss_frac * 0.6)::int);
  ks.catapult_count := GREATEST(0, ks.catapult_count - CEIL(ks.catapult_count * loss_frac * 0.5)::int);

  entry := jsonb_build_object(
    'type','attack','enemy', target->>'enemy','won', won,
    'attack_power', my_attack, 'defense_power', their_defense,
    'xp_reward', xp_reward, 'at', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
  );
  log := jsonb_build_array(entry) || ks.battle_log;
  IF jsonb_array_length(log) > 20 THEN
    log := (SELECT jsonb_agg(e) FROM (SELECT e FROM jsonb_array_elements(log) WITH ORDINALITY t(e, ord) ORDER BY ord LIMIT 20) x);
  END IF;

  UPDATE public.kingdom_states SET
    militia_count = ks.militia_count, archer_count = ks.archer_count,
    swordsman_count = ks.swordsman_count, knight_count = ks.knight_count, catapult_count = ks.catapult_count,
    wins = ks.wins, losses = ks.losses,
    last_player_attack = now(),
    scout_target = NULL, scouted_at = NULL,
    battle_log = log
  WHERE user_id = auth.uid()
  RETURNING * INTO ks;

  IF won AND xp_reward > 0 THEN
    PERFORM public._kingdom_award_xp(auth.uid(), xp_reward);
  END IF;

  RETURN to_jsonb(ks);
END $$;

-- ============ GRANTS ============
GRANT EXECUTE ON FUNCTION public.kingdom_resolve_raids_rpc() TO authenticated;
GRANT EXECUTE ON FUNCTION public.kingdom_build_rpc(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kingdom_train_rpc(text, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.kingdom_scout_rpc() TO authenticated;
GRANT EXECUTE ON FUNCTION public.kingdom_attack_rpc() TO authenticated;
