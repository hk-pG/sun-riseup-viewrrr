import { createActionRegistry } from '../actions/actionRegistry';
import type {
  ActionDependencies,
  ActionResult,
  ResultApplier,
} from '../actions/types';
import type { AppMenuBarEvent } from '../components/AppMenuBar';

export function applyResult(
  result: ActionResult | null,
  applier: ResultApplier,
): void {
  if (result === null) return;

  switch (result.type) {
    case 'folder-selected':
      applier.startTransition(() => {
        applier.setAppState((prev) => ({
          ...prev,
          currentFolderPath: result.folderPath,
          initialImageIndex: result.initialImageIndex,
        }));
      });
      break;
    case 'theme-toggled':
      applier.setTheme(result.theme);
      break;
  }
}

interface UseAppActionsReturn {
  executeAction: (actionId: AppMenuBarEvent) => Promise<void>;
}

export function useAppActions(
  deps: ActionDependencies,
  applier: ResultApplier,
): UseAppActionsReturn {
  const registry = createActionRegistry(deps);

  const executeAction = async (actionId: AppMenuBarEvent) => {
    const handler = registry.get(actionId);
    if (!handler) {
      console.warn(`Unhandled menu action: ${actionId}`);
      return;
    }
    try {
      const result = await handler();
      applyResult(result, applier);
    } catch (error) {
      console.error(`Menu action failed [${actionId}]:`, error);
    }
  };

  return { executeAction };
}
