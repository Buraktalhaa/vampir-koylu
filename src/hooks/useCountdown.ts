import { useEffect, useRef, useState } from 'react';

/**
 * Bitiş zamanına göre sayar; uygulama arka plana gidip gelse de doğru kalır.
 * Süre dolunca `onFinish` bir kez çağrılır.
 */
export function useCountdown(seconds: number, onFinish: () => void) {
  const [endAt, setEndAt] = useState(() => Date.now() + seconds * 1000);
  const [total, setTotal] = useState(seconds);
  const [now, setNow] = useState(() => Date.now());
  const finished = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const remaining = Math.max(0, Math.ceil((endAt - now) / 1000));

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !finished.current) {
      finished.current = true;
      onFinishRef.current();
    }
  }, [remaining]);

  const addSeconds = (extra: number) => {
    setEndAt((e) => e + extra * 1000);
    setTotal((t) => t + extra);
  };

  return { remaining, total, addSeconds };
}
