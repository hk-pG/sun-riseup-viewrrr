import type { ImageSource } from './ImageSource';

/**
 * ImageSource 配列をソートするための関数型。
 */
export type SortFunction = (a: ImageSource, b: ImageSource) => number;
