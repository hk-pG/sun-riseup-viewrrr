import type { SortFunction } from '../types/SortFunction';

export const naturalSort: SortFunction = (a, b) => {
    const [aName, bName] = [a.name, b.name];

    const result = aName.localeCompare(bName, 'ja', { numeric: true });

    return result;
};