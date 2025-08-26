import type { NextApiRequest, NextApiResponse } from 'next';
import { playerServerManager } from '@/lib/PlayerServerManager';
import type { PlayerContext, WitchContext, SeerContext } from '@/lib/types';

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
    console.log('\n=== USE ABILITY REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const context: PlayerContext | WitchContext | SeerContext = req.body;
    const configPath = req.query.config as string || process.env.PLAYER_CONFIG;
    const server = playerServerManager.getInstance(configPath);
    
    const result = await server.useAbility(context);

    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('=== END USE ABILITY REQUEST ===\n');

    res.json(result);
  } catch (error) {
    console.error('Use ability error:', error);
    res.status(500).json({ error: 'Failed to use ability' });
  }
}