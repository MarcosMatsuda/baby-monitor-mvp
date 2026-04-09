import { useState, useEffect, useRef } from 'react';

export function useLastActivity(lastNoiseAt: number | null): string {
  const [label, setLabel] = useState('--');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!lastNoiseAt) {
      setLabel('--');
      return;
    }

    const update = () => {
      const diff = Math.floor((Date.now() - lastNoiseAt) / 1000);

      if (diff < 5) {
        setLabel('Ativo agora');
        return;
      }

      if (diff < 60) {
        setLabel(`Silêncio há ${diff}s`);
        return;
      }

      const min = Math.floor(diff / 60);
      setLabel(`Silêncio há ${min} min`);
    };

    update();
    intervalRef.current = setInterval(update, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [lastNoiseAt]);

  return label;
}
