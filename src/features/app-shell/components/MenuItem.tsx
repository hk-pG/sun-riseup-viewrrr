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
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm text-left
          hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed
          ${depth > 0 ? 'pl-6' : ''}
        `}
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
            <span className="text-xs text-gray-500">{action.shortcut}</span>
          )}
          {hasSubmenu && <span className="text-xs">▶</span>}
        </div>
      </button>

      {hasSubmenu && isOpen && (
        <div className="absolute left-full top-0 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
