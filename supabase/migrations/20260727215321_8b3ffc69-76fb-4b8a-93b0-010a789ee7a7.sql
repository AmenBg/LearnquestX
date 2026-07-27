
ALTER FUNCTION public._kingdom_formation_power(int,int,int,int,int,int,int,boolean) SET search_path = public;
ALTER FUNCTION public._kingdom_building_next(text,int) SET search_path = public;
ALTER FUNCTION public._kingdom_unit_info(text) SET search_path = public;
ALTER FUNCTION public._kingdom_generate_rival(int) SET search_path = public;
ALTER FUNCTION public._kingdom_row_to_json(public.kingdom_states) SET search_path = public;

REVOKE EXECUTE ON FUNCTION public._kingdom_ensure(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public._kingdom_spend_xp(uuid, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public._kingdom_award_xp(uuid, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.kingdom_resolve_raids_rpc() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.kingdom_build_rpc(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.kingdom_train_rpc(text, int) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.kingdom_scout_rpc() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.kingdom_attack_rpc() FROM PUBLIC, anon;
