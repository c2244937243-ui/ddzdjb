import { useEffect, useCallback } from 'react';
import { PlayerArea } from './PlayerArea';
import { GameControls } from './GameControls';
import { Card } from './Card';
import { useGame } from '@/hooks/useGame';
import { Trophy, Scroll } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function GameBoard() {
  const {
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
  } = useGame();

  const { phase, players, currentPlayer, lastPlayedCards, lastPlayedBy, landlordCards, winner } = gameState;
  const isHumanTurn = currentPlayer === 0 && (phase === 'calling' || phase === 'playing');

  // AI行动
  useEffect(() => {
    if (phase === 'calling' && players[currentPlayer].type === 'ai') {
      const timer = setTimeout(() => {
        aiCallLandlord(currentPlayer);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (phase === 'playing' && players[currentPlayer].type === 'ai') {
      const timer = setTimeout(() => {
        aiPlay(currentPlayer);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentPlayer, players, aiCallLandlord, aiPlay]);

  const handlePlay = useCallback(() => {
    if (selectedCards.length > 0) {
      playCards(0, selectedCards);
    }
  }, [selectedCards, playCards]);

  const handlePass = useCallback(() => {
    passTurn(0);
    clearSelection();
  }, [passTurn, clearSelection]);

  const handleCallLandlord = useCallback((score: number) => {
    callLandlord(0, score);
  }, [callLandlord]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 p-4">
      <div className="max-w-6xl mx-auto h-screen flex flex-col">
        {/* 标题 */}
        <header className="text-center py-4">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            🎴 斗地主
          </h1>
          <p className="text-green-200 mt-1">{message}</p>
        </header>

        {/* 游戏区域 */}
        <div className="flex-1 flex flex-col relative">
          {/* 顶部 - AI玩家1 */}
          <div className="flex justify-center">
            <PlayerArea
              player={players[1]}
              position="left"
              isCurrentTurn={currentPlayer === 1}
              lastPlayedCards={lastPlayedBy === 1 ? lastPlayedCards : []}
            />
          </div>

          {/* 中间区域 */}
          <div className="flex-1 flex items-center justify-between px-8">
            {/* 左侧 - AI玩家2 */}
            <PlayerArea
              player={players[2]}
              position="right"
              isCurrentTurn={currentPlayer === 2}
              lastPlayedCards={lastPlayedBy === 2 ? lastPlayedCards : []}
            />

            {/* 中央区域 - 底牌和出牌区 */}
            <div className="flex flex-col items-center gap-6">
              {/* 底牌 */}
              {phase !== 'waiting' && landlordCards.length > 0 && (
                <div className="bg-black/30 rounded-xl p-4">
                  <p className="text-white text-sm mb-2 text-center">底牌</p>
                  <div className="flex gap-2">
                    {landlordCards.map((card, index) => (
                      <Card 
                        key={index} 
                        card={card} 
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 最后出牌 */}
              {lastPlayedCards.length > 0 && lastPlayedBy !== -1 && (
                <div className="bg-white/10 rounded-xl p-4">
                  <p className="text-white text-sm mb-2 text-center">
                    {players[lastPlayedBy].name} 出牌
                  </p>
                  <div className="flex gap-1">
                    {lastPlayedCards.map((card) => (
                      <Card 
                        key={card.id} 
                        card={card} 
                        size="md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 游戏控制 */}
              <GameControls
                phase={phase}
                isHumanTurn={isHumanTurn}
                selectedCards={selectedCards}
                onPlay={handlePlay}
                onPass={handlePass}
                onStart={startGame}
                onCallLandlord={handleCallLandlord}
                lastPlayedBy={lastPlayedBy}
                currentPlayer={currentPlayer}
              />
            </div>

            {/* 右侧 - 游戏记录 */}
            <div className="w-48 bg-black/30 rounded-xl p-3">
              <div className="flex items-center gap-2 text-white mb-2">
                <Scroll className="w-4 h-4" />
                <span className="text-sm font-medium">游戏记录</span>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-1">
                  {playHistory.map((record, index) => (
                    <p key={index} className="text-xs text-green-200">
                      {record}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* 底部 - 人类玩家 */}
          <div className="flex justify-center pb-4">
            <PlayerArea
              player={players[0]}
              position="bottom"
              isCurrentTurn={currentPlayer === 0}
              selectedCards={selectedCards}
              onCardClick={toggleCardSelection}
              lastPlayedCards={lastPlayedBy === 0 ? lastPlayedCards : []}
            />
          </div>
        </div>

        {/* 获胜弹窗 */}
        {phase === 'finished' && winner !== null && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {players[winner].name} 获胜！
              </h2>
              <p className="text-gray-600 mb-6">
                {players[winner].isLandlord ? '地主' : '农民'} 赢得了比赛
              </p>
              <button
                onClick={startGame}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                再来一局
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
