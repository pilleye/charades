import { renderHook, act } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from '../test/test-utils';
import { useTimer } from './useTimer';

const describeFn = (process as any).versions.bun ? describe.skip : describe;

describeFn('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('should initialize with correct time', () => {
    console.log('Is setInterval mocked?', (setInterval as any)._isMockFunction || (setInterval as any).clock ? 'YES' : 'NO', setInterval.toString());
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
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.remaining).toBe(58);
  });
});
