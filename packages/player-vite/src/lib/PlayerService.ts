import { 
  Role, 
  type StartGameParams, 
  type PlayerContext, 
  type WitchContext, 
  type SeerContext,
  type PlayerId,
  type PlayerInfo,
  VotingResponseType,
  SpeechResponseType,
  VotingResponseSchema,
  NightActionResponseType,
  WerewolfNightActionSchema,
  SeerNightActionSchema,
  WitchNightActionSchema,
  SpeechResponseSchema
} from '@ai-werewolf/types';
import { generateObject } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { PlayerConfig } from './types';

// 角色到夜间行动 Schema 的映射
const ROLE_SCHEMA_MAP = {
  [Role.WEREWOLF]: WerewolfNightActionSchema,
  [Role.SEER]: SeerNightActionSchema,
  [Role.WITCH]: WitchNightActionSchema,
} as const;

// 无状态的Player服务类
export class PlayerService {
  private config: PlayerConfig;
  private gameState: {
    gameId?: string;
    playerId?: number;
    role?: Role;
    teammates?: PlayerId[];
  };

  constructor(config: PlayerConfig, gameState?: {
    gameId?: string;
    playerId?: number;
    role?: string;
    teammates?: PlayerId[];
  }) {
    this.config = config;
    this.gameState = {
      ...gameState,
      role: gameState?.role as Role
    };
  }

  async startGame(params: StartGameParams): Promise<void> {
    this.gameState = {
      gameId: params.gameId,
      role: params.role as Role,
      teammates: params.teammates,
      playerId: params.playerId,
    };
    
    console.log(`🎮 Player started game ${this.gameState.gameId} as ${this.gameState.role}`);
  }

  async speak(context: PlayerContext): Promise<string> {
    if (!this.gameState.role) {
      return "我需要仔细思考一下当前的情况。";
    }

    const speechResponse = await this.generateSpeech(context);
    return speechResponse.speech;
  }

  async vote(context: PlayerContext): Promise<VotingResponseType> {
    if (!this.gameState.role) {
      return { target: 1, reason: "默认投票给玩家1" };
    }

    return await this.generateVote(context);
  }

  async useAbility(context: PlayerContext | WitchContext | SeerContext): Promise<any> {
    if (!this.gameState.role) {
      throw new Error("我没有特殊能力可以使用。");
    }

    return await this.generateAbilityUse(context);
  }

  async lastWords(): Promise<string> {
    return "很遗憾要离开游戏了，希望好人阵营能够获胜！";
  }

  getStatus() {
    return {
      gameId: this.gameState.gameId,
      playerId: this.gameState.playerId,
      role: this.gameState.role,
      teammates: this.gameState.teammates,
      isAlive: true,
      config: {
        personality: this.config.game.personality
      }
    };
  }

  // AI生成方法
  private async generateSpeech(context: PlayerContext): Promise<SpeechResponseType> {
    const prompt = this.buildSpeechPrompt(context);
    
    return this.generateWithAI<SpeechResponseType>({
      schema: SpeechResponseSchema,
      prompt: prompt,
    });
  }

  private async generateVote(context: PlayerContext): Promise<VotingResponseType> {
    const prompt = this.buildVotePrompt(context);
    
    return this.generateWithAI<VotingResponseType>({
      schema: VotingResponseSchema,
      prompt: prompt,
    });
  }

  private async generateAbilityUse(context: PlayerContext | WitchContext | SeerContext): Promise<NightActionResponseType> {
    if (this.gameState.role === Role.VILLAGER) {
      throw new Error('Village has no night action, should be skipped');
    }
    
    const schema = ROLE_SCHEMA_MAP[this.gameState.role!];
    if (!schema) {
      throw new Error(`Unknown role: ${this.gameState.role}`);
    }

    const prompt = this.buildAbilityPrompt(context);
    
    return this.generateWithAI<NightActionResponseType>({
      schema: schema,
      prompt: prompt,
    });
  }

  // 通用AI生成方法
  private async generateWithAI<T>(params: {
    schema: any;
    prompt: string;
    maxOutputTokens?: number;
    temperature?: number;
  }): Promise<T> {
    const { schema, prompt, maxOutputTokens, temperature } = params;
    
    try {
      const result = await generateObject({
        model: this.getModel(),
        schema: schema,
        prompt: prompt,
        maxOutputTokens: maxOutputTokens || this.config.ai.maxTokens,
        temperature: temperature ?? this.config.ai.temperature,
      });

      return result.object as T;
    } catch (error) {
      console.error(`AI generation failed:`, error);
      throw new Error(`Failed to generate AI response: ${error}`);
    }
  }

  // Prompt构建方法
  private buildSpeechPrompt(context: PlayerContext): string {
    const personalityPrompt = this.buildPersonalityPrompt();
    const rolePrompt = this.buildRolePrompt();
    
    return `${personalityPrompt}

${rolePrompt}

当前游戏状态：
- 当前阶段: ${context.currentPhase}
- 回合数: ${context.round}
- 我的角色: ${this.gameState.role}
- 我的ID: ${this.gameState.playerId}

存活玩家列表：
${context.alivePlayers.map((p: PlayerInfo) => `- ${p.id}: 玩家${p.id} (${p.isAlive ? '存活' : '死亡'})`).join('\n')}

最近发言：
${Object.entries(context.allSpeeches).slice(-1).map(([round, speeches]) => 
  speeches.map(s => `回合${round} - 玩家${s.playerId}: ${s.content}`).join('\n')
).join('\n')}

请根据当前情况发言，发言控制在30-80字，语言自然，像真人玩家。

你的发言：`;
  }

  private buildVotePrompt(context: PlayerContext): string {
    const personalityPrompt = this.buildPersonalityPrompt();
    const rolePrompt = this.buildRolePrompt();
    
    return `${personalityPrompt}

${rolePrompt}

当前投票阶段，你需要选择投票目标。

当前游戏状态：
- 当前阶段: ${context.currentPhase}
- 回合数: ${context.round}
- 我的角色: ${this.gameState.role}
- 我的ID: ${this.gameState.playerId}

存活玩家：
${context.alivePlayers.filter((p: PlayerInfo) => p.isAlive && p.id !== this.gameState.playerId).map((p: PlayerInfo) => `- ${p.id}: 玩家${p.id}`).join('\n')}

请根据以上信息进行投票决策。`;
  }

  private buildAbilityPrompt(context: PlayerContext | WitchContext | SeerContext): string {
    const personalityPrompt = this.buildPersonalityPrompt();
    const rolePrompt = this.buildRolePrompt();
    
    let specificPrompt = '';
    
    if (this.gameState.role === Role.SEER) {
      specificPrompt = '请选择你想要查验的玩家。';
    } else if (this.gameState.role === Role.WITCH) {
      const witchContext = context as WitchContext;
      specificPrompt = `夜间行动阶段：
- 被杀玩家ID: ${witchContext.killedTonight || '无'}
- 已使用解药: ${witchContext.potionUsed.heal ? '是' : '否'}
- 已使用毒药: ${witchContext.potionUsed.poison ? '是' : '否'}

请选择你的行动。`;
    } else if (this.gameState.role === Role.WEREWOLF) {
      specificPrompt = '请选择你想要杀死的玩家。';
    }
    
    return `${personalityPrompt}

${rolePrompt}

${specificPrompt}

存活玩家：
${(context as PlayerContext).alivePlayers.filter((p: PlayerInfo) => p.isAlive && p.id !== this.gameState.playerId).map((p: PlayerInfo) => `- ${p.id}: 玩家${p.id}`).join('\n')}`;
  }

  private buildPersonalityPrompt(): string {
    const strategy = this.config.game.strategy;
    const speakingStyle = this.config.game.speakingStyle;
    
    let strategyPrompt = '';
    switch (strategy) {
      case 'aggressive':
        strategyPrompt = '你是一个激进型玩家，喜欢主动出击，敢于冒险，说话直接果断。';
        break;
      case 'conservative':
        strategyPrompt = '你是一个保守型玩家，谨慎小心，喜欢观察和分析，不轻易表态。';
        break;
      case 'balanced':
        strategyPrompt = '你是一个平衡型玩家，会根据情况灵活调整策略。';
        break;
    }
    
    let stylePrompt = '';
    switch (speakingStyle) {
      case 'casual':
        stylePrompt = '说话风格随意自然，使用日常用语。';
        break;
      case 'formal':
        stylePrompt = '说话风格正式规范，用词准确。';
        break;
      case 'witty':
        stylePrompt = '说话风格幽默机智，偶尔开玩笑。';
        break;
    }
    
    return `个性设定：
${this.config.game.personality}

策略风格：${strategyPrompt}
说话风格：${stylePrompt}`;
  }

  private buildRolePrompt(): string {
    switch (this.gameState.role) {
      case Role.VILLAGER:
        return '你是村民，目标是找出并投票处死所有狼人。';
      case Role.WEREWOLF:
        return `你是狼人，目标是消灭所有好人。${this.gameState.teammates?.length ? `你的狼人队友：${this.gameState.teammates.join(', ')}` : ''}`;
      case Role.SEER:
        return '你是预言家，每晚可以查验一名玩家的身份。';
      case Role.WITCH:
        return '你是女巫，有解药和毒药各一瓶。';
      default:
        return '';
    }
  }

  private getModel() {
    const openrouter = createOpenAICompatible({
      name: 'openrouter',
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      headers: {
        'HTTP-Referer': 'https://mojo.monad.xyz',
        'X-Title': 'AI Werewolf Game',
      },
    });
    
    return openrouter(this.config.ai.model);
  }
}