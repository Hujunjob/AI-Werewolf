import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PlayerConfig, ApiResponse } from '@/lib/types';

const CONFIGS_DIR = join(process.cwd(), 'configs');

async function ensureConfigsDir() {
  try {
    await fs.mkdir(CONFIGS_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureConfigsDir();
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (name) {
      const configPath = join(CONFIGS_DIR, `${name}.json`);
      try {
        const configData = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(configData) as PlayerConfig;
        
        const response: ApiResponse<PlayerConfig> = {
          success: true,
          data: config
        };
        return NextResponse.json(response);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          error: `Configuration '${name}' not found`
        };
        return NextResponse.json(response, { status: 404 });
      }
    } else {
      const files = await fs.readdir(CONFIGS_DIR);
      const configNames = files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

      const response: ApiResponse<string[]> = {
        success: true,
        data: configNames
      };
      return NextResponse.json(response);
    }
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to read configurations'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, config }: { name: string; config: PlayerConfig } = body;

    if (!name || !config) {
      const response: ApiResponse = {
        success: false,
        error: 'Name and config are required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await ensureConfigsDir();
    const configPath = join(CONFIGS_DIR, `${name}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));

    const response: ApiResponse = {
      success: true,
      data: { message: `Configuration '${name}' saved successfully` }
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to save configuration'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  return POST(request); // Same logic for update
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      const response: ApiResponse = {
        success: false,
        error: 'Configuration name is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    const configPath = join(CONFIGS_DIR, `${name}.json`);
    await fs.unlink(configPath);

    const response: ApiResponse = {
      success: true,
      data: { message: `Configuration '${name}' deleted successfully` }
    };
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete configuration'
    };
    return NextResponse.json(response, { status: 500 });
  }
}