import { describe, expect, it, vi } from 'vitest';
import { createMockDeps } from '../../__tests__/helpers';
import { createActionRegistry } from '../actionRegistry';

describe('createActionRegistry', () => {
  it('3つのアクションが登録される', () => {
    const deps = createMockDeps();
    const registry = createActionRegistry(deps);

    expect(registry.size).toBe(3);
  });

  it('open-folder / open-image / toggle-theme のキーが存在する', () => {
    const deps = createMockDeps();
    const registry = createActionRegistry(deps);

    expect(registry.has('open-folder')).toBe(true);
    expect(registry.has('open-image')).toBe(true);
    expect(registry.has('toggle-theme')).toBe(true);
  });

  it('各ハンドラーは BoundActionHandler（引数なし関数）である', () => {
    const deps = createMockDeps();
    const registry = createActionRegistry(deps);

    for (const handler of registry.values()) {
      expect(typeof handler).toBe('function');
      expect(handler.length).toBe(0);
    }
  });

  it('open-folder ハンドラーが fss.openDirectoryDialog を呼ぶ', async () => {
    const deps = createMockDeps();
    vi.mocked(deps.fss.openDirectoryDialog).mockResolvedValue('/test');

    const registry = createActionRegistry(deps);
    const result = await registry.get('open-folder')?.();

    expect(deps.fss.openDirectoryDialog).toHaveBeenCalledOnce();
    expect(result).toEqual({
      type: 'folder-selected',
      folderPath: '/test',
      initialImageIndex: 0,
    });
  });

  it('toggle-theme ハンドラーが currentTheme に基づいて結果を返す', async () => {
    const deps = createMockDeps({ currentTheme: 'light' });

    const registry = createActionRegistry(deps);
    const result = await registry.get('toggle-theme')?.();

    expect(result).toEqual({
      type: 'theme-toggled',
      theme: 'dark',
    });
  });

  it('キャンセル時: ハンドラーが null を返す', async () => {
    const deps = createMockDeps();

    const registry = createActionRegistry(deps);
    const result = await registry.get('open-folder')?.();

    expect(result).toBeNull();
  });
});
