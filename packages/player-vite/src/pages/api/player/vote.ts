import type { NextApiRequest, NextApiResponse } from 'next';
import { playerServerManager } from '@/lib/PlayerServerManager';
import { VotingResponseSchema } from '@/lib/validation';
import type { PlayerContext } from '@/lib/types';

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
    console.log('\n=== VOTE REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const context: PlayerContext = req.body;
    const configPath = req.query.config as string || process.env.PLAYER_CONFIG;
    const server = playerServerManager.getInstance(configPath);
    
    const voteResponse = await server.vote(context);

    const response = VotingResponseSchema.parse(voteResponse);
    console.log('Response:', JSON.stringify(response, null, 2));
    console.log('=== END VOTE REQUEST ===\n');

    res.json(response);
  } catch (error) {
    console.error('Vote error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid response data', details: error });
    } else {
      res.status(500).json({ error: 'Failed to generate vote' });
    }
  }
}