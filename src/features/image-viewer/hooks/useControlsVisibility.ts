import { useCallback, useEffect, useRef, useState } from 'react';

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
  const timeoutRef = useRef<NodeJS.Timeout>();

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (autoHide && timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, timeout);
    }
  }, [autoHide, timeout]);

  const handleMouseMove = useCallback(() => {
    if (autoHide) {
      setIsVisible(true);
      resetTimeout();
    }
  }, [autoHide, resetTimeout]);

  useEffect(() => {
    setIsVisible(showControls);
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
