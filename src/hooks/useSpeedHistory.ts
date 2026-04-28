import { useState, useEffect } from 'react';

interface SpeedHistoryInput {
  dl: number;
  up: number;
}

interface SpeedHistory {
  dl: number[];
  up: number[];
}

export function useSpeedHistory({ dl, up }: SpeedHistoryInput): SpeedHistory {
  const [dlHistory, setDlHistory] = useState<number[]>([]);
  const [upHistory, setUpHistory] = useState<number[]>([]);

  useEffect(() => {
    setDlHistory((prev) => [...prev.slice(-59), dl]);
    setUpHistory((prev) => [...prev.slice(-59), up]);
  }, [dl, up]);

  return { dl: dlHistory, up: upHistory };
}
