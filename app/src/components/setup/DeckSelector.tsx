import React, { useState } from 'react';
import { DEFAULT_DECKS, FREE_TIER_CARD_LIMIT } from '@/data/decks';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TrashIcon, SearchIcon, CheckIcon, LockIcon } from '../ui/Icons';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  const deckNames = Object.keys(DEFAULT_DECKS);
  const filteredDecks = deckNames.filter(name => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase text-slate-400 tracking-wider">Card Decks</label>
          <Badge variant="default" size="sm">
            {deckNames.length} Decks
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <SearchIcon className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks..."
            className="h-12 w-full rounded-2xl bg-slate-100 pl-11 pr-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Deck List */}
        <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {filteredDecks.length > 0 ? (
            filteredDecks.map((deckName) => {
              const isLocked = !isPremium && deckName !== 'Default';
              const isSelected = selectedDeck === deckName;
              const isDefaultDeck = deckName === 'Default';
              
              const totalCards = DEFAULT_DECKS[deckName]?.length || 0;

              const displayCards = !isPremium && isDefaultDeck 
                ? Math.min(totalCards, FREE_TIER_CARD_LIMIT) 
                : totalCards;
              
              const fullCountRounded = Math.floor(totalCards / 10) * 10;
              
              return (
                <div key={deckName} className="relative">
                  <PremiumGate 
                    onLockClick={() => onPaywallTrigger('locked_deck')} 
                    showBadge={false}
                    isDisabled={isDefaultDeck}
                  >
                    <button
                      onClick={() => {
                        onDeckChange(deckName);
                        if (!isPremium && isDefaultDeck) {
                          onPaywallTrigger('full_deck');
                        }
                      }}
                      className={`group flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-200 ${
                        isSelected 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' 
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex flex-col items-start text-left">
                        <span className={`font-black uppercase tracking-wide ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {deckName}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                            {displayCards} CARDS
                          </span>
                          {!isPremium && isDefaultDeck && totalCards > FREE_TIER_CARD_LIMIT && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-500 ${
                              isSelected ? 'text-black brightness-110' : 'text-black'
                            }`}>
                              {fullCountRounded}+ WITH PREMIUM
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {isSelected ? (
                        <CheckIcon className="h-6 w-6 text-white" />
                      ) : isLocked ? (
                        <LockIcon className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-slate-200 group-hover:border-slate-300" />
                      )}
                    </button>
                  </PremiumGate>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-400 font-bold">
              No decks found matching "{searchQuery}"
            </div>
          )}
        </div>
      </section>

      {/* Custom Words Section */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold uppercase text-slate-400 tracking-wider">Custom Words</label>
          <Badge variant="default" size="sm">
            {customWords.length} Added
          </Badge>
        </div>

        <div className="flex w-full items-center gap-2">
          <input
            type="text"
            value={newWordInput}
            onChange={(e) => setNewWordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="Type a custom word..."
            className="h-12 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Button 
            variant="secondary" 
            onClick={handleAddWord} 
            className="!h-12 shrink-0 px-6 rounded-2xl font-black"
          >
            ADD
          </Button>
        </div>
        
        {customWords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {customWords.map((word, i) => (
              <button 
                key={i} 
                onClick={() => onRemoveWord(word)} 
                className="group flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all"
              >
                {word} 
                <TrashIcon className="h-4 w-4 text-slate-300 group-hover:text-red-400" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
