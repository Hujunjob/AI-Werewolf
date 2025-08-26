// Local type definitions to avoid shared package webpack issues

export enum Role {
  VILLAGER = 'villager',
  WEREWOLF = 'werewolf',
  SEER = 'seer',
  WITCH = 'witch'
}

export enum GamePhase {
  DAY = 'day',
  VOTING = 'voting',  
  NIGHT = 'night'
}

export type PlayerId = number;

export type PersonalityType = 'aggressive' | 'conservative' | 'cunning' | 'witty';

export interface StartGameParams {
  gameId: string;
  playerId: number;
  role: Role;
  teammates?: PlayerId[];
}

export interface Player {
  id: PlayerId;
  name: string;
  role?: Role;
  isAlive: boolean;
  votedBy?: PlayerId[];
  dayVoteTarget?: PlayerId;
  speeches?: string[];
}

export interface PlayerContext {
  gameId: string;
  playerId: PlayerId;
  round: number;
  currentPhase: GamePhase;
  players: Player[];
  history: GameHistory[];
}

export interface WitchContext extends PlayerContext {
  nightDeaths?: PlayerId[];
  witchHealUsed?: boolean;
  witchPoisonUsed?: boolean;
}

export interface SeerContext extends PlayerContext {
  investigatedPlayers?: { [playerId: string]: { target: number; isGood: boolean } };
}

export interface GameHistory {
  round: number;
  phase: GamePhase;
  events: GameEvent[];
}

export interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface SpeechResponseType {
  speech: string;
}

export interface VotingResponseType {
  target: number;
  reason: string;
}

export interface NightActionResponseType {
  target?: number;
  useHeal?: boolean;
  healTarget?: number;
  usePoison?: boolean;
  poisonTarget?: number;
}