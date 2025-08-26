# Player Vite - AI Player Management Interface

AI狼人杀玩家配置和管理界面，提供Web UI和API服务用于管理AI玩家实例。

## 功能特性

### Web界面
- **Player管理**：启动、停止和监控AI玩家实例
- **配置编辑**：创建和编辑玩家配置文件
- **实时状态**：查看玩家运行状态、端口、策略等信息

### API接口
提供RESTful API用于程序化管理AI玩家和配置。

## 启动服务

```bash
# 开发模式（端口4001）
bun dev

# 生产模式
bun build
bun start
```

## API接口文档

### 游戏API (`/api/game/*`) - 新增无服务器架构

直接提供AI玩家游戏功能，无需依赖外部player实例：

#### POST `/api/game/start`
开始游戏

**请求体:**
```json
{
  "configName": "aggressive",
  "gameId": "game-123",
  "playerId": 1,
  "role": "VILLAGER",
  "teammates": []
}
```

#### POST `/api/game/speak`
玩家发言

**请求体:**
```json
{
  "configName": "aggressive",
  "gameState": {
    "gameId": "game-123",
    "playerId": 1,
    "role": "VILLAGER",
    "teammates": []
  },
  "gameId": "game-123",
  "phase": "day",
  "round": 1,
  "players": [{"id": 1, "name": "Player1", "isAlive": true}],
  "gameHistory": []
}
```

#### POST `/api/game/vote`
投票表决

**请求体:** 同speak，但用于投票阶段

#### POST `/api/game/use-ability`
使用角色技能

**请求体:** 包含角色特定的上下文信息

#### POST `/api/game/last-words`
发表遗言

#### GET/POST `/api/game/status`
获取玩家状态

### 配置管理 API (`/api/config`)

#### GET `/api/config`
获取所有配置文件列表

**响应:**
```json
{
  "success": true,
  "data": ["aggressive", "conservative", "default", "witty"]
}
```

#### GET `/api/config?name={configName}`
获取指定配置文件详情

**参数:**
- `name`: 配置文件名称

**响应:**
```json
{
  "success": true,
  "data": {
    "server": {
      "port": 3001,
      "host": "0.0.0.0"
    },
    "ai": {
      "model": "gpt-4",
      "maxTokens": 1000,
      "temperature": 0.7,
      "provider": "openai"
    },
    "game": {
      "name": "激进玩家",
      "personality": "激进且直接的玩家",
      "strategy": "aggressive",
      "speakingStyle": "casual"
    },
    "logging": {
      "level": "info",
      "enabled": true
    }
  }
}
```

#### POST `/api/config`
创建或更新配置文件

**请求体:**
```json
{
  "name": "my-config",
  "config": {
    "server": { "port": 3001, "host": "0.0.0.0" },
    "ai": { "model": "gpt-4", "maxTokens": 1000, "temperature": 0.7, "provider": "openai" },
    "game": { "name": "自定义玩家", "personality": "描述", "strategy": "balanced", "speakingStyle": "formal" },
    "logging": { "level": "info", "enabled": true }
  }
}
```

#### DELETE `/api/config?name={configName}`
删除指定配置文件

### 玩家管理 API (`/api/player`)

#### GET `/api/player`
获取所有玩家实例状态

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "player-1692123456789",
      "port": 3001,
      "config": { /* 配置对象 */ },
      "status": "running",
      "pid": 12345,
      "startTime": "2023-08-15T10:30:00Z"
    }
  ]
}
```

#### GET `/api/player?id={playerId}`
获取指定玩家实例状态

**参数:**
- `id`: 玩家实例ID

#### POST `/api/player`
启动新的玩家实例

**请求体:**
```json
{
  "id": "player-unique-id",
  "configName": "aggressive"
}
```

**功能:**
- 自动分配可用端口（避免冲突）
- 创建实例专属配置文件
- 启动玩家进程

#### DELETE `/api/player?id={playerId}`
停止指定玩家实例

**参数:**
- `id`: 玩家实例ID

### 代理 API (`/api/proxy/[...path]`)

HTTP代理服务，用于转发请求到运行中的AI玩家实例。

#### 所有HTTP方法 `/api/proxy/{path}?port={targetPort}`
代理请求到指定端口的玩家实例

**参数:**
- `port`: 目标玩家实例端口号
- `path`: 转发的路径

**示例:**
```bash
# 获取端口3001玩家的状态
GET /api/proxy/api/player/status?port=3001

# 向端口3002玩家发送游戏数据
POST /api/proxy/api/player/speak?port=3002
```

### 通过代理访问的游戏API

通过代理可以访问AI玩家的完整游戏接口：

#### POST `/api/proxy/api/player/start-game?port={port}`
开始游戏

**请求体:**
```json
{
  "gameId": "game-123",
  "players": [
    {"id": 1, "name": "Player1", "isAlive": true},
    {"id": 2, "name": "Player2", "isAlive": true}
  ],
  "myPlayerId": 1,
  "myRole": "VILLAGER"
}
```

#### POST `/api/proxy/api/player/speak?port={port}`
玩家发言

**请求体:**
```json
{
  "gameId": "game-123",
  "phase": "day",
  "round": 1,
  "players": [/* 玩家列表 */],
  "gameHistory": [/* 游戏历史 */],
  "myPlayerId": 1
}
```

#### POST `/api/proxy/api/player/vote?port={port}`
投票表决

**请求体:**
```json
{
  "gameId": "game-123",
  "phase": "day",
  "round": 1,
  "players": [/* 玩家列表 */],
  "gameHistory": [/* 游戏历史 */],
  "myPlayerId": 1
}
```

#### POST `/api/proxy/api/player/use-ability?port={port}`
使用角色技能

**请求体 (预言家):**
```json
{
  "gameId": "game-123",
  "phase": "night",
  "round": 1,
  "players": [/* 玩家列表 */],
  "gameHistory": [/* 游戏历史 */],
  "myPlayerId": 1,
  "role": "SEER"
}
```

**请求体 (女巫):**
```json
{
  "gameId": "game-123",
  "phase": "night", 
  "round": 1,
  "players": [/* 玩家列表 */],
  "gameHistory": [/* 游戏历史 */],
  "myPlayerId": 1,
  "role": "WITCH",
  "killedPlayerId": 2,
  "canSave": true,
  "canPoison": true
}
```

#### POST `/api/proxy/api/player/last-words?port={port}`
发表遗言

#### GET/POST `/api/proxy/api/player/status?port={port}`
获取玩家状态

**特性:**
- 自动转发请求头和请求体
- 处理CORS跨域
- 连接失败时返回友好错误信息
- 支持所有HTTP方法 (GET, POST, PUT, DELETE, PATCH, OPTIONS)

## 配置文件结构

每个AI玩家的配置文件包含以下字段：

```typescript
interface PlayerConfig {
  server: {
    port: number;        // 服务端口
    host: string;        // 监听地址
  };
  ai: {
    model: string;       // AI模型 (如 "gpt-4")
    maxTokens: number;   // 最大token数
    temperature: number; // 温度参数
    provider: string;    // AI提供商
  };
  game: {
    name: string;                                    // 玩家名称
    personality: string;                             // 个性描述
    strategy: 'aggressive' | 'conservative' | 'balanced'; // 策略
    speakingStyle: 'casual' | 'formal' | 'witty';          // 说话风格
  };
  logging: {
    level: string;       // 日志级别
    enabled: boolean;    // 是否启用日志
  };
}
```

## 预设配置

系统包含以下预设配置：
- `aggressive`: 激进型玩家
- `conservative`: 保守型玩家  
- `default`: 默认平衡型玩家
- `witty`: 机智幽默型玩家

## 错误处理

所有API响应遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;      // 成功时的数据
  error?: string; // 失败时的错误信息
}
```

## 架构说明

### 无服务器架构 (推荐)
新的`/api/game/*`接口提供完全无状态的AI玩家功能：
- 每次请求创建新的PlayerService实例
- 通过configName加载玩家配置
- 通过gameState参数传递游戏状态
- 完全适配Vercel等无服务器平台

### 传统代理架构 (兼容)
`/api/proxy/*`接口用于转发到独立的player实例：
- 需要独立部署player服务
- 适用于需要持久状态的场景

## 环境变量

```env
OPENROUTER_API_KEY=your_openrouter_api_key
```

## Vercel部署

1. 连接GitHub仓库到Vercel
2. 设置环境变量 `OPENROUTER_API_KEY`
3. 部署即可使用完整的AI狼人杀功能

## 开发说明

- 基于 Next.js App Router 架构
- 使用 TypeScript 严格类型检查
- TailwindCSS + Lucide图标
- 集成 AI SDK 和 OpenRouter
- 支持热重载开发模式
- CORS已配置支持跨域访问