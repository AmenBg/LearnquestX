
-- Private table holding the actual questions + answer keys; never published to Realtime.
CREATE TABLE IF NOT EXISTS public.quiz_match_questions (
  match_id uuid PRIMARY KEY REFERENCES public.quiz_matches(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.quiz_match_questions TO authenticated;
GRANT ALL ON public.quiz_match_questions TO service_role;

ALTER TABLE public.quiz_match_questions ENABLE ROW LEVEL SECURITY;

-- No SELECT policy: direct reads are blocked. Access happens via SECURITY DEFINER RPCs.
-- Allow match participants to insert the questions (write-once via PK).
DROP POLICY IF EXISTS "Participants can insert match questions" ON public.quiz_match_questions;
CREATE POLICY "Participants can insert match questions"
  ON public.quiz_match_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.match_players mp
      WHERE mp.match_id = quiz_match_questions.match_id
        AND mp.user_id = auth.uid()
    )
  );

-- Make sure the private questions table is NOT in the realtime publication.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'quiz_match_questions'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.quiz_match_questions';
  END IF;
END $$;

-- Return questions to participants with answer fields stripped.
CREATE OR REPLACE FUNCTION public.get_match_questions(p_match_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  qs jsonb;
  is_participant boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.match_players
    WHERE match_id = p_match_id AND user_id = auth.uid()
  ) INTO is_participant;

  IF NOT is_participant THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;

  SELECT questions INTO qs
  FROM public.quiz_match_questions
  WHERE match_id = p_match_id;

  IF qs IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN (
    SELECT jsonb_agg(q - 'correct' - 'accepted_answers' - 'explanation')
    FROM jsonb_array_elements(qs) AS q
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_match_questions(uuid) TO authenticated;

-- Server-side answer validation that bumps the score atomically.
CREATE OR REPLACE FUNCTION public.submit_match_answer(
  p_match_id uuid,
  p_question_index int,
  p_answer_index int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  qs jsonb;
  q jsonb;
  correct_idx int;
  is_correct boolean;
  match_status text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT status INTO match_status FROM public.quiz_matches WHERE id = p_match_id;
  IF match_status IS NULL THEN RAISE EXCEPTION 'Match not found'; END IF;
  IF match_status <> 'active' THEN RAISE EXCEPTION 'Match is not active'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.match_players
    WHERE match_id = p_match_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not a participant';
  END IF;

  SELECT questions INTO qs
  FROM public.quiz_match_questions
  WHERE match_id = p_match_id;

  IF qs IS NULL THEN RAISE EXCEPTION 'Questions not ready'; END IF;

  q := qs -> p_question_index;
  IF q IS NULL THEN RAISE EXCEPTION 'Invalid question index'; END IF;

  correct_idx := NULLIF(q ->> 'correct', '')::int;
  is_correct := correct_idx IS NOT NULL AND correct_idx = p_answer_index;

  IF is_correct THEN
    PERFORM set_config('app.allow_score_update', 'true', true);
    UPDATE public.match_players
      SET score = score + 1
      WHERE match_id = p_match_id AND user_id = auth.uid();
  END IF;

  RETURN is_correct;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_match_answer(uuid, int, int) TO authenticated;
