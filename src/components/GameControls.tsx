import type { Card as CardType, GamePhase } from '@/types/game';
import { analyzeCardCombo } from '@/utils/cardUtils';
import { Play, SkipForward, RefreshCw, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  phase: GamePhase;
  isHumanTurn: boolean;
  selectedCards: CardType[];
  onPlay: () => void;
  onPass: () => void;
  onStart: () => void;
  onCallLandlord: (score: number) => void;
  lastPlayedBy: number;
  currentPlayer: number;
}

export function GameControls({
  phase,
  isHumanTurn,
  selectedCards,
  onPlay,
  onPass,
  onStart,
  onCallLandlord,
  lastPlayedBy,
  currentPlayer,
}: GameControlsProps) {
  // 等待开始
  if (phase === 'waiting') {
    return (
      <div className="flex justify-center">
        <Button 
          onClick={onStart}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-xl"
        >
          <RefreshCw className="mr-2 w-5 h-5" />
          开始游戏
        </Button>
      </div>
    );
  }

  // 叫地主阶段
  if (phase === 'calling' && isHumanTurn) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-lg font-medium text-gray-700">是否叫地主？</p>
        <div className="flex gap-3">
          <Button 
            onClick={() => onCallLandlord(1)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Coins className="mr-1 w-4 h-4" />
            1分
          </Button>
          <Button 
            onClick={() => onCallLandlord(2)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Coins className="mr-1 w-4 h-4" />
            2分
          </Button>
          <Button 
            onClick={() => onCallLandlord(3)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-50"
          >
            <Coins className="mr-1 w-4 h-4" />
            3分
          </Button>
          <Button 
            onClick={() => onCallLandlord(0)}
            variant="outline"
            className="border-gray-400 text-gray-600 hover:bg-gray-50"
          >
            不叫
          </Button>
        </div>
      </div>
    );
  }

  // 游戏进行中
  if (phase === 'playing' && isHumanTurn) {
    const combo = analyzeCardCombo(selectedCards);
    const isValid = combo.type !== 'invalid';
    
    // 检查是否必须出牌
    const mustPlay = lastPlayedBy === currentPlayer || lastPlayedBy === -1;

    return (
      <div className="flex flex-col items-center gap-3">
        {selectedCards.length > 0 && (
          <p className="text-sm text-gray-600">
            已选择 {selectedCards.length} 张牌
            {isValid && <span className="text-green-600 ml-2">{getComboName(combo.type)}</span>}
            {!isValid && <span className="text-red-500 ml-2">无效牌型</span>}
          </p>
        )}
        <div className="flex gap-3">
          <Button
            onClick={onPlay}
            disabled={!isValid || selectedCards.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            <Play className="mr-1 w-4 h-4" />
            出牌
          </Button>
          {!mustPlay && (
            <Button
              onClick={onPass}
              variant="outline"
              className="border-gray-400 text-gray-600 hover:bg-gray-50"
            >
              <SkipForward className="mr-1 w-4 h-4" />
              不出
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 游戏结束
  if (phase === 'finished') {
    return (
      <div className="flex justify-center">
        <Button 
          onClick={onStart}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-xl"
        >
          <RefreshCw className="mr-2 w-5 h-5" />
          再来一局
        </Button>
      </div>
    );
  }

  return null;
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
