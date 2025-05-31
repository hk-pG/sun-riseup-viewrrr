import { useCallback, useEffect, useRef, useState } from 'react';

export const useControlsVisibility = (
  showControls: boolean,
  autoHide: boolean,
  timeout: number,
) => {
  const [isVisible, setIsVisible] = useState(showControls);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoHide && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, timeout);
    }
  }, [autoHide, timeout]);

  const handleMouseMove = useCallback(() => {
    if (autoHide) {
      setIsVisible(true);
      resetTimeout();
    }
  }, [autoHide, resetTimeout]);

  useEffect(() => {
    setIsVisible(showControls);
    if (showControls && autoHide) {
      resetTimeout();
    }
  }, [showControls, autoHide, resetTimeout]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isVisible, handleMouseMove };
};
