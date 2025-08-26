import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { PlayerConfig, PlayerInstance } from './types';
import axios from 'axios';

class PlayerManager {
  private instances = new Map<string, PlayerInstance>();
  private playerProjectPath: string;

  constructor() {
    this.playerProjectPath = join(process.cwd(), '../player');
  }

  async startPlayer(id: string, config: PlayerConfig): Promise<PlayerInstance> {
    if (this.instances.has(id)) {
      const instance = this.instances.get(id)!;
      if (instance.status === 'running') {
        throw new Error(`Player ${id} is already running`);
      }
    }

    // Create absolute path for the config file
    const configPath = join(process.cwd(), 'configs', `${id}.json`);
    // Calculate relative path from player project to config file  
    const playerViteConfigsPath = join(process.cwd(), 'configs');
    const relativeConfigPath = join('..', 'player-vite', 'configs', `${id}.json`);
    
    try {
      const process = spawn('bun', ['--watch', 'src/index.ts', `--config=${relativeConfigPath}`], {
        cwd: this.playerProjectPath,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const instance: PlayerInstance = {
        id,
        port: config.server.port,
        config,
        status: 'running',
        pid: process.pid,
        startTime: new Date()
      };

      process.on('error', (error) => {
        console.error(`Player ${id} error:`, error);
        instance.status = 'error';
      });

      process.on('exit', (code) => {
        console.log(`Player ${id} exited with code ${code}`);
        instance.status = 'stopped';
      });

      this.instances.set(id, instance);

      // Wait a bit for the server to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify the server is running
      try {
        await axios.post(`http://localhost:${config.server.port}/api/player/status`, {}, {
          timeout: 5000
        });
      } catch (error) {
        instance.status = 'error';
        throw new Error(`Failed to start player ${id}: server not responding`);
      }

      return instance;
    } catch (error) {
      throw new Error(`Failed to start player ${id}: ${error}`);
    }
  }

  async stopPlayer(id: string): Promise<void> {
    const instance = this.instances.get(id);
    if (!instance) {
      throw new Error(`Player ${id} not found`);
    }

    if (instance.pid) {
      try {
        process.kill(instance.pid, 'SIGTERM');
        instance.status = 'stopped';
      } catch (error) {
        console.error(`Failed to kill player ${id}:`, error);
      }
    }

    this.instances.delete(id);
  }

  async getPlayerStatus(id: string): Promise<PlayerInstance | null> {
    const instance = this.instances.get(id);
    if (!instance) {
      return null;
    }

    // Check if the process is still running
    if (instance.pid && instance.status === 'running') {
      try {
        await axios.post(`http://localhost:${instance.port}/api/player/status`, {}, {
          timeout: 3000
        });
      } catch (error) {
        instance.status = 'error';
      }
    }

    return instance;
  }

  getAllPlayers(): PlayerInstance[] {
    return Array.from(this.instances.values());
  }

  async stopAllPlayers(): Promise<void> {
    const stopPromises = Array.from(this.instances.keys()).map(id => 
      this.stopPlayer(id).catch(console.error)
    );
    await Promise.all(stopPromises);
  }
}

export const playerManager = new PlayerManager();