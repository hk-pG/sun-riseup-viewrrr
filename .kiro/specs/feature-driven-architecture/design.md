# Design Document

## Overview

This design outlines the transformation of the current Tauri-based image viewer application from a technical-driven file structure to a feature-driven architecture. The current structure separates code by technical concerns (components, hooks, services, types), while the new structure will organize code by business features and domains.

The application has three main feature domains:

1. **Image Viewing** - Core image display, navigation, and viewer controls
2. **Folder Navigation** - Sidebar, folder selection, and file system browsing
3. **Application Shell** - Menu bar, settings, keyboard shortcuts, and app-level concerns

## Architecture

### Current Structure Analysis

The current structure follows a technical layering approach:

- `/components` - All React components mixed together
- `/hooks` - All custom hooks regardless of domain
- `/services` - Business logic services
- `/types` - All TypeScript interfaces
- `/context` - React contexts
- `/utils` - Utility functions

### Target Feature-Driven Structure

```
src/
├── features/
│   ├── image-viewer/
│   │   ├── components/
│   │   │   ├── ImageDisplay.tsx
│   │   │   ├── ImageViewer.tsx
│   │   │   └── ViewerControls.tsx
│   │   ├── hooks/
│   │   │   ├── useControlsVisibility.ts
│   │   │   └── useKeyboardHandler.ts
│   │   ├── services/
│   │   │   └── imageViewerService.ts
│   │   ├── types/
│   │   │   ├── ImageSource.ts
│   │   │   ├── ImageContainer.ts
│   │   │   └── viewerTypes.ts
│   │   └── index.ts
│   ├── folder-navigation/
│   │   ├── components/
│   │   │   ├── FolderList.tsx
│   │   │   ├── FolderView.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── hooks/
│   │   │   ├── useSiblingFolders.ts
│   │   │   └── useOpenImageFile.ts
│   │   ├── services/
│   │   │   ├── FileSystemService.ts
│   │   │   └── getSiblingFolders.ts
│   │   ├── containers/
│   │   │   └── LocalFolderContainer.ts
│   │   ├── types/
│   │   │   └── folderTypes.ts
│   │   └── index.ts
│   └── app-shell/
│       ├── components/
│       │   ├── AppMenuBar.tsx
│       │   ├── HeaderMenu.tsx
│       │   ├── MenuDropdown.tsx
│       │   ├── MenuItem.tsx
│       │   └── KeyboardShortcutHelp.tsx
│       ├── settings/
│       │   ├── defaultKeyConfig.ts
│       │   └── keyUtils.ts
│       ├── types/
│       │   └── menuTypes.ts
│       └── index.ts
├── shared/
│   ├── components/
│   │   └── ui/ (shadcn components)
│   ├── hooks/
│   │   └── data/
│   ├── services/
│   │   └── base/
│   ├── utils/
│   │   ├── isStringArray.ts
│   │   ├── sort.ts
│   │   └── utils.ts
│   ├── context/
│   │   └── ServiceContext.tsx
│   ├── adapters/
│   │   └── tauriAdapters.ts
│   └── types/
│       └── common.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Components and Interfaces

### Feature Boundaries

Each feature will have clear boundaries and responsibilities:

**Image Viewer Feature:**

- Manages image display, zoom, rotation, and navigation
- Handles viewer controls and keyboard shortcuts
- Contains image-specific types and interfaces
- Exports: `ImageViewer`, `ImageDisplay`, `ViewerControls`, image-related hooks

**Folder Navigation Feature:**

- Manages folder browsing and selection
- Handles file system operations
- Contains folder and file-related types
- Exports: `Sidebar`, `FolderList`, `FolderView`, folder-related hooks

**App Shell Feature:**

- Manages application-level concerns (menu, settings)
- Handles global keyboard shortcuts and app configuration
- Contains menu and app-level types
- Exports: `AppMenuBar`, menu components, settings utilities

### Shared Resources

Common utilities and components will be centralized:

- UI components (shadcn/ui)
- Common hooks and utilities
- Service context and adapters
- Base types and interfaces

### Export Strategy

Each feature will have an `index.ts` file that exports its public API:

```typescript
// features/image-viewer/index.ts
export { ImageViewer } from './components/ImageViewer';
export { ImageDisplay } from './components/ImageDisplay';
export { ViewerControls } from './components/ViewerControls';
export type { ImageSource, ViewerSettings } from './types';
```

## Data Models

### Type Organization

Types will be organized by feature domain:

**Image Viewer Types:**

- `ImageSource` - Display resource information
- `ImageContainer` - Image list interface
- `ViewerSettings` - Display configuration
- `ImageViewerCallbacks` - Event handlers

**Folder Navigation Types:**

- `FolderInfo` - Folder metadata
- `ImageFile` - File system information
- `SidebarProps`, `FolderListProps` - Component interfaces

**App Shell Types:**

- `MenuAction` - Menu item structure
- `KeyboardShortcut` - Shortcut configuration
- `ActionType` - Keyboard action types

### Import Strategy

Features will import from each other through their public APIs:

```typescript
// In App.tsx
import { ImageViewer } from './features/image-viewer';
import { Sidebar } from './features/folder-navigation';
import { AppMenuBar } from './features/app-shell';
```

## Error Handling

### Migration Error Prevention

- Incremental migration with validation at each step
- Automated import path updates
- TypeScript compilation checks
- Test execution after each migration step

### Runtime Error Handling

- Maintain existing error boundaries and handling
- Preserve current error reporting mechanisms
- Ensure no breaking changes to error interfaces

## Testing Strategy

### Migration Testing

1. **Pre-migration baseline**: Run full test suite to establish baseline
2. **Step-by-step validation**: After each file move/refactor:
   - Run `pnpm build` to check compilation
   - Run `pnpm lint` to check code quality
   - Run `pnpm test` to verify functionality
3. **Integration testing**: Verify all features work together
4. **Storybook validation**: Ensure all stories continue to work

### Test Organization

Tests will be co-located with their respective features:

```
features/
├── image-viewer/
│   ├── components/
│   │   ├── ImageViewer.tsx
│   │   └── ImageViewer.test.tsx
│   └── hooks/
│       ├── useControlsVisibility.ts
│       └── useControlsVisibility.test.ts
```

### Existing Test Preservation

- Maintain all existing test files and their functionality
- Update import paths in test files during migration
- Preserve test configuration in `vitest.workspace.ts`
- Keep Storybook stories functional throughout migration

### Validation Commands

The following commands will be run after each migration step:

```bash
pnpm build      # TypeScript compilation check
pnpm lint       # Code quality and style check
pnpm test       # Unit and integration tests
pnpm storybook  # Visual component testing (manual verification)
```
