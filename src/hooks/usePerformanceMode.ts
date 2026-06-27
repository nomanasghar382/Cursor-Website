import { useEffect, useMemo, useState } from 'react';

export function usePerformanceMode() {
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isLowSpecDevice, setIsLowSpecDevice] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileViewport(mobile);

      const hardwareThreads = navigator.hardwareConcurrency ?? 8;
      const navWithMemory = navigator as Navigator & { deviceMemory?: number };
      const memory = navWithMemory.deviceMemory ?? 8;
      setIsLowSpecDevice(hardwareThreads <= 4 || memory <= 4);
    };

    evaluate();
    window.addEventListener('resize', evaluate);
    return () => window.removeEventListener('resize', evaluate);
  }, []);

  return useMemo(
    () => ({
      prefersSmoothMode: isMobileViewport || isLowSpecDevice,
      isMobileViewport,
      isLowSpecDevice,
    }),
    [isLowSpecDevice, isMobileViewport],
  );
}
