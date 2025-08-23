import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PlayerServer } from '../../src/PlayerServer';
import { ConfigLoader } from '../../src/config/PlayerConfig';
import { LastWordsResponseSchema } from '../../src/validation';
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

    // 从请求体获取数据
    const { 
      playerId, 
      gameState, 
      playerConfig: customPlayerConfig 
    }: {
      playerId: string;
      gameState?: any;
      playerConfig?: any;
    } = req.body;

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

    console.log('\n=== SERVERLESS LAST WORDS REQUEST ===');
    console.log('Player ID:', playerId);

    // 调用 lastWords 方法
    const lastWords = await playerServer.lastWords();

    // 验证响应格式
    const response = LastWordsResponseSchema.parse({ content: lastWords });
    
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END SERVERLESS LAST WORDS REQUEST ===\n');

    res.json(response);

  } catch (error) {
    console.error('Serverless last words error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid response data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to generate last words' });
    }
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