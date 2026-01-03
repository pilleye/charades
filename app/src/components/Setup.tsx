import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from './ui/Button';
import { CogIcon, BackIcon } from './ui/Icons';
import { SafeScreen } from './ui/SafeArea';
import { Paywall } from './Paywall';
import { TeamEditor } from './setup/TeamEditor';
import { GameRulesEditor } from './setup/GameRulesEditor';
import { DeckSelector } from './setup/DeckSelector';

export type PaywallTrigger = 'full_deck' | 'locked_deck' | 'custom_words' | 'settings';

export const Setup: React.FC = () => {
  const store = useGameStore();
  const [view, setView] = useState<'LOBBY' | 'SETTINGS'>('LOBBY');
  
  // Local state for configuration before "Start"
  const [localTeams, setLocalTeams] = useState(store.teams);
  const [localRules, setLocalRules] = useState({
    duration: store.roundDuration,
    skips: store.skipsPerTurn,
    rounds: store.totalRounds,
    secondChance: store.secondChanceEnabled,
    secondChancePoints: store.secondChanceValue,
    hints: store.hintsEnabled,
  });
  const [localDeck, setLocalDeck] = useState(store.selectedDeck);

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<PaywallTrigger>('full_deck');

  const handleStart = () => {
    store.setTeams(localTeams);
    store.setSettings({
      roundDuration: localRules.duration,
      skipsPerTurn: localRules.skips,
      totalRounds: localRules.rounds,
      secondChanceEnabled: localRules.secondChance,
      secondChanceValue: localRules.secondChancePoints,
      hintsEnabled: localRules.hints,
    });
    store.setDeckConfig(localDeck, store.customWords);
    store.startGame();
  };

  if (view === 'SETTINGS') {
    return (
      <SafeScreen className="animate-fade-in-right flex h-full w-full flex-col overflow-hidden bg-slate-50 py-6">
        <header className="flex shrink-0 items-center justify-between py-4">
          <button onClick={() => setView('LOBBY')} className="-ml-2 p-2 text-slate-400">
            <BackIcon />
          </button>
          <h2 className="text-2xl font-black uppercase tracking-wide text-slate-800">GAME RULES</h2>
          <div className="w-8"></div>
        </header>

        <div className="mask-fade-bottom flex-1 space-y-6 overflow-y-auto pb-4">
          <GameRulesEditor
            {...localRules}
            onDurationChange={(d) => setLocalRules(r => ({ ...r, duration: d }))}
            onSkipsChange={(s) => setLocalRules(r => ({ ...r, skips: s }))}
            onRoundsChange={(rn) => setLocalRules(r => ({ ...r, rounds: rn }))}
            onSecondChanceChange={(sc) => setLocalRules(r => ({ ...r, secondChance: sc }))}
            onSecondChancePointsChange={(scp) => setLocalRules(r => ({ ...r, secondChancePoints: scp }))}
            onHintsChange={(h) => setLocalRules(r => ({ ...r, hints: h }))}
          />

          <DeckSelector
            selectedDeck={localDeck}
            onDeckChange={setLocalDeck}
            customWords={store.customWords}
            onAddWord={store.addCustomWord}
            onRemoveWord={store.removeCustomWord}
            onPaywallTrigger={(t) => {
              setPaywallTrigger(t);
              setPaywallOpen(true);
            }}
          />
        </div>

        <div className="shrink-0 pt-2 pb-4">
          <Button variant="primary" size="xl" fullWidth onClick={() => setView('LOBBY')}>DONE</Button>
        </div>

        <Paywall isOpen={paywallOpen} onClose={() => setPaywallOpen(false)} trigger={paywallTrigger} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen className="animate-fade-in relative flex h-full w-full flex-col overflow-hidden bg-slate-50 py-6">
      <header className="relative shrink-0 py-8 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-blue-600">CHARADES</h1>
      </header>

      <div className="mask-fade-bottom flex-1 space-y-6 overflow-y-auto pb-4">
        <TeamEditor teams={localTeams} onTeamsChange={setLocalTeams} />
      </div>

      <div className="z-10 flex shrink-0 flex-col space-y-3 pt-4">
        <Button variant="secondary" size="lg" fullWidth onClick={() => setView('SETTINGS')} className="gap-2" icon={<CogIcon />}>
          GAME RULES & DECKS
        </Button>
        <Button variant="success" size="xl" fullWidth onClick={handleStart} className="text-2xl">
          PLAY GAME
        </Button>
      </div>
    </SafeScreen>
  );
};
