import { useState } from 'react';
import type { HeaderMenuProps, MenuAction } from '../types/menuTypes';
import { MenuDropdown } from './MenuDropdown';

export function HeaderMenu({
  title = '漫画ビューア',
  menuActions,
  onMenuAction,
  onOpenFolder,
  className = '',
  style,
}: HeaderMenuProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleMenuClick = (actionId: string) => {
    setOpenMenuId(openMenuId === actionId ? null : actionId);
  };

  const handleMenuAction = (actionId: string, action: MenuAction) => {
    onMenuAction(actionId, action);
    setOpenMenuId(null);
  };

  return (
    <header
      className={`flex items-center justify-between border-gray-200 border-b bg-white px-4 py-2 ${className}`}
      style={style}
    >
      <div className="flex items-center gap-4">
        <h1 className="font-semibold text-gray-800 text-lg">{title}</h1>

        <nav className="flex items-center">
          {onOpenFolder && (
            <button
              type="button"
              className="mr-2 rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
              onClick={onOpenFolder}
            >
              📁 フォルダを開く
            </button>
          )}

          <div className="flex">
            {menuActions.map((action) => {
              const hasSubmenu = action.submenu && action.submenu.length > 0;
              const isOpen = openMenuId === action.id;

              return (
                <div key={action.id} className="relative">
                  <button
                    type="button"
                    className={`rounded px-3 py-1 text-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 ${isOpen ? 'bg-gray-100' : ''} `}
                    disabled={action.disabled}
                    onClick={() =>
                      hasSubmenu
                        ? handleMenuClick(action.id)
                        : handleMenuAction(action.id, action)
                    }
                  >
                    {action.icon && <span className="mr-1">{action.icon}</span>}
                    {action.label}
                  </button>

                  {hasSubmenu && (
                    <MenuDropdown
                      actions={action.submenu || []}
                      onAction={handleMenuAction}
                      isOpen={isOpen}
                      onClose={() => setOpenMenuId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
