
-- ============= 1. QUIZ_MATCHES integrity trigger =============
CREATE OR REPLACE FUNCTION public.protect_quiz_matches()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Immutable fields
  NEW.created_by := OLD.created_by;
  NEW.match_type := OLD.match_type;
  NEW.max_players := OLD.max_players;
  NEW.created_at := OLD.created_at;

  -- question_data is write-once: once non-empty, cannot change
  IF OLD.question_data IS NOT NULL
     AND jsonb_typeof(OLD.question_data) = 'array'
     AND jsonb_array_length(OLD.question_data) > 0
     AND NEW.question_data IS DISTINCT FROM OLD.question_data THEN
    NEW.question_data := OLD.question_data;
  END IF;

  -- started_at / finished_at write-once
  IF OLD.started_at IS NOT NULL AND NEW.started_at IS DISTINCT FROM OLD.started_at THEN
    NEW.started_at := OLD.started_at;
  END IF;
  IF OLD.finished_at IS NOT NULL AND NEW.finished_at IS DISTINCT FROM OLD.finished_at THEN
    NEW.finished_at := OLD.finished_at;
  END IF;

  -- status: only forward transitions waiting -> active -> finished
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'waiting' AND NEW.status IN ('active','finished'))
      OR (OLD.status = 'active' AND NEW.status = 'finished')
    ) THEN
      NEW.status := OLD.status;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_quiz_matches ON public.quiz_matches;
CREATE TRIGGER trg_protect_quiz_matches
BEFORE UPDATE ON public.quiz_matches
FOR EACH ROW EXECUTE FUNCTION public.protect_quiz_matches();

-- ============= 2. SUBJECT_PROGRESS lockdown =============
-- Not currently written from client code; remove direct write privileges.
DROP POLICY IF EXISTS "Users can insert own progress" ON public.subject_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.subject_progress;
REVOKE INSERT, UPDATE, DELETE ON public.subject_progress FROM authenticated, anon;
-- service_role and SECURITY DEFINER functions retain access.

-- ============= 3. USER_ACHIEVEMENTS server-validated unlock =============

-- Prevent duplicates at the schema level.
CREATE UNIQUE INDEX IF NOT EXISTS user_achievements_user_ach_uidx
  ON public.user_achievements (user_id, achievement_id);

-- Server-side catalog of valid achievements with unlock criteria.
CREATE TABLE IF NOT EXISTS public.achievement_catalog (
  achievement_id text PRIMARY KEY,
  xp_reward integer NOT NULL DEFAULT 0,
  min_xp integer,
  min_level integer,
  min_streak integer
);

GRANT SELECT ON public.achievement_catalog TO authenticated, anon;
GRANT ALL ON public.achievement_catalog TO service_role;

ALTER TABLE public.achievement_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Catalog readable by anyone" ON public.achievement_catalog;
CREATE POLICY "Catalog readable by anyone" ON public.achievement_catalog
  FOR SELECT USING (true);

-- Seed catalog (idempotent).
INSERT INTO public.achievement_catalog (achievement_id, xp_reward, min_xp, min_level, min_streak) VALUES
  -- Learning
  ('first_correct',10,NULL,NULL,NULL),('correct_10',25,NULL,NULL,NULL),('correct_50',50,NULL,NULL,NULL),
  ('correct_100',100,NULL,NULL,NULL),('correct_500',200,NULL,NULL,NULL),('correct_1000',500,NULL,NULL,NULL),
  ('perfect_quiz',30,NULL,NULL,NULL),('perfect_5',75,NULL,NULL,NULL),
  ('math_master',60,NULL,NULL,NULL),('science_master',60,NULL,NULL,NULL),('language_master',60,NULL,NULL,NULL),
  ('all_subjects',100,NULL,NULL,NULL),
  -- Streak (server-validated)
  ('streak_3',15,NULL,NULL,3),('streak_7',35,NULL,NULL,7),('streak_14',70,NULL,NULL,14),
  ('streak_30',150,NULL,NULL,30),('streak_60',300,NULL,NULL,60),('streak_90',500,NULL,NULL,90),
  ('streak_180',1000,NULL,NULL,180),('streak_365',2500,NULL,NULL,365),
  -- Speed
  ('fast_answer',15,NULL,NULL,NULL),('fast_5_row',40,NULL,NULL,NULL),('fast_10_row',80,NULL,NULL,NULL),
  ('quiz_under_1min',30,NULL,NULL,NULL),('quiz_under_30s',60,NULL,NULL,NULL),
  ('exercise_speed_10',50,NULL,NULL,NULL),('reaction_master',25,NULL,NULL,NULL),('speed_legend',200,NULL,NULL,NULL),
  -- Competitive
  ('first_mp_win',20,NULL,NULL,NULL),('mp_wins_5',50,NULL,NULL,NULL),('mp_wins_10',100,NULL,NULL,NULL),
  ('mp_wins_25',200,NULL,NULL,NULL),('mp_wins_50',500,NULL,NULL,NULL),('mp_top1',25,NULL,NULL,NULL),
  ('mp_perfect',75,NULL,NULL,NULL),('beat_stronger',40,NULL,NULL,NULL),
  ('win_streak_3',50,NULL,NULL,NULL),('win_streak_5',100,NULL,NULL,NULL),
  ('ai_easy_win',10,NULL,NULL,NULL),('ai_expert_win',100,NULL,NULL,NULL),
  -- Games
  ('first_game',10,NULL,NULL,NULL),('games_5',30,NULL,NULL,NULL),('games_10',60,NULL,NULL,NULL),
  ('games_25',150,NULL,NULL,NULL),('games_all',500,NULL,NULL,NULL),
  ('chess_first_win',20,NULL,NULL,NULL),('chess_10_wins',75,NULL,NULL,NULL),('chess_beat_immortal',500,NULL,NULL,NULL),
  -- Special (server-validated milestones)
  ('xp_1000',50,1000,NULL,NULL),('xp_5000',100,5000,NULL,NULL),('xp_10000',250,10000,NULL,NULL),('xp_50000',1000,50000,NULL,NULL),
  ('level_5',30,NULL,5,NULL),('level_10',75,NULL,10,NULL),('level_25',200,NULL,25,NULL),('level_50',500,NULL,50,NULL),
  ('first_arena',15,NULL,NULL,NULL),('arena_10',50,NULL,NULL,NULL),('secret_explorer',100,NULL,NULL,NULL),
  -- Starter
  ('welcome',5,NULL,NULL,NULL),('profile_complete',5,NULL,NULL,NULL),('first_lesson_open',5,NULL,NULL,NULL),
  ('first_quiz_answer',5,NULL,NULL,NULL),('first_subject_visit',5,NULL,NULL,NULL),('first_theme_swap',10,NULL,NULL,NULL),
  ('first_settings',5,NULL,NULL,NULL),('three_lessons',15,NULL,NULL,NULL),('first_language_pick',10,NULL,NULL,NULL),
  ('first_xp_milestone',10,100,NULL,NULL),
  -- Code
  ('code_first_run',10,NULL,NULL,NULL),('code_first_lesson',15,NULL,NULL,NULL),('code_first_perfect',20,NULL,NULL,NULL),
  ('code_no_hints',25,NULL,NULL,NULL),('code_5_lessons',30,NULL,NULL,NULL),('code_10_lessons',60,NULL,NULL,NULL),
  ('code_30_lessons',150,NULL,NULL,NULL),('code_2_languages',25,NULL,NULL,NULL),('code_5_languages',80,NULL,NULL,NULL),
  ('code_all_languages',250,NULL,NULL,NULL),('code_expert_level',30,NULL,NULL,NULL),
  ('code_python_first',10,NULL,NULL,NULL),('code_js_first',10,NULL,NULL,NULL),
  ('code_streak_3',20,NULL,NULL,NULL),('code_streak_10',75,NULL,NULL,NULL)
ON CONFLICT (achievement_id) DO UPDATE
  SET xp_reward = EXCLUDED.xp_reward,
      min_xp = EXCLUDED.min_xp,
      min_level = EXCLUDED.min_level,
      min_streak = EXCLUDED.min_streak;

-- Server-side unlock RPC
CREATE OR REPLACE FUNCTION public.unlock_achievement_rpc(p_achievement_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cat record;
  prof record;
  already boolean;
  new_xp integer;
  new_level integer;
  daily_cap constant integer := 1000;
  today_xp integer;
  today_date date;
  capped integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO cat FROM public.achievement_catalog WHERE achievement_id = p_achievement_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown achievement'; END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = auth.uid() AND achievement_id = p_achievement_id
  ) INTO already;
  IF already THEN RETURN false; END IF;

  SELECT xp, level, streak, xp_today, xp_today_date
    INTO prof FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  -- Server-side milestone checks
  IF cat.min_xp IS NOT NULL AND prof.xp < cat.min_xp THEN
    RAISE EXCEPTION 'Criteria not met';
  END IF;
  IF cat.min_level IS NOT NULL AND prof.level < cat.min_level THEN
    RAISE EXCEPTION 'Criteria not met';
  END IF;
  IF cat.min_streak IS NOT NULL AND prof.streak < cat.min_streak THEN
    RAISE EXCEPTION 'Criteria not met';
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (auth.uid(), p_achievement_id);

  IF cat.xp_reward > 0 THEN
    today_xp := COALESCE(prof.xp_today, 0);
    today_date := prof.xp_today_date;
    IF today_date IS NULL OR today_date <> CURRENT_DATE THEN today_xp := 0; END IF;
    capped := LEAST(cat.xp_reward, GREATEST(0, daily_cap - today_xp));
    IF capped > 0 THEN
      new_xp := prof.xp + capped;
      new_level := FLOOR(new_xp / 400) + 1;
      PERFORM set_config('app.allow_xp_update', 'true', true);
      UPDATE public.profiles
        SET xp = new_xp,
            level = new_level,
            xp_today = today_xp + capped,
            xp_today_date = CURRENT_DATE,
            last_activity_date = CURRENT_DATE
        WHERE user_id = auth.uid();
    END IF;
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_achievement_rpc(text) TO authenticated;

-- Remove direct INSERT privilege; only the RPC may insert.
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
REVOKE INSERT, UPDATE, DELETE ON public.user_achievements FROM authenticated, anon;
