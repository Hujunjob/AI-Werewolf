import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/lib/PlayerService';
import { ApiResponse, PlayerConfig } from '@/lib/types';
import { StartGameParams } from '@ai-werewolf/types';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('\n=== START GAME REQUEST ===');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { configName, ...gameParams }: { configName: string } & StartGameParams = body;

    if (!configName) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration name is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 读取配置文件
    const configPath = join(process.cwd(), 'configs', `${configName}.json`);
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData) as PlayerConfig;

      // 创建PlayerService实例
      const playerService = new PlayerService(config);
      await playerService.startGame(gameParams);

      const response: ApiResponse = {
        success: true,
        data: { 
          message: 'Game started successfully',
          gameId: gameParams.gameId,
          playerId: gameParams.playerId,
          role: gameParams.role
        }
      };

      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('=== END START GAME REQUEST ===\n');

      return NextResponse.json(response);
    } catch (configError) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration '${configName}' not found`
      };
      return NextResponse.json(response, { status: 404 });
    }
  } catch (error) {
    console.error('Start game error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to start game'
    };
    return NextResponse.json(response, { status: 500 });
  }
}