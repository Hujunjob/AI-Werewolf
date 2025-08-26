import { NextRequest, NextResponse } from 'next/server';
import { playerManager } from '@/lib/playerManager';
import { PlayerConfig, ApiResponse } from '@/lib/types';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const player = await playerManager.getPlayerStatus(id);
      if (!player) {
        const response: ApiResponse = {
          success: false,
          error: `Player ${id} not found`
        };
        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: true,
        data: player
      };
      return NextResponse.json(response);
    } else {
      const players = playerManager.getAllPlayers();
      const response: ApiResponse = {
        success: true,
        data: players
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get player status'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, configName }: { id: string; configName: string } = body;

    if (!id || !configName) {
      const response: ApiResponse = {
        success: false,
        error: 'Player ID and config name are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Read the configuration
    const configPath = join(process.cwd(), 'configs', `${configName}.json`);
    try {
      const configData = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(configData) as PlayerConfig;

      // Ensure unique port for this instance
      const allPlayers = playerManager.getAllPlayers();
      const usedPorts = allPlayers.map(p => p.port);
      const basePort = config.server.port;
      
      let availablePort = basePort;
      while (usedPorts.includes(availablePort)) {
        availablePort++;
      }
      
      config.server.port = availablePort;

      // Save instance-specific config
      const instanceConfigPath = join(process.cwd(), 'configs', `${id}.json`);
      await fs.writeFile(instanceConfigPath, JSON.stringify(config, null, 2));

      // Start the player
      const player = await playerManager.startPlayer(id, config);

      const response: ApiResponse = {
        success: true,
        data: player
      };
      return NextResponse.json(response);
    } catch (configError) {
      console.error('Config error:', configError);
      const response: ApiResponse = {
        success: false,
        error: `Configuration '${configName}' not found or invalid: ${configError}`
      };
      return NextResponse.json(response, { status: 400 });
    }
  } catch (error) {
    console.error('Player start error:', error);
    const response: ApiResponse = {
      success: false,
      error: `Failed to start player: ${error}`
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      const response: ApiResponse = {
        success: false,
        error: 'Player ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await playerManager.stopPlayer(id);

    // Clean up instance-specific config
    const instanceConfigPath = join(process.cwd(), 'configs', `${id}.json`);
    try {
      await fs.unlink(instanceConfigPath);
    } catch (error) {
      // Config file might not exist, that's okay
    }

    const response: ApiResponse = {
      success: true,
      data: { message: `Player ${id} stopped successfully` }
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: `Failed to stop player: ${error}`
    };
    return NextResponse.json(response, { status: 500 });
  }
}