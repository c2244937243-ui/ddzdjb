import { useState, useCallback, useRef } from 'react';
import type { GameState, Player, Card, GamePhase } from '@/types/game';
import { 
  createDeck, 
  shuffleDeck, 
  sortCards, 
  analyzeCardCombo, 
  canPlayCards,
  getRecommendedPlay,
} from '@/utils/cardUtils';

const INITIAL_PLAYERS: Player[] = [
  { id: 0, name: '你', type: 'human', cards: [], isLandlord: false, hasCalledLandlord: false },
  { id: 1, name: 'AI-1', type: 'ai', cards: [], isLandlord: false, hasCalledLandlord: false },
  { id: 2, name: 'AI-2', type: 'ai', cards: [], isLandlord: false, hasCalledLandlord: false },
];

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'waiting',
    players: JSON.parse(JSON.stringify(INITIAL_PLAYERS)),
    currentPlayer: 0,
    lastPlayedCards: [],
    lastPlayedBy: -1,
    landlordCards: [],
    callRound: 0,
    callScore: 0,
    winner: null,
  });

  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [message, setMessage] = useState<string>('点击"开始游戏"开始新游戏');
  const [playHistory, setPlayHistory] = useState<string[]>([]);
  
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // 开始新游戏
  const startGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const players = JSON.parse(JSON.stringify(INITIAL_PLAYERS));
    
    // 发牌
    for (let i = 0; i < 17; i++) {
      for (let j = 0; j < 3; j++) {
        players[j].cards.push(deck.pop()!);
      }
    }
    
    // 排序手牌
    players.forEach((p: Player) => {
      p.cards = sortCards(p.cards);
    });
    
    const landlordCards = deck;
    
    setGameState({
      phase: 'calling',
      players,
      currentPlayer: 0,
      lastPlayedCards: [],
      lastPlayedBy: -1,
      landlordCards,
      callRound: 0,
      callScore: 0,
      winner: null,
    });
    
    setSelectedCards([]);
    setMessage('请叫地主（1分、2分、3分或不叫）');
    setPlayHistory(['游戏开始，开始叫地主']);
  }, []);

  // 叫地主
  const callLandlord = useCallback((playerId: number, score: number) => {
    setGameState(prev => {
      const newPlayers = [...prev.players];
      newPlayers[playerId].hasCalledLandlord = true;
      
      let newCallScore = prev.callScore;
      let newPhase: GamePhase = 'calling';
      let nextPlayer = (playerId + 1) % 3;
      let newCallRound = prev.callRound;
      
      if (score > prev.callScore) {
        newCallScore = score;
        // 重置其他玩家的地主状态
        newPlayers.forEach((p, i) => {
          if (i !== playerId) p.isLandlord = false;
        });
        newPlayers[playerId].isLandlord = true;
      }
      
      // 检查叫地主是否结束
      const allCalled = newPlayers.every(p => p.hasCalledLandlord);
      const hasLandlord = newPlayers.some(p => p.isLandlord);
      
      if (allCalled && hasLandlord) {
        // 叫地主结束，给地主发底牌
        const landlordId = newPlayers.findIndex(p => p.isLandlord);
        newPlayers[landlordId].cards = sortCards([...newPlayers[landlordId].cards, ...prev.landlordCards]);
        newPhase = 'playing';
        nextPlayer = landlordId;
        
        setMessage(`${newPlayers[landlordId].name} 成为地主，游戏开始！`);
        setPlayHistory(h => [...h, `${newPlayers[landlordId].name} 成为地主`]);
      } else if (allCalled && !hasLandlord) {
        // 都没叫，重新发牌
        setTimeout(() => startGame(), 1000);
        return prev;
      } else {
        setMessage(`${newPlayers[nextPlayer].name} 叫地主`);
      }
      
      return {
        ...prev,
        players: newPlayers,
        currentPlayer: nextPlayer,
        callScore: newCallScore,
        phase: newPhase,
        callRound: newCallRound,
      };
    });
  }, [startGame]);

  // AI叫地主
  const aiCallLandlord = useCallback((playerId: number) => {
    const player = gameStateRef.current.players[playerId];
    const hasGoodCards = player.cards.some(c => c.value >= 15) || 
                         player.cards.filter(c => c.value >= 13).length >= 3;
    
    if (hasGoodCards && gameStateRef.current.callScore < 3) {
      const score = Math.min(gameStateRef.current.callScore + 1, 3);
      callLandlord(playerId, score);
    } else {
      callLandlord(playerId, 0);
    }
  }, [callLandlord]);

  // 出牌
  const playCards = useCallback((playerId: number, cards: Card[]) => {
    const combo = analyzeCardCombo(cards);
    const lastCombo = gameStateRef.current.lastPlayedCards.length > 0 
      ? analyzeCardCombo(gameStateRef.current.lastPlayedCards)
      : null;
    
    if (!canPlayCards(cards, lastCombo)) {
      setMessage('无效的出牌！');
      return false;
    }
    
    setGameState(prev => {
      const newPlayers = [...prev.players];
      const player = newPlayers[playerId];
      
      // 从手牌中移除出的牌
      const cardIds = cards.map(c => c.id);
      player.cards = player.cards.filter(c => !cardIds.includes(c.id));
      
      const nextPlayer = (playerId + 1) % 3;
      
      // 检查是否获胜
      if (player.cards.length === 0) {
        setMessage(`${player.name} 获胜！`);
        setPlayHistory(h => [...h, `${player.name} 打出 ${getComboName(combo.type)} 并获胜！`]);
        
        return {
          ...prev,
          players: newPlayers,
          lastPlayedCards: cards,
          lastPlayedBy: playerId,
          currentPlayer: nextPlayer,
          phase: 'finished',
          winner: playerId,
        };
      }
      
      setMessage(`${newPlayers[nextPlayer].name} 的回合`);
      setPlayHistory(h => [...h, `${player.name} 打出 ${getComboName(combo.type)}`]);
      
      return {
        ...prev,
        players: newPlayers,
        lastPlayedCards: cards,
        lastPlayedBy: playerId,
        currentPlayer: nextPlayer,
      };
    });
    
    setSelectedCards([]);
    return true;
  }, []);

  // 不出牌
  const passTurn = useCallback((playerId: number) => {
    setGameState(prev => {
      const nextPlayer = (playerId + 1) % 3;
      
      // 如果一圈都过了，重置最后出牌
      let newLastPlayedCards = prev.lastPlayedCards;
      let newLastPlayedBy = prev.lastPlayedBy;
      
      if (nextPlayer === prev.lastPlayedBy) {
        newLastPlayedCards = [];
        newLastPlayedBy = -1;
        setMessage(`${prev.players[nextPlayer].name} 获得出牌权`);
      } else {
        setMessage(`${prev.players[nextPlayer].name} 的回合`);
      }
      
      setPlayHistory(h => [...h, `${prev.players[playerId].name} 不出`]);
      
      return {
        ...prev,
        currentPlayer: nextPlayer,
        lastPlayedCards: newLastPlayedCards,
        lastPlayedBy: newLastPlayedBy,
      };
    });
  }, []);

  // AI出牌
  const aiPlay = useCallback((playerId: number) => {
    const player = gameStateRef.current.players[playerId];
    const lastCombo = gameStateRef.current.lastPlayedCards.length > 0
      ? analyzeCardCombo(gameStateRef.current.lastPlayedCards)
      : null;
    
    // 如果上家是自己或者没有上家，必须出牌
    const mustPlay = gameStateRef.current.lastPlayedBy === playerId || 
                     gameStateRef.current.lastPlayedBy === -1;
    
    const recommended = getRecommendedPlay(player.cards, lastCombo);
    
    if (recommended) {
      playCards(playerId, recommended);
    } else if (!mustPlay) {
      passTurn(playerId);
    } else {
      // 必须出但出不了，出最小的单张
      playCards(playerId, [player.cards[player.cards.length - 1]]);
    }
  }, [playCards, passTurn]);

  // 选择/取消选择卡牌
  const toggleCardSelection = useCallback((card: Card) => {
    setSelectedCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) {
        return prev.filter(c => c.id !== card.id);
      }
      return [...prev, card];
    });
  }, []);

  // 清除选择
  const clearSelection = useCallback(() => {
    setSelectedCards([]);
  }, []);

  return {
    gameState,
    selectedCards,
    message,
    playHistory,
    startGame,
    callLandlord,
    aiCallLandlord,
    playCards,
    passTurn,
    aiPlay,
    toggleCardSelection,
    clearSelection,
  };
}

function getComboName(type: string): string {
  const names: Record<string, string> = {
    'single': '单张',
    'pair': '对子',
    'triple': '三张',
    'triple_single': '三带一',
    'triple_pair': '三带二',
    'straight': '顺子',
    'double_straight': '连对',
    'triple_straight': '飞机',
    'bomb': '炸弹',
    'rocket': '王炸',
  };
  return names[type] || type;
}
