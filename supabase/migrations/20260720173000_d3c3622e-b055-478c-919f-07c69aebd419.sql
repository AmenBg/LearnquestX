-- Kingdom Wars — Phase 4: Combat depth.
-- Adds: scouting (reveal a rival's army before committing to an attack), formation-aware
-- power (frontline tanks, archers deal ranged damage + get a wall garrison bonus when
-- defending, catapults are an attack-only siege tool), loot that scales with the target's
-- strength, and a small chance to crack a wall on a decisive loss.

ALTER TABLE public.kingdom_states
  ADD COLUMN IF NOT EXISTS scout_target jsonb,
  ADD COLUMN IF NOT EXISTS scouted_at timestamptz;


-- Picks one of 5 flavoured rival archetypes and scales it to the player's level, so
-- scouted/raiding rivals stay roughly matched as the player grows. Internal helper only
-- (not exposed to clients) — used by kingdom_scout_rpc, kingdom_attack_rpc and
-- kingdom_resolve_raids_rpc so all three share one definition of "how strong is a rival".
CREATE OR REPLACE FUNCTION public.kingdom_generate_rival(p_player_level integer)
RETURNS jsonb
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  archetypes jsonb := '[
    {"name":"Ashenvale Horde","militia":15,"archer":3,"swordsman":2,"knight":0,"catapult":0,"wall":0,"watchtower":0},
    {"name":"Frostbane Legion","militia":4,"archer":6,"swordsman":6,"knight":1,"catapult":0,"wall":1,"watchtower":0},
    {"name":"Crimson Talon Clan","militia":3,"archer":12,"swordsman":3,"knight":0,"catapult":0,"wall":1,"watchtower":1},
    {"name":"Ironclad Dominion","militia":2,"archer":4,"swordsman":8,"knight":3,"catapult":0,"wall":2,"watchtower":1},
    {"name":"Shadowmere Raiders","militia":3,"archer":4,"swordsman":4,"knight":1,"catapult":1,"wall":1,"watchtower":0}
  ]'::jsonb;
  pick jsonb;
  factor numeric;
  knight_count integer;
  catapult_count integer;
  wall_level integer;
  watchtower_level integer;
BEGIN
  pick := archetypes -> FLOOR(random() * jsonb_array_length(archetypes))::int;
  factor := GREATEST(1.0, p_player_level / 6.0);

  knight_count := ROUND((pick->>'knight')::numeric * factor)::int;
  IF p_player_level < 12 THEN knight_count := 0; END IF;
  catapult_count := ROUND((pick->>'catapult')::numeric * factor)::int;
  IF p_player_level < 25 THEN catapult_count := 0; END IF;

  wall_level := LEAST(3, (pick->>'wall')::int + (CASE WHEN p_player_level >= 20 THEN 1 ELSE 0 END));
  watchtower_level := LEAST(2, (pick->>'watchtower')::int + (CASE WHEN p_player_level >= 20 THEN 1 ELSE 0 END));

  RETURN jsonb_build_object(
    'enemy', pick->>'name',
    'militia', ROUND((pick->>'militia')::numeric * factor)::int,
    'archer', ROUND((pick->>'archer')::numeric * factor)::int,
    'swordsman', ROUND((pick->>'swordsman')::numeric * factor)::int,
    'knight', knight_count,
    'catapult', catapult_count,
    'wall_level', wall_level,
    'watchtower_level', watchtower_level
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.kingdom_generate_rival(integer) FROM PUBLIC;


-- Shared formation-power formula. Frontline (militia/swordsmen/knights) absorbs the fight,
-- archers deal ranged damage on top, catapults are a siege tool. Defenders get a wall
-- multiplier on frontline, a +25% garrison bonus on archers once any wall is built, and a
-- flat watchtower bonus. Attackers get a +30% bonus on their catapults (good vs static
-- defenses) instead. Internal helper only, not exposed to clients.
CREATE OR REPLACE FUNCTION public.kingdom_power(
  p_militia integer, p_archer integer, p_swordsman integer, p_knight integer, p_catapult integer,
  p_wall integer, p_watchtower integer, p_is_defender boolean
)
RETURNS numeric
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  frontline numeric;
  ranged numeric;
  siege numeric;
BEGIN
  frontline := p_militia * 2 + p_swordsman * 8 + p_knight * 18;
  ranged := p_archer * 5;
  siege := p_catapult * 40;

  IF p_is_defender THEN
    frontline := frontline * (1 + p_wall * 0.15);
    IF p_wall >= 1 THEN ranged := ranged * 1.25; END IF;
    RETURN frontline + ranged + siege + (p_watchtower * 30);
  END IF;

  RETURN frontline + ranged + (siege * 1.3);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.kingdom_power(integer, integer, integer, integer, integer, integer, integer, boolean) FROM PUBLIC;


-- Scout a rival before attacking: reveals their composition so the player can decide
-- whether to engage. 2-minute cooldown between scouting rolls.
CREATE OR REPLACE FUNCTION public.kingdom_scout_rpc()
RETURNS public.kingdom_states
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k public.kingdom_states;
  player_level integer;
  cooldown_remaining numeric;
  rival jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    INSERT INTO public.kingdom_states (user_id) VALUES (auth.uid()) RETURNING * INTO k;
  END IF;

  IF k.scouted_at IS NOT NULL THEN
    cooldown_remaining := EXTRACT(EPOCH FROM (k.scouted_at + interval '2 minutes' - now()));
    IF cooldown_remaining > 0 THEN
      RAISE EXCEPTION 'Scouts are still out. Wait % more seconds', CEIL(cooldown_remaining);
    END IF;
  END IF;

  SELECT level INTO player_level FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  rival := public.kingdom_generate_rival(player_level);

  UPDATE public.kingdom_states
  SET scout_target = rival, scouted_at = now(), updated_at = now()
  WHERE user_id = auth.uid();

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  RETURN k;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.kingdom_scout_rpc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kingdom_scout_rpc() TO authenticated;


-- Player-initiated raid, now formation-aware. Uses the scouted target if one is active,
-- otherwise generates (and reveals only afterwards) a blind target. Loot scales with the
-- target's power. Consumes the scout on resolution either way.
CREATE OR REPLACE FUNCTION public.kingdom_attack_rpc()
RETURNS public.kingdom_states
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k public.kingdom_states;
  player_level integer;
  attacker_power numeric;
  defender_power numeric;
  rival jsonb;
  enemy_name text;
  won boolean;
  xp_reward integer;
  capped_reward integer;
  today_xp integer;
  today_date date;
  entry jsonb;
  new_log jsonb;
  cooldown_remaining numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    INSERT INTO public.kingdom_states (user_id) VALUES (auth.uid()) RETURNING * INTO k;
  END IF;

  IF k.last_player_attack IS NOT NULL THEN
    cooldown_remaining := EXTRACT(EPOCH FROM (k.last_player_attack + interval '20 minutes' - now()));
    IF cooldown_remaining > 0 THEN
      RAISE EXCEPTION 'Army is still resting. Wait % more seconds', CEIL(cooldown_remaining);
    END IF;
  END IF;

  attacker_power := public.kingdom_power(k.militia_count, k.archer_count, k.swordsman_count, k.knight_count, k.catapult_count, k.wall_level, k.watchtower_level, false);
  IF attacker_power < 5 THEN
    RAISE EXCEPTION 'Train some units before attacking';
  END IF;

  IF k.scout_target IS NOT NULL THEN
    rival := k.scout_target;
  ELSE
    SELECT level INTO player_level FROM public.profiles WHERE user_id = auth.uid();
    rival := public.kingdom_generate_rival(COALESCE(player_level, 1));
  END IF;

  enemy_name := rival->>'enemy';
  defender_power := public.kingdom_power(
    (rival->>'militia')::int, (rival->>'archer')::int, (rival->>'swordsman')::int,
    (rival->>'knight')::int, (rival->>'catapult')::int,
    (rival->>'wall_level')::int, (rival->>'watchtower_level')::int, true
  );

  won := attacker_power >= defender_power;

  IF won THEN
    xp_reward := GREATEST(10, ROUND(defender_power * 0.4)::int);
    SELECT xp_today, xp_today_date INTO today_xp, today_date FROM public.profiles WHERE user_id = auth.uid();
    IF today_date IS NULL OR today_date <> CURRENT_DATE THEN today_xp := 0; END IF;
    capped_reward := LEAST(xp_reward, GREATEST(0, 1000 - today_xp));
    IF capped_reward > 0 THEN
      PERFORM set_config('app.allow_xp_update', 'true', true);
      UPDATE public.profiles
      SET xp = xp + capped_reward, xp_today = today_xp + capped_reward, xp_today_date = CURRENT_DATE
      WHERE user_id = auth.uid();
    END IF;
  ELSE
    capped_reward := 0;
  END IF;

  entry := jsonb_build_object(
    'type', 'attack', 'enemy', enemy_name, 'won', won,
    'attack_power', round(attacker_power), 'defense_power', round(defender_power),
    'xp_reward', capped_reward, 'at', now()
  );
  new_log := jsonb_build_array(entry) || k.battle_log;
  IF jsonb_array_length(new_log) > 15 THEN
    SELECT jsonb_agg(elem ORDER BY ord) INTO new_log
    FROM jsonb_array_elements(new_log) WITH ORDINALITY AS t(elem, ord)
    WHERE ord <= 15;
  END IF;

  UPDATE public.kingdom_states
  SET last_player_attack = now(), battle_log = new_log, scout_target = NULL, updated_at = now()
  WHERE user_id = auth.uid();

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  RETURN k;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.kingdom_attack_rpc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kingdom_attack_rpc() TO authenticated;


-- Passive incoming raids, now formation-aware. Losses hit the frontline hardest, archers
-- are partly protected, and a decisive loss (defense under 60% of the attack) cracks the
-- wall down one level — needs XP to repair, giving neglecting defense a real cost without
-- ever touching the player's other buildings.
CREATE OR REPLACE FUNCTION public.kingdom_resolve_raids_rpc()
RETURNS public.kingdom_states
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  k public.kingdom_states;
  player_level integer;
  hours_elapsed numeric;
  raids_to_resolve integer;
  i integer;
  rival jsonb;
  attack_power numeric;
  defense_power numeric;
  enemy_name text;
  won boolean;
  xp_reward integer;
  today_xp integer;
  today_date date;
  capped_reward integer;
  new_log jsonb;
  entry jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  IF NOT FOUND THEN
    INSERT INTO public.kingdom_states (user_id) VALUES (auth.uid()) RETURNING * INTO k;
  END IF;

  SELECT level INTO player_level FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  hours_elapsed := EXTRACT(EPOCH FROM (now() - k.last_raid_check)) / 3600.0;
  raids_to_resolve := LEAST(FLOOR(hours_elapsed / 6.0)::integer, 3);

  IF raids_to_resolve < 1 THEN
    RETURN k;
  END IF;

  new_log := k.battle_log;

  FOR i IN 1..raids_to_resolve LOOP
    rival := public.kingdom_generate_rival(player_level);
    enemy_name := rival->>'enemy';

    attack_power := public.kingdom_power(
      (rival->>'militia')::int, (rival->>'archer')::int, (rival->>'swordsman')::int,
      (rival->>'knight')::int, (rival->>'catapult')::int,
      (rival->>'wall_level')::int, (rival->>'watchtower_level')::int, false
    );
    defense_power := public.kingdom_power(
      k.militia_count, k.archer_count, k.swordsman_count, k.knight_count, k.catapult_count,
      k.wall_level, k.watchtower_level, true
    );

    IF defense_power >= attack_power THEN
      won := true;
      k.wins := k.wins + 1;
      xp_reward := 10 + FLOOR(random() * 15)::int;

      SELECT xp_today, xp_today_date INTO today_xp, today_date FROM public.profiles WHERE user_id = auth.uid();
      IF today_date IS NULL OR today_date <> CURRENT_DATE THEN today_xp := 0; END IF;
      capped_reward := LEAST(xp_reward, GREATEST(0, 1000 - today_xp));

      IF capped_reward > 0 THEN
        PERFORM set_config('app.allow_xp_update', 'true', true);
        UPDATE public.profiles
        SET xp = xp + capped_reward, xp_today = today_xp + capped_reward, xp_today_date = CURRENT_DATE
        WHERE user_id = auth.uid();
      END IF;
    ELSE
      won := false;
      k.losses := k.losses + 1;
      capped_reward := 0;
      k.militia_count := GREATEST(0, k.militia_count - FLOOR(k.militia_count * 0.3)::int);
      k.swordsman_count := GREATEST(0, k.swordsman_count - FLOOR(k.swordsman_count * 0.3)::int);
      k.knight_count := GREATEST(0, k.knight_count - FLOOR(k.knight_count * 0.3)::int);
      k.archer_count := GREATEST(0, k.archer_count - FLOOR(k.archer_count * 0.15)::int);
      k.catapult_count := GREATEST(0, k.catapult_count - FLOOR(k.catapult_count * 0.1)::int);
      IF defense_power < attack_power * 0.6 THEN
        k.wall_level := GREATEST(0, k.wall_level - 1);
      END IF;
    END IF;

    entry := jsonb_build_object(
      'type', 'raid', 'enemy', enemy_name, 'won', won,
      'attack_power', round(attack_power), 'defense_power', round(defense_power),
      'xp_reward', capped_reward, 'at', now()
    );
    new_log := jsonb_build_array(entry) || new_log;
  END LOOP;

  IF jsonb_array_length(new_log) > 15 THEN
    SELECT jsonb_agg(elem ORDER BY ord) INTO new_log
    FROM jsonb_array_elements(new_log) WITH ORDINALITY AS t(elem, ord)
    WHERE ord <= 15;
  END IF;

  UPDATE public.kingdom_states
  SET militia_count = k.militia_count,
      archer_count = k.archer_count,
      swordsman_count = k.swordsman_count,
      knight_count = k.knight_count,
      catapult_count = k.catapult_count,
      wall_level = k.wall_level,
      wins = k.wins,
      losses = k.losses,
      battle_log = new_log,
      last_raid_check = k.last_raid_check + make_interval(hours => raids_to_resolve * 6),
      updated_at = now()
  WHERE user_id = auth.uid();

  SELECT * INTO k FROM public.kingdom_states WHERE user_id = auth.uid();
  RETURN k;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.kingdom_resolve_raids_rpc() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kingdom_resolve_raids_rpc() TO authenticated;
