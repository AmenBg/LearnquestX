// Kingdom Wars — the single strategy game that replaced the old mini-game store.
// IMPORTANT: costs/levels here are for DISPLAY only. The real source of truth is the
// SECURITY DEFINER RPCs in supabase/migrations (kingdom_build_rpc, kingdom_train_rpc).
// If you change a number here, change it there too or purchases will be rejected server-side.

export type BuildingId = 'town_hall' | 'wall' | 'watchtower' | 'barracks' | 'archery';
export type UnitId = 'militia' | 'archer' | 'swordsman' | 'knight' | 'catapult';

export interface BuildingLevelInfo {
  level: number;
  cost: number;
  minPlayerLevel: number;
  perk: string;
}

export interface BuildingDef {
  id: BuildingId;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  /** Isometric grid coordinates used to place this building on the kingdom map. */
  gridCol: number;
  gridRow: number;
  levels: BuildingLevelInfo[];
}

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'town_hall',
    name: 'Town Hall',
    icon: '🏰',
    description: 'The heart of your kingdom. Upgrading it raises the level cap for every other building.',
    maxLevel: 4,
    gridCol: 0,
    gridRow: 0,
    levels: [
      { level: 2, cost: 300, minPlayerLevel: 5, perk: 'Unlocks tier-2 buildings' },
      { level: 3, cost: 900, minPlayerLevel: 15, perk: 'Unlocks tier-3 buildings' },
      { level: 4, cost: 2000, minPlayerLevel: 30, perk: 'Maximum kingdom tier' },
    ],
  },
  {
    id: 'watchtower',
    name: 'Watchtower',
    icon: '🗼',
    description: 'Spots raiders early and adds a standing garrison bonus to your defense.',
    maxLevel: 2,
    gridCol: 0,
    gridRow: -1,
    levels: [
      { level: 1, cost: 200, minPlayerLevel: 6, perk: '+30 flat defense' },
      { level: 2, cost: 500, minPlayerLevel: 16, perk: '+60 flat defense' },
    ],
  },
  {
    id: 'barracks',
    name: 'Barracks',
    icon: '⚔️',
    description: 'Trains melee units. Grows to unlock Swordsmen, then Knights, then Catapults.',
    maxLevel: 3,
    gridCol: -1,
    gridRow: 0,
    levels: [
      { level: 1, cost: 150, minPlayerLevel: 2, perk: 'Unlocks Swordsmen' },
      { level: 2, cost: 450, minPlayerLevel: 12, perk: 'Unlocks Knights' },
      { level: 3, cost: 1000, minPlayerLevel: 25, perk: 'Unlocks Catapults' },
    ],
  },
  {
    id: 'archery',
    name: 'Archery Range',
    icon: '🏹',
    description: 'Trains ranged units that soften attackers before they reach your walls.',
    maxLevel: 2,
    gridCol: 1,
    gridRow: 0,
    levels: [
      { level: 1, cost: 150, minPlayerLevel: 4, perk: 'Unlocks Archers' },
      { level: 2, cost: 500, minPlayerLevel: 18, perk: '+range damage' },
    ],
  },
  {
    id: 'wall',
    name: 'Walls',
    icon: '🧱',
    description: 'Sturdy walls reduce all incoming damage during raids.',
    maxLevel: 3,
    gridCol: 0,
    gridRow: 1,
    levels: [
      { level: 1, cost: 150, minPlayerLevel: 3, perk: '+15% defense' },
      { level: 2, cost: 400, minPlayerLevel: 8, perk: '+30% defense' },
      { level: 3, cost: 900, minPlayerLevel: 20, perk: '+45% defense' },
    ],
  },
];

export interface UnitDef {
  id: UnitId;
  name: string;
  icon: string;
  power: number;
  cost: number;
  minPlayerLevel: number;
  requiresBuilding?: BuildingId;
  requiresBuildingLevel?: number;
  requiresLabel?: string;
}

export const UNITS: UnitDef[] = [
  { id: 'militia', name: 'Militia', icon: '🧑‍🌾', power: 2, cost: 8, minPlayerLevel: 1 },
  { id: 'swordsman', name: 'Swordsmen', icon: '🗡️', power: 8, cost: 20, minPlayerLevel: 2, requiresBuilding: 'barracks', requiresBuildingLevel: 1, requiresLabel: 'Barracks' },
  { id: 'archer', name: 'Archers', icon: '🏹', power: 5, cost: 15, minPlayerLevel: 4, requiresBuilding: 'archery', requiresBuildingLevel: 1, requiresLabel: 'Archery Range' },
  { id: 'knight', name: 'Knights', icon: '🛡️', power: 18, cost: 45, minPlayerLevel: 12, requiresBuilding: 'barracks', requiresBuildingLevel: 2, requiresLabel: 'Barracks Lv2' },
  { id: 'catapult', name: 'Catapults', icon: '🪨', power: 40, cost: 120, minPlayerLevel: 25, requiresBuilding: 'barracks', requiresBuildingLevel: 3, requiresLabel: 'Barracks Lv3' },
];

export const RIVAL_KINGDOMS = [
  'Ashenvale Horde',
  'Frostbane Legion',
  'Crimson Talon Clan',
  'Ironclad Dominion',
  'Shadowmere Raiders',
];

export const RAID_INTERVAL_HOURS = 6;
export const ATTACK_COOLDOWN_MINUTES = 20;
export const SCOUT_COOLDOWN_MINUTES = 2;

export interface BattleLogEntry {
  type: 'raid' | 'attack';
  enemy: string;
  won: boolean;
  attack_power: number;
  defense_power: number;
  xp_reward: number;
  at: string;
}

export interface RivalComposition {
  enemy: string;
  militia: number;
  archer: number;
  swordsman: number;
  knight: number;
  catapult: number;
  wall_level: number;
  watchtower_level: number;
}

/** Mirrors the public.kingdom_states table row. */
export interface KingdomState {
  user_id: string;
  town_hall_level: number;
  wall_level: number;
  watchtower_level: number;
  barracks_level: number;
  archery_level: number;
  militia_count: number;
  archer_count: number;
  swordsman_count: number;
  knight_count: number;
  catapult_count: number;
  wins: number;
  losses: number;
  last_raid_check: string;
  last_player_attack: string | null;
  scout_target: RivalComposition | null;
  scouted_at: string | null;
  battle_log: BattleLogEntry[];
  created_at: string;
  updated_at: string;
}

/**
 * Client-side mirror of the server's kingdom_power() SQL function — for live preview only.
 * Frontline (militia/swordsmen/knights) tanks hits, ranged (archers) deals damage from
 * behind them, siege (catapults) is an offense-only tool that's strong vs static defenses.
 * Defenders get a wall multiplier on frontline + a garrison bonus on archers if walls exist,
 * plus a flat watchtower bonus.
 */
export function computeFormationPower(
  comp: { militia: number; archer: number; swordsman: number; knight: number; catapult: number; wall_level: number; watchtower_level: number },
  isDefender: boolean
): number {
  let frontline = comp.militia * 2 + comp.swordsman * 8 + comp.knight * 18;
  let ranged = comp.archer * 5;
  const siege = comp.catapult * 40;

  if (isDefender) {
    frontline *= 1 + comp.wall_level * 0.15;
    if (comp.wall_level >= 1) ranged *= 1.25;
    return Math.round(frontline + ranged + siege + comp.watchtower_level * 30);
  }
  return Math.round(frontline + ranged + siege * 1.3);
}

/** Client-side mirror of the defense formula used by the server RPCs, for live display only. */
export function computeDefensePower(state: {
  militia_count: number;
  archer_count: number;
  swordsman_count: number;
  knight_count: number;
  catapult_count: number;
  wall_level: number;
  watchtower_level: number;
}): number {
  const raw =
    state.militia_count * 2 +
    state.archer_count * 5 +
    state.swordsman_count * 8 +
    state.knight_count * 18 +
    state.catapult_count * 40;
  return Math.round(raw * (1 + state.wall_level * 0.15) + state.watchtower_level * 30);
}

export function unitCountKey(id: UnitId): 'militia_count' | 'archer_count' | 'swordsman_count' | 'knight_count' | 'catapult_count' {
  return `${id}_count` as const;
}

export function buildingLevelKey(id: BuildingId): 'town_hall_level' | 'wall_level' | 'watchtower_level' | 'barracks_level' | 'archery_level' {
  return `${id}_level` as const;
}
