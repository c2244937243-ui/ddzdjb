import type { Card as CardType } from '@/types/game';
import { getCardColor, getCardBg } from '@/utils/cardUtils';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardType;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  hidden?: boolean;
}

export function Card({ 
  card, 
  selected = false, 
  disabled = false, 
  onClick,
  size = 'md',
  hidden = false
}: CardProps) {
  const sizeClasses = {
    sm: 'w-8 h-12 text-xs',
    md: 'w-14 h-20 text-base',
    lg: 'w-20 h-28 text-xl',
  };

  if (hidden) {
    return (
      <div 
        className={cn(
          sizeClasses[size],
          'rounded-lg border-2 border-blue-800 bg-gradient-to-br from-blue-600 to-blue-800',
          'flex items-center justify-center shadow-md',
          'select-none'
        )}
      >
        <div className="w-3/4 h-3/4 border border-blue-400 rounded opacity-30" />
      </div>
    );
  }

  const isJoker = card.suit === 'joker';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses[size],
        'rounded-lg border-2 transition-all duration-150 shadow-md',
        'flex flex-col items-center justify-center relative',
        getCardBg(card.suit),
        selected 
          ? 'border-yellow-400 -translate-y-3 shadow-lg ring-2 ring-yellow-200' 
          : 'border-gray-300 hover:border-gray-400 hover:-translate-y-1',
        disabled && 'opacity-50 cursor-not-allowed hover:translate-y-0',
        'select-none'
      )}
    >
      {/* 左上角 */}
      <span className={cn(
        'absolute top-0.5 left-1 font-bold leading-none',
        getCardColor(card.suit),
        size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-lg'
      )}>
        {card.rank}
      </span>
      
      {/* 中间花色/图案 */}
      <span className={cn(
        'font-bold',
        getCardColor(card.suit),
        size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-4xl'
      )}>
        {isJoker ? (card.rank === '大王' ? '👑' : '🃏') : card.suit}
      </span>
      
      {/* 右下角（倒置） */}
      <span className={cn(
        'absolute bottom-0.5 right-1 font-bold leading-none rotate-180',
        getCardColor(card.suit),
        size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-sm' : 'text-lg'
      )}>
        {card.rank}
      </span>
    </button>
  );
}

// 卡牌背面
export function CardBack({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-12',
    md: 'w-14 h-20',
    lg: 'w-20 h-28',
  };

  return (
    <div 
      className={cn(
        sizeClasses[size],
        'rounded-lg border-2 border-blue-800 bg-gradient-to-br from-blue-600 to-blue-800',
        'flex items-center justify-center shadow-md'
      )}
    >
      <div className="w-3/4 h-3/4 border border-blue-400 rounded opacity-30" />
    </div>
  );
}
