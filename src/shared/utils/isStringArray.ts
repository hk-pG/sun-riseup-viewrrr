/**
 * 指定の値が文字列の配列かどうかを判定する関数
 *
 * @param value - The value to check
 * @returns true if the value is an array of strings, false otherwise
 * @todo zodなどのバリデーションライブラリを使うと、より簡潔に書けるかもしれない
 */
function isStringArray(value: unknown): value is string[] {
    if (!Array.isArray(value)) {
        return false;
    }
    return value.every((item) => typeof item === 'string');
}

export { isStringArray };