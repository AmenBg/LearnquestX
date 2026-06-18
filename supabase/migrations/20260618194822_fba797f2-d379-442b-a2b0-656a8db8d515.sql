
REVOKE EXECUTE ON FUNCTION public.get_match_questions(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.submit_match_answer(uuid, int, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_match_questions(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_match_answer(uuid, int, int) TO authenticated;
