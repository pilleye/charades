import React, { useState } from 'react';
import { DEFAULT_DECKS } from '@/data/decks';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrashIcon } from '../ui/Icons';
import { PremiumGate } from '../ui/PremiumGate';
import { useIsPremium } from '@/store/subscriptionStore';
import type { PaywallTrigger } from '../Setup';

interface DeckSelectorProps {
  selectedDeck: string;
  onDeckChange: (deck: string) => void;
  customWords: string[];
  onAddWord: (word: string) => void;
  onRemoveWord: (word: string) => void;
  onPaywallTrigger: (trigger: PaywallTrigger) => void;
}

export const DeckSelector: React.FC<DeckSelectorProps> = ({
  selectedDeck, onDeckChange,
  customWords, onAddWord, onRemoveWord,
  onPaywallTrigger
}) => {
  const isPremium = useIsPremium();
  const [newWordInput, setNewWordInput] = useState('');

  const handleAddWord = () => {
    if (!isPremium) {
      onPaywallTrigger('custom_words');
      return;
    }
    if (newWordInput.trim()) {
      onAddWord(newWordInput);
      setNewWordInput('');
    }
  };

  return (
    <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase text-slate-400">Card Deck</label>
          <Badge variant={isPremium ? 'info' : 'warning'} size="sm">
            {isPremium ? `${DEFAULT_DECKS[selectedDeck]?.length || 0} Words` : 'Limited'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(DEFAULT_DECKS).map((deckName) => {
            const isLocked = !isPremium && deckName !== 'Default';
            return (
              <PremiumGate key={deckName} onLockClick={() => onPaywallTrigger('locked_deck')} showBadge={isLocked}>
                <button
                  onClick={() => onDeckChange(deckName)}
                  className={`relative w-full h-16 rounded-2xl text-sm font-black uppercase transition-all ${selectedDeck === deckName ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {deckName}
                </button>
              </PremiumGate>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 pt-2">
        <label className="text-sm font-bold uppercase text-slate-400">Custom Words</label>
        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={newWordInput}
            onChange={(e) => setNewWordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="Type a custom word..."
            className="h-12 min-w-0 flex-1 rounded-xl bg-slate-100 px-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="secondary" onClick={handleAddWord} className="!h-12 shrink-0">ADD</Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {customWords.map((word, i) => (
            <button key={i} onClick={() => onRemoveWord(word)} className="flex items-center gap-2 rounded-xl border p-2 text-sm font-bold">
              {word} <TrashIcon className="h-4 w-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
