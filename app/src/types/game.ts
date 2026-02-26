// 卡牌类型
export type CardSuit = '♠' | '♥' | '♣' | '♦' | 'joker';
export type CardRank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | '小王' | '大王';

export interface Card {
  suit: CardSuit;
  rank: CardRank;
  value: number; // 用于比较大小
  id: string;
}

// 卡牌组合类型
export type CardType = 
  | 'single'      // 单张
  | 'pair'        // 对子
  | 'triple'      // 三张
  | 'triple_single' // 三带一
  | 'triple_pair'   // 三带二
  | 'straight'      // 顺子
  | 'double_straight' // 连对
  | 'triple_straight' // 飞机
  | 'bomb'          // 炸弹
  | 'rocket'        // 王炸
  | 'invalid';      // 无效

export interface CardCombo {
  type: CardType;
  cards: Card[];
  value: number; // 组合的主值，用于比较
}

// 玩家类型
export type PlayerType = 'human' | 'ai';

export interface Player {
  id: number;
  name: string;
  type: PlayerType;
  cards: Card[];
  isLandlord: boolean;
  hasCalledLandlord: boolean;
}

// 游戏状态
export type GamePhase = 
  | 'waiting'      // 等待开始
  | 'dealing'      // 发牌中
  | 'calling'      // 叫地主
  | 'playing'      // 游戏中
  | 'finished';    // 游戏结束

export interface GameState {
  phase: GamePhase;
  players: Player[];
  currentPlayer: number;
  lastPlayedCards: Card[];
  lastPlayedBy: number;
  landlordCards: Card[];
  callRound: number;
  callScore: number;
  winner: number | null;
}

// 游戏配置
export const GAME_CONFIG = {
  TOTAL_CARDS: 54,
  PLAYER_CARDS: 17,
  LANDLORD_EXTRA: 3,
  MIN_STRAIGHT_LENGTH: 5,
  MIN_DOUBLE_STRAIGHT_LENGTH: 3,
  MIN_TRIPLE_STRAIGHT_LENGTH: 2,
};

// 卡牌分值映射
export const CARD_VALUES: Record<CardRank, number> = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15,
  '小王': 16, '大王': 17,
};
