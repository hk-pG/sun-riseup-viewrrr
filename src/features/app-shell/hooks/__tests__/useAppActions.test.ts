import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockApplier, createMockDeps } from '../../__tests__/helpers';
import type { ActionDependencies, ResultApplier } from '../../actions/types';
import { applyResult, useAppActions } from '../useAppActions';

describe('applyResult', () => {
  let applier: ResultApplier;

  beforeEach(() => {
    applier = createMockApplier();
  });

  it('folder-selected: startTransition 内で setAppState を呼び出す', () => {
    applyResult(
      {
        type: 'folder-selected',
        folderPath: '/test/folder',
        initialImageIndex: 5,
      },
      applier,
    );

    expect(applier.startTransition).toHaveBeenCalledOnce();
    expect(applier.setAppState).toHaveBeenCalledOnce();
  });

  it('folder-selected: setAppState の updater が正しい状態を生成する', () => {
    applyResult(
      {
        type: 'folder-selected',
        folderPath: '/new/path',
        initialImageIndex: 3,
      },
      applier,
    );

    const updater = vi.mocked(applier.setAppState).mock.calls[0][0];
    const prev = { currentFolderPath: '/old/path', initialImageIndex: 0 };
    const next =
      typeof updater === 'function' ? updater(prev as never) : updater;

    expect(next).toEqual(
      expect.objectContaining({
        currentFolderPath: '/new/path',
        initialImageIndex: 3,
      }),
    );
  });

  it('theme-toggled: setTheme を呼び出す', () => {
    applyResult({ type: 'theme-toggled', theme: 'light' }, applier);

    expect(applier.setTheme).toHaveBeenCalledWith('light');
  });

  it('theme-toggled: setAppState / startTransition を呼ばない', () => {
    applyResult({ type: 'theme-toggled', theme: 'dark' }, applier);

    expect(applier.setAppState).not.toHaveBeenCalled();
    expect(applier.startTransition).not.toHaveBeenCalled();
  });

  it('null: 副作用を一切実行しない', () => {
    applyResult(null, applier);

    expect(applier.startTransition).not.toHaveBeenCalled();
    expect(applier.setAppState).not.toHaveBeenCalled();
    expect(applier.setTheme).not.toHaveBeenCalled();
  });
});

describe('useAppActions', () => {
  let deps: ActionDependencies;
  let applier: ResultApplier;

  beforeEach(() => {
    deps = createMockDeps();
    applier = createMockApplier();
  });

  it('open-folder 実行: ハンドラーの結果を applyResult で適用する', async () => {
    vi.mocked(deps.fss.openDirectoryDialog).mockResolvedValue('/test');

    const { result } = renderHook(() => useAppActions(deps, applier));

    await result.current.executeAction('open-folder');

    expect(deps.fss.openDirectoryDialog).toHaveBeenCalledOnce();
    expect(applier.startTransition).toHaveBeenCalledOnce();
    expect(applier.setAppState).toHaveBeenCalledOnce();
  });

  it('open-folder キャンセル: 副作用が実行されない', async () => {
    vi.mocked(deps.fss.openDirectoryDialog).mockResolvedValue(null);

    const { result } = renderHook(() => useAppActions(deps, applier));

    await result.current.executeAction('open-folder');

    expect(applier.setAppState).not.toHaveBeenCalled();
  });

  it('toggle-theme 実行: setTheme が呼ばれる', async () => {
    deps = createMockDeps({ currentTheme: 'dark' });

    const { result } = renderHook(() => useAppActions(deps, applier));

    await result.current.executeAction('toggle-theme');

    expect(applier.setTheme).toHaveBeenCalledWith('light');
  });

  it('未登録のアクション ID: console.warn を出力する', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAppActions(deps, applier));

    await result.current.executeAction('exit');

    expect(warnSpy).toHaveBeenCalledWith('Unhandled menu action: exit');
    warnSpy.mockRestore();
  });

  it('ハンドラーエラー: console.error でログ出力する', async () => {
    const error = new Error('boom');
    vi.mocked(deps.fss.openDirectoryDialog).mockRejectedValue(error);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAppActions(deps, applier));
    await result.current.executeAction('open-folder');

    expect(errorSpy).toHaveBeenCalledWith(
      'Menu action failed [open-folder]:',
      error,
    );
    errorSpy.mockRestore();
  });
});
