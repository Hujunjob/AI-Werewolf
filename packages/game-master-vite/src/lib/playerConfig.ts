// Browser-compatible player configuration
// Uses environment variables or defaults

export function getPlayerUrls(): string[] {
  // In production, these could come from environment variables
  // For now, we'll use the default localhost URLs
  const defaultPlayers = [
    'https://ai-werewolf-game-master-vite.vercel.app:3001',
    'https://ai-werewolf-game-master-vite.vercel.app:3002',
    'https://ai-werewolf-game-master-vite.vercel.app:3003',
    'https://ai-werewolf-game-master-vite.vercel.app:3004',
    'https://ai-werewolf-game-master-vite.vercel.app:3005',
    'https://ai-werewolf-game-master-vite.vercel.app:3006',
    'https://ai-werewolf-game-master-vite.vercel.app:3007',
    'https://ai-werewolf-game-master-vite.vercel.app:3008'
  ];

  // Check if there's a custom configuration in environment variables
  // This would need to be set at build time for Vite
  const customPlayers = import.meta.env.VITE_PLAYER_URLS;
  
  if (customPlayers) {
    try {
      return JSON.parse(customPlayers);
    } catch (e) {
      console.warn('Failed to parse VITE_PLAYER_URLS, using defaults');
    }
  }

  return defaultPlayers;
}