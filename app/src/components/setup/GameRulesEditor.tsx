import React from 'react';
import { NumberControl, InfiniteToggleControl } from '../ui/Controls';
import { SegmentedControl } from '../ui/SegmentedControl';

interface GameRulesEditorProps {
  duration: number;
  onDurationChange: (v: number) => void;
  skips: number | 'Infinite';
  onSkipsChange: (v: number | 'Infinite') => void;
  rounds: number | 'Infinite';
  onRoundsChange: (v: number | 'Infinite') => void;
  secondChance: boolean;
  onSecondChanceChange: (v: boolean) => void;
  secondChancePoints: number;
  onSecondChancePointsChange: (v: number) => void;
  hints: boolean;
  onHintsChange: (v: boolean) => void;
}

export const GameRulesEditor: React.FC<GameRulesEditorProps> = ({
  duration, onDurationChange,
  skips, onSkipsChange,
  rounds, onRoundsChange,
  secondChance, onSecondChanceChange,
  secondChancePoints, onSecondChancePointsChange,
  hints, onHintsChange
}) => {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <NumberControl
        label="Round Timer"
        value={duration}
        onDecrease={() => onDurationChange(Math.max(10, duration - 10))}
        onIncrease={() => onDurationChange(duration + 10)}
        unit="SECONDS"
      />

      <InfiniteToggleControl
        label="Skips Allowed"
        value={skips}
        onDecrease={() => typeof skips === 'number' && onSkipsChange(Math.max(0, skips - 1))}
        onIncrease={() => typeof skips === 'number' && onSkipsChange(Math.min(10, skips + 1))}
        onToggleInfinite={() => onSkipsChange(skips === 'Infinite' ? 3 : 'Infinite')}
        unit="PER TURN"
        color="yellow"
        lastFiniteValue={3}
      />

      <InfiniteToggleControl
        label="Total Rounds"
        value={rounds}
        onDecrease={() => typeof rounds === 'number' && onRoundsChange(Math.max(1, rounds - 1))}
        onIncrease={() => typeof rounds === 'number' && onRoundsChange(Math.min(20, rounds + 1))}
        onToggleInfinite={() => onRoundsChange(rounds === 'Infinite' ? 5 : 'Infinite')}
        unit="ROUNDS"
        color="indigo"
        lastFiniteValue={5}
      />

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
        <label className="text-sm font-bold uppercase text-slate-400">Second Chance Round</label>
        <SegmentedControl
          options={[{ label: 'Disabled', value: false }, { label: 'Enabled', value: true }]}
          value={secondChance}
          onChange={onSecondChanceChange}
        />
      </div>

      {secondChance && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold uppercase text-slate-400">Recovery Score</label>
          <SegmentedControl
            options={[{ label: '0 Pts', value: 0 }, { label: '½ Pts', value: 0.5 }, { label: '1 Pt', value: 1 }]}
            value={secondChancePoints}
            onChange={onSecondChancePointsChange}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-2">
        <label className="text-sm font-bold uppercase text-slate-400">Show Hints</label>
        <SegmentedControl
          options={[{ label: 'Disabled', value: false }, { label: 'Enabled', value: true }]}
          value={hints}
          onChange={onHintsChange}
        />
      </div>
    </section>
  );
};
