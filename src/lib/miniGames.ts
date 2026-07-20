export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpCost: number;
  category: 'strategy';
  color: string;
  color2?: string;
  is3D?: boolean;
}

// The mini-game catalog has been replaced with a single flagship title:
// Kingdom Builder 3D — a low-poly strategy & wave-defense experience.
export const miniGames: MiniGame[] = [
  {
    id: 'kingdom',
    name: 'Kingdom Builder 3D',
    description:
      'Build a low-poly fantasy kingdom, recruit an army, and defend your Town Hall against waves of raiders.',
    icon: '🏰',
    xpCost: 0,
    category: 'strategy',
    color: 'hsl(30 90% 55%)',
    color2: 'hsl(340 90% 55%)',
    is3D: true,
  },
];
