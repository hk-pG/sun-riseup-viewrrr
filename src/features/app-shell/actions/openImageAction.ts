import type { ActionHandler } from './types';

export const openImageAction: ActionHandler = async (ctx) => {
  const result = await ctx.openImageFile();
  const folderPath = result?.folderPath;
  if (folderPath) {
    ctx.startTransition(() => {
      ctx.setAppState((prev) => ({
        ...prev,
        currentFolderPath: folderPath,
        initialImageIndex: result.index,
      }));
    });
  }
};
