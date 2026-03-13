import type { ActionHandler } from './types';

export const openImageAction: ActionHandler = async (ctx) => {
  const result = await ctx.openImageFile();
  if (result?.folderPath) {
    ctx.startTransition(() => {
      ctx.setAppState((prev) => ({
        ...prev,
        currentFolderPath: result.folderPath || '',
        initialImageIndex: result.index,
      }));
    });
  }
};
