import type { Card, CardSuit, CardRank, CardCombo } from '@/types/game';
import { CARD_VALUES } from '@/types/game';

// 创建一副牌
export function createDeck(): Card[] {
  const suits: CardSuit[] = ['♠', '♥', '♣', '♦'];
  const ranks: CardRank[] = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  const deck: Card[] = [];
  let id = 0;

  // 创建普通牌
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        suit,
        rank,
        value: CARD_VALUES[rank],
        id: `${suit}-${rank}-${id++}`,
      });
    }
  }

  // 创建大小王
  deck.push({
    suit: 'joker',
    rank: '小王',
    value: CARD_VALUES['小王'],
    id: `joker-small-${id++}`,
  });
  deck.push({
    suit: 'joker',
    rank: '大王',
    value: CARD_VALUES['大王'],
    id: `joker-big-${id++}`,
  });

  return deck;
}

// 洗牌
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// 排序手牌（从大到小）
export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => b.value - a.value);
}

// 获取卡牌颜色
export function getCardColor(suit: CardSuit): string {
  if (suit === 'joker') return 'text-purple-600';
  return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-gray-900';
}

// 获取卡牌背景色
export function getCardBg(suit: CardSuit): string {
  if (suit === 'joker') return 'bg-gradient-to-br from-purple-100 to-purple-200';
  return 'bg-white';
}

// 分析卡牌组合
export function analyzeCardCombo(cards: Card[]): CardCombo {
  if (cards.length === 0) {
    return { type: 'invalid', cards, value: 0 };
  }

  const sorted = sortCards(cards);
  const values = sorted.map(c => c.value);
  const uniqueValues = [...new Set(values)];

  // 王炸
  if (cards.length === 2 && values.includes(16) && values.includes(17)) {
    return { type: 'rocket', cards: sorted, value: 17 };
  }

  // 炸弹
  if (cards.length === 4 && uniqueValues.length === 1) {
    return { type: 'bomb', cards: sorted, value: values[0] };
  }

  // 单张
  if (cards.length === 1) {
    return { type: 'single', cards: sorted, value: values[0] };
  }

  // 对子
  if (cards.length === 2 && uniqueValues.length === 1) {
    return { type: 'pair', cards: sorted, value: values[0] };
  }

  // 三张
  if (cards.length === 3 && uniqueValues.length === 1) {
    return { type: 'triple', cards: sorted, value: values[0] };
  }

  // 三带一
  if (cards.length === 4) {
    const valueCounts = countValues(values);
    const entries = Object.entries(valueCounts);
    if (entries.length === 2 && entries.some(([_, count]) => count === 3)) {
      const mainValue = entries.find(([_, count]) => count === 3)![0];
      return { type: 'triple_single', cards: sorted, value: parseInt(mainValue) };
    }
  }

  // 三带二
  if (cards.length === 5) {
    const valueCounts = countValues(values);
    const entries = Object.entries(valueCounts);
    if (entries.length === 2 && entries.some(([_, count]) => count === 3) && entries.some(([_, count]) => count === 2)) {
      const mainValue = entries.find(([_, count]) => count === 3)![0];
      return { type: 'triple_pair', cards: sorted, value: parseInt(mainValue) };
    }
  }

  // 顺子 (至少5张)
  if (cards.length >= 5) {
    const isStraight = checkStraight(values);
    if (isStraight) {
      return { type: 'straight', cards: sorted, value: values[0] };
    }
  }

  // 连对 (至少3对)
  if (cards.length >= 6 && cards.length % 2 === 0) {
    const isDoubleStraight = checkDoubleStraight(values);
    if (isDoubleStraight) {
      return { type: 'double_straight', cards: sorted, value: values[0] };
    }
  }

  // 飞机 (至少2个三连)
  if (cards.length >= 6) {
    const isTripleStraight = checkTripleStraight(values);
    if (isTripleStraight) {
      return { type: 'triple_straight', cards: sorted, value: values[0] };
    }
  }

  return { type: 'invalid', cards: sorted, value: 0 };
}

// 统计各数值出现次数
function countValues(values: number[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1;
  }
  return counts;
}

// 检查是否为顺子
function checkStraight(values: number[]): boolean {
  // 顺子不能包含2、小王、大王
  if (values.some(v => v >= 15)) return false;
  
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length !== values.length) return false;
  
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) return false;
  }
  return true;
}

// 检查是否为连对
function checkDoubleStraight(values: number[]): boolean {
  // 不能包含2、小王、大王
  if (values.some(v => v >= 15)) return false;
  
  const valueCounts = countValues(values);
  const entries = Object.entries(valueCounts);
  
  // 必须都是成对的
  if (!entries.every(([_, count]) => count === 2)) return false;
  
  // 检查是否连续
  const uniqueValues = entries.map(([v, _]) => parseInt(v)).sort((a, b) => b - a);
  for (let i = 0; i < uniqueValues.length - 1; i++) {
    if (uniqueValues[i] - uniqueValues[i + 1] !== 1) return false;
  }
  return true;
}

// 检查是否为飞机
function checkTripleStraight(values: number[]): boolean {
  // 不能包含2、小王、大王
  if (values.some(v => v >= 15)) return false;
  
  const valueCounts = countValues(values);
  const entries = Object.entries(valueCounts);
  
  // 必须都是3个的
  if (!entries.every(([_, count]) => count === 3)) return false;
  
  // 检查是否连续
  const uniqueValues = entries.map(([v, _]) => parseInt(v)).sort((a, b) => b - a);
  for (let i = 0; i < uniqueValues.length - 1; i++) {
    if (uniqueValues[i] - uniqueValues[i + 1] !== 1) return false;
  }
  return true;
}

// 比较两个组合的大小
export function canBeat(combo1: CardCombo, combo2: CardCombo): boolean {
  // 王炸最大
  if (combo1.type === 'rocket') return true;
  if (combo2.type === 'rocket') return false;
  
  // 炸弹可以打非炸弹
  if (combo1.type === 'bomb' && combo2.type !== 'bomb') return true;
  if (combo2.type === 'bomb' && combo1.type !== 'bomb') return false;
  
  // 类型必须相同才能比较
  if (combo1.type !== combo2.type) return false;
  
  // 张数必须相同
  if (combo1.cards.length !== combo2.cards.length) return false;
  
  // 比较主值
  return combo1.value > combo2.value;
}

// 检查是否可以出牌
export function canPlayCards(cards: Card[], lastCombo: CardCombo | null): boolean {
  const combo = analyzeCardCombo(cards);
  
  if (combo.type === 'invalid') return false;
  
  // 如果没有上家出牌，任意有效牌型都可以出
  if (!lastCombo || lastCombo.cards.length === 0) return true;
  
  // 必须能打过上家
  return canBeat(combo, lastCombo);
}

// 获取推荐出牌（AI用）
export function getRecommendedPlay(hand: Card[], lastCombo: CardCombo | null): Card[] | null {
  const sortedHand = sortCards(hand);
  
  // 如果没有上家出牌，出最小的单张
  if (!lastCombo || lastCombo.cards.length === 0) {
    return [sortedHand[sortedHand.length - 1]];
  }
  
  // 尝试找出能打的牌
  const possiblePlays: Card[][] = [];
  
  // 生成所有可能的组合
  const allCombinations = generateAllCombinations(sortedHand);
  
  for (const combo of allCombinations) {
    const analyzed = analyzeCardCombo(combo);
    if (analyzed.type !== 'invalid' && canBeat(analyzed, lastCombo)) {
      possiblePlays.push(combo);
    }
  }
  
  // 优先出非炸弹的牌，其次出炸弹
  const nonBombs = possiblePlays.filter(cards => {
    const analyzed = analyzeCardCombo(cards);
    return analyzed.type !== 'bomb' && analyzed.type !== 'rocket';
  });
  
  if (nonBombs.length > 0) {
    // 出最小的能打的牌
    return nonBombs.sort((a, b) => {
      const comboA = analyzeCardCombo(a);
      const comboB = analyzeCardCombo(b);
      return comboA.value - comboB.value;
    })[0];
  }
  
  // 出炸弹或王炸
  if (possiblePlays.length > 0) {
    return possiblePlays[0];
  }
  
  return null;
}

// 生成所有可能的组合
function generateAllCombinations(hand: Card[]): Card[][] {
  const combinations: Card[][] = [];
  const n = hand.length;
  
  // 生成所有子集
  for (let i = 1; i < (1 << n); i++) {
    const subset: Card[] = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        subset.push(hand[j]);
      }
    }
    combinations.push(subset);
  }
  
  return combinations;
}
