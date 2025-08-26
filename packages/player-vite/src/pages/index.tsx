import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface PlayerConfig {
  game: {
    personality?: string;
    strategy: string;
  };
  ai: {
    model: string;
    customModel?: string;
    apiKey: string;
    maxTokens: number;
    temperature: number;
  };
  logging: {
    enabled: boolean;
    level: string;
  };
  server: {
    host: string;
    port: number;
  };
}

export default function Home() {
  const [config, setConfig] = useState<PlayerConfig>({
    game: {
      personality: '',
      strategy: 'balanced'
    },
    ai: {
      model: 'openrouter/anthropic/claude-3.5-sonnet',
      apiKey: '',
      maxTokens: 8192,
      temperature: 0.7
    },
    logging: {
      enabled: true,
      level: 'info'
    },
    server: {
      host: '0.0.0.0',
      port: 3001
    }
  });

  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleConfigChange = (section: keyof PlayerConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const startPlayer = async () => {
    try {
      setIsRunning(true);
      setLogs(prev => [...prev, '🚀 启动AI玩家服务器...']);
      
      // 这里可以调用API启动玩家服务器
      // 暂时只是模拟启动过程
      setTimeout(() => {
        setLogs(prev => [...prev, `✅ AI玩家服务器已启动在端口 ${config.server.port}`]);
        setLogs(prev => [...prev, `🎮 使用策略: ${config.game.strategy}`]);
        setLogs(prev => [...prev, `🤖 AI模型: ${config.ai.model}`]);
      }, 1000);

    } catch (error) {
      setLogs(prev => [...prev, `❌ 启动失败: ${error}`]);
      setIsRunning(false);
    }
  };

  const stopPlayer = () => {
    setIsRunning(false);
    setLogs(prev => [...prev, '🛑 AI玩家服务器已停止']);
  };

  const testAPI = async () => {
    try {
      setLogs(prev => [...prev, '🧪 测试API连接...']);
      
      const response = await fetch('/api/player/test');
      const result = await response.json();
      
      if (result.status === 'success') {
        setLogs(prev => [...prev, `✅ ${result.message}`]);
        setLogs(prev => [...prev, `📊 模型: ${result.config?.model}`]);
        setLogs(prev => [...prev, `🔑 API密钥: ${result.config?.hasApiKey ? '已配置' : '未配置'}`]);
        setLogs(prev => [...prev, `🎭 策略: ${result.config?.strategy}`]);
        setLogs(prev => [...prev, `🎪 个性: ${result.config?.personality}`]);
      } else {
        setLogs(prev => [...prev, `❌ 测试失败: ${result.message}`]);
        if (result.error) {
          setLogs(prev => [...prev, `💥 错误详情: ${result.error}`]);
        }
      }
    } catch (error) {
      setLogs(prev => [...prev, `❌ API测试失败: ${error}`]);
    }
  };

  return (
    <main className={`min-h-screen bg-gray-100 p-8 ${inter.className}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">AI狼人杀玩家配置</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 配置面板 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">玩家配置</h2>
            
            {/* 游戏配置 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">游戏设置</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  策略类型
                </label>
                <select 
                  value={config.game.strategy}
                  onChange={(e) => handleConfigChange('game', 'strategy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="aggressive">激进型</option>
                  <option value="conservative">保守型</option>
                  <option value="balanced">平衡型</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  个性描述 (可选)
                </label>
                <input
                  type="text"
                  value={config.game.personality || ''}
                  onChange={(e) => handleConfigChange('game', 'personality', e.target.value)}
                  placeholder="例如：幽默风趣的玩家"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* AI配置 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">AI设置</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI模型
                </label>
                <div className="space-y-2">
                  <select 
                    value={config.ai.model}
                    onChange={(e) => handleConfigChange('ai', 'model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="openrouter/anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="openrouter/openai/gpt-4">GPT-4</option>
                    <option value="openrouter/openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="deepseek/deepseek-r1-0528-qwen3-8b:free">DeepSeek R1 (Free)</option>
                    <option value="custom">自定义模型...</option> 
                  </select>
                  {config.ai.model === 'custom' && (
                    <input
                      type="text"
                      placeholder="输入自定义模型名称，如: openrouter/meta-llama/llama-3.2-3b-instruct:free"
                      value={config.ai.customModel || ''}
                      onChange={(e) => handleConfigChange('ai', 'customModel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API密钥
                </label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">从环境变量读取:</span>
                    <code className="text-sm bg-gray-200 px-2 py-1 rounded">OPENROUTER_API_KEY</code>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    请在 .env.local 文件中设置 OPENROUTER_API_KEY=your_api_key
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  温度值 ({config.ai.temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.ai.temperature}
                  onChange={(e) => handleConfigChange('ai', 'temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>保守 (0)</span>
                  <span>创造性 (2)</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最大令牌数
                </label>
                <input
                  type="number"
                  value={config.ai.maxTokens}
                  onChange={(e) => handleConfigChange('ai', 'maxTokens', parseInt(e.target.value))}
                  min="1000"
                  max="32000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 服务器配置 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">服务器设置</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  端口
                </label>
                <input
                  type="number"
                  value={config.server.port}
                  onChange={(e) => handleConfigChange('server', 'port', parseInt(e.target.value))}
                  min="3000"
                  max="9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-4">
              {!isRunning ? (
                <>
                  <button
                    onClick={startPlayer}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    启动玩家
                  </button>
                  <button
                    onClick={testAPI}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    测试API
                  </button>
                </>
              ) : (
                <button
                  onClick={stopPlayer}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  停止玩家
                </button>
              )}
            </div>
          </div>

          {/* 日志面板 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">运行日志</h2>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">等待启动...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4">
              <button
                onClick={() => setLogs([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                清空日志
              </button>
            </div>
          </div>
        </div>

        {/* API端点信息 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API端点</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/start-game
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/speak
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/vote
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/use-ability
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/last-words
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <strong>POST</strong> /api/player/status
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <strong className="text-green-700">GET</strong> <span className="text-green-600">/api/player/test</span>
              <div className="text-xs text-green-600 mt-1">测试API连接</div>
            </div>
          </div>
          
          {isRunning && (
            <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
              <p className="text-sm text-blue-700">
                玩家服务器运行在: <code>http://localhost:{config.server.port}</code>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}