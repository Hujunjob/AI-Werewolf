// Define the type locally to avoid import issues
interface LastWordsParams {
  playerId: number;
  gameId: string;
  alivePlayers: any[];
}
import { formatPlayerList } from '../utils';


export function getLastWords(params: LastWordsParams): string {
  const playerList = formatPlayerList(params.alivePlayers);
  
  return `你是${params.playerId}号玩家，即将离开游戏。当前游戏状态：
- 存活玩家: [${playerList}]

作为即将离开游戏的玩家，你需要发表遗言：
1. 可以留下对游戏的最后分析
2. 可以暗示自己的身份（如果是神职）
3. 可以指认你认为的狼人
4. 可以给好人阵营提供建议

请简短发言（30-50字）。
`;
}



