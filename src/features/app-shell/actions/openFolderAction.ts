import type { ActionHandler } from './types';

export const openFolderAction: ActionHandler = async (ctx) => {
  const folderPath = await ctx.fss.openDirectoryDialog();
  if (folderPath) {
    ctx.startTransition(() => {
      ctx.setAppState((prev) => ({
        ...prev,
        currentFolderPath: folderPath,
        initialImageIndex: 0,
      }));
    });
  }
};
