import { useState } from 'react';

/**
 * this is a example of a custom hook for writing test code
 * you can use this hook to test the counter component
 */
export function useCounter(initialCount = 0) {
  const [count, setCount] = useState(initialCount);

  const increment = () => {
    setCount((prevCount) => prevCount + 1);
  };

  const decrement = () => {
    setCount((prevCount) => prevCount - 1);
  };

  const reset = () => {
    setCount(initialCount);
  };

  return { count, increment, decrement, reset };
}
