import { useState, useEffect, useRef } from 'react';

export function useElapsedTime(startedAt: number | null): string {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
  const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
  const s = String(elapsed % 60).padStart(2, '0');

  return `${h}:${m}:${s}`;
}
