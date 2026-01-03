import { renderHook, act } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { useTimer } from './useTimer';

describe('useTimer', () => {
  vi.useFakeTimers();

  test('should initialize with correct time', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 60 }));
    expect(result.current.remaining).toBe(60);
    expect(result.current.isActive).toBe(false);
  });

  test('should tick down when active', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 60, autoStart: true }));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(59);
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remaining).toBe(57);
  });

  test('should call onFinish when time reaches zero', () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useTimer({ initialTime: 2, onFinish, autoStart: true }));
    
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    expect(result.current.remaining).toBe(0);
    expect(onFinish).toHaveBeenCalled();
  });

  test('should pause and resume', () => {
    const { result } = renderHook(() => useTimer({ initialTime: 60, autoStart: true }));
    
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.pause();
    });
    
    expect(result.current.remaining).toBe(59);
    expect(result.current.isActive).toBe(false);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remaining).toBe(59); // Should not have changed
    
    act(() => {
      result.current.start();
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(58);
  });
});
