'use client';

import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from './ui/Button';
import { TEAM_COLORS } from '@/constants';
import { DEFAULT_DECKS } from '@/data/decks';

// Icons
const CogIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.217.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

const DragHandleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="h-5 w-5 text-slate-300"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 9h16.5m-16.5 6.75h16.5"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className="h-5 w-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

// Reusable Segmented Control Component
const SegmentedControl = <T,>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (val: T) => void;
}) => {
  const activeIndex = options.findIndex((o) => o.value === value);
  const widthPercent = 100 / options.length;

  return (
    <div className="relative flex h-14 items-center rounded-2xl border border-slate-100 bg-slate-100 p-1">
      <div
        className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          width: `calc(${widthPercent}% - 0.5rem)`,
          left: `calc(${activeIndex * widthPercent}% + 0.25rem)`,
        }}
      />
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 flex-1 text-sm font-black tracking-wide uppercase transition-colors ${value === opt.value ? 'text-blue-600' : 'text-slate-400'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

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
      <div className="animate-fade-in-right mx-auto flex h-full w-full flex-col overflow-hidden bg-slate-50 p-6">
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
            {/* Duration Control */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 uppercase">
                Round Timer
              </label>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setLocalDuration(Math.max(10, localDuration - 10))
                  }
                  className="!h-12 !w-16 !px-0 text-xl"
                >
                  -
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-black text-slate-800">
                    {localDuration}
                  </span>
                  <span className="block text-xs font-bold text-slate-500">
                    SECONDS
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setLocalDuration(localDuration + 10)}
                  className="!h-12 !w-16 !px-0 text-xl"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Skips Control */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 uppercase">
                Skips Allowed
              </label>
              <div className="flex gap-2">
                <div
                  className={`flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-opacity duration-200 ${localSkips === 'Infinite' ? 'opacity-40 grayscale' : ''}`}
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="!h-12 !w-14 !px-0 text-xl"
                    onClick={() => adjustSkips(-1)}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-yellow-500">
                      {localSkips === 'Infinite' ? lastSkipsValue : localSkips}
                    </span>
                    <span className="mt-1 block text-xs leading-none font-bold text-slate-500">
                      PER TURN
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    className="!h-12 !w-14 !px-0 text-xl"
                    onClick={() => adjustSkips(1)}
                  >
                    +
                  </Button>
                </div>

                <button
                  onClick={toggleInfiniteSkips}
                  className={`flex w-16 items-center justify-center rounded-2xl border text-xl font-bold transition-all active:scale-95 ${localSkips === 'Infinite' ? 'border-yellow-200 bg-yellow-100 text-yellow-600 shadow-inner' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'} `}
                >
                  ∞
                </button>
              </div>
            </div>

            {/* Rounds Control */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 uppercase">
                Total Rounds
              </label>
              <div className="flex gap-2">
                <div
                  className={`flex flex-1 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-opacity duration-200 ${localRounds === 'Infinite' ? 'opacity-40 grayscale' : ''}`}
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="!h-12 !w-14 !px-0 text-xl"
                    onClick={() => adjustRounds(-1)}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-black text-indigo-500">
                      {localRounds === 'Infinite'
                        ? lastRoundsValue
                        : localRounds}
                    </span>
                    <span className="mt-1 block text-xs leading-none font-bold text-slate-500">
                      ROUNDS
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="md"
                    className="!h-12 !w-14 !px-0 text-xl"
                    onClick={() => adjustRounds(1)}
                  >
                    +
                  </Button>
                </div>

                <button
                  onClick={toggleInfiniteRounds}
                  className={`flex w-16 items-center justify-center rounded-2xl border text-xl font-bold transition-all active:scale-95 ${localRounds === 'Infinite' ? 'border-indigo-200 bg-indigo-100 text-indigo-600 shadow-inner' : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300'} `}
                >
                  ∞
                </button>
              </div>
            </div>

            {/* Second Chance Toggle */}
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

            {/* Second Chance Points (Conditional) */}
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

            {/* Hints Toggle */}
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
                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-500">
                  {DEFAULT_DECKS[localDeck]?.length || 0} Words
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {Object.keys(DEFAULT_DECKS).map((deckName) => (
                  <button
                    key={deckName}
                    onClick={() => setLocalDeck(deckName)}
                    className={`h-14 rounded-2xl text-sm font-black tracking-wide uppercase transition-all active:scale-95 ${
                      localDeck === deckName
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                    } `}
                  >
                    {deckName}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-400 uppercase">
                  Add Words
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
                  placeholder="Enter word..."
                  className="h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-100 px-4 text-lg font-bold text-slate-800 placeholder-slate-400 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  variant="secondary"
                  onClick={handleAddWord}
                  className="!h-12 shrink-0 !px-5"
                >
                  ADD
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
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative mx-auto flex h-full w-full flex-col overflow-hidden bg-slate-50 p-6">
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
          {/* Team Count Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-400 uppercase">
              Number of Teams
            </label>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-2">
              <Button
                variant="secondary"
                size="md"
                className="!h-12 !w-16 !px-0 text-xl"
                onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-black text-slate-800">
                  {teamCount}
                </span>
              </div>
              <Button
                variant="secondary"
                size="md"
                className="!h-12 !w-16 !px-0 text-xl"
                onClick={() => setTeamCount(Math.min(5, teamCount + 1))}
              >
                +
              </Button>
            </div>
          </div>

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
                    {/* Color Bubble / Trigger */}
                    <button
                      onClick={() =>
                        setColorPickerTeamId(isColorPickerOpen ? null : team.id)
                      }
                      className={`h-10 w-12 shrink-0 rounded-xl sm:h-12 sm:w-16 ${TEAM_COLORS[team.colorIndex % TEAM_COLORS.length]} flex items-center justify-center shadow-md transition-transform active:scale-95`}
                    >
                      {/* Optional: Indicator to show it's clickable */}
                      <div className="h-1.5 w-1.5 rounded-full bg-white/40 sm:h-2 sm:w-2"></div>
                    </button>

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

      {/* Color Picker Modal */}
      {colorPickerTeamId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="animate-fade-in absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setColorPickerTeamId(null)}
          />

          {/* Modal */}
          <div className="animate-fade-in relative w-full max-w-sm rounded-[2rem] border border-slate-100 bg-white p-6 shadow-2xl">
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
          </div>
        </div>
      )}
    </div>
  );
};
