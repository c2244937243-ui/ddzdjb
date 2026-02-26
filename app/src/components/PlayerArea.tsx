import type { Player, Card as CardType } from '@/types/game';
import { Card, CardBack } from './Card';
import { cn } from '@/lib/utils';
import { Crown, User, Bot } from 'lucide-react';

interface PlayerAreaProps {
  player: Player;
  position: 'bottom' | 'left' | 'right';
  isCurrentTurn: boolean;
  selectedCards?: CardType[];
  onCardClick?: (card: CardType) => void;
  lastPlayedCards?: CardType[];
}

export function PlayerArea({ 
  player, 
  position, 
  isCurrentTurn,
  selectedCards = [],
  onCardClick,
  lastPlayedCards = []
}: PlayerAreaProps) {
  const isHuman = player.type === 'human';
  
  const positionClasses = {
    bottom: 'flex-col items-center',
    left: 'flex-row items-center',
    right: 'flex-row-reverse items-center',
  };

  const cardContainerClasses = {
    bottom: 'flex flex-wrap justify-center gap-1 max-w-2xl',
    left: 'flex flex-col gap-1',
    right: 'flex flex-col gap-1',
  };

  return (
    <div className={cn(
      'flex gap-3 p-4 rounded-xl transition-all duration-300',
      positionClasses[position],
      isCurrentTurn && 'bg-yellow-100/50 ring-2 ring-yellow-400',
      !isCurrentTurn && 'bg-white/30'
    )}>
      {/* 玩家信息 */}
      <div className="flex flex-col items-center gap-1">
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center relative',
          player.isLandlord ? 'bg-yellow-500' : 'bg-gray-200',
          isCurrentTurn && 'ring-4 ring-yellow-400 animate-pulse'
        )}>
          {player.isLandlord && (
            <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-600" />
          )}
          {isHuman ? (
            <User className="w-6 h-6 text-gray-700" />
          ) : (
            <Bot className="w-6 h-6 text-gray-700" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-800">{player.name}</span>
        <span className="text-xs text-gray-600">{player.cards.length}张</span>
      </div>

      {/* 手牌区域 */}
      <div className={cardContainerClasses[position]}>
        {isHuman ? (
          // 人类玩家显示真实卡牌
          player.cards.map((card, index) => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            return (
              <div 
                key={card.id}
                style={{ 
                  marginLeft: position === 'bottom' && index > 0 ? '-20px' : undefined,
                  zIndex: isSelected ? 10 : index
                }}
              >
                <Card
                  card={card}
                  selected={isSelected}
                  onClick={() => onCardClick?.(card)}
                  size={position === 'bottom' ? 'md' : 'sm'}
                />
              </div>
            );
          })
        ) : (
          // AI玩家显示卡牌背面
          player.cards.map((_, idx) => (
            <div 
              key={idx}
              style={{ 
                marginTop: position !== 'bottom' && idx > 0 ? '-15px' : undefined,
                zIndex: idx
              }}
            >
              <CardBack size={position === 'bottom' ? 'md' : 'sm'} />
            </div>
          ))
        )}
      </div>

      {/* 最后出的牌 */}
      {lastPlayedCards.length > 0 && (
        <div className="flex gap-1 mt-2">
          {lastPlayedCards.map((card) => (
            <Card 
              key={card.id} 
              card={card} 
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}
