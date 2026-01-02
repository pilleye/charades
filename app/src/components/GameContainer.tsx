import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const GameContainer: React.FC<Props> = ({ children }) => {
  return (
    <main className="relative h-full w-full overflow-hidden bg-slate-50">
      {/* Inner wrapper - full width in portrait, constrained in landscape for readability */}
      <div className="relative flex h-full w-full flex-col landscape:mx-auto landscape:max-w-6xl">
        {children}
      </div>
    </main>
  );
};
