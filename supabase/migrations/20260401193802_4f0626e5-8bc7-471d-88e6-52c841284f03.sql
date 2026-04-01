
-- 1. Add created_by column to quiz_matches
ALTER TABLE public.quiz_matches ADD COLUMN created_by uuid;

-- 2. Drop old permissive policies on quiz_matches
DROP POLICY IF EXISTS "Authenticated users can update matches" ON public.quiz_matches;
DROP POLICY IF EXISTS "Anyone can view matches" ON public.quiz_matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.quiz_matches;

-- 3. New INSERT policy that sets created_by
CREATE POLICY "Authenticated users can create matches"
  ON public.quiz_matches FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- 4. UPDATE restricted to creator or match participants
CREATE POLICY "Creator or participants can update match"
  ON public.quiz_matches FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.match_players mp WHERE mp.match_id = quiz_matches.id AND mp.user_id = auth.uid())
  );

-- 5. SELECT restricted to participants only
CREATE POLICY "Participants can view matches"
  ON public.quiz_matches FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.match_players mp WHERE mp.match_id = quiz_matches.id AND mp.user_id = auth.uid())
  );

-- 6. Trigger to cap exercise_history.xp_earned on insert
CREATE OR REPLACE FUNCTION public.cap_xp_earned()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  IF NEW.xp_earned < 0 THEN
    NEW.xp_earned := 0;
  END IF;
  IF NEW.xp_earned > 50 THEN
    NEW.xp_earned := 50;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cap_xp_earned_trigger
  BEFORE INSERT ON public.exercise_history
  FOR EACH ROW
  EXECUTE FUNCTION public.cap_xp_earned();

-- 7. Trigger to prevent client manipulation of match_players.score
CREATE OR REPLACE FUNCTION public.protect_match_score()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public'
AS $$
BEGIN
  -- Prevent clients from directly setting score to arbitrary values
  -- Score can only increase by 1 at a time (answering a question correctly)
  IF NEW.score IS DISTINCT FROM OLD.score THEN
    IF current_setting('app.allow_score_update', true) IS DISTINCT FROM 'true' THEN
      IF NEW.score > OLD.score + 1 OR NEW.score < OLD.score THEN
        NEW.score := OLD.score;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_match_score_trigger
  BEFORE UPDATE ON public.match_players
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_match_score();
