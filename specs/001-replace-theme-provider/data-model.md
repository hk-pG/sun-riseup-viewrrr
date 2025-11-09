# Data Model: Replace Theme Provider with shadcn/ui Version

**Date**: November 9, 2025  
**Feature**: 001-replace-theme-provider

## Core Entities

### Theme

**Description**: Represents the visual theme state of the application

**Fields**:
- `value`: `'light' | 'dark'` - The active theme value
- `storageKey`: `string` - Key used for localStorage persistence (default: 'vite-ui-theme')

**Validation Rules**:
- Theme value must be either 'light' or 'dark' (system removed)
- StorageKey must be non-empty string
- Default theme is 'dark'

**State Transitions**:
```
'light' ⟷ 'dark'
```

**Storage**:
- Persisted in `localStorage[storageKey]`
- Falls back to default 'dark' if localStorage unavailable
- Automatically applies CSS classes to `document.documentElement`

### ThemeContextType (Interface)

**Description**: Context interface provided by ThemeProvider to consuming components

**Fields**:
- `theme`: `'light' | 'dark'` - Current theme value
- `setTheme`: `(theme: 'light' | 'dark') => void` - Theme setter function

**Validation Rules**:
- Context must be used within ThemeProvider boundary
- setTheme updates both state and localStorage
- Theme changes immediately apply CSS classes

**Relationships**:
- Consumed by: ThemeToggle, ThemeSelector, App component
- Provided by: ThemeProvider component

### ThemeProviderProps (Interface)

**Description**: Props interface for ThemeProvider component

**Fields**:
- `children`: `React.ReactNode` - Child components to wrap
- `defaultTheme?`: `'light' | 'dark'` - Initial theme (default: 'dark')
- `storageKey?`: `string` - localStorage key (default: 'vite-ui-theme')

**Validation Rules**:
- Children is required
- DefaultTheme must be valid theme value if provided
- StorageKey must be valid string if provided

## Removed Entities

### ~~resolvedTheme~~ (Removed)
- **Reason**: Eliminated with system theme support removal
- **Migration**: Replace usage with direct `theme` property

### ~~system theme~~ (Removed)
- **Reason**: Simplified to only light/dark binary choice
- **Migration**: Convert existing 'system' usages to 'dark' default

## State Management

**Pattern**: React Context API (existing approved pattern)
**Location**: `src/components/theme-provider.tsx` (new shadcn/ui location)
**Persistence**: localStorage with automatic fallback
**CSS Integration**: Automatic class application to document element

## Migration Impact

**Breaking Changes**:
- `resolvedTheme` property no longer available
- `'system'` theme value no longer supported
- Provider import path changes from `src/providers/ThemeProvider` to `src/components/theme-provider`

**Backward Compatibility**:
- `useTheme()` hook interface maintained (minus resolvedTheme)
- Theme CSS classes remain same ('light', 'dark')
- Component prop interfaces simplified but compatible