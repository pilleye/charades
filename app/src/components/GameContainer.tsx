import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const GameContainer: React.FC<Props> = ({ children }) => {
  return (
    <main className="relative h-full w-full overflow-hidden bg-slate-50">
      {/* Inner wrapper centers content and constrains width for readability without looking like a card */}
      <div className="relative mx-auto flex h-full w-full max-w-2xl flex-col landscape:max-w-6xl">
        {children}
      </div>
    </main>
  );
};
