export interface PlayerConfig {
  server: {
    port: number;
    host: string;
  };
  ai: {
    model: string;
    maxTokens: number;
    temperature: number;
    provider: string;
  };
  game: {
    name: string;
    personality: string;
    strategy: 'aggressive' | 'conservative' | 'balanced';
    speakingStyle: 'casual' | 'formal' | 'witty';
  };
  logging: {
    level: string;
    enabled: boolean;
  };
}

export interface PlayerInstance {
  id: string;
  port: number;
  config: PlayerConfig;
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  startTime?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type PersonalityType = 'aggressive' | 'conservative' | 'balanced' | 'witty' | 'default';