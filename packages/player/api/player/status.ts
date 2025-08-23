import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PlayerServer } from '../../src/PlayerServer';
import { ConfigLoader } from '../../src/config/PlayerConfig';

// 从配置文件或环境变量获取玩家配置
function getPlayerConfig(playerId: string) {
  try {
    // 尝试加载对应的配置文件
    const configPath = `../configs/player${playerId}.json`;
    const configLoader = new ConfigLoader(configPath);
    return configLoader.getConfig();
  } catch (error) {
    // 如果配置文件不存在，使用默认配置
    const configLoader = new ConfigLoader();
    return configLoader.getConfig();
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 从请求体或查询参数获取数据
    const data = req.method === 'POST' ? req.body : req.query;
    const { 
      playerId, 
      gameState, 
      playerConfig: customPlayerConfig 
    }: {
      playerId: string;
      gameState?: any;
      playerConfig?: any;
    } = data;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    // 获取玩家配置
    const config = customPlayerConfig || getPlayerConfig(playerId);
    
    // 创建 PlayerServer 实例
    const playerServer = new PlayerServer(config);

    // 如果有游戏状态，先初始化游戏
    if (gameState) {
      await playerServer.startGame({
        gameId: gameState.gameId,
        playerId: parseInt(playerId),
        role: gameState.playerRole,
        teammates: gameState.teammates || []
      });
    }

    console.log('\n=== SERVERLESS STATUS REQUEST ===');
    console.log('Player ID:', playerId);

    // 调用 getStatus 方法
    const status = playerServer.getStatus();

    console.log('Status:', JSON.stringify(status, null, 2));
    console.log('=== END SERVERLESS STATUS REQUEST ===\n');

    res.json(status);

  } catch (error) {
    console.error('Serverless status error:', error);
    res.status(500).json({ error: 'Failed to get status', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}