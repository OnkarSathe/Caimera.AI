import { useState, useEffect } from 'react';

interface Props {
  startedAt: number | null;
  stopped: boolean;
}

export function Timer({ startedAt, stopped }: Props) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || stopped) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, stopped]);

  useEffect(() => {
    if (startedAt) setElapsed(Math.floor((Date.now() - startedAt) / 1000));
  }, [startedAt]);

  const color = elapsed > 30 ? '#ef4444' : elapsed > 15 ? '#f59e0b' : '#94a3b8';

  return (
    <div style={{ textAlign: 'center', fontSize: 13, color, fontVariantNumeric: 'tabular-nums' }}>
      {stopped ? 'Round over' : `${elapsed}s elapsed`}
    </div>
  );
}
