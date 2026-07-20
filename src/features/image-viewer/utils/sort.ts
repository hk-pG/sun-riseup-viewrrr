import type { SortFunction } from '../types/SortFunction';

export const naturalSort: SortFunction = (a, b) => {
  const [aName, bName] = [a.name, b.name];

  return aName.localeCompare(bName, 'ja', { numeric: true });
};
