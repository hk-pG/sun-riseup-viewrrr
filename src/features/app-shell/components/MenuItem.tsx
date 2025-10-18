import { useState } from 'react';
import type { MenuItemProps } from '../types/menuTypes';

export function MenuItem({ action, onAction, depth = 0 }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubmenu = action.submenu && action.submenu.length > 0;

  const handleClick = () => {
    if (hasSubmenu) {
      setIsOpen(!isOpen);
    } else {
      onAction(action.id, action);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        className={`flex w-full items-center justify-between px-3 py-2 text-left text-foreground text-sm hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50 ${depth > 0 ? 'pl-6' : ''} `}
        disabled={action.disabled}
        onClick={handleClick}
        type="button"
      >
        <span className="flex items-center gap-2">
          {action.icon && <span className="text-base">{action.icon}</span>}
          {action.label}
        </span>
        <div className="flex items-center gap-2">
          {action.shortcut && (
            <span className="text-muted-foreground text-xs">
              {action.shortcut}
            </span>
          )}
          {hasSubmenu && <span className="text-xs">▶</span>}
        </div>
      </button>

      {hasSubmenu && isOpen && (
        <div className="absolute top-0 left-full z-50 min-w-48 rounded-md border border-border bg-popover shadow-lg">
          {action.submenu?.map((subAction) => (
            <MenuItem
              key={subAction.id}
              action={subAction}
              onAction={onAction}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
