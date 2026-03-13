import { useMemo } from 'react';
import { createActionRegistry } from '../actions/actionRegistry';
import type { ActionContext } from '../actions/types';
import type { AppMenuBarEvent } from '../components/AppMenuBar';

interface UseAppActionsReturn {
  executeAction: (actionId: AppMenuBarEvent) => Promise<void>;
}

export function useAppActions(context: ActionContext): UseAppActionsReturn {
  const registry = useMemo(() => createActionRegistry(), []);

  const executeAction = async (actionId: AppMenuBarEvent) => {
    const handler = registry.get(actionId);
    if (!handler) {
      console.warn(`Unhandled menu action: ${actionId}`);
      return;
    }
    try {
      await handler(context);
    } catch (error) {
      console.error('Menu action failed:', error);
    }
  };

  return { executeAction };
}
