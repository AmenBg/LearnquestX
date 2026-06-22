UPDATE public.game_catalog SET xp_cost = CASE game_id
  WHEN 'quick-reflex'     THEN 650
  WHEN 'reaction-zone'    THEN 700
  WHEN 'shadow-memory'    THEN 800
  WHEN 'hidden-object'    THEN 800
  WHEN 'number-trap'      THEN 800
  WHEN 'shape-storm'      THEN 800
  WHEN 'word-search'      THEN 800
  WHEN 'word-clash'       THEN 900
  WHEN 'word-chain'       THEN 950
  WHEN 'number-grid'      THEN 950
  WHEN 'brain-tracker'    THEN 950
  WHEN 'fast-math-duel'   THEN 950
  WHEN 'speed-logic'      THEN 950
  WHEN 'pattern-escape'   THEN 1050
  WHEN 'memory-grid-pro'  THEN 1050
  WHEN 'geometry-builder' THEN 1050
  WHEN 'speed-builder'    THEN 1050
  WHEN 'hidden-logic'     THEN 1100
  WHEN 'puzzle-rush'      THEN 1100
  WHEN 'mind-switch'      THEN 1100
  WHEN 'brain-shift'      THEN 1100
  WHEN 'logic-circuit'    THEN 1200
  WHEN 'mind-control'     THEN 1200
  WHEN 'code-signal'      THEN 1300
  WHEN 'strategy-shift'   THEN 1300
  WHEN 'chess'            THEN 1600
  ELSE xp_cost
END
WHERE game_id IN (
  'quick-reflex','reaction-zone','shadow-memory','hidden-object','number-trap','shape-storm',
  'word-search','word-clash','word-chain','number-grid','brain-tracker','fast-math-duel',
  'speed-logic','pattern-escape','memory-grid-pro','geometry-builder','speed-builder',
  'hidden-logic','puzzle-rush','mind-switch','brain-shift','logic-circuit','mind-control',
  'code-signal','strategy-shift','chess'
);