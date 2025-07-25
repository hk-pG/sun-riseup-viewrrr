import type { ImageSource } from '../features/image-viewer/types/ImageSource';

/**
 * SortFunction
 * @description
 * SortFunction is a type that represents a function used to sort an array of ImageSource objects.
 * It takes two ImageSource objects as arguments and returns a number indicating their relative order.
 * A negative number indicates that the first argument should come before the second,
 * a positive number indicates that the first argument should come after the second,
 * and zero indicates that they are equal in terms of sorting order.
 *
 * (JP)
 * SortFunctionは、ImageSourceオブジェクトの配列をソートするために使用される関数を表す型です。
 * 2つのImageSourceオブジェクトを引数として受け取り、それらの相対的な順序を示す数値を返します。
 * 1. 負の数は、最初の引数が2番目の引数の前に来るべきことを示します。
 * 2. 正の数は、最初の引数が2番目の引数の後に来るべきことを示します。
 * 3. ゼロは、ソート順序において等しいことを示します。
 */
export type SortFunction = (a: ImageSource, b: ImageSource) => number;
