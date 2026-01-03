import React, { useState } from 'react';
import { Team } from '@/store/types';
import { TEAM_COLORS } from '@/constants';
import { NumberControl } from '../ui/Controls';
import { TeamColorButton } from '../ui/TeamBadge';
import { DragHandleIcon } from '../ui/Icons';
import { Modal } from '../ui/Modal';
import { useDragReorder } from '@/hooks/useDragReorder';

interface TeamEditorProps {
  teams: Team[];
  onTeamsChange: (teams: Team[]) => void;
}

export const TeamEditor: React.FC<TeamEditorProps> = ({ teams, onTeamsChange }) => {
  const [colorPickerTeamId, setColorPickerTeamId] = useState<number | null>(null);

  const { getItemProps } = useDragReorder({
    items: teams,
    onReorder: onTeamsChange,
    itemHeight: 60,
  });

  const updateTeamName = (index: number, name: string) => {
    const newTeams = [...teams];
    newTeams[index].name = name;
    onTeamsChange(newTeams);
  };

  const updateTeamColor = (index: number, colorIdx: number) => {
    const newTeams = [...teams];
    newTeams[index].colorIndex = colorIdx;
    onTeamsChange(newTeams);
    setColorPickerTeamId(null);
  };

  const setTeamCount = (count: number) => {
    if (count > teams.length) {
      const newTeams = [...teams];
      const usedColors = new Set(teams.map((t) => t.colorIndex));
      for (let i = teams.length; i < count; i++) {
        let nextColorIndex = i;
        while (usedColors.has(nextColorIndex % TEAM_COLORS.length)) {
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
      onTeamsChange(newTeams);
    } else {
      onTeamsChange(teams.slice(0, count));
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <NumberControl
        label="Number of Teams"
        value={teams.length}
        onDecrease={() => setTeamCount(Math.max(2, teams.length - 1))}
        onIncrease={() => setTeamCount(Math.min(5, teams.length + 1))}
      />

      <div className="space-y-3 pt-2">
        {teams.map((team, idx) => (
          <div key={team.id} className="flex items-center gap-2" {...getItemProps(idx)}>
            <TeamColorButton
              colorIndex={team.colorIndex}
              onClick={() => setColorPickerTeamId(team.id)}
            />
            <input
              type="text"
              value={team.name}
              onChange={(e) => updateTeamName(idx, e.target.value)}
              onFocus={(e) => e.target.select()}
              className="h-10 min-w-0 flex-1 rounded-xl border border-transparent bg-slate-100 px-3 text-base font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 sm:h-12 sm:px-4 sm:text-lg"
              placeholder="Team Name"
            />
            <div className="drag-handle cursor-grab touch-manipulation p-1 active:cursor-grabbing sm:p-2">
              <DragHandleIcon />
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={colorPickerTeamId !== null} onClose={() => setColorPickerTeamId(null)}>
        <div className="mb-6 text-center">
          <h3 className="text-xl font-black uppercase tracking-wide text-slate-800">Select Color</h3>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {TEAM_COLORS.map((colorClass, cIdx) => {
            const isTaken = teams.some(t => t.id !== colorPickerTeamId && t.colorIndex === cIdx);
            const isSelected = teams.find(t => t.id === colorPickerTeamId)?.colorIndex === cIdx;
            return (
              <button
                key={cIdx}
                disabled={isTaken}
                onClick={() => {
                  const idx = teams.findIndex(t => t.id === colorPickerTeamId);
                  if (idx !== -1) updateTeamColor(idx, cIdx);
                }}
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClass} ${isSelected ? 'ring-4 ring-slate-300 ring-offset-2' : ''} ${isTaken ? 'opacity-30' : ''}`}
              >
                {isSelected && <div className="h-3 w-3 rounded-full bg-white shadow-sm" />}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setColorPickerTeamId(null)}
          className="mt-6 w-full rounded-2xl bg-slate-100 py-4 font-black uppercase tracking-wide text-slate-500"
        >
          Cancel
        </button>
      </Modal>
    </section>
  );
};
