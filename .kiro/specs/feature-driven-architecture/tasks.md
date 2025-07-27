# Implementation Plan

- [x] 1. Create feature directory structure and shared utilities foundation

  - Create the new directory structure under `src/features/` and `src/shared/`
  - Set up index.ts files for each feature with placeholder exports
  - Move shared utilities and common types to `src/shared/`
  - _Requirements: 1.1, 4.2_

- [x] 2. Migrate shared components and utilities

  - [x] 2.1 Move UI components to shared directory

    - Move `src/components/ui/` to `src/shared/components/ui/`
    - Update import paths in all consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 4.2_

  - [x] 2.2 Move common utilities and adapters

    - Move `src/utils/` contents to `src/shared/utils/`
    - Move `src/adapters/` to `src/shared/adapters/`
    - Move `src/lib/utils.ts` to `src/shared/utils/`
    - Update all import statements referencing these utilities
    - Run build, lint, and test to validate changes
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 4.2_

  - [x] 2.3 Move service context to shared

    - Move `src/context/ServiceContext.tsx` to `src/shared/context/`
    - Update import in `src/main.tsx` and other consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 5.1_

- [x] 3. Migrate image viewer feature

  - [x] 3.1 Move image viewer types

    - Move `src/types/ImageSource.ts` to `src/features/image-viewer/types/`
    - Move `src/types/ImageContainer.ts` to `src/features/image-viewer/types/`
    - Extract image viewer related types from `src/types/viewerTypes.ts` to `src/features/image-viewer/types/`
    - Update import statements in all consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [x] 3.2 Move image viewer components

    - Move `src/components/ImageViewer.tsx` to `src/features/image-viewer/components/`
    - Move `src/components/ImageDisplay.tsx` to `src/features/image-viewer/components/`
    - Move `src/components/ViewerControls.tsx` to `src/features/image-viewer/components/`
    - Update import statements in these components and their consumers
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [x] 3.3 Move image viewer hooks

    - Move `src/hooks/useControlsVisibility.ts` to `src/features/image-viewer/hooks/`
    - Move `src/hooks/useKeyboardHandler.ts` to `src/features/image-viewer/hooks/`
    - Update import statements in consuming components
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [x] 3.4 Create image viewer feature exports

    - Create comprehensive `src/features/image-viewer/index.ts` with all public exports
    - Update `src/App.tsx` to import from the feature index
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 4.3_

- [-] 4. Migrate folder navigation feature

  - [x] 4.1 Move folder navigation types

    - Extract folder-related types from `src/types/viewerTypes.ts` to `src/features/folder-navigation/types/`
    - Create `folderTypes.ts` with `FolderInfo`, `ImageFile`, and related interfaces
    - Update import statements in all consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [x] 4.2 Move folder navigation services

    - Move `src/service/FileSystemService.ts` to `src/features/folder-navigation/services/`
    - Move `src/service/getSiblingFolders.ts` to `src/features/folder-navigation/services/`
    - Move `src/containers/LocalFolderContainer.ts` to `src/features/folder-navigation/containers/`
    - Update import statements in consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [x] 4.3 Move folder navigation hooks

    - Move `src/components/hooks/useSiblingFolders.ts` to `src/features/folder-navigation/hooks/`
    - Move `src/components/hooks/useOpenImageFile.ts` to `src/features/folder-navigation/hooks/`
    - Update import statements in consuming components
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [ ] 4.4 Move folder navigation components

    - Move `src/components/Sidebar.tsx` to `src/features/folder-navigation/components/`
    - Move `src/components/FolderList.tsx` to `src/features/folder-navigation/components/`
    - Move `src/components/FolderView.tsx` to `src/features/folder-navigation/components/`
    - Move `src/components/FolderView.test.tsx` to `src/features/folder-navigation/components/`
    - Update import statements in these components and their consumers
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [ ] 4.5 Create folder navigation feature exports
    - Create comprehensive `src/features/folder-navigation/index.ts` with all public exports
    - Update `src/App.tsx` to import from the feature index
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 4.3_

- [ ] 5. Migrate app shell feature
  - [ ] 5.1 Move app shell types
    - Extract menu-related types from `src/types/viewerTypes.ts` to `src/features/app-shell/types/`
    - Create `menuTypes.ts` with `MenuAction`, `HeaderMenuProps`, and related interfaces
    - Update import statements in all consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [ ] 5.2 Move app settings
    - Move `src/app-settings/` directory to `src/features/app-shell/settings/`
    - Update import statements in consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [ ] 5.3 Move app shell components
    - Move `src/components/AppMenuBar.tsx` to `src/features/app-shell/components/`
    - Move `src/components/HeaderMenu.tsx` to `src/features/app-shell/components/`
    - Move `src/components/MenuDropdown.tsx` to `src/features/app-shell/components/`
    - Move `src/components/MenuItem.tsx` to `src/features/app-shell/components/`
    - Move `src/components/KeyboardShortcutHelp.tsx` to `src/features/app-shell/components/`
    - Update import statements in these components and their consumers
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3_

  - [ ] 5.4 Create app shell feature exports
    - Create comprehensive `src/features/app-shell/index.ts` with all public exports
    - Update `src/App.tsx` to import from the feature index
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 4.3_

- [ ] 6. Move remaining shared resources
  - [ ] 6.1 Move remaining hooks to shared
    - Move `src/hooks/data/` to `src/shared/hooks/data/`
    - Update import statements in consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3, 4.2_

  - [ ] 6.2 Clean up remaining types
    - Move any remaining common types from `src/types/` to `src/shared/types/`
    - Remove empty `src/types/` directory
    - Update import statements in consuming files
    - Run build, lint, and test to validate changes
    - _Requirements: 1.1, 1.2, 2.1, 2.4, 3.1, 3.3, 4.2_

- [ ] 7. Update Storybook configuration and stories
  - [ ] 7.1 Move and update story files
    - Move stories from `src/stories/` to their respective feature directories
    - Update import paths in all story files
    - Update Storybook configuration if needed
    - Run Storybook to validate all stories work correctly
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 5.4_

  - [ ] 7.2 Update test configuration
    - Update `vitest.workspace.ts` if needed for new directory structure
    - Verify all tests can find their dependencies with new import paths
    - Run full test suite to validate everything works
    - _Requirements: 2.1, 2.4, 3.1, 3.3, 5.4_

- [ ] 8. Clean up old directory structure
  - [ ] 8.1 Remove empty directories
    - Remove empty `src/components/` directory (except temp folder if needed)
    - Remove empty `src/hooks/` directory
    - Remove empty `src/service/` directory
    - Remove empty `src/containers/` directory
    - Remove empty `src/adapters/` directory
    - Remove empty `src/app-settings/` directory
    - Run build, lint, and test to validate no broken references
    - _Requirements: 1.1, 2.1, 2.4, 3.1, 3.3_

  - [ ] 8.2 Final validation and cleanup
    - Run complete build process to ensure no compilation errors
    - Run full test suite to ensure all functionality is preserved
    - Run linting to ensure code quality standards are met
    - Verify Storybook works with all components
    - Clean up any temporary files or unused imports
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 5.1, 5.2, 5.3, 5.4_
