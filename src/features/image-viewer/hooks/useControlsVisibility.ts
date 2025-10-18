import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

  const resetTimeout = useCallback(() => {
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
  }, [shouldAutoHide, timeout]);

  const handleMouseMove = useCallback(() => {
    if (autoHide) {
      // 非緊急な表示状態更新
      startTransition(() => {
        setIsVisible(true);
      });
      resetTimeout();
    }
  }, [autoHide, resetTimeout]);

  useEffect(() => {
    // 初期表示状態の設定
    startTransition(() => {
      setIsVisible(showControls);
    });
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
