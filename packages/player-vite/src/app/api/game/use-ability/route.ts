import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/lib/PlayerService';
import { ApiResponse, PlayerConfig } from '@/lib/types';
import { PlayerContext, WitchContext, SeerContext } from '@ai-werewolf/types';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('\n=== USE ABILITY REQUEST ===');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    const { configName, gameState, ...context }: { 
      configName: string;
      gameState: {
        gameId: string;
        playerId: number;
        role: string;
        teammates?: number[];
      };
    } & (PlayerContext | WitchContext | SeerContext) = body;

    if (!configName || !gameState) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration name and game state are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 读取配置文件
    const configPath = join(process.cwd(), 'configs', `${configName}.json`);
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData) as PlayerConfig;

      // 创建PlayerService实例
      const playerService = new PlayerService(config, gameState);
      const result = await playerService.useAbility(context);

      const response: ApiResponse = {
        success: true,
        data: result
      };

      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('=== END USE ABILITY REQUEST ===\n');

      return NextResponse.json(response);
    } catch (configError) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration '${configName}' not found`
      };
      return NextResponse.json(response, { status: 404 });
    }
  } catch (error) {
    console.error('Use ability error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to use ability'
    };
    return NextResponse.json(response, { status: 500 });
  }
}