import { describe, expect, it } from 'vitest'; // Vitestのテスト関数をインポート
import { renderHook } from '@testing-library/react'; // React Hooksのテスト用ユーティリティ
import { useCounter } from '../useCounter'; // テスト対象のカスタムフック
import { act } from 'react'; // 状態変更をテストする際に必要

// useCounterフックのテストスイート
describe('useCounter', () => {
  // 初期値でカウントが初期化されるか
  it('should initialize count with initialCount', () => {
    // renderHookでフックを実行し、result.currentで返り値にアクセスできる
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0); // デフォルト値は0
  });

  // increment関数でカウントが増えるか
  it('should increment count', () => {
    const { result } = renderHook(() => useCounter(0));
    // actでラップして副作用（状態変更）を安全にテスト
    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  // decrement関数でカウントが減るか
  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter(0));
    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(-1);
  });

  // reset関数でカウントが初期値に戻るか
  it('should reset count to initialCount', () => {
    const initialCount = 5;

    const { result } = renderHook(() => useCounter(initialCount));

    // 2回インクリメントしてカウントを7に
    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(7);

    // resetで初期値に戻るか
    act(() => {
      result.current.reset();
    });
    expect(result.current.count).toBe(initialCount);
  });
});
