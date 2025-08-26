# AI狼人杀玩家前端

这是一个基于 Next.js 的 AI 狼人杀玩家管理系统，提供了前端配置界面和后端 Serverless API。

## 功能特性

- 🎮 可视化玩家配置管理
- 🤖 支持多种 AI 模型 (Claude 3.5, GPT-4 等)
- ⚙️ 灵活的策略和个性配置
- 📊 实时运行日志显示
- 🚀 一键部署到 Vercel

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 环境配置

复制环境变量模板并配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，设置必要的环境变量：

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_BASEURL=https://cloud.langfuse.com
```

### 3. 运行开发服务器

```bash
bun run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## API 端点

所有 API 端点都实现为 Serverless Functions，与原 player 包的接口完全兼容：

- `POST /api/player/start-game` - 启动游戏
- `POST /api/player/speak` - 生成发言
- `POST /api/player/vote` - 投票决策
- `POST /api/player/use-ability` - 使用特殊能力
- `POST /api/player/last-words` - 遗言生成
- `POST /api/player/status` - 获取玩家状态

## 部署到 Vercel

### 1. 连接仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库

### 2. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

- `OPENROUTER_API_KEY`: OpenRouter API 密钥
- `LANGFUSE_SECRET_KEY`: Langfuse 密钥 (可选)
- `LANGFUSE_PUBLIC_KEY`: Langfuse 公钥 (可选)
- `LANGFUSE_BASEURL`: Langfuse 服务器地址 (可选)

### 3. 部署

配置完成后，Vercel 会自动部署你的应用。

## 配置文件

项目包含多个预设配置文件：

- `configs/default.json` - 默认配置
- `configs/aggressive.json` - 激进型策略
- `configs/conservative.json` - 保守型策略
- `configs/witty.json` - 幽默型个性

你可以通过前端界面动态修改这些配置，或者通过 API 参数指定配置文件。

## 开发

### 项目结构

```
src/
├── pages/
│   ├── api/player/          # Serverless API 函数
│   ├── index.tsx           # 主页面
├── lib/
│   ├── PlayerServer.ts     # 核心玩家服务器逻辑
│   ├── config/             # 配置管理
│   ├── prompts/            # AI 提示词
│   └── validation.ts       # 数据验证
├── styles/
│   └── globals.css         # 全局样式
```

### 本地开发

```bash
# 开发模式
bun run dev

# 类型检查
bun run typecheck

# 代码检查
bun run lint

# 构建
bun run build
```

## 与原 player 包的区别

1. **架构**: 使用 Next.js + Serverless Functions 替代 Express 服务器
2. **部署**: 支持一键部署到 Vercel
3. **管理界面**: 提供可视化的配置管理界面
4. **API 兼容**: 完全兼容原 player 包的 API 接口

## 故障排除

### 常见问题

1. **API 调用失败**: 确保环境变量正确配置
2. **AI 响应错误**: 检查 API 密钥是否有效
3. **部署失败**: 确保所有依赖都正确安装

### 日志查看

在前端界面的"运行日志"面板可以查看实时日志，在 Vercel 控制台可以查看服务器端日志。