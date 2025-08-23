import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PlayerServer } from '../../src/PlayerServer';
import { ConfigLoader } from '../../src/config/PlayerConfig';
import type { StartGameParams } from '@ai-werewolf/types';
import { initializeLangfuse, shutdownLangfuse } from '../../src/services/langfuse';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let langfuseInitialized = false;

  try {
    // 初始化 Langfuse
    initializeLangfuse();
    langfuseInitialized = true;

    console.log('\n=== SERVERLESS START GAME REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    // 从请求体获取数据
    const { 
      playerId,
      playerConfig: customPlayerConfig,
      ...gameParams 
    }: {
      playerId: string;
      playerConfig?: any;
      [key: string]: any;
    } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    // 获取玩家配置
    const config = customPlayerConfig || getPlayerConfig(playerId);
    
    // 创建 PlayerServer 实例
    const playerServer = new PlayerServer(config);

    // 构造 StartGameParams
    const startGameParams: StartGameParams = {
      gameId: gameParams.gameId || 'serverless-game',
      playerId: parseInt(playerId),
      role: gameParams.role,
      teammates: gameParams.teammates || [],
      ...gameParams
    };

    // 调用 startGame 方法
    await playerServer.startGame(startGameParams);

    const response = {
      message: 'Game started successfully',
      playerId: parseInt(playerId),
      gameId: startGameParams.gameId,
      role: startGameParams.role,
      teammates: startGameParams.teammates,
      langfuseEnabled: true
    };

    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END SERVERLESS START GAME REQUEST ===\n');

    res.json(response);

  } catch (error) {
    console.error('Serverless start game error:', error);
    res.status(500).json({ error: 'Failed to start game', details: error instanceof Error ? error.message : 'Unknown error' });
  } finally {
    // 清理 Langfuse
    if (langfuseInitialized) {
      try {
        await shutdownLangfuse();
      } catch (error) {
        console.error('Langfuse shutdown error:', error);
      }
    }
  }
}