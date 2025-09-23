'use client';

import { useEffect, useRef } from 'react';
import type { MenuDropdownProps } from '../types/menuTypes';
import { MenuItem } from './MenuItem';

export function MenuDropdown({
  actions,
  onAction,
  isOpen,
  onClose,
  className = '',
}: MenuDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full left-0 z-50 mt-1 min-w-48 rounded-md border border-border bg-popover shadow-lg ${className}`}
    >
      {actions.map((action) => (
        <MenuItem key={action.id} action={action} onAction={onAction} />
      ))}
    </div>
  );
}
