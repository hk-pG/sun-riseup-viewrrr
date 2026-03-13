import { describe, expect, it } from 'vitest';
import { createActionRegistry } from '../actionRegistry';
import { openFolderAction } from '../openFolderAction';
import { openImageAction } from '../openImageAction';
import { toggleThemeAction } from '../toggleThemeAction';

describe('createActionRegistry', () => {
  it('registers 3 actions', () => {
    const registry = createActionRegistry();

    expect(registry.size).toBe(3);
  });

  it('maps open-folder to openFolderAction', () => {
    const registry = createActionRegistry();

    expect(registry.get('open-folder')).toBe(openFolderAction);
  });

  it('maps open-image to openImageAction', () => {
    const registry = createActionRegistry();

    expect(registry.get('open-image')).toBe(openImageAction);
  });

  it('maps toggle-theme to toggleThemeAction', () => {
    const registry = createActionRegistry();

    expect(registry.get('toggle-theme')).toBe(toggleThemeAction);
  });
});
