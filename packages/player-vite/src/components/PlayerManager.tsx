'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayerInstance, ApiResponse } from '@/lib/types';
import { Play, Square, RefreshCw } from 'lucide-react';

export default function PlayerManager() {
  const [players, setPlayers] = useState<PlayerInstance[]>([]);
  const [configs, setConfigs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/player');
      const data: ApiResponse<PlayerInstance[]> = await response.json();
      if (data.success && data.data) {
        setPlayers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/config');
      const data: ApiResponse<string[]> = await response.json();
      if (data.success && data.data) {
        setConfigs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    }
  };

  useEffect(() => {
    fetchPlayers();
    fetchConfigs();
  }, []);

  const startPlayer = async (configName: string) => {
    setIsLoading(true);
    try {
      const playerId = `player-${Date.now()}`;
      const response = await fetch('/api/player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: playerId, configName })
      });

      const data: ApiResponse<PlayerInstance> = await response.json();
      if (data.success) {
        await fetchPlayers();
      } else {
        alert(`启动失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to start player:', error);
      alert('启动失败');
    } finally {
      setIsLoading(false);
    }
  };

  const stopPlayer = async (playerId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/player?id=${playerId}`, {
        method: 'DELETE'
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        await fetchPlayers();
      } else {
        alert(`停止失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to stop player:', error);
      alert('停止失败');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: PlayerInstance['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: PlayerInstance['status']) => {
    switch (status) {
      case 'running':
        return '运行中';
      case 'stopped':
        return '已停止';
      case 'error':
        return '错误';
      default:
        return '未知';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            启动新Player
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { fetchPlayers(); fetchConfigs(); }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {configs.map(configName => (
              <div key={configName} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{configName}</span>
                <Button
                  size="sm"
                  onClick={() => startPlayer(configName)}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-2" />
                  启动
                </Button>
              </div>
            ))}
          </div>
          {configs.length === 0 && (
            <p className="text-muted-foreground">暂无可用配置</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>运行中的Player实例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium">{player.config.game.name || player.id}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(player.status)}`}>
                      {getStatusText(player.status)}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground space-x-4">
                    <span>端口: {player.port}</span>
                    <span>策略: {player.config.game.strategy}</span>
                    <span>风格: {player.config.game.speakingStyle}</span>
                    {player.startTime && (
                      <span>启动时间: {new Date(player.startTime).toLocaleTimeString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`http://localhost:${player.port}/api/status`, '_blank')}
                  >
                    状态
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => stopPlayer(player.id)}
                    disabled={isLoading}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    停止
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {players.length === 0 && (
            <p className="text-muted-foreground">暂无运行中的Player实例</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}