import { startTransition, useEffect, useRef, useState } from 'react';

/**
 * 画像ビューアのコントロールの表示/非表示を管理するカスタムフック。
 *
 * @param showControls - コントロールを表示するか
 * @param autoHide - コントロールを自動的に非表示にするか
 * @param timeout - コントロールが自動的に非表示になるまでの時間(ms)。0以下の場合は自動非表示しない
 * @returns 表示状態とマウスムーブハンドラを含むオブジェクト。
 */
export const useControlsVisibility = (
  showControls: boolean,
  autoHide: boolean,
  timeout: number,
) => {
  const [isVisible, setIsVisible] = useState(showControls);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const shouldAutoHide = autoHide && timeout > 0;

  const resetTimeout = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (shouldAutoHide) {
      timeoutRef.current = setTimeout(() => {
        // 非緊急な表示状態更新
        startTransition(() => {
          setIsVisible(false);
        });
      }, timeout);
    }
  };

  const handleMouseMove = (): void => {
    if (autoHide) {
      // 非緊急な表示状態更新
      startTransition(() => {
        setIsVisible(true);
      });
      resetTimeout();
    }
  };

  useEffect(() => {
    // 初期表示状態の設定
    startTransition(() => {
      setIsVisible(showControls);
    });
    if (showControls && autoHide) {
      // 依存関数にぶらさずに、このeffectの中でタイマーを張り直す
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (timeout > 0) {
        timeoutRef.current = setTimeout(() => {
          startTransition(() => setIsVisible(false));
        }, timeout);
      }
    }
  }, [showControls, autoHide, timeout]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isVisible, handleMouseMove };
};
