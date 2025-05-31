import type React from 'react';
import { useState } from 'react';
import type { HeaderMenuProps, MenuAction } from '../types/viewerTypes';
import { MenuDropdown } from './MenuDropdown';

export const HeaderMenu: React.FC<HeaderMenuProps> = ({
  title = '漫画ビューア',
  menuActions,
  onMenuAction,
  onOpenFolder,
  className = '',
  style,
}) => {
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
      className={`flex items-center justify-between bg-white border-b border-gray-200 px-4 py-2 ${className}`}
      style={style}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>

        <nav className="flex items-center">
          {onOpenFolder && (
            <button
              type="button"
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
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
                    className={`
                      px-3 py-1 text-sm hover:bg-gray-100 rounded
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${isOpen ? 'bg-gray-100' : ''}
                    `}
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
};
