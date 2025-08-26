import { NextRequest, NextResponse } from 'next/server';
import { PlayerService } from '@/lib/PlayerService';
import { ApiResponse, PlayerConfig } from '@/lib/types';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { configName, gameState }: { 
      configName: string;
      gameState: {
        gameId: string;
        playerId: number;
        role: string;
        teammates?: number[];
      };
    } = body;

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
      const playerService = new PlayerService(config, gameState);
      const status = playerService.getStatus();

      const response: ApiResponse = {
        success: true,
        data: status
      };

      return NextResponse.json(response);
    } catch (configError) {
      const response: ApiResponse = {
        success: false,
        error: `Configuration '${configName}' not found`
      };
      return NextResponse.json(response, { status: 404 });
    }
  } catch (error) {
    console.error('Status error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get status'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// 兼容GET请求
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const configName = searchParams.get('config');
    
    if (!configName) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration name is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    try {
      const configPath = join(process.cwd(), 'configs', `${configName}.json`);
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData) as PlayerConfig;

      const playerService = new PlayerService(config);
      const status = playerService.getStatus();

      const response: ApiResponse = {
        success: true,
        data: status
      };

      return NextResponse.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to get status'
      };
      return NextResponse.json(response, { status: 500 });
    }
  }
}