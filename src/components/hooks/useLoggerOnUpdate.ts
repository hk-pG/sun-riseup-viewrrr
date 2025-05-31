import { useEffect } from 'react';

export function useLoggerOnUpdate(
  value: string,
  messagePrefix = 'Value changed:',
) {
  useEffect(() => {
    console.log(`${messagePrefix} ${value}`);

    return () => {
      console.log(`Cleanup function for: ${value}`);
    };
  }, [value, messagePrefix]);
}
