import { useEffect, useMemo, useRef, useState, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Clouds } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Castle, Home, Swords, Sparkles, Shield, Zap, Volume2, VolumeX,
  Users, Crown, ArrowLeft, Trash2, Play, Pause, X, Flag,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   KINGDOM BUILDER 3D — flagship game
   Low-poly R3F strategy + wave defense + local-storage save.
   ═══════════════════════════════════════════════════════════════ */

const GRID_SIZE = 14;         // 14 x 14 tiles
const TILE = 1;               // world units per tile
const HALF = (GRID_SIZE * TILE) / 2;
const WAVE_INTERVAL = 75;     // seconds between waves
const SAVE_KEY = 'kingdom_save_v1';

type BuildingType = 'townhall' | 'house' | 'barracks' | 'academy' | 'tower' | 'wall';
type UnitType = 'archer' | 'knight' | 'catapult';

interface Building {
  id: string;
  type: BuildingType;
  x: number; // tile coords, -HALF .. HALF-1
  z: number;
  level: number;
  hp: number;
  maxHp: number;
  cooldown?: number; // for towers & academies
}

interface Enemy {
  id: string;
  x: number; z: number;
  hp: number; maxHp: number;
  speed: number;
  dmg: number;
}

interface Projectile {
  id: string;
  from: [number, number, number];
  to: [number, number, number];
  t: number; // 0..1
  dmg: number;
  targetId: string;
}

interface Floater {
  id: string;
  text: string;
  color: string;
  x: number; z: number;
  t: number;
}

interface KingdomState {
  xp: number;
  kingdomLevel: number;
  buildings: Building[];
  army: Record<UnitType, number>;
  waveNumber: number;
  nextWaveAt: number; // seconds remaining
  savedAt: number;
}

const BUILDING_DEFS: Record<BuildingType, {
  name: string; icon: string; cost: number; hp: number; unlockLevel: number;
  color: string; roof: string; size: [number, number, number]; footprint: number;
  desc: string;
}> = {
  townhall: { name: 'Town Hall',  icon: '👑', cost: 0,   hp: 500, unlockLevel: 1, color: '#c68b5b', roof: '#8b3a2e', size: [1.6, 1.4, 1.6], footprint: 2, desc: 'Heart of your kingdom. Upgrade to unlock new tech.' },
  house:    { name: 'Cottage',    icon: '🏠', cost: 40,  hp: 80,  unlockLevel: 1, color: '#d8b98a', roof: '#8a5a3a', size: [0.8, 0.8, 0.8], footprint: 1, desc: '+5 population cap. Home to your villagers.' },
  academy:  { name: 'XP Academy', icon: '📜', cost: 120, hp: 120, unlockLevel: 1, color: '#e5d3a8', roof: '#4a6cd4', size: [0.9, 1.0, 0.9], footprint: 1, desc: 'Generates +5 XP every 5s. Click to instantly collect bonus XP.' },
  barracks: { name: 'Barracks',   icon: '⚔️', cost: 180, hp: 200, unlockLevel: 2, color: '#8a6a4a', roof: '#5a2a1a', size: [1.1, 0.9, 1.1], footprint: 1, desc: 'Required to recruit troops. Trained units defend the kingdom.' },
  tower:    { name: 'Watchtower', icon: '🗼', cost: 150, hp: 150, unlockLevel: 2, color: '#b0a090', roof: '#3a3a3a', size: [0.6, 2.0, 0.6], footprint: 1, desc: 'Auto-shoots incoming raiders within range.' },
  wall:     { name: 'Wall',       icon: '🧱', cost: 20,  hp: 250, unlockLevel: 3, color: '#8a8a8a', roof: '#6a6a6a', size: [1.0, 0.6, 1.0], footprint: 1, desc: 'Blocks enemy movement and absorbs damage.' },
};

const UNIT_DEFS: Record<UnitType, {
  name: string; icon: string; cost: number; hp: number; dps: number; unlockLevel: number; color: string;
}> = {
  archer:   { name: 'Archer',   icon: '🏹', cost: 10, hp: 30,  dps: 8,  unlockLevel: 2, color: '#4ade80' },
  knight:   { name: 'Knight',   icon: '🛡️', cost: 30, hp: 100, dps: 15, unlockLevel: 3, color: '#60a5fa' },
  catapult: { name: 'Catapult', icon: '💥', cost: 75, hp: 60,  dps: 40, unlockLevel: 5, color: '#f97316' },
};

const LEVEL_XP: Record<number, number> = { 1: 0, 2: 300, 3: 800, 4: 1800, 5: 3500, 6: 6000, 7: 10000, 8: 16000 };

/* ─── Audio (simple WebAudio SFX) ─── */
class AudioBus {
  ctx: AudioContext | null = null;
  muted = false;
  ensure() {
    if (!this.ctx && typeof window !== 'undefined') {
      try { this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
    }
  }
  beep(freq: number, dur = 0.08, type: OscillatorType = 'sine', vol = 0.08) {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.start(t); osc.stop(t + dur);
  }
  place()   { this.beep(520, 0.09, 'triangle'); setTimeout(() => this.beep(720, 0.09, 'triangle'), 60); }
  click()   { this.beep(880, 0.05, 'square', 0.05); }
  coin()    { this.beep(1200, 0.08, 'sine'); setTimeout(() => this.beep(1600, 0.08, 'sine'), 60); }
  horn()    { this.beep(180, 0.4, 'sawtooth', 0.12); setTimeout(() => this.beep(140, 0.5, 'sawtooth', 0.12), 200); }
  arrow()   { this.beep(1400, 0.04, 'triangle', 0.04); }
  hit()     { this.beep(220, 0.08, 'square', 0.06); }
  victory() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.beep(f, 0.15, 'triangle', 0.09), i * 120)); }
}
const audio = new AudioBus();

/* ─── Save / load ─── */
const initialState = (): KingdomState => ({
  xp: 200,
  kingdomLevel: 1,
  buildings: [{
    id: 'th', type: 'townhall', x: 0, z: 0, level: 1,
    hp: BUILDING_DEFS.townhall.hp, maxHp: BUILDING_DEFS.townhall.hp,
  }],
  army: { archer: 0, knight: 0, catapult: 0 },
  waveNumber: 0,
  nextWaveAt: WAVE_INTERVAL,
  savedAt: Date.now(),
});

function loadState(): KingdomState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return initialState();
    const s = JSON.parse(raw) as KingdomState;
    // basic sanity
    if (!s.buildings || !s.buildings.length) return initialState();
    return s;
  } catch { return initialState(); }
}

function saveState(s: KingdomState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ ...s, savedAt: Date.now() })); } catch {}
}

/* ═══════════════════════════════════════════════════════════════
   3D SCENE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Ground({ onGridClick }: { onGridClick: (x: number, z: number) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const p = e.point;
        const gx = Math.floor(p.x / TILE);
        const gz = Math.floor(p.z / TILE);
        onGridClick(gx, gz);
      }}
    >
      <planeGeometry args={[GRID_SIZE * TILE * 2, GRID_SIZE * TILE * 2, 1, 1]} />
      <meshStandardMaterial color="#5fa055" />
    </mesh>
  );
}

function GridLines() {
  const points: THREE.Vector3[] = [];
  for (let i = -HALF; i <= HALF; i += TILE) {
    points.push(new THREE.Vector3(i, 0.01, -HALF), new THREE.Vector3(i, 0.01, HALF));
    points.push(new THREE.Vector3(-HALF, 0.01, i), new THREE.Vector3(HALF, 0.01, i));
  }
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), []);
  return (
    <lineSegments geometry={geom}>
      <lineBasicMaterial color="#3d7f3a" transparent opacity={0.35} />
    </lineSegments>
  );
}

function TreeMesh({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8 + seed) * 0.04;
  });
  return (
    <group ref={ref} position={position}>
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
        <meshStandardMaterial color="#6b4a2a" />
      </mesh>
      <mesh castShadow position={[0, 0.75, 0]}>
        <coneGeometry args={[0.35, 0.9, 6]} />
        <meshStandardMaterial color="#2e7a3a" />
      </mesh>
    </group>
  );
}

function Decorations() {
  // static scattered trees around the outer border
  const trees = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = HALF + 1 + Math.random() * 3;
      out.push([Math.cos(angle) * r, 0, Math.sin(angle) * r]);
    }
    return out;
  }, []);
  return <>{trees.map((p, i) => <TreeMesh key={i} position={p} />)}</>;
}

/* ── Building 3D ── */
function BuildingMesh({
  b, isPreview = false, valid = true, selected = false, onClick,
}: {
  b: { type: BuildingType; x: number; z: number; level?: number };
  isPreview?: boolean; valid?: boolean; selected?: boolean;
  onClick?: () => void;
}) {
  const def = BUILDING_DEFS[b.type];
  const px = (b.x + 0.5) * TILE;
  const pz = (b.z + 0.5) * TILE;
  const [w, h, d] = def.size;
  const color = isPreview ? (valid ? '#4ade80' : '#ef4444') : def.color;
  const roof = isPreview ? color : def.roof;
  const opacity = isPreview ? 0.55 : 1;

  const ref = useRef<THREE.Group>(null!);
  useFrame(({ clock }) => {
    if (ref.current && selected) ref.current.position.y = Math.sin(clock.elapsedTime * 3) * 0.05;
  });

  return (
    <group
      ref={ref}
      position={[px, 0, pz]}
      onClick={(e) => { if (onClick) { e.stopPropagation(); onClick(); } }}
    >
      {/* base */}
      <mesh castShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} transparent={isPreview} opacity={opacity} />
      </mesh>
      {/* roof */}
      {b.type !== 'wall' && b.type !== 'tower' && (
        <mesh castShadow position={[0, h + h * 0.25, 0]}>
          <coneGeometry args={[w * 0.85, h * 0.5, 4]} />
          <meshStandardMaterial color={roof} transparent={isPreview} opacity={opacity} />
        </mesh>
      )}
      {b.type === 'tower' && (
        <mesh castShadow position={[0, h + 0.15, 0]}>
          <coneGeometry args={[w * 0.7, 0.3, 6]} />
          <meshStandardMaterial color={roof} transparent={isPreview} opacity={opacity} />
        </mesh>
      )}
      {/* town hall flag */}
      {b.type === 'townhall' && !isPreview && (
        <>
          <mesh position={[0.5, h + 0.7, 0.5]}>
            <cylinderGeometry args={[0.03, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#3a2a1a" />
          </mesh>
          <mesh position={[0.75, h + 1.1, 0.5]}>
            <boxGeometry args={[0.5, 0.3, 0.02]} />
            <meshStandardMaterial color="#e63946" />
          </mesh>
        </>
      )}
      {selected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[w * 0.7, w * 0.85, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

/* ── Enemy 3D ── */
function EnemyMesh({ e }: { e: Enemy }) {
  return (
    <group position={[e.x, 0, e.z]}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <boxGeometry args={[0.35, 0.7, 0.35]} />
        <meshStandardMaterial color="#8b1a1a" />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      {/* hp bar */}
      <mesh position={[0, 1.3, 0]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshBasicMaterial color="#333" />
      </mesh>
      <mesh position={[-0.3 + (0.6 * (e.hp / e.maxHp)) / 2, 1.3, 0.001]}>
        <planeGeometry args={[0.6 * (e.hp / e.maxHp), 0.06]} />
        <meshBasicMaterial color="#22c55e" />
      </mesh>
    </group>
  );
}

/* ── Projectile 3D ── */
function ProjectileMesh({ p }: { p: Projectile }) {
  const x = p.from[0] + (p.to[0] - p.from[0]) * p.t;
  const y = p.from[1] + (p.to[1] - p.from[1]) * p.t + Math.sin(p.t * Math.PI) * 0.7;
  const z = p.from[2] + (p.to[2] - p.from[2]) * p.t;
  return (
    <mesh position={[x, y, z]}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshBasicMaterial color="#fef3c7" />
    </mesh>
  );
}

/* ── Camera controls with pan/zoom ── */
function IsoCamera() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(12, 14, 12);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function KingdomPage() {
  const [state, setState] = useState<KingdomState>(() => loadState());
  const [placing, setPlacing] = useState<BuildingType | null>(null);
  const [preview, setPreview] = useState<{ x: number; z: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const enemiesRef = useRef(enemies);
  enemiesRef.current = enemies;

  useEffect(() => { audio.muted = muted; }, [muted]);

  /* Derived: population cap, kingdom level, town hall */
  const townhall = state.buildings.find(b => b.type === 'townhall');
  const populationCap = state.buildings.filter(b => b.type === 'house').length * 5;
  const populationUsed = state.army.archer + state.army.knight * 2 + state.army.catapult * 3;

  /* Level up check */
  useEffect(() => {
    let lvl = 1;
    for (const [l, req] of Object.entries(LEVEL_XP)) {
      if (state.xp >= req) lvl = Math.max(lvl, Number(l));
    }
    if (lvl !== state.kingdomLevel) {
      setState(s => ({ ...s, kingdomLevel: lvl }));
      if (lvl > state.kingdomLevel) audio.victory();
    }
  }, [state.xp, state.kingdomLevel]);

  /* Auto-save every 10s */
  useEffect(() => {
    const iv = setInterval(() => saveState(stateRef.current), 10000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => () => saveState(stateRef.current), []);

  /* ── Main tick loop ── */
  useEffect(() => {
    if (paused || gameOver) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      acc += dt;

      // Enemy movement + attacks
      setEnemies(prev => {
        if (!prev.length) return prev;
        const th = stateRef.current.buildings.find(b => b.type === 'townhall');
        if (!th) return prev;
        const thx = (th.x + 0.5) * TILE;
        const thz = (th.z + 0.5) * TILE;
        let thDmg = 0;
        const next: Enemy[] = [];
        for (const e of prev) {
          const dx = thx - e.x;
          const dz = thz - e.z;
          const d = Math.hypot(dx, dz);
          if (d < 1.2) {
            thDmg += e.dmg * dt;
            next.push(e); // stays and attacks
          } else {
            const step = e.speed * dt;
            next.push({ ...e, x: e.x + (dx / d) * step, z: e.z + (dz / d) * step });
          }
        }
        if (thDmg > 0) {
          setState(s => {
            const b = s.buildings.map(b => b.id === th.id ? { ...b, hp: Math.max(0, b.hp - thDmg) } : b);
            const newTh = b.find(x => x.id === th.id)!;
            if (newTh.hp <= 0) setGameOver(true);
            return { ...s, buildings: b };
          });
        }
        return next;
      });

      // Tower auto-shoot (every ~1.2s per tower)
      if (acc >= 0.2) {
        acc = 0;
        const s = stateRef.current;
        const currentEnemies = enemiesRef.current;
        if (currentEnemies.length) {
          const shots: Projectile[] = [];
          for (const b of s.buildings) {
            if (b.type !== 'tower') continue;
            b.cooldown = (b.cooldown ?? 0) - 0.2;
            if (b.cooldown > 0) continue;
            const bx = (b.x + 0.5) * TILE, bz = (b.z + 0.5) * TILE;
            // find nearest enemy within 5 tiles
            let best: Enemy | null = null; let bestD = 5;
            for (const e of currentEnemies) {
              const d = Math.hypot(e.x - bx, e.z - bz);
              if (d < bestD) { bestD = d; best = e; }
            }
            if (best) {
              b.cooldown = 1.2;
              shots.push({
                id: crypto.randomUUID(), targetId: best.id,
                from: [bx, 1.6, bz], to: [best.x, 0.6, best.z], t: 0, dmg: 12,
              });
              audio.arrow();
            }
          }
          if (shots.length) setProjectiles(p => [...p, ...shots]);
        }

        // Passive troop DPS (auto-defense) — army chews down closest enemy
        const totalDps = s.army.archer * UNIT_DEFS.archer.dps
                       + s.army.knight * UNIT_DEFS.knight.dps
                       + s.army.catapult * UNIT_DEFS.catapult.dps;
        if (totalDps > 0 && currentEnemies.length) {
          setEnemies(prev => {
            const remaining = [...prev];
            let dmgBudget = totalDps * 0.2; // per 0.2s tick
            // sort by distance to TH — attack nearest to base
            const th = s.buildings.find(x => x.type === 'townhall');
            if (th) {
              const thx = (th.x + 0.5) * TILE, thz = (th.z + 0.5) * TILE;
              remaining.sort((a, b) => Math.hypot(a.x - thx, a.z - thz) - Math.hypot(b.x - thx, b.z - thz));
            }
            const out: Enemy[] = [];
            let killed = 0;
            for (const e of remaining) {
              if (dmgBudget <= 0) { out.push(e); continue; }
              const applied = Math.min(dmgBudget, e.hp);
              dmgBudget -= applied;
              const newHp = e.hp - applied;
              if (newHp <= 0) { killed++; continue; }
              out.push({ ...e, hp: newHp });
            }
            if (killed > 0) {
              const reward = killed * 15;
              setState(ss => ({ ...ss, xp: ss.xp + reward }));
              addFloater(`+${reward} XP`, '#fbbf24', 0, 0);
              audio.hit();
            }
            return out;
          });
        }

        // Academy passive XP (every 5s check via cooldown)
        setState(s => {
          const buildings = s.buildings.map(b => {
            if (b.type !== 'academy') return b;
            const cd = (b.cooldown ?? 5) - 0.2;
            if (cd <= 0) {
              addFloater('+5', '#fbbf24', (b.x + 0.5) * TILE, (b.z + 0.5) * TILE);
              return { ...b, cooldown: 5 };
            }
            return { ...b, cooldown: cd };
          });
          const acadCount = s.buildings.filter(b => b.type === 'academy' && (b.cooldown ?? 5) <= 0.2).length;
          const xpGain = acadCount * 5;
          return xpGain > 0 ? { ...s, buildings, xp: s.xp + xpGain } : { ...s, buildings };
        });
      }

      // Projectile motion
      setProjectiles(prev => {
        if (!prev.length) return prev;
        const out: Projectile[] = [];
        const hits: { id: string; dmg: number }[] = [];
        for (const p of prev) {
          const nt = p.t + dt * 2.5;
          if (nt >= 1) hits.push({ id: p.targetId, dmg: p.dmg });
          else out.push({ ...p, t: nt });
        }
        if (hits.length) {
          setEnemies(en => {
            const killed: string[] = [];
            const next = en.map(e => {
              const h = hits.filter(h => h.id === e.id).reduce((a, b) => a + b.dmg, 0);
              if (!h) return e;
              const nhp = e.hp - h;
              if (nhp <= 0) { killed.push(e.id); return { ...e, hp: 0 }; }
              return { ...e, hp: nhp };
            }).filter(e => e.hp > 0);
            if (killed.length) {
              const reward = killed.length * 15;
              setState(ss => ({ ...ss, xp: ss.xp + reward }));
            }
            return next;
          });
        }
        return out;
      });

      // Wave countdown
      setState(s => {
        const next = s.nextWaveAt - dt;
        if (next <= 0) {
          spawnWave(s.waveNumber + 1);
          return { ...s, nextWaveAt: WAVE_INTERVAL, waveNumber: s.waveNumber + 1 };
        }
        return { ...s, nextWaveAt: next };
      });

      // Floaters
      setFloaters(prev => prev.map(f => ({ ...f, t: f.t + dt })).filter(f => f.t < 1.4));

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, gameOver]);

  const addFloater = (text: string, color: string, x: number, z: number) => {
    setFloaters(prev => [...prev, { id: crypto.randomUUID(), text, color, x, z, t: 0 }]);
  };

  const spawnWave = (n: number) => {
    audio.horn();
    const count = 3 + n * 2;
    const hp = 30 + n * 15;
    const spawned: Enemy[] = [];
    for (let i = 0; i < count; i++) {
      const side = Math.floor(Math.random() * 4);
      const edge = HALF + 1;
      let x = 0, z = 0;
      if (side === 0) { x = -edge + Math.random() * (edge * 2); z = -edge; }
      else if (side === 1) { x = edge; z = -edge + Math.random() * (edge * 2); }
      else if (side === 2) { x = -edge + Math.random() * (edge * 2); z = edge; }
      else { x = -edge; z = -edge + Math.random() * (edge * 2); }
      spawned.push({
        id: crypto.randomUUID(), x, z, hp, maxHp: hp,
        speed: 0.7 + Math.random() * 0.3,
        dmg: 5 + n * 1.5,
      });
    }
    setEnemies(e => [...e, ...spawned]);
  };

  /* ── Placement handling ── */
  const isOccupied = useCallback((x: number, z: number) => {
    return state.buildings.some(b => {
      const s = BUILDING_DEFS[b.type].footprint;
      return x >= b.x && x < b.x + s && z >= b.z && z < b.z + s;
    });
  }, [state.buildings]);

  const isValidPlacement = useCallback((x: number, z: number, type: BuildingType) => {
    const s = BUILDING_DEFS[type].footprint;
    for (let dx = 0; dx < s; dx++) for (let dz = 0; dz < s; dz++) {
      const ax = x + dx, az = z + dz;
      if (ax < -HALF || ax >= HALF || az < -HALF || az >= HALF) return false;
      if (isOccupied(ax, az)) return false;
    }
    return true;
  }, [isOccupied]);

  const handleGridClick = (x: number, z: number) => {
    if (!placing) return;
    const def = BUILDING_DEFS[placing];
    if (state.kingdomLevel < def.unlockLevel) return;
    if (state.xp < def.cost) return;
    if (!isValidPlacement(x, z, placing)) return;
    setState(s => ({
      ...s,
      xp: s.xp - def.cost,
      buildings: [...s.buildings, {
        id: crypto.randomUUID(), type: placing, x, z, level: 1,
        hp: def.hp, maxHp: def.hp,
      }],
    }));
    audio.place();
    saveState(stateRef.current);
    setPlacing(null);
    setPreview(null);
  };

  const handleGridHover = (x: number, z: number) => {
    if (placing) setPreview({ x, z });
  };

  const recruit = (u: UnitType) => {
    const def = UNIT_DEFS[u];
    if (state.kingdomLevel < def.unlockLevel) return;
    if (state.xp < def.cost) return;
    if (!state.buildings.some(b => b.type === 'barracks')) return;
    const unitPop = u === 'archer' ? 1 : u === 'knight' ? 2 : 3;
    if (populationUsed + unitPop > populationCap) return;
    setState(s => ({ ...s, xp: s.xp - def.cost, army: { ...s.army, [u]: s.army[u] + 1 } }));
    audio.click();
  };

  const collectAcademy = (b: Building) => {
    setState(s => ({ ...s, xp: s.xp + 25 }));
    addFloater('+25 XP', '#fbbf24', (b.x + 0.5) * TILE, (b.z + 0.5) * TILE);
    audio.coin();
  };

  const upgradeTownHall = () => {
    if (!townhall) return;
    const cost = 300 * townhall.level;
    if (state.xp < cost) return;
    setState(s => ({
      ...s,
      xp: s.xp - cost,
      buildings: s.buildings.map(b => b.id === townhall.id ? { ...b, level: b.level + 1, maxHp: b.maxHp + 200, hp: b.hp + 200 } : b),
    }));
    audio.victory();
  };

  const demolish = () => {
    if (!selectedId) return;
    const b = state.buildings.find(x => x.id === selectedId);
    if (!b || b.type === 'townhall') return;
    setState(s => ({
      ...s,
      xp: s.xp + Math.floor(BUILDING_DEFS[b.type].cost * 0.5),
      buildings: s.buildings.filter(x => x.id !== selectedId),
    }));
    setSelectedId(null);
    audio.click();
  };

  const resetGame = () => {
    if (!confirm('Reset your kingdom? All progress will be lost.')) return;
    localStorage.removeItem(SAVE_KEY);
    setState(initialState());
    setEnemies([]);
    setProjectiles([]);
    setGameOver(false);
  };

  const nextLevelXp = LEVEL_XP[state.kingdomLevel + 1];
  const prevLevelXp = LEVEL_XP[state.kingdomLevel] || 0;
  const levelPct = nextLevelXp
    ? Math.min(100, ((state.xp - prevLevelXp) / (nextLevelXp - prevLevelXp)) * 100)
    : 100;

  const thHpPct = townhall ? (townhall.hp / townhall.maxHp) * 100 : 0;

  const previewValid = preview && placing ? isValidPlacement(preview.x, preview.z, placing) : false;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-sky-300 to-emerald-200 select-none">
      {/* ── TOP HUD ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 p-3">
        <div className="pointer-events-auto mx-auto flex max-w-6xl flex-wrap items-center gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur-md ring-1 ring-white/10">
          <Link to="/store" className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">
            <ArrowLeft className="h-3.5 w-3.5" /> Exit
          </Link>

          <HudPill icon={<Crown className="h-4 w-4 text-yellow-300" />} label="Kingdom" value={`Lv ${state.kingdomLevel}`} sub={nextLevelXp ? `${Math.floor(levelPct)}%` : 'MAX'} />
          <HudPill icon={<Sparkles className="h-4 w-4 text-amber-300" />} label="XP" value={Math.floor(state.xp).toLocaleString()} />
          <HudPill icon={<Users className="h-4 w-4 text-blue-300" />} label="Pop" value={`${populationUsed}/${populationCap}`} />
          <HudPill icon={<Shield className="h-4 w-4 text-red-300" />} label="Town Hall" value={`${Math.ceil(thHpPct)}%`} danger={thHpPct < 30} />
          <HudPill icon={<Flag className="h-4 w-4 text-orange-300" />} label={`Wave ${state.waveNumber + 1} in`} value={formatTime(state.nextWaveAt)} danger={state.nextWaveAt < 10} />

          <div className="ml-auto flex items-center gap-1">
            <IconBtn onClick={() => { setPaused(p => !p); audio.click(); }} title={paused ? 'Resume' : 'Pause'}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </IconBtn>
            <IconBtn onClick={() => { setMuted(m => !m); }} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </IconBtn>
            <IconBtn onClick={resetGame} title="Reset kingdom">
              <Trash2 className="h-4 w-4" />
            </IconBtn>
          </div>
        </div>
      </div>

      {/* ── 3D CANVAS ── */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [12, 14, 12], fov: 40 }}
          gl={{ antialias: true }}
        >
          <IsoCamera />
          <Sky sunPosition={[100, 40, 100]} turbidity={4} rayleigh={0.5} />
          <ambientLight intensity={0.55} />
          <directionalLight
            castShadow
            position={[10, 18, 8]}
            intensity={1.2}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <Suspense fallback={null}>
            <Clouds material={THREE.MeshBasicMaterial}>
              <Cloud seed={1} bounds={[6, 1, 6]} volume={4} position={[-6, 8, -4]} color="white" opacity={0.4} />
              <Cloud seed={2} bounds={[6, 1, 6]} volume={4} position={[8, 9, 6]} color="white" opacity={0.4} />
            </Clouds>
            <Ground onGridClick={handleGridClick} />
            <GridLines />
            <Decorations />

            {/* Hover-tracking plane for preview */}
            {placing && (
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.02, 0]}
                onPointerMove={(e) => {
                  const p = e.point;
                  handleGridHover(Math.floor(p.x / TILE), Math.floor(p.z / TILE));
                }}
              >
                <planeGeometry args={[GRID_SIZE * TILE, GRID_SIZE * TILE]} />
                <meshBasicMaterial transparent opacity={0} />
              </mesh>
            )}

            {state.buildings.map(b => (
              <BuildingMesh
                key={b.id}
                b={b}
                selected={selectedId === b.id}
                onClick={() => {
                  if (placing) return;
                  if (b.type === 'academy') { collectAcademy(b); return; }
                  setSelectedId(selectedId === b.id ? null : b.id);
                  audio.click();
                }}
              />
            ))}

            {placing && preview && (
              <BuildingMesh b={{ type: placing, x: preview.x, z: preview.z }} isPreview valid={!!previewValid} />
            )}

            {enemies.map(e => <EnemyMesh key={e.id} e={e} />)}
            {projectiles.map(p => <ProjectileMesh key={p.id} p={p} />)}
          </Suspense>

          <OrbitControls
            enablePan
            enableZoom
            enableRotate={false}
            mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
            screenSpacePanning={false}
            minDistance={8}
            maxDistance={30}
            target={[0, 0, 0]}
            dampingFactor={0.15}
            enableDamping
          />
        </Canvas>
      </div>

      {/* ── FLOATERS (HTML overlay via absolute) ── */}
      {/* rendered inside canvas via 3D-projected math would need extra code; use simple corner toast */}
      <div className="pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2">
        <AnimatePresence>
          {floaters.slice(-3).map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0, y: -40 }}
              className="text-lg font-black drop-shadow-lg"
              style={{ color: f.color, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── SIDEBAR ── */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-40 flex items-center">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              className="pointer-events-auto m-3 flex max-h-[calc(100vh-8rem)] w-80 flex-col overflow-hidden rounded-2xl bg-slate-900/85 shadow-2xl ring-1 ring-white/10 backdrop-blur-md mt-20"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Castle className="h-4 w-4 text-amber-300" /> Command Center
                </div>
                <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-white/70 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Selected building panel */}
                {selectedId && (() => {
                  const b = state.buildings.find(x => x.id === selectedId);
                  if (!b) return null;
                  const def = BUILDING_DEFS[b.type];
                  return (
                    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-2xl">{def.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-white">{def.name} <span className="text-xs text-white/50">Lv {b.level}</span></div>
                          <div className="text-xs text-white/60">HP {Math.ceil(b.hp)}/{b.maxHp}</div>
                        </div>
                      </div>
                      {b.type === 'townhall' ? (
                        <button
                          onClick={upgradeTownHall}
                          disabled={state.xp < 300 * b.level}
                          className="w-full rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white shadow hover:bg-amber-400 disabled:opacity-40"
                        >
                          Upgrade ({300 * b.level} XP)
                        </button>
                      ) : (
                        <button
                          onClick={demolish}
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-red-500/80 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                        >
                          <Trash2 className="h-3 w-3" /> Demolish (refund 50%)
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Build menu */}
                <Section title="Build">
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(BUILDING_DEFS) as BuildingType[]).filter(t => t !== 'townhall').map(t => {
                      const d = BUILDING_DEFS[t];
                      const locked = state.kingdomLevel < d.unlockLevel;
                      const poor = state.xp < d.cost;
                      const active = placing === t;
                      return (
                        <button
                          key={t}
                          disabled={locked}
                          onClick={() => { setPlacing(active ? null : t); setSelectedId(null); audio.click(); }}
                          className={`rounded-lg p-2 text-left ring-1 transition ${
                            active ? 'bg-amber-500/30 ring-amber-400' :
                            locked ? 'bg-white/5 ring-white/5 opacity-50' :
                            poor ? 'bg-white/5 ring-white/10 opacity-70' :
                            'bg-white/10 ring-white/10 hover:bg-white/15'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-sm">
                            <span>{d.icon}</span>
                            <span className="font-bold text-white">{d.name}</span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-amber-300">
                            {locked ? `🔒 Lv ${d.unlockLevel}` : `⚡ ${d.cost} XP`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {placing && (
                    <p className="mt-2 text-[11px] text-amber-300">Click a tile on the map to place. Green = valid, Red = blocked.</p>
                  )}
                </Section>

                {/* Recruit */}
                <Section title="Recruit Army">
                  {!state.buildings.some(b => b.type === 'barracks') && (
                    <p className="mb-2 rounded bg-red-500/20 px-2 py-1 text-[11px] text-red-200">Build a Barracks first.</p>
                  )}
                  <div className="space-y-2">
                    {(Object.keys(UNIT_DEFS) as UnitType[]).map(u => {
                      const d = UNIT_DEFS[u];
                      const locked = state.kingdomLevel < d.unlockLevel;
                      const noBarr = !state.buildings.some(b => b.type === 'barracks');
                      const poor = state.xp < d.cost;
                      const unitPop = u === 'archer' ? 1 : u === 'knight' ? 2 : 3;
                      const noPop = populationUsed + unitPop > populationCap;
                      const disabled = locked || noBarr || poor || noPop;
                      return (
                        <button
                          key={u}
                          disabled={disabled}
                          onClick={() => recruit(u)}
                          className="flex w-full items-center gap-2 rounded-lg bg-white/10 p-2 ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-40"
                        >
                          <span className="text-xl">{d.icon}</span>
                          <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-white">{d.name} <span className="text-xs text-white/50">×{state.army[u]}</span></div>
                            <div className="text-[11px] text-white/60">
                              {locked ? `🔒 Kingdom Lv ${d.unlockLevel}` : `⚡ ${d.cost} · ❤️ ${d.hp} · ⚔️ ${d.dps}/s`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Section>

                <Section title="Info">
                  <ul className="space-y-1 text-[11px] text-white/70">
                    <li>• Drag with left click to pan the map.</li>
                    <li>• Scroll to zoom in and out.</li>
                    <li>• Click an Academy to collect +25 XP.</li>
                    <li>• Waves come every {WAVE_INTERVAL}s — prepare!</li>
                    <li>• Progress auto-saves every 10s.</li>
                  </ul>
                </Section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 rounded-l-xl bg-slate-900/80 p-3 text-white shadow-lg ring-1 ring-white/10 backdrop-blur"
          >
            <Castle className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* ── Game Over overlay ── */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
          >
            <div className="rounded-2xl bg-slate-900 p-8 text-center ring-1 ring-red-500/30">
              <div className="mb-2 text-5xl">💀</div>
              <h2 className="mb-1 text-2xl font-black text-white">Your Town Hall has fallen</h2>
              <p className="mb-6 text-sm text-white/70">You survived {state.waveNumber} wave{state.waveNumber === 1 ? '' : 's'}.</p>
              <button
                onClick={resetGame}
                className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white shadow-lg hover:bg-amber-400"
              >
                Rebuild
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pause overlay ── */}
      <AnimatePresence>
        {paused && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <div className="pointer-events-auto rounded-2xl bg-slate-900 px-8 py-6 text-center ring-1 ring-white/10">
              <div className="mb-3 text-4xl">⏸️</div>
              <div className="mb-4 text-lg font-bold text-white">Paused</div>
              <button
                onClick={() => setPaused(false)}
                className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-white hover:bg-amber-400"
              >
                Resume
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── UI helpers ── */
function HudPill({ icon, label, value, sub, danger }: { icon: React.ReactNode; label: string; value: string; sub?: string; danger?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-white ring-1 ${danger ? 'bg-red-500/30 ring-red-400/40 animate-pulse' : 'bg-white/10 ring-white/10'}`}>
      {icon}
      <span className="text-white/60">{label}</span>
      <span className="tabular-nums text-white">{value}</span>
      {sub && <span className="text-[10px] text-white/50">{sub}</span>}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
  return (
    <button
      onClick={onClick} title={title}
      className="rounded-lg bg-white/10 p-2 text-white ring-1 ring-white/10 hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-black uppercase tracking-wider text-amber-300/80">{title}</div>
      {children}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
