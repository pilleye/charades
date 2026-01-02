'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from './ui/Button';
import { CogIcon, BackIcon, DragHandleIcon, TrashIcon, LockIcon } from './ui/Icons';
import { SegmentedControl } from './ui/SegmentedControl';
import { TeamColorButton } from './ui/TeamBadge';
import { NumberControl, InfiniteToggleControl } from './ui/Controls';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { SafeScreen } from './ui/SafeArea';
import { TEAM_COLORS } from '@/constants';
import { DEFAULT_DECKS, FREE_TIER_CARD_LIMIT } from '@/data/decks';
import { useSubscriptionStore, useIsPremium } from '@/store/subscriptionStore';
import { Paywall } from './Paywall';

export const Setup: React.FC = () => {
  const {
    teams,
    setTeams,
    roundDuration,
    skipsPerTurn,
    totalRounds,
    secondChanceEnabled,
    secondChanceValue,
    startGame,
    setSettings,
    pointsPerWord,
    selectedDeck,
    setDeckConfig,
    customWords,
    addCustomWord,
    removeCustomWord,
    hintsEnabled,
  } = useGameStore();

  const [view, setView] = useState<'LOBBY' | 'SETTINGS'>('LOBBY');

  const [localTeams, setLocalTeams] = useState(teams);
  const [localDuration, setLocalDuration] = useState(roundDuration);

  // Logic for Skips/Rounds with Infinite toggle
  const [localSkips, setLocalSkips] = useState<number | 'Infinite'>(
    skipsPerTurn
  );
  const [lastSkipsValue, setLastSkipsValue] = useState<number>(
    typeof skipsPerTurn === 'number' ? skipsPerTurn : 3
  );

  const [localRounds, setLocalRounds] = useState<number | 'Infinite'>(
    totalRounds
  );
  const [lastRoundsValue, setLastRoundsValue] = useState<number>(
    typeof totalRounds === 'number' ? totalRounds : 3
  );

  // Split Second Chance State
  const [isSecondChanceEnabled, setIsSecondChanceEnabled] =
    useState(secondChanceEnabled);
  const [secondChancePoints, setSecondChancePoints] =
    useState(secondChanceValue);

  // Hints State
  const [isHintsEnabled, setIsHintsEnabled] = useState(hintsEnabled);

  // Deck State
  const [localDeck, setLocalDeck] = useState(selectedDeck);
  const [newWordInput, setNewWordInput] = useState('');

  // Subscription state
  const initializeSubscription = useSubscriptionStore((s) => s.initialize);
  const isPremium = useIsPremium();
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<'custom_words' | 'full_deck'>('full_deck');

  // Initialize subscription on mount
  React.useEffect(() => {
    initializeSubscription();
  }, [initializeSubscription]);

  const [teamCount, setTeamCount] = useState(teams.length);
  const [colorPickerTeamId, setColorPickerTeamId] = useState<number | null>(
    null
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [touchState, setTouchState] = useState<{
    index: number | null;
    startY: number;
    currentY: number;
    elementRect?: DOMRect;
  }>({ index: null, startY: 0, currentY: 0 });
  const [previewOrder, setPreviewOrder] = useState<number[]>([]);

  // Sync localTeams array with teamCount using ref to track previous count
  const prevTeamCountRef = React.useRef(teamCount);
  
  React.useLayoutEffect(() => {
    if (prevTeamCountRef.current !== teamCount) {
      if (teamCount > localTeams.length) {
        // Add teams
        setLocalTeams(currentTeams => {
          const newTeams = [...currentTeams];
          const usedColors = new Set(currentTeams.map((t) => t.colorIndex));

          for (let i = currentTeams.length; i < teamCount; i++) {
            // Find next available color index
            let nextColorIndex = i;
            while (
              usedColors.has(nextColorIndex % TEAM_COLORS.length) &&
              usedColors.size < TEAM_COLORS.length
            ) {
              nextColorIndex++;
            }

            newTeams.push({
              id: Date.now() + i,
              name: `Team ${i + 1}`,
              score: 0,
              colorIndex: nextColorIndex % TEAM_COLORS.length,
            });
            usedColors.add(nextColorIndex % TEAM_COLORS.length);
          }
          return newTeams;
        });
      } else if (teamCount < localTeams.length) {
        // Remove teams (slice)
        setLocalTeams(currentTeams => currentTeams.slice(0, teamCount));
      }
      prevTeamCountRef.current = teamCount;
    }
  }, [teamCount, localTeams.length]);

  const updateTeamName = (index: number, name: string) => {
    const newTeams = [...localTeams];
    newTeams[index].name = name;
    setLocalTeams(newTeams);
  };

  const updateTeamColor = (index: number, colorIdx: number) => {
    const newTeams = [...localTeams];
    newTeams[index].colorIndex = colorIdx;
    setLocalTeams(newTeams);
    setColorPickerTeamId(null);
  };

  const handleStart = () => {
    setTeams(localTeams);
    setSettings(
      localDuration,
      localSkips,
      pointsPerWord,
      localRounds,
      isSecondChanceEnabled,
      secondChancePoints,
      isHintsEnabled
    );
    setDeckConfig(localDeck, customWords);
    startGame();
  };

  // Toggle handlers for infinite
  const toggleInfiniteSkips = () => {
    if (localSkips === 'Infinite') {
      setLocalSkips(lastSkipsValue);
    } else {
      setLastSkipsValue(localSkips);
      setLocalSkips('Infinite');
    }
  };

  const toggleInfiniteRounds = () => {
    if (localRounds === 'Infinite') {
      setLocalRounds(lastRoundsValue);
    } else {
      setLastRoundsValue(localRounds);
      setLocalRounds('Infinite');
    }
  };

  const adjustSkips = (delta: number) => {
    if (localSkips === 'Infinite') {
      const newValue = Math.max(0, Math.min(10, lastSkipsValue + delta));
      setLocalSkips(newValue);
      setLastSkipsValue(newValue);
    } else {
      const newValue = Math.max(0, Math.min(10, localSkips + delta));
      setLocalSkips(newValue);
      setLastSkipsValue(newValue);
    }
  };

  const adjustRounds = (delta: number) => {
    if (localRounds === 'Infinite') {
      const newValue = Math.max(1, Math.min(20, lastRoundsValue + delta));
      setLocalRounds(newValue);
      setLastRoundsValue(newValue);
    } else {
      const newValue = Math.max(1, Math.min(20, localRounds + delta));
      setLocalRounds(newValue);
      setLastRoundsValue(newValue);
    }
  };

  const handleAddWord = () => {
    // Check if premium is required for custom words
    if (!isPremium) {
      setPaywallTrigger('custom_words');
      setPaywallOpen(true);
      return;
    }
    if (newWordInput.trim()) {
      addCustomWord(newWordInput);
      setNewWordInput('');
    }
  };

  // Drag Handlers (Desktop)
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggingIndex === null || draggingIndex === index) return;

    reorderTeams(draggingIndex, index);
    setDraggingIndex(index);
  };

  const onDragEnd = () => {
    setDraggingIndex(null);
  };

  // Touch Handlers (Mobile)
  const onTouchStart = (e: React.TouchEvent, index: number) => {
    // Only start dragging from drag handle area
    const target = e.target as HTMLElement;
    if (!target.closest('.drag-handle')) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const element = target.closest('[data-team-item]') as HTMLElement;
    const rect = element?.getBoundingClientRect();

    setTouchState({
      index,
      startY: touch.clientY,
      currentY: touch.clientY,
      elementRect: rect,
    });
    setDraggingIndex(index);
    setPreviewOrder([...Array(localTeams.length).keys()]); // Initialize with current order
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchState.index === null) return;

    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchState.startY;
    const itemHeight = 60;

    // Calculate which position the dragged item should be in
    const positionShift = Math.round(deltaY / itemHeight);
    const newPosition = Math.max(
      0,
      Math.min(localTeams.length - 1, touchState.index + positionShift)
    );

    // Create preview order for visual feedback
    const preview = [...Array(localTeams.length).keys()];
    if (newPosition !== touchState.index) {
      // Remove dragged item from its original position
      preview.splice(touchState.index, 1);
      // Insert it at the new position
      preview.splice(newPosition, 0, touchState.index);
    }
    setPreviewOrder(preview);

    setTouchState((prev) => ({
      ...prev,
      currentY: touch.clientY,
    }));
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchState.index === null) return;

    e.preventDefault();
    e.stopPropagation();

    const deltaY = touchState.currentY - touchState.startY;
    const itemHeight = 60; // Approximate height of each team item
    const moveThreshold = itemHeight * 0.5; // 50% of item height to trigger move

    if (Math.abs(deltaY) > moveThreshold) {
      const direction = deltaY > 0 ? 1 : -1;
      const newIndex = Math.max(
        0,
        Math.min(localTeams.length - 1, touchState.index + direction)
      );
      if (newIndex !== touchState.index) {
        reorderTeams(touchState.index, newIndex);
      }
    }

    setTouchState({ index: null, startY: 0, currentY: 0 });
    setDraggingIndex(null);
    setPreviewOrder([]);
  };

  // Common reorder function
  const reorderTeams = (fromIndex: number, toIndex: number) => {
    const newTeams = [...localTeams];
    const draggedItem = newTeams[fromIndex];
    newTeams.splice(fromIndex, 1);
    newTeams.splice(toIndex, 0, draggedItem);
    setLocalTeams(newTeams);
  };

  // Calculate transform for each item during drag preview
  const getItemTransform = (currentIndex: number) => {
    if (touchState.index === null || previewOrder.length === 0) {
      return touchState.index === currentIndex
        ? `translateY(${touchState.currentY - touchState.startY}px)`
        : undefined;
    }

    if (touchState.index === currentIndex) {
      // Dragged item follows finger
      return `translateY(${touchState.currentY - touchState.startY}px)`;
    }

    // Calculate where this item should be in the preview order
    const previewIndex = previewOrder.indexOf(currentIndex);
    const originalIndex = currentIndex;
    const offset = (previewIndex - originalIndex) * 60; // 60px per item height

    return offset !== 0 ? `translateY(${offset}px)` : undefined;
  };

  if (view === 'SETTINGS') {
    return (
      <SafeScreen className="animate-fade-in-right mx-auto flex h-full w-full flex-col overflow-hidden bg-slate-50 py-6">
        <header className="flex shrink-0 items-center justify-between py-4">
          <button
            onClick={() => {
              setDeckConfig(localDeck, customWords);
              setView('LOBBY');
            }}
            className="-ml-2 p-2 text-slate-400 transition-transform hover:text-slate-600 active:scale-95"
          >
            <BackIcon />
          </button>
          <h2 className="text-2xl font-black tracking-wide text-slate-800 uppercase">
            GAME RULES
          </h2>
          <div className="w-8"></div> {/* Spacer for centering */}
        </header>

        <div className="mask-fade-bottom flex-1 space-y-6 overflow-y-auto pb-4">
          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <NumberControl
              label="Round Timer"
              value={localDuration}
              onDecrease={() => setLocalDuration(Math.max(10, localDuration - 10))}
              onIncrease={() => setLocalDuration(localDuration + 10)}
              unit="SECONDS"
            />

            <InfiniteToggleControl
              label="Skips Allowed"
              value={localSkips}
              onDecrease={() => adjustSkips(-1)}
              onIncrease={() => adjustSkips(1)}
              onToggleInfinite={toggleInfiniteSkips}
              unit="PER TURN"
              color="yellow"
              lastFiniteValue={lastSkipsValue}
            />

            <InfiniteToggleControl
              label="Total Rounds"
              value={localRounds}
              onDecrease={() => adjustRounds(-1)}
              onIncrease={() => adjustRounds(1)}
              onToggleInfinite={toggleInfiniteRounds}
              unit="ROUNDS"
              color="indigo"
              lastFiniteValue={lastRoundsValue}
            />

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
              <label className="text-sm font-bold text-slate-400 uppercase">
                Second Chance Round
              </label>
              <SegmentedControl
                options={[
                  { label: 'Disabled', value: false },
                  { label: 'Enabled', value: true },
                ]}
                value={isSecondChanceEnabled}
                onChange={setIsSecondChanceEnabled}
              />
            </div>

            {isSecondChanceEnabled && (
              <div className="animate-fade-in flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-400 uppercase">
                  Recovery Score
                </label>
                <SegmentedControl
                  options={[
                    { label: '0 Pts', value: 0 },
                    { label: '½ Pts', value: 0.5 },
                    { label: '1 Pt', value: 1 },
                  ]}
                  value={secondChancePoints}
                  onChange={setSecondChancePoints}
                />
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
              <label className="text-sm font-bold text-slate-400 uppercase">
                Show Hints
              </label>
              <SegmentedControl
                options={[
                  { label: 'Disabled', value: false },
                  { label: 'Enabled', value: true },
                ]}
                value={isHintsEnabled}
                onChange={setIsHintsEnabled}
              />
            </div>
          </section>

          {/* CONTENT SECTION */}
          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-400 uppercase">
                  Card Deck
                </label>
                <Badge variant={isPremium ? 'info' : 'warning'} size="sm">
                  {isPremium
                    ? `${DEFAULT_DECKS[localDeck]?.length || 0} Words`
                    : localDeck === 'Default'
                      ? `${FREE_TIER_CARD_LIMIT} / ${DEFAULT_DECKS[localDeck]?.length || 0} Words`
                      : 'Locked'}
                </Badge>
              </div>

              {!isPremium && (
                <button
                  onClick={() => {
                    setPaywallTrigger('full_deck');
                    setPaywallOpen(true);
                  }}
                  className="flex items-center justify-between rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-3 transition-all hover:from-yellow-100 hover:to-orange-100 active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-orange-500">&#9733;</span>
                    <span className="text-sm font-bold text-slate-700">
                      Unlock all {DEFAULT_DECKS[localDeck]?.length || 0} words
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-500 uppercase">
                    Premium
                  </span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {Object.keys(DEFAULT_DECKS).map((deckName) => {
                  const isLocked = !isPremium && deckName !== 'Default';
                  const count = DEFAULT_DECKS[deckName]?.length || 0;
                  return (
                    <button
                      key={deckName}
                      onClick={() => {
                        if (isLocked) {
                          setPaywallTrigger('full_deck');
                          setPaywallOpen(true);
                        } else {
                          setLocalDeck(deckName);
                        }
                      }}
                      className={`relative h-16 rounded-2xl text-sm font-black tracking-wide uppercase transition-all active:scale-95 ${
                        localDeck === deckName
                          ? 'bg-blue-500 text-white shadow-md'
                          : isLocked
                            ? 'bg-slate-100 text-slate-400 opacity-80'
                            : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      } `}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2">
                          {deckName}
                          {isLocked && <LockIcon className="h-4 w-4" />}
                        </div>
                        <span className={`text-xs font-bold ${localDeck === deckName ? 'text-blue-200' : 'text-slate-400'}`}>
                          {count} Cards
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-400 uppercase">
                  Add Words
                  {!isPremium && (
                    <span className="ml-2 text-xs text-orange-500">&#9733; Premium</span>
                  )}
                </label>
                <span className="text-xs font-bold text-slate-400">
                  {customWords.length} Added
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWordInput}
                  onChange={(e) => setNewWordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
                  placeholder={isPremium ? "Enter word..." : "Premium feature..."}
                  disabled={!isPremium}
                  className={`h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-100 px-4 text-lg font-bold text-slate-800 placeholder-slate-400 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <Button
                  variant="secondary"
                  onClick={handleAddWord}
                  className="!h-12 shrink-0 !px-5"
                >
                  {isPremium ? 'ADD' : '\u2605'}
                </Button>
              </div>

              {customWords.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {customWords.map((word, i) => (
                    <button
                      key={i}
                      onClick={() => removeCustomWord(word)}
                      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pr-2 pl-4 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                    >
                      <span>{word}</span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition-colors group-hover:bg-red-100 group-hover:text-red-500">
                        <TrashIcon />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="shrink-0 pt-2 pb-4">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            onClick={() => {
              setDeckConfig(localDeck, customWords);
              setView('LOBBY');
            }}
          >
            DONE
          </Button>
        </div>

        <Paywall
          isOpen={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          trigger={paywallTrigger}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen className="animate-fade-in relative mx-auto flex h-full w-full flex-col overflow-hidden bg-slate-50 py-6">
      {/* Header */}
      <header className="relative shrink-0 py-8 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-blue-600 drop-shadow-sm">
          CHARADES
        </h1>
      </header>

      {/* Scrollable Content */}
      <div className="mask-fade-bottom flex-1 space-y-6 overflow-y-auto pb-4">
        {/* Teams Section */}
        <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <NumberControl
            label="Number of Teams"
            value={teamCount}
            onDecrease={() => setTeamCount(Math.max(2, teamCount - 1))}
            onIncrease={() => setTeamCount(Math.min(5, teamCount + 1))}
          />

          {/* Team Input List */}
          <div className="space-y-3 pt-2">
            {localTeams.map((team, idx) => {
              const isColorPickerOpen = colorPickerTeamId === team.id;

              return (
                <div key={team.id} className="flex flex-col gap-2">
                  <div
                    className={`animate-fade-in flex items-center gap-2 ${draggingIndex === idx ? 'z-20 opacity-70 shadow-lg' : ''} ${touchState.index === idx ? '' : 'transition-transform duration-200'}`}
                    data-team-item
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDragEnd={onDragEnd}
                    onTouchStart={(e) => onTouchStart(e, idx)}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                    style={{
                      transform: getItemTransform(idx),
                      pointerEvents: touchState.index === idx ? 'none' : 'auto',
                      transition:
                        touchState.index === idx
                          ? 'none'
                          : 'transform 200ms ease-out',
                    }}
                  >
                    <TeamColorButton
                      colorIndex={team.colorIndex}
                      onClick={() => setColorPickerTeamId(isColorPickerOpen ? null : team.id)}
                    />

                    <input
                      type="text"
                      value={team.name}
                      onChange={(e) => updateTeamName(idx, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="h-10 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-100 px-3 text-base font-bold text-slate-800 placeholder-slate-400 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 sm:h-12 sm:px-4 sm:text-lg"
                      placeholder="Team Name"
                    />

                    {/* Drag Handle - Responsive */}
                    <div className="drag-handle cursor-grab touch-manipulation p-1 select-none active:cursor-grabbing sm:p-2">
                      <DragHandleIcon />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <div className="z-10 flex shrink-0 flex-col space-y-3 pt-4">
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setView('SETTINGS')}
          className="gap-2"
          icon={<CogIcon />}
        >
          GAME RULES & DECKS
        </Button>

        <Button
          variant="success"
          size="xl"
          fullWidth
          onClick={handleStart}
          className="border-green-700 text-2xl shadow-green-700"
        >
          PLAY GAME
        </Button>
      </div>

      <Modal
        isOpen={colorPickerTeamId !== null}
        onClose={() => setColorPickerTeamId(null)}
      >
            <div className="mb-6 text-center">
              <h3 className="text-xl font-black tracking-wide text-slate-800 uppercase">
                Select Color
              </h3>
              <p className="text-sm font-bold text-slate-400">
                {localTeams.find((t) => t.id === colorPickerTeamId)?.name}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {TEAM_COLORS.map((colorClass, cIdx) => {
                // Check if taken by other teams
                const isTaken = localTeams.some(
                  (t) => t.id !== colorPickerTeamId && t.colorIndex === cIdx
                );
                const isSelected =
                  localTeams.find((t) => t.id === colorPickerTeamId)
                    ?.colorIndex === cIdx;

                return (
                  <button
                    key={cIdx}
                    disabled={isTaken}
                    onClick={() => {
                      const idx = localTeams.findIndex(
                        (t) => t.id === colorPickerTeamId
                      );
                      if (idx !== -1) updateTeamColor(idx, cIdx);
                    }}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl shadow-sm transition-all ${colorClass} ${isSelected ? 'z-10 scale-110 ring-4 ring-slate-300 ring-offset-2' : ''} ${isTaken ? 'cursor-not-allowed opacity-30 shadow-none saturate-50' : 'hover:scale-110 active:scale-95'} `}
                  >
                    {isSelected && (
                      <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setColorPickerTeamId(null)}
              className="mt-6 w-full rounded-2xl bg-slate-100 py-4 font-black tracking-wide text-slate-500 uppercase hover:bg-slate-200"
            >
              Cancel
            </button>
      </Modal>
    </SafeScreen>
  );
};
