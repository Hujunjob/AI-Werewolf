import { PlayerServer } from './PlayerServer';
import { ConfigLoader } from './config/PlayerConfig';

// 全局 PlayerServer 管理器 - 确保所有API端点使用同一个实例
class PlayerServerManager {
  private playerServer: PlayerServer | null = null;
  private currentConfigPath: string | undefined = undefined;

  getInstance(configPath?: string): PlayerServer {
    console.log('🔍 PlayerServerManager.getInstance() called with configPath:', configPath);
    console.log('🔍 Current state - hasInstance:', !!this.playerServer, 'currentConfigPath:', this.currentConfigPath);
    
    // 如果已经有实例且configPath相同，直接返回
    if (this.playerServer && this.currentConfigPath === configPath) {
      console.log('♻️  Reusing existing PlayerServer instance');
      return this.playerServer;
    }
    
    // 如果configPath不同，重置实例
    if (this.playerServer && this.currentConfigPath !== configPath) {
      console.log('🔄 ConfigPath changed, creating new PlayerServer instance');
      this.playerServer = null;
    }
    
    if (!this.playerServer) {
      console.log('🔨 Creating new PlayerServer instance...');
      const configLoader = new ConfigLoader(configPath);
      const config = configLoader.getConfig();
      
      if (!configLoader.validateConfig()) {
        throw new Error('配置验证失败');
      }
      
      this.playerServer = new PlayerServer(config);
      this.currentConfigPath = configPath;
      console.log('🎮 Created new PlayerServer instance with config:', configPath || 'default');
    }
    
    return this.playerServer;
  }

  reset() {
    this.playerServer = null;
    this.currentConfigPath = undefined;
    console.log('♻️  PlayerServer instance reset');
  }
}

// 使用 globalThis 确保在 Next.js 开发环境中单例不会被重置
const globalKey = Symbol.for('playerServerManager');

function getPlayerServerManager(): PlayerServerManager {
  if (!(globalKey in globalThis)) {
    (globalThis as any)[globalKey] = new PlayerServerManager();
    console.log('🌍 Created global PlayerServerManager instance');
  }
  return (globalThis as any)[globalKey];
}

// 导出单例实例
export const playerServerManager = getPlayerServerManager();