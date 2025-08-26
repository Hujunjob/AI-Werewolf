import type { NextApiRequest, NextApiResponse } from 'next';
import { playerServerManager } from '@/lib/PlayerServerManager';

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
    const configPath = req.query.config as string || process.env.PLAYER_CONFIG;
    const server = playerServerManager.getInstance(configPath);
    const status = server.getStatus();
    
    res.json(status);
  } catch (error) {
    console.error('Status error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(500).json({ error: 'Invalid status data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to get status' });
    }
  }
}