'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerConfig, PersonalityType } from '@/lib/types';

interface PlayerConfigFormProps {
  initialConfig?: PlayerConfig;
  onSave: (name: string, config: PlayerConfig) => Promise<void>;
  onCancel?: () => void;
}

export default function PlayerConfigForm({ initialConfig, onSave, onCancel }: PlayerConfigFormProps) {
  const [configName, setConfigName] = useState('');
  const [config, setConfig] = useState<PlayerConfig>(initialConfig || {
    server: {
      port: 3001,
      host: '0.0.0.0'
    },
    ai: {
      model: 'anthropic/claude-3-haiku',
      maxTokens: 150,
      temperature: 0.8,
      provider: 'openrouter'
    },
    game: {
      name: '',
      personality: '',
      strategy: 'balanced',
      speakingStyle: 'casual'
    },
    logging: {
      level: 'info',
      enabled: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configName.trim()) {
      alert('请输入配置名称');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(configName, config);
      setConfigName('');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('保存配置失败');
    } finally {
      setIsLoading(false);
    }
  };

  const strategies: Array<{ value: PlayerConfig['game']['strategy']; label: string }> = [
    { value: 'aggressive', label: '激进型' },
    { value: 'conservative', label: '保守型' },
    { value: 'balanced', label: '平衡型' }
  ];

  const speakingStyles: Array<{ value: PlayerConfig['game']['speakingStyle']; label: string }> = [
    { value: 'casual', label: '随意风格' },
    { value: 'formal', label: '正式风格' },
    { value: 'witty', label: '幽默风格' }
  ];

  const providers = [
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'openai', label: 'OpenAI' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Player Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">配置名称</label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              placeholder="输入配置名称"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">服务器端口</label>
              <input
                type="number"
                value={config.server.port}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  server: { ...prev.server, port: parseInt(e.target.value) }
                }))}
                className="w-full p-2 border border-input rounded-md bg-background"
                min="3000"
                max="9999"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">主机地址</label>
              <input
                type="text"
                value={config.server.host}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  server: { ...prev.server, host: e.target.value }
                }))}
                className="w-full p-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI 配置</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">AI模型</label>
                <input
                  type="text"
                  value={config.ai.model}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    ai: { ...prev.ai, model: e.target.value }
                  }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">提供商</label>
                <select
                  value={config.ai.provider}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    ai: { ...prev.ai, provider: e.target.value }
                  }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {providers.map(provider => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">最大Token数</label>
                <input
                  type="number"
                  value={config.ai.maxTokens}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    ai: { ...prev.ai, maxTokens: parseInt(e.target.value) }
                  }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                  min="50"
                  max="2000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">温度值 ({config.ai.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.ai.temperature}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    ai: { ...prev.ai, temperature: parseFloat(e.target.value) }
                  }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">游戏配置</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium">玩家名称</label>
              <input
                type="text"
                value={config.game.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  game: { ...prev.game, name: e.target.value }
                }))}
                className="w-full p-2 border border-input rounded-md bg-background"
                placeholder="输入玩家名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">个性描述</label>
              <textarea
                value={config.game.personality}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  game: { ...prev.game, personality: e.target.value }
                }))}
                className="w-full p-2 border border-input rounded-md bg-background h-20"
                placeholder="描述这个AI玩家的个性特征..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">策略类型</label>
                <select
                  value={config.game.strategy}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    game: { ...prev.game, strategy: e.target.value as PlayerConfig['game']['strategy'] }
                  }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {strategies.map(strategy => (
                    <option key={strategy.value} value={strategy.value}>
                      {strategy.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">说话风格</label>
                <select
                  value={config.game.speakingStyle}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    game: { ...prev.game, speakingStyle: e.target.value as PlayerConfig['game']['speakingStyle'] }
                  }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  {speakingStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                取消
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}