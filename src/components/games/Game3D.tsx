import { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Timer } from 'lucide-react';

/* ─────────────────────────── shared HUD ─────────────────────────── */
function HUD({ score, time, label = 'Score' }: { score: number; time: number; label?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between text-sm">
      <span className="font-bold text-foreground">{label}: {score}</span>
      <span className={`flex items-center gap-1 ${time <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
        <Timer className="h-4 w-4" /> {time}s
      </span>
    </div>
  );
}

function GameLost() {
  return null;
}

/* ─────────────────────────── 1) CUBE RUNNER 3D ───────────────────────────
   Player slides a glowing cube across 3 lanes to dodge incoming neon cubes.
   Controls: ← → arrows or A / D.
*/
function CubeRunnerScene({ onScore, onLose }: { onScore: (s: number) => void; onLose: () => void }) {
  const player = useRef<THREE.Mesh>(null!);
  const obstacles = useRef<{ mesh: THREE.Mesh; lane: number; z: number; color: THREE.Color }[]>([]);
  const lanesX = [-1.6, 0, 1.6];
  const laneRef = useRef(1);
  const elapsed = useRef(0);
  const spawn = useRef(0);
  const groundRef = useRef<THREE.Mesh>(null!);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') laneRef.current = Math.max(0, laneRef.current - 1);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') laneRef.current = Math.min(2, laneRef.current + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useFrame((_, dt) => {
    elapsed.current += dt;
    spawn.current += dt;
    const speed = 8 + Math.min(12, elapsed.current * 0.4);
    onScore(Math.floor(elapsed.current * 10));

    // smooth slide
    if (player.current) {
      const targetX = lanesX[laneRef.current];
      player.current.position.x += (targetX - player.current.position.x) * Math.min(1, dt * 12);
      player.current.rotation.y += dt * 1.5;
    }

    // ground scroll
    if (groundRef.current) {
      const mat = groundRef.current.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.offset.y -= dt * speed * 0.05;
      }
    }

    // spawn
    const spawnEvery = Math.max(0.35, 0.9 - elapsed.current * 0.02);
    while (spawn.current >= spawnEvery) {
      spawn.current -= spawnEvery;
      const lane = Math.floor(Math.random() * 3);
      const color = new THREE.Color().setHSL(Math.random(), 0.9, 0.6);
      const geo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, roughness: 0.3 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(lanesX[lane], 0.6, -40);
      obstacles.current.push({ mesh, lane, z: -40, color });
    }

    // move obstacles
    for (let i = obstacles.current.length - 1; i >= 0; i--) {
      const o = obstacles.current[i];
      o.z += dt * speed;
      o.mesh.position.z = o.z;
      o.mesh.rotation.x += dt * 2;
      o.mesh.rotation.y += dt * 2;
      // collide
      if (o.z > 0.5 && o.z < 1.8 && o.lane === laneRef.current) {
        onLose();
      }
      if (o.z > 5) {
        o.mesh.geometry.dispose();
        (o.mesh.material as THREE.Material).dispose();
        obstacles.current.splice(i, 1);
      }
    }
  });

  // attach obstacle meshes to scene
  const { scene } = useThree();
  useEffect(() => {
    const group = new THREE.Group();
    scene.add(group);
    const interval = setInterval(() => {
      obstacles.current.forEach(o => {
        if (!o.mesh.parent) group.add(o.mesh);
      });
    }, 50);
    return () => {
      clearInterval(interval);
      scene.remove(group);
      obstacles.current.forEach(o => {
        o.mesh.geometry.dispose();
        (o.mesh.material as THREE.Material).dispose();
      });
      obstacles.current = [];
    };
  }, [scene]);

  // ground texture (procedural grid)
  const groundTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 30);
    return tex;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 6, 2]} intensity={1.8} color="#a855f7" />
      <pointLight position={[0, 2, -10]} intensity={1.5} color="#06b6d4" />
      <Stars radius={50} depth={50} count={1500} factor={3} fade speed={1} />
      {/* ground */}
      <mesh ref={groundRef} rotation-x={-Math.PI / 2} position={[0, 0, -10]}>
        <planeGeometry args={[10, 60]} />
        <meshStandardMaterial map={groundTex} emissive="#1e293b" emissiveIntensity={0.4} />
      </mesh>
      {/* lane glow lines */}
      {[-0.8, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.01, -10]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.05, 60]} />
          <meshBasicMaterial color="#22d3ee" />
        </mesh>
      ))}
      {/* player cube */}
      <mesh ref={player} position={[0, 0.6, 1]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#fde047" emissive="#f59e0b" emissiveIntensity={0.9} />
      </mesh>
    </>
  );
}

export function CubeRunner3D({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  useEffect(() => { if (dead) setTimeout(() => onFinish(score), 600); }, [dead]); // eslint-disable-line
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">Score: {score}</span>
        <span className="text-muted-foreground">← → or A / D to dodge</span>
      </div>
      <div className="rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_40px_hsl(195_100%_50%/0.3)]" style={{ height: 420 }}>
        <Canvas camera={{ position: [0, 3.5, 5], fov: 60 }}>
          <Suspense fallback={null}>
            {!dead && <CubeRunnerScene onScore={setScore} onLose={() => setDead(true)} />}
          </Suspense>
        </Canvas>
      </div>
      {dead && <p className="mt-3 text-center text-destructive font-bold">💥 Crashed!</p>}
    </div>
  );
}

/* ─────────────────────────── 2) ORBIT SHOOTER 3D ───────────────────────────
   The player orbits a glowing core. Tap / click to shoot at incoming asteroids.
*/
function OrbitShooterScene({ onScore, time, onAdd }: { onScore: number; time: number; onAdd: (n: number) => void }) {
  const playerRef = useRef<THREE.Mesh>(null!);
  const angleRef = useRef(0);
  const asteroids = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3 }[]>([]);
  const bullets = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[]>([]);
  const spawn = useRef(0);
  const { scene, camera } = useThree();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ') shoot();
    };
    const onClick = () => shoot();
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onClick);

    function shoot() {
      if (!playerRef.current) return;
      const dir = playerRef.current.position.clone().normalize().multiplyScalar(-30);
      const geo = new THREE.SphereGeometry(0.15, 12, 12);
      const mat = new THREE.MeshStandardMaterial({ color: '#fde047', emissive: '#facc15', emissiveIntensity: 2 });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(playerRef.current.position);
      scene.add(m);
      bullets.current.push({ mesh: m, vel: dir, life: 2 });
    }
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onClick);
    };
  }, [scene]);

  useFrame((_, dt) => {
    angleRef.current += dt * 1.2;
    if (playerRef.current) {
      playerRef.current.position.set(Math.cos(angleRef.current) * 4, 0, Math.sin(angleRef.current) * 4);
      playerRef.current.lookAt(0, 0, 0);
    }

    // spawn asteroids
    spawn.current += dt;
    const every = Math.max(0.4, 1.2 - (60 - time) * 0.015);
    while (spawn.current >= every) {
      spawn.current -= every;
      const a = Math.random() * Math.PI * 2;
      const r = 18;
      const pos = new THREE.Vector3(Math.cos(a) * r, (Math.random() - 0.5) * 2, Math.sin(a) * r);
      const vel = pos.clone().multiplyScalar(-1).normalize().multiplyScalar(2 + Math.random() * 2);
      const geo = new THREE.IcosahedronGeometry(0.6 + Math.random() * 0.4, 0);
      const color = new THREE.Color().setHSL(Math.random(), 0.85, 0.55);
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5, flatShading: true });
      const m = new THREE.Mesh(geo, mat);
      m.position.copy(pos);
      scene.add(m);
      asteroids.current.push({ mesh: m, vel });
    }

    // move bullets
    for (let i = bullets.current.length - 1; i >= 0; i--) {
      const b = bullets.current[i];
      b.mesh.position.addScaledVector(b.vel, dt);
      b.life -= dt;
      if (b.life <= 0) {
        scene.remove(b.mesh);
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
        bullets.current.splice(i, 1);
      }
    }

    // move asteroids + collide
    for (let i = asteroids.current.length - 1; i >= 0; i--) {
      const a = asteroids.current[i];
      a.mesh.position.addScaledVector(a.vel, dt);
      a.mesh.rotation.x += dt; a.mesh.rotation.y += dt * 1.3;
      // bullet hit
      let hit = false;
      for (let j = bullets.current.length - 1; j >= 0; j--) {
        if (a.mesh.position.distanceTo(bullets.current[j].mesh.position) < 0.9) {
          hit = true;
          onAdd(10);
          scene.remove(bullets.current[j].mesh);
          bullets.current[j].mesh.geometry.dispose();
          (bullets.current[j].mesh.material as THREE.Material).dispose();
          bullets.current.splice(j, 1);
          break;
        }
      }
      if (hit || a.mesh.position.length() < 0.8 || a.mesh.position.length() > 25) {
        scene.remove(a.mesh);
        a.mesh.geometry.dispose();
        (a.mesh.material as THREE.Material).dispose();
        asteroids.current.splice(i, 1);
      }
    }

    // camera orbit slowly
    camera.position.set(Math.cos(angleRef.current * 0.3) * 10, 6, Math.sin(angleRef.current * 0.3) * 10);
    camera.lookAt(0, 0, 0);
  });

  useEffect(() => {
    return () => {
      asteroids.current.forEach(a => { scene.remove(a.mesh); a.mesh.geometry.dispose(); (a.mesh.material as THREE.Material).dispose(); });
      bullets.current.forEach(b => { scene.remove(b.mesh); b.mesh.geometry.dispose(); (b.mesh.material as THREE.Material).dispose(); });
      asteroids.current = []; bullets.current = [];
    };
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={3} color="#ec4899" distance={20} />
      <Stars radius={60} depth={60} count={2500} factor={4} fade speed={2} />
      {/* core */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#ec4899" emissive="#f43f5e" emissiveIntensity={1.5} />
      </mesh>
      {/* player ship */}
      <mesh ref={playerRef}>
        <coneGeometry args={[0.4, 1, 8]} />
        <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={1.2} />
      </mesh>
    </>
  );
}

export function OrbitShooter3D({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  useEffect(() => {
    if (time <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [time, score, onFinish]);

  return (
    <div>
      <HUD score={score} time={time} />
      <p className="mb-2 text-center text-xs text-muted-foreground">Click or press SPACE to shoot asteroids 🌟</p>
      <div className="rounded-2xl overflow-hidden border-2 border-pink-500/40 shadow-[0_0_40px_hsl(330_95%_60%/0.4)]" style={{ height: 420 }}>
        <Canvas camera={{ position: [0, 6, 10], fov: 60 }}>
          <Suspense fallback={null}>
            <OrbitShooterScene onScore={score} time={time} onAdd={(n) => setScore(s => s + n)} />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

/* ─────────────────────────── 3) COLOR CUBE MATCH 3D ───────────────────────────
   A spinning 3D cube with 6 colored faces. Player taps the named color.
*/
const FACE_COLORS = [
  { name: 'Red', hex: '#ef4444' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Green', hex: '#22c55e' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Orange', hex: '#fb923c' },
];

function SpinningCube({ rotation }: { rotation: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null!);
  const target = useRef<[number, number, number]>(rotation);
  useEffect(() => { target.current = rotation; }, [rotation]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += (target.current[0] - ref.current.rotation.x) * Math.min(1, dt * 5);
    ref.current.rotation.y += (target.current[1] - ref.current.rotation.y) * Math.min(1, dt * 5);
    ref.current.rotation.z += (target.current[2] - ref.current.rotation.z) * Math.min(1, dt * 5);
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[2.5, 2.5, 2.5]} />
      {FACE_COLORS.map((c, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} color={c.hex} emissive={c.hex} emissiveIntensity={0.35} roughness={0.4} />
      ))}
    </mesh>
  );
}

export function ColorCubeMatch3D({ onFinish }: { onFinish: (s: number) => void }) {
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(30);
  const [target, setTarget] = useState(FACE_COLORS[0]);
  const [rot, setRot] = useState<[number, number, number]>([0.6, 0.8, 0]);
  const [flash, setFlash] = useState<'ok' | 'bad' | null>(null);

  const nextRound = () => {
    const next = FACE_COLORS[Math.floor(Math.random() * FACE_COLORS.length)];
    setTarget(next);
    setRot([Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI]);
  };

  useEffect(() => {
    if (time <= 0) { onFinish(score); return; }
    const t = setTimeout(() => setTime(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [time, score, onFinish]);

  const handlePick = (c: typeof FACE_COLORS[number]) => {
    if (c.hex === target.hex) { setScore(s => s + 1); setFlash('ok'); }
    else { setScore(s => Math.max(0, s - 1)); setFlash('bad'); }
    setTimeout(() => { setFlash(null); nextRound(); }, 200);
  };

  return (
    <div>
      <HUD score={score} time={time} />
      <p className="mb-2 text-center text-sm">
        Tap the color: <span className="font-bold" style={{ color: target.hex }}>{target.name}</span>
      </p>
      <div className={`rounded-2xl overflow-hidden border-2 transition-colors ${flash === 'ok' ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.5)]' : flash === 'bad' ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]' : 'border-primary/30 shadow-[0_0_40px_hsl(150_90%_50%/0.3)]'}`} style={{ height: 320 }}>
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.5} />
          <pointLight position={[-5, -3, -5]} intensity={0.8} color="#a855f7" />
          <Stars radius={30} depth={20} count={400} factor={2} fade />
          <SpinningCube rotation={rot} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {FACE_COLORS.map(c => (
          <button
            key={c.hex}
            onClick={() => handlePick(c)}
            className="rounded-xl py-3 font-bold text-white shadow-lg active:scale-95 transition-transform"
            style={{ background: `linear-gradient(135deg, ${c.hex}, ${c.hex}cc)`, boxShadow: `0 4px 20px ${c.hex}55` }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
