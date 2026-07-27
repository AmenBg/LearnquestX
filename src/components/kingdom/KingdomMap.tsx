import { BUILDINGS, BuildingId, KingdomState, buildingLevelKey } from '@/lib/kingdomData';
import { AlertTriangle } from 'lucide-react';

interface KingdomMapProps {
  state: KingdomState;
  selectedBuilding: BuildingId;
  onSelectBuilding: (id: BuildingId) => void;
  raidImminent: boolean;
}

/**
 * Simple isometric-style grid showing each building as a tile.
 * Click a tile to select it in the panel below (build/upgrade there).
 */
export default function KingdomMap({ state, selectedBuilding, onSelectBuilding, raidImminent }: KingdomMapProps) {
  const cols = BUILDINGS.map((b) => b.gridCol);
  const rows = BUILDINGS.map((b) => b.gridRow);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const tileSize = 96;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-emerald-950/40 to-emerald-900/20 p-8 ${raidImminent ? 'ring-2 ring-destructive/60' : ''}`}>
      {raidImminent && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground">
          <AlertTriangle className="h-3.5 w-3.5" /> Raid imminent
        </div>
      )}
      <div
        className="relative mx-auto"
        style={{
          width: (maxCol - minCol + 1) * tileSize,
          height: (maxRow - minRow + 1) * tileSize,
        }}
      >
        {BUILDINGS.map((b) => {
          const level = state[buildingLevelKey(b.id)] as number;
          const built = level > 0;
          const isSelected = selectedBuilding === b.id;
          const left = (b.gridCol - minCol) * tileSize;
          const top = (b.gridRow - minRow) * tileSize;

          return (
            <button
              key={b.id}
              onClick={() => onSelectBuilding(b.id)}
              className={`absolute flex flex-col items-center justify-center rounded-xl border-2 text-center transition-transform hover:z-10 hover:scale-105 ${
                isSelected ? 'border-primary bg-primary/20 shadow-lg' : 'border-border/60 bg-card/70'
              } ${!built ? 'opacity-60' : ''}`}
              style={{ left, top, width: tileSize - 12, height: tileSize - 12 }}
            >
              <span className="text-3xl">{b.icon}</span>
              <span className="mt-1 text-[11px] font-semibold text-foreground">{b.name}</span>
              <span className="text-[10px] text-muted-foreground">{built ? `Lv${level}` : 'Not built'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
