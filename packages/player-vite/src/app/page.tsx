'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import PlayerConfigForm from '@/components/PlayerConfigForm';
import PlayerManager from '@/components/PlayerManager';
import { PlayerConfig, ApiResponse } from '@/lib/types';
import { Settings, Users } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'manager' | 'config'>('manager');

  const handleSaveConfig = async (name: string, config: PlayerConfig) => {
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, config })
      });

      const data: ApiResponse = await response.json();
      if (data.success) {
        alert('配置保存成功！');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      throw error;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex space-x-1 mb-6 border-b border-border">
        <Button
          variant={activeTab === 'manager' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('manager')}
          className="rounded-b-none"
        >
          <Users className="h-4 w-4 mr-2" />
          Player管理
        </Button>
        <Button
          variant={activeTab === 'config' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('config')}
          className="rounded-b-none"
        >
          <Settings className="h-4 w-4 mr-2" />
          配置编辑
        </Button>
      </div>

      {activeTab === 'manager' && <PlayerManager />}
      
      {activeTab === 'config' && (
        <div className="max-w-2xl mx-auto">
          <PlayerConfigForm onSave={handleSaveConfig} />
        </div>
      )}
    </div>
  );
}