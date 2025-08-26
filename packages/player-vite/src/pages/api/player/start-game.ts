import type { NextApiRequest, NextApiResponse } from 'next';
import { playerServerManager } from '@/lib/PlayerServerManager';
import type { StartGameParams } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('\n=== START GAME REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const params: StartGameParams = req.body;
    const configPath = req.query.config as string || process.env.PLAYER_CONFIG;
    const server = playerServerManager.getInstance(configPath);
    
    await server.startGame(params);

    const response = {
      message: 'Game started successfully',
      langfuseEnabled: true
    };

    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END START GAME REQUEST ===\n');

    res.json(response);
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Failed to start game' });
  }
}