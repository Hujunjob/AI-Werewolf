import type { NextApiRequest, NextApiResponse } from 'next';
import { playerServerManager } from '@/lib/PlayerServerManager';
import { ConfigLoader } from '@/lib/config/PlayerConfig';

interface TestResponse {
  status: 'success' | 'error';
  message: string;
  timestamp: string;
  config?: {
    model: string;
    hasApiKey: boolean;
    personality: string;
    strategy: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      status: 'error',
      message: 'Method not allowed',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // 测试配置加载
    const configPath = req.query.config as string || process.env.PLAYER_CONFIG;
    const configLoader = new ConfigLoader(configPath);
    const config = configLoader.getConfig();
    
    // 验证配置
    const isValidConfig = configLoader.validateConfig();
    
    if (!isValidConfig) {
      return res.status(400).json({
        status: 'error',
        message: '配置验证失败',
        timestamp: new Date().toISOString(),
        error: '配置文件不完整或格式错误'
      });
    }

    // 测试PlayerServer初始化
    const playerServer = playerServerManager.getInstance(configPath);

    // 返回测试结果
    res.json({
      status: 'success',
      message: 'AI玩家服务器测试成功',
      timestamp: new Date().toISOString(),
      config: {
        model: config.ai.model,
        hasApiKey: !!(config.ai.apiKey || process.env.OPENROUTER_API_KEY),
        personality: config.game.personality || '默认',
        strategy: config.game.strategy
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    res.status(500).json({
      status: 'error', 
      message: '服务器内部错误',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}