import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

// テーマの種類を定義: ライト、ダーク、システム設定に従う
type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  // 現在設定されているテーマ
  theme: Theme;
  // テーマを変更する関数
  setTheme: (theme: Theme) => void;
  // 実際に適用されるテーマ（systemの場合は解決済み）
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * テーマプロバイダーコンポーネント
 * アプリケーション全体のテーマ管理を行い、子コンポーネントにテーマ情報を提供する
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  // 現在のテーマ設定を管理するstate（デフォルトはシステム設定）
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // 実際に適用されるテーマ（systemの場合はOSの設定を反映）
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // システムテーマの検出とresolvedThemeの更新
  useEffect(() => {
    try {
      // React 19対応のメディアクエリ処理（テスト環境でのフォールバック付き）
      const updateResolvedTheme = () => {
        if (theme !== 'system') {
          // 'light'または'dark'が直接指定されている場合はそのまま使用
          setResolvedTheme(theme);
          return;
        }

        // テスト環境での安全なメディアクエリチェック
        if (typeof window !== 'undefined' && window.matchMedia) {
          // OSのダークモード設定を取得
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
        } else {
          // テスト環境でのフォールバック（ライトテーマを使用）
          setResolvedTheme('light');
        }
      };

      // 初回実行
      updateResolvedTheme();

      // システムテーマかつブラウザ環境の場合、OSの設定変更を監視
      if (
        theme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia
      ) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // OSのテーマ設定変更時にupdateResolvedThemeを実行
        mediaQuery.addEventListener('change', updateResolvedTheme);

        // クリーンアップ関数：コンポーネントアンマウント時にイベントリスナーを削除
        return () =>
          mediaQuery.removeEventListener('change', updateResolvedTheme);
      }

      return undefined; // 何もクリーンアップしない場合
    } catch (error) {
      console.error('テーマの解決中にエラーが発生しました:', error);
      // エラー発生時はデフォルトでライトテーマを設定
      setResolvedTheme('light');
      return undefined;
    }
  }, [theme]); // themeが変更された時に実行

  // 決定されたテーマをドキュメントのルート要素に適用
  useEffect(() => {
    const root = document.documentElement; // <html>要素を取得
    // 既存のテーマクラスを削除
    root.classList.remove('light', 'dark');
    // 新しいテーマクラスを追加（CSSでテーマ変数が切り替わる）
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]); // resolvedThemeが変更された時に実行

  // コンテキストに提供する値を定義
  const value: ThemeContextType = {
    theme, // 現在のテーマ設定
    setTheme, // テーマ変更関数
    resolvedTheme, // 実際に適用されるテーマ
  };

  // Context.Providerで子コンポーネントにテーマ情報を提供
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * テーマ情報を取得するカスタムフック
 * ThemeProviderの子コンポーネント内でのみ使用可能
 *
 * @returns テーマの現在値、変更関数、解決済みテーマを含むオブジェクト
 * @throws ThemeProvider外で使用された場合はエラーをスロー
 */
export function useTheme() {
  // ThemeContextから値を取得
  const context = useContext(ThemeContext);

  // コンテキストが未定義の場合はThemeProvider外で使用されている
  if (context === undefined) {
    throw new Error('useTheme は ThemeProvider 内でのみ使用できます');
  }

  return context;
}
