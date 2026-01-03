'use client';

import React, { useState } from 'react';
import { Button } from './Button';

interface PauseMenuOverlayProps {
    /** Whether the overlay is visible */
    isOpen: boolean;
    /** Callback when resume is clicked */
    onResume: () => void;
    /** Callback when quit is confirmed */
    onQuit: () => void;
    /** Theme variant */
    variant?: 'light' | 'dark';
    /** Title text when paused */
    pauseTitle?: string;
    /** Optional children to render between resume and quit buttons */
    children?: React.ReactNode;
}

/**
 * Reusable pause menu overlay with pause/resume and quit confirmation flow.
 * Supports light and dark themes.
 */
export const PauseMenuOverlay: React.FC<PauseMenuOverlayProps> = ({
    isOpen,
    onResume,
    onQuit,
    variant = 'light',
    pauseTitle = 'GAME PAUSED',
    children,
}) => {
    const [showQuitConfirm, setShowQuitConfirm] = useState(false);

    if (!isOpen) return null;

    const isDark = variant === 'dark';

    const bgClass = isDark
        ? 'bg-indigo-950/95 backdrop-blur-sm'
        : 'bg-slate-50/95 backdrop-blur-sm';
    const textMainClass = isDark ? 'text-white' : 'text-slate-900';
    const textSubClass = isDark ? 'text-indigo-200' : 'text-slate-500';

    const handleResume = () => {
        setShowQuitConfirm(false);
        onResume();
    };

    const handleQuitConfirm = () => {
        setShowQuitConfirm(false);
        onQuit();
    };

    return (
        <div
            className={`animate-fade-in absolute inset-0 z-50 flex flex-col items-center justify-center space-y-8 p-6 ${bgClass} safe-overlay`}
        >
            {!showQuitConfirm ? (
                <>
                    <h2 className={`text-4xl font-black ${textMainClass}`}>
                        {pauseTitle}
                    </h2>

                    <div className="w-full max-w-sm space-y-6">
                        <Button
                            variant="primary"
                            size="xl"
                            fullWidth
                            onClick={handleResume}
                            className={isDark ? 'border-blue-900 bg-blue-600 shadow-blue-900' : ''}
                        >
                            RESUME
                        </Button>

                        {children}

                        <div className="pt-4">
                            <Button
                                variant="ghost"
                                size="lg"
                                fullWidth
                                onClick={() => setShowQuitConfirm(true)}
                                className={
                                    isDark
                                        ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40 hover:text-red-300'
                                        : 'bg-red-50 text-red-500 hover:bg-red-100'
                                }
                            >
                                QUIT GAME
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <h2 className={`text-center text-3xl font-black ${textMainClass}`}>
                        EXIT TO MENU?
                    </h2>
                    <p className={`-mt-4 text-center font-bold ${textSubClass}`}>
                        Current game progress will be lost.
                    </p>

                    <div className="w-full max-w-sm space-y-4">
                        <Button
                            variant="danger"
                            size="xl"
                            fullWidth
                            onClick={handleQuitConfirm}
                            className={isDark ? 'border-red-900 shadow-red-900' : ''}
                        >
                            YES, EXIT GAME
                        </Button>
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={() => setShowQuitConfirm(false)}
                            className={
                                isDark
                                    ? '!bg-slate-700 !text-white !shadow-[0_4px_0_0_rgba(15,23,42,1)] hover:!bg-slate-600'
                                    : ''
                            }
                        >
                            CANCEL
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};
