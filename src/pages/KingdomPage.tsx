bash

cat /home/claude/work/repo_clone/src/pages/KingdomPage.tsx
Output

import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import PageSeo from '@/components/PageSeo';
import KingdomMap from '@/components/kingdom/KingdomMap';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, Swords, Trophy, Clock, Zap, Lock, AlertTriangle, Hammer } from 'lucide-react';
import {
  BUILDINGS,
  UNITS,
  BuildingId,
  UnitId,
  KingdomState,
  buildingLevelKey,
  unitCountKey,
  computeFormationPower,
  RAID_INTERVAL_HOURS,
  ATTACK_COOLDOWN_MINUTES,
  SCOUT_COOLDOWN_MINUTES,
} from '@/lib/kingdomData';

function formatDuration(ms: number): string {
  if (ms <= 0) return 'now';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function timeAgo(iso: string, nowMs: number): string {
  const diff = Math.max(0, nowMs - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function KingdomPage() {
  const { authUser, authLoading, profile, profileLoading, refetchProfile } = useApp();
  const [kingdom, setKingdom] = useState<KingdomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingId>('town_hall');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [trainQty, setTrainQty] = useState<Record<UnitId, number>>(() =>
    UNITS.reduce((acc, u) => ({ ...acc, [u.id]: 10 }), {} as Record<UnitId, number>)
  );

  const loadKingdom = useCallback(async () => {
    const { data, error } = await supabase.rpc('kingdom_resolve_raids_rpc' as any);
    if (error) {
      toast.error('Could not load your kingdom. Try refreshing.');
    } else if (data) {
      setKingdom(data as unknown as KingdomState);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authUser) loadKingdom();
  }, [authUser, loadKingdom]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (authLoading || profileLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-background text-foreground">Loading...</div>;
  }
  if (!authUser) return <Navigate to="/auth" replace />;

  const playerLevel = profile?.level ?? 1;
  const playerXp = profile?.xp ?? 0;
  const myComposition = kingdom
    ? {
        militia: kingdom.militia_count,
        archer: kingdom.archer_count,
        swordsman: kingdom.swordsman_count,
        knight: kingdom.knight_count,
        catapult: kingdom.catapult_count,
        wall_level: kingdom.wall_level,
        watchtower_level: kingdom.watchtower_level,
      }
    : null;
  const defensePower = myComposition ? computeFormationPower(myComposition, true) : 0;
  const myAttackPower = myComposition ? computeFormationPower(myComposition, false) : 0;

  const nextRaidAt = kingdom ? new Date(kingdom.last_raid_check).getTime() + RAID_INTERVAL_HOURS * 3_600_000 : null;
  const raidMsRemaining = nextRaidAt !== null ? nextRaidAt - now : 0;
  const raidImminent = raidMsRemaining <= 30 * 60_000;

  const attackCooldownEndsAt = kingdom?.last_player_attack
    ? new Date(kingdom.last_player_attack).getTime() + ATTACK_COOLDOWN_MINUTES * 60_000
    : null;
  const attackMsRemaining = attackCooldownEndsAt ? attackCooldownEndsAt - now : 0;
  const canAttack = !attackCooldownEndsAt || attackMsRemaining <= 0;

  const scoutCooldownEndsAt = kingdom?.scouted_at
    ? new Date(kingdom.scouted_at).getTime() + SCOUT_COOLDOWN_MINUTES * 60_000
    : null;
  const scoutMsRemaining = scoutCooldownEndsAt ? scoutCooldownEndsAt - now : 0;
  const canScout = !scoutCooldownEndsAt || scoutMsRemaining <= 0;

  const handleBuild = async (id: BuildingId) => {
    if (!kingdom || busyId) return;
    setBusyId(id);
    const { data, error } = await supabase.rpc('kingdom_build_rpc' as any, { p_building: id } as any);
    if (error) {
      toast.error(error.message || 'Upgrade failed');
    } else if (data) {
      setKingdom(data as unknown as KingdomState);
      toast.success('Building upgraded! 🏗️');
      await refetchProfile();
    }
    setBusyId(null);
  };

  const handleTrain = async (id: UnitId) => {
    if (!kingdom || busyId) return;
    const quantity = trainQty[id] || 1;
    setBusyId(`unit-${id}`);
    const { data, error } = await supabase.rpc('kingdom_train_rpc' as any, { p_unit: id, p_quantity: quantity } as any);
    if (error) {
      toast.error(error.message || 'Training failed');
    } else if (data) {
      setKingdom(data as unknown as KingdomState);
      toast.success(`${quantity} troops trained! ⚔️`);
      await refetchProfile();
    }
    setBusyId(null);
  };

  const handleScout = async () => {
    if (!kingdom || busyId || !canScout) return;
    setBusyId('scout');
    const { data, error } = await supabase.rpc('kingdom_scout_rpc' as any);
    if (error) {
      toast.error(error.message || 'Scouting failed');
    } else if (data) {
      setKingdom(data as unknown as KingdomState);
      toast.success('Your scouts report back 🔍');
    }
    setBusyId(null);
  };

  const handleAttack = async () => {
    if (!kingdom || busyId || !canAttack) return;
    setBusyId('attack');
    const { data, error } = await supabase.rpc('kingdom_attack_rpc' as any);
    if (error) {
      toast.error(error.message || 'Attack failed');
    } else if (data) {
      const updated = data as unknown as KingdomState;
      setKingdom(updated);
      const last = updated.battle_log[0];
      if (last?.won) toast.success(`Victory over the ${last.enemy}! +${last.xp_reward} XP`);
      else toast.error(`Your army was repelled by the ${last?.enemy ?? 'enemy'}.`);
      await refetchProfile();
    }
    setBusyId(null);
  };

  const selected = BUILDINGS.find((b) => b.id === selectedBuilding)!;
  const selectedLevel = kingdom ? (kingdom[buildingLevelKey(selected.id)] as number) : 0;
  const nextLevelInfo = selected.levels.find((l) => l.level === selectedLevel + 1);
  const maxed = !nextLevelInfo;
  const canAffordBuilding = nextLevelInfo ? playerXp >= nextLevelInfo.cost : false;
  const meetsLevelBuilding = nextLevelInfo ? playerLevel >= nextLevelInfo.minPlayerLevel : false;

  return (
    <div className="min-h-screen bg-background">
      <PageSeo
        title="Kingdom Wars — LearnQuest"
        description="Build your kingdom, train an army with the XP you earn from lessons, and defend against rival raids."
        path="/kingdom"
      />
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Kingdom Wars</h1>
          </div>
          <p className="text-muted-foreground">
            Every lesson you finish earns XP — spend it here to grow your kingdom and build an army before the next raid.
          </p>
        </motion.div>

        {/* Stat strip */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Zap className="h-3.5 w-3.5" /> XP to spend</div>
            <div className="mt-1 text-xl font-bold text-foreground">{playerXp.toLocaleString()}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Trophy className="h-3.5 w-3.5" /> Study level</div>
            <div className="mt-1 text-xl font-bold text-foreground">{playerLevel}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Defense power</div>
            <div className="mt-1 text-xl font-bold text-foreground">{defensePower}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Swords className="h-3.5 w-3.5" /> Record</div>
            <div className="mt-1 text-xl font-bold text-foreground">
              <span className="text-primary">{kingdom?.wins ?? 0}W</span> <span className="text-destructive">{kingdom?.losses ?? 0}L</span>
            </div>
          </div>
        </div>

        {loading || !kingdom ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">Founding your kingdom...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: map + building panel */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-border bg-card">
                <KingdomMap
                  state={kingdom}
                  selectedBuilding={selectedBuilding}
                  onSelectBuilding={setSelectedBuilding}
                  raidImminent={raidImminent}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">{selected.icon}</div>
                  <div>
                    <h3 className="font-bold text-foreground">
                      {selected.name} <span className="text-sm font-normal text-muted-foreground">— Lv{selectedLevel}/{selected.maxLevel}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                </div>

                {maxed ? (
                  <div className="rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">Max level reached 🎉</div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/50 px-4 py-3">
                    <div className="text-sm">
                      <div className="font-semibold text-foreground">Next: Level {nextLevelInfo!.level} — {nextLevelInfo!.perk}</div>
                      <div className="text-muted-foreground">
                        Cost: <span className="text-primary font-semibold">{nextLevelInfo!.cost} XP</span>
                        {' · '}Requires study level {nextLevelInfo!.minPlayerLevel}
                      </div>
                    </div>
                    <button
                      onClick={() => handleBuild(selected.id)}
                      disabled={!canAffordBuilding || !meetsLevelBuilding || busyId !== null}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                    >
                      {!meetsLevelBuilding ? (
                        <><Lock className="h-4 w-4" /> Needs level {nextLevelInfo!.minPlayerLevel}</>
                      ) : busyId === selected.id ? (
                        '...'
                      ) : (
                        <><Hammer className="h-4 w-4" /> Upgrade</>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: raids + army + log */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
                <div className={`mb-3 flex items-center gap-2 text-sm font-semibold ${raidImminent ? 'text-destructive' : 'text-foreground'}`}>
                  {raidImminent ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  Next raid: {formatDuration(raidMsRemaining)}
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  Raiders strike automatically. If your defense power is lower than their attack, you'll lose some troops — keep training and upgrading walls.
                </p>

                {kingdom.scout_target && (
                  <div className="mb-3 rounded-lg border border-border bg-muted/40 p-3">
                    <div className="mb-2 text-sm font-semibold text-foreground">🔍 Scouted: {kingdom.scout_target.enemy}</div>
                    <div className="mb-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {UNITS.map((u) => {
                        const count = kingdom.scout_target![u.id];
                        return count > 0 ? <span key={u.id}>{u.icon} {count}</span> : null;
                      })}
                      <span>🧱 Wall Lv{kingdom.scout_target.wall_level}</span>
                      <span>🗼 Watch Lv{kingdom.scout_target.watchtower_level}</span>
                    </div>
                    <div className="text-xs">
                      Your power <span className="font-semibold text-foreground">{myAttackPower}</span>
                      {' vs their '}
                      <span className="font-semibold text-foreground">{computeFormationPower(kingdom.scout_target, true)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleAttack}
                    disabled={!canAttack || busyId !== null}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-bold text-primary transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {busyId === 'attack' ? (
                      '...'
                    ) : !canAttack ? (
                      <><Clock className="h-4 w-4" /> Ready in {formatDuration(attackMsRemaining)}</>
                    ) : kingdom.scout_target ? (
                      <><Swords className="h-4 w-4" /> Attack {kingdom.scout_target.enemy}</>
                    ) : (
                      <><Swords className="h-4 w-4" /> Raid blind</>
                    )}
                  </button>
                  <button
                    onClick={handleScout}
                    disabled={!canScout || busyId !== null}
                    title="Scout a rival kingdom before attacking"
                    className="flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {busyId === 'scout' ? '...' : canScout ? '🔍 Scout' : formatDuration(scoutMsRemaining)}
                  </button>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 font-bold text-foreground">Train your army</h3>
                <div className="space-y-3">
                  {UNITS.map((u) => {
                    const owned = kingdom[unitCountKey(u.id)] as number;
                    const buildingOk = u.requiresBuilding
                      ? (kingdom[buildingLevelKey(u.requiresBuilding)] as number) >= (u.requiresBuildingLevel ?? 1)
                      : true;
                    const levelOk = playerLevel >= u.minPlayerLevel;
                    const qty = trainQty[u.id];
                    const totalCost = qty * u.cost;
                    const locked = !buildingOk || !levelOk;

                    return (
                      <div key={u.id} className={`rounded-lg border border-border p-3 ${locked ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{u.icon}</span>
                            <div>
                              <div className="text-sm font-semibold text-foreground">{u.name}</div>
                              <div className="text-xs text-muted-foreground">Power {u.power} · {u.cost} XP each · Owned {owned}</div>
                            </div>
                          </div>
                        </div>
                        {locked ? (
                          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" />
                            {!buildingOk ? `Requires ${u.requiresLabel}` : `Requires study level ${u.minPlayerLevel}`}
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              max={200}
                              value={qty}
                              onChange={(e) => {
                                const v = Math.max(1, Math.min(200, Number(e.target.value) || 1));
                                setTrainQty((prev) => ({ ...prev, [u.id]: v }));
                              }}
                              className="w-16 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
                            />
                            <button
                              onClick={() => handleTrain(u.id)}
                              disabled={playerXp < totalCost || busyId !== null}
                              className="flex flex-1 items-center justify-center gap-1 rounded-md bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground disabled:opacity-40"
                            >
                              {busyId === `unit-${u.id}` ? '...' : `Train for ${totalCost} XP`}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-3 font-bold text-foreground">Battle log</h3>
                {kingdom.battle_log.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No battles yet. Build up your defenses — the first raid is coming.</p>
                ) : (
                  <div className="space-y-2">
                    {kingdom.battle_log.slice(0, 8).map((entry, i) => (
                      <div key={i} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span>{entry.type === 'attack' ? '⚔️' : '🛡️'}</span>
                          <span className={entry.won ? 'text-primary font-semibold' : 'text-destructive font-semibold'}>
                            {entry.won ? 'Victory' : 'Defeat'}
                          </span>
                          <span className="text-muted-foreground">vs {entry.enemy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {entry.won && entry.xp_reward > 0 && <span className="text-primary">+{entry.xp_reward} XP</span>}
                          <span>{timeAgo(entry.at, now)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
