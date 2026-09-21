# Graph Report - sun-riseup-viewrrr  (2026-08-04)

## Corpus Check
- 231 files · ~170,102 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1443 nodes · 2405 edges · 99 communities (79 shown, 20 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `048f54a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- UI Tooltip & Dev Mocks
- Agent Workflows & Architecture Docs
- Frontend Runtime Dependencies
- App Menu & Folder Navigation
- DevTooling Dependencies
- Action Registry Pattern
- Biome Lint Config
- App Shell State
- Biome Recommended Rules
- Rust Test Helpers
- Thumbnail Container Rust
- SpecKit Prerequisite Scripts
- Thumbnail Batch Pipeline
- Architecture ADRs & DI
- Package Scripts & Engines
- Tauri App Icon Config
- TypeScript Compiler Config
- app-shell/index.ts
- Image Container Trait
- Sidebar Scroll Layout Spec
- mocks.ts
- Local Folder Container
- Image Viewer UI
- FileSystemService
- Windows Store Square Logos
- Keyboard Shortcut Handling
- folder.rs
- shadcn Components Config
- Archive Listing Logic
- Filesystem Service Rust
- Vitest TypeScript Config
- Theme Provider Spec
- iOS AppIcon Size Set
- Android High-DPI Icons
- Android hdpi/mdpi Icons
- Brand Motif & Master Icon
- Thumbnail Config Validation
- Vite Node TS Config
- Dev Strict TS Config
- src/fs.rs
- Rust Thumbnail Optimization
- Tauri Capability Permissions
- mockService.ts
- Test Fixtures Folder 2
- Test Fixtures Folder 3 Digits
- Nested Folder 4 Fixtures
- Thumbnail Types Frontend
- Test Fixtures Folder 1
- Desktop App Icon Sizes
- SpecKit Feature Branch Script
- ImageContainer Refactor Docs
- useSiblingContainers.ts
- React Security Patch Spec
- Folder 1 Fixture Digits
- Folder 4 Orange Digits
- Tauri Log Config
- Theme Context Types
- iOS iPad App Icons
- System Theme Removal
- Rust Image Crate Module
- Pre-commit Hook Script
- HTML Vite Entry
- Tauri Vite Brand Logos
- macOS Cache Clear Script
- Phase4 Test Data Script
- macOS Cache Dir Script
- macOS Log Dir Script
- macOS View Log Script
- Container Config Types
- Idea Issue Template
- No useTransition Pitfall
- Agent File Template
- SpecKit Checklist Template
- SpecKit Spec Template
- SpecKit Tasks Template
- React Logo Asset
- Implementation Steps
- Sidebar.tsx
- folder-navigation/index.ts
- Specification Quality Checklist: Replace Theme Provider with shadcn/ui Version
- Specification Quality Checklist: Rust Backend Thumbnail Optimization
- post-commit
- post-checkout
- ImageContainerReaderConfig
- Review Unit Tests
- hash_path
- CommandError

## God Nodes (most connected - your core abstractions)
1. `CommandError` - 35 edges
2. `FileSystemService` - 32 edges
3. `React` - 26 edges
4. `compilerOptions` - 20 edges
5. `ImageSource` - 19 edges
6. `scripts` - 18 edges
7. `cn()` - 17 edges
8. `TempTestDir` - 16 edges
9. `get_sibling_containers()` - 14 edges
10. `ThumbnailGenerator` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Quality gate (type-check, lint, test)` --semantically_similar_to--> `CI jobs: lint, frontend-test, backend-test`  [INFERRED] [semantically similar]
  AGENTS.md → .github/workflows/ci.yml
- `Feature-based architecture (src/features/)` --semantically_similar_to--> `sun-riseup-viewrrr image viewer app`  [INFERRED] [semantically similar]
  AGENTS.md → README.md
- `useServices() DI for Tauri APIs` --semantically_similar_to--> `FileSystemService abstraction`  [INFERRED] [semantically similar]
  AGENTS.md → .github/copilot-instructions.md
- `Feature-Based Architecture` --semantically_similar_to--> `Frontend Feature Layout`  [INFERRED] [semantically similar]
  .specify/memory/constitution.md → docs/frontend-architecture-analysis.md
- `prefetch_folder_thumbnails` --conceptually_related_to--> `Thumbnail Prefetch Without Cache Check`  [INFERRED]
  docs/specs/016-thumbnail-backend-responsibility/spec.md → src-tauri/core_logic/docs/todo.md

## Import Cycles
- 3-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 3-file cycle: `src/features/folder-navigation/hooks/useThumbnailPrefetch.ts -> src/shared/context/ServiceContext.tsx -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useThumbnailPrefetch.ts`
- 3-file cycle: `src/features/folder-navigation/hooks/useSiblingContainers.ts -> src/shared/context/ServiceContext.tsx -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useSiblingContainers.ts`
- 3-file cycle: `src/features/folder-navigation/hooks/useThumbnail.ts -> src/shared/context/ServiceContext.tsx -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useThumbnail.ts`
- 3-file cycle: `src/features/image-viewer/components/ImageViewer.tsx -> src/shared/hooks/data/useImages.ts -> src/features/image-viewer/index.ts -> src/features/image-viewer/components/ImageViewer.tsx`
- 4-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/index.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 4-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/hooks/useAppActions.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 4-file cycle: `src/features/folder-navigation/hooks/useThumbnailPrefetch.ts -> src/shared/context/ServiceContext.tsx -> src/shared/adapters/tauriAdapters.ts -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useThumbnailPrefetch.ts`
- 4-file cycle: `src/features/folder-navigation/hooks/useSiblingContainers.ts -> src/features/folder-navigation/services/getSiblingContainers.ts -> src/shared/index.ts -> src/shared/types/FolderSortFunction.ts -> src/features/folder-navigation/hooks/useSiblingContainers.ts`
- 4-file cycle: `src/features/folder-navigation/index.ts -> src/features/folder-navigation/services/getSiblingContainers.ts -> src/shared/index.ts -> src/shared/adapters/tauriAdapters.ts -> src/features/folder-navigation/index.ts`
- 4-file cycle: `src/features/folder-navigation/index.ts -> src/features/folder-navigation/services/getSiblingContainers.ts -> src/shared/index.ts -> src/shared/context/ServiceContext.tsx -> src/features/folder-navigation/index.ts`
- 4-file cycle: `src/features/folder-navigation/components/FolderView.tsx -> src/features/folder-navigation/hooks/useThumbnail.ts -> src/shared/context/ServiceContext.tsx -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/components/FolderView.tsx`
- 4-file cycle: `src/features/folder-navigation/hooks/useSiblingContainers.ts -> src/shared/context/ServiceContext.tsx -> src/shared/adapters/tauriAdapters.ts -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useSiblingContainers.ts`
- 4-file cycle: `src/features/folder-navigation/hooks/useThumbnail.ts -> src/shared/context/ServiceContext.tsx -> src/shared/adapters/tauriAdapters.ts -> src/features/folder-navigation/index.ts -> src/features/folder-navigation/hooks/useThumbnail.ts`
- 5-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/index.ts -> src/features/app-shell/actions/actionRegistry.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 5-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/index.ts -> src/features/app-shell/actions/openFolderAction.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 5-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/index.ts -> src/features/app-shell/actions/openImageAction.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 5-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/actions/index.ts -> src/features/app-shell/actions/toggleThemeAction.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 5-file cycle: `src/App.tsx -> src/features/app-shell/index.ts -> src/features/app-shell/hooks/useAppActions.ts -> src/features/app-shell/actions/actionRegistry.ts -> src/features/app-shell/actions/types.ts -> src/App.tsx`
- 5-file cycle: `src/features/folder-navigation/hooks/useSiblingContainers.ts -> src/features/folder-navigation/services/getSiblingContainers.ts -> src/shared/index.ts -> src/shared/utils/folderSort.ts -> src/shared/types/FolderSortFunction.ts -> src/features/folder-navigation/hooks/useSiblingContainers.ts`

## Communities (99 total, 20 thin omitted)

### Community 0 - "UI Tooltip & Dev Mocks"
Cohesion: 0.26
Nodes (11): FolderList(), FolderListLoadMore(), FolderListLoadMoreProps, mockThumbnailIdle(), mockThumbnailIdle(), FolderView(), ContainerConfig, useThumbnail() (+3 more)

### Community 1 - "Agent Workflows & Architecture Docs"
Cohesion: 0.06
Nodes (46): grill-me skill, Design stress-test interview, Copilot instructions, Branch hierarchy main ← feature/core ← issue branches, Conventional Commits (Japanese messages), App data flow (actions → useServices → setState/SWR), FileSystemService abstraction, State management (useState, SWR, Context, useTransition) (+38 more)

### Community 2 - "Frontend Runtime Dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, lucide-react, next-themes, dependencies, class-variance-authority, clsx, lucide-react (+39 more)

### Community 3 - "App Menu & Folder Navigation"
Cohesion: 0.14
Nodes (26): AppMenuBar(), AppMenuBarProps, fileMenu, renderMenuItems(), viewMenu, Button(), buttonVariants, Menubar() (+18 more)

### Community 4 - "DevTooling Dependencies"
Cohesion: 0.04
Nodes (45): babel-plugin-react-compiler, @biomejs/biome, @commitlint/cli, @commitlint/config-conventional, globals, husky, jsdom, devDependencies (+37 more)

### Community 5 - "Action Registry Pattern"
Cohesion: 0.14
Nodes (27): AppState, createActionRegistry(), openFolderAction(), openImageAction(), toggleThemeAction(), ActionDependencies, ActionRegistry, ActionResult (+19 more)

### Community 6 - "Biome Lint Config"
Cohesion: 0.06
Nodes (42): source, assist, actions, css, formatter, parser, files, ignoreUnknown (+34 more)

### Community 7 - "App Shell State"
Cohesion: 0.12
Nodes (10): initialState, Theme, ThemeProvider(), ThemeProviderContext, ThemeProviderProps, ThemeProviderState, ThemeToggle(), SmoothInteractionCoordinator (+2 more)

### Community 8 - "Biome Recommended Rules"
Cohesion: 0.05
Nodes (41): recommended, useKeyWithClickEvents, useKeyWithMouseEvents, noAdjacentSpacesInRegex, noExtraBooleanCast, noUselessCatch, noUselessTypeConstraint, recommended (+33 more)

### Community 9 - "Rust Test Helpers"
Cohesion: 0.04
Nodes (46): Contact & Support, CVE確認, Next Steps, Overview, Phase 1: Security Patch（必須）, Phase 2: React Compiler Stable（推奨）, Phase 3: Testing Library Update（推奨）, Phase 4: Latest Stable（オプション） (+38 more)

### Community 10 - "Thumbnail Container Rust"
Cohesion: 0.09
Nodes (31): AsRef, File, FolderThumbnailResult, get_first_image_in_container(), Option, Path, Result, String (+23 more)

### Community 11 - "SpecKit Prerequisite Scripts"
Cohesion: 0.11
Nodes (22): check-prerequisites.sh script, check_dir(), check_feature_branch(), check_file(), get_feature_paths(), has_git(), common.sh script, setup-plan.sh script (+14 more)

### Community 12 - "Thumbnail Batch Pipeline"
Cohesion: 0.10
Nodes (24): Arc, FolderThumbnailResult, ImageError, BatchResult, BatchTask, BatchThumbnailGenerator, Option, PathBuf (+16 more)

### Community 13 - "Architecture ADRs & DI"
Cohesion: 0.06
Nodes (33): Dependency Injection via useServices, Feature-Based Architecture, Quality Gates, Test Pyramid Strategy, SpecKit Plan Constitution Check Gate, ActionDependencies vs ResultApplier Split, ActionResult Discriminated Union, ADR-001 Action Result Pattern (+25 more)

### Community 14 - "Package Scripts & Engines"
Cohesion: 0.07
Nodes (29): engines, node, name, pnpm, onlyBuiltDependencies, private, scripts, build (+21 more)

### Community 15 - "Tauri App Icon Config"
Cohesion: 0.07
Nodes (29): $CACHE/**, icons/128x128@2x.png, icons/128x128.png, icons/32x32.png, icons/icon.icns, icons/icon.ico, app, macOSPrivateApi (+21 more)

### Community 16 - "TypeScript Compiler Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2022, compilerOptions, allowImportingTsExtensions, exactOptionalPropertyTypes, isolatedModules, jsx (+18 more)

### Community 17 - "app-shell/index.ts"
Cohesion: 0.12
Nodes (18): SidebarProps, basenameImpl(), convertFileSrcImpl(), dirnameImpl(), mockBasename, mockConvertFileSrc, mockDialogOpen, mockDirname (+10 more)

### Community 18 - "Image Container Trait"
Cohesion: 0.20
Nodes (18): Box, get_sibling_containers(), ImageContainer, ImageContainerReader, ImageHandle, resolves_images_in_requested_range_for_folder(), returns_error_when_folder_not_found(), returns_error_when_path_has_no_parent() (+10 more)

### Community 19 - "Sidebar Scroll Layout Spec"
Cohesion: 0.08
Nodes (26): 003 Spec Quality Checklist Ready, 003 Contracts UI Layout Only No New APIs, LayoutContainer, SidebarPane, ViewerPane, Sidebar and Viewer Scroll Fix Plan, Sidebar Scroll Quickstart CSS Layout Steps, Flex Layout with min-height:0 Decision (+18 more)

### Community 20 - "mocks.ts"
Cohesion: 0.18
Nodes (10): App(), APP_VIEWER_CONTAINER_CONFIG, TODO: 状態管理が複雑化している。appStateでの管理に無理が生じ始めている。, TODO: App.tsx自体が肥大化してきている。状態管理とUIロジックの分離を検討。, ErrorBoundary, useTheme(), Toaster(), ToasterProps (+2 more)

### Community 21 - "Local Folder Container"
Cohesion: 0.07
Nodes (44): KeyboardShortcutHelp(), KeyboardShortcutHelpProps, DEFAULT_CONTAINER_CONFIG, isImageHandle(), isImageHandleArray(), LocalFolderContainer, normalizeChunkSize(), ImageFile (+36 more)

### Community 22 - "Image Viewer UI"
Cohesion: 0.05
Nodes (42): 1.1. サムネイル生成ロジック, 1.2. Tauriコマンドの追加, 1.3. コマンドの登録, 1. ブランチのチェックアウト, 2.1. FileSystemServiceの拡張, 2.2. Tauriアダプターの実装, 2.3. useThumbnailフックの更新, 2. 依存関係のインストール (+34 more)

### Community 23 - "FileSystemService"
Cohesion: 0.14
Nodes (9): mockFolders, useOpenImageFile(), fetchThumbnail(), FileSystemService, FolderThumbnailResult, servicesContext, ServicesProvider(), ServicesProviderProps (+1 more)

### Community 24 - "Windows Store Square Logos"
Cohesion: 0.12
Nodes (22): Square142x142Logo Windows Store Asset, Medium Tile Scaled Variant (142x142), Square150x150Logo Windows Store Asset, Medium Start Tile (150x150), Square284x284Logo Windows Store Asset, Large Tile Scaled Variant (284x284), Square30x30Logo Windows Store Asset, Small List / Compact Chrome Logo (30x30) (+14 more)

### Community 25 - "Keyboard Shortcut Handling"
Cohesion: 0.11
Nodes (18): Phase 4 手動テスト - チェックリスト, T037: 初回ロード性能テスト, T038: UI応答性テスト, T039: キャッシュ再利用テスト, キャッシュ確認, スクリーンショット・ログ, パフォーマンス, 事前準備 (+10 more)

### Community 26 - "folder.rs"
Cohesion: 0.22
Nodes (16): FolderImageContainer, get_sibling_archives(), get_sibling_folders(), is_supported_image_path(), list_image_paths_in_folder(), ImageContainer, ImageHandle, P (+8 more)

### Community 27 - "shadcn Components Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Archive Listing Logic"
Cohesion: 0.14
Nodes (26): R, ArchiveImageContainer, ArchiveImageEntry, get_zip_entries_without_extracting(), is_supported_archive_image_path(), lists_entries_from_fixture_zip_without_extracting(), lists_handles_without_extracting_archive(), resolve_range_reuses_cached_files() (+18 more)

### Community 29 - "Filesystem Service Rust"
Cohesion: 0.12
Nodes (26): Drop, P, Path, PathBuf, Self, Vec, TempTestDir, ZipTestEnv (+18 more)

### Community 30 - "Vitest TypeScript Config"
Cohesion: 0.12
Nodes (16): src/test/**/*, src/**/*.test.ts, src/**/*.test.tsx, src/__tests__/**/*, @testing-library/jest-dom, vitest.config.ts, vitest/globals, compilerOptions (+8 more)

### Community 31 - "Theme Provider Spec"
Cohesion: 0.12
Nodes (16): ThemeToggle, Theme localStorage Persistence, 001-replace-theme-provider, shadcn/ui Theme Provider, ThemeProvider, useTheme, package.json Dependencies, React 19.1.4 (+8 more)

### Community 32 - "iOS AppIcon Size Set"
Cohesion: 0.17
Nodes (16): AppIcon 29x29@3x (87px), AppIcon 40x40@1x (40px), AppIcon 40x40@2x (80px), AppIcon 40x40@2x-1 (80px), AppIcon 40x40@3x (120px), AppIcon 512@2x (1024px), AppIcon 60x60@2x (120px), AppIcon 60x60@3x (180px) (+8 more)

### Community 33 - "Android High-DPI Icons"
Cohesion: 0.26
Nodes (15): ic_launcher_foreground (xhdpi 216x216), mipmap-xhdpi density (~2.0x), ic_launcher_round (xhdpi 96x96), ic_launcher (xxhdpi 144x144), ic_launcher_foreground (xxhdpi 324x324), Adaptive icon foreground layer, Legacy composite launcher icon, mipmap-xxhdpi density (~3.0x) (+7 more)

### Community 34 - "Android hdpi/mdpi Icons"
Cohesion: 0.27
Nodes (14): Android hdpi launcher icon, Android density hdpi, Android hdpi adaptive foreground layer, Adaptive icon layers, Android hdpi round launcher icon, Android mdpi launcher icon, Android density mdpi, Android mdpi adaptive foreground layer (+6 more)

### Community 35 - "Brand Motif & Master Icon"
Cohesion: 0.23
Nodes (14): Brand Motif: Black Night Sky with White Sparkle Stars, Brand Motif: Open Book (cream pages, orange outline), Brand Palette: Black / Orange-Gold / Cream, Brand Motif: Rising Orange Sun with Rays, Master App Icon (512x512) — rising sun over open book, iOS AppIcon 20pt @1x (20x20) — Notification, iOS Icon Role: Notification (20pt), iOS AppIcon 20pt @2x alt (40x40) — Notification / iPad catalog (+6 more)

### Community 36 - "Thumbnail Config Validation"
Cohesion: 0.23
Nodes (8): Default, Result, Self, String, test_default_config(), test_validate_quality(), test_validate_size(), ThumbnailConfig

### Community 37 - "Vite Node TS Config"
Cohesion: 0.17
Nodes (11): ESNext, vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, lib, module, moduleResolution (+3 more)

### Community 38 - "Dev Strict TS Config"
Cohesion: 0.17
Nodes (11): **/*.stories.ts, **/*.stories.tsx, compilerOptions, exactOptionalPropertyTypes, noUncheckedIndexedAccess, noUnusedLocals, noUnusedParameters, extends (+3 more)

### Community 39 - "src/fs.rs"
Cohesion: 0.27
Nodes (16): Q, get_sibling_containers(), list_image_handles(), list_images_in_container(), resolve_images_in_range(), ImageHandle, P, Result (+8 more)

### Community 40 - "Rust Thumbnail Optimization"
Cohesion: 0.18
Nodes (11): get_or_create_thumbnail, ImageFile, useThumbnail, 001-rust-thumbnail-optimization, FileSystemService, WebKitGTK Image Decode Bottleneck, BLAKE3 Cache Hash, rayon Parallel Processing (+3 more)

### Community 41 - "Tauri Capability Permissions"
Cohesion: 0.18
Nodes (10): core:default, dialog:default, fs:default, main, opener:default, description, identifier, permissions (+2 more)

### Community 42 - "mockService.ts"
Cohesion: 0.15
Nodes (9): allFolderPaths, devMockService, dummyFolders, folderNameMap, imageFolders, generateDummyEmptyFolders(), getMockImageFolders(), mockImageSourcesByFolderPath (+1 more)

### Community 43 - "Test Fixtures Folder 2"
Cohesion: 0.18
Nodes (11): folder_2 test fixtures, Test fixture image 2-1 (digit 1, mint), Test fixture image 2-10 (digit 10, mint), Test fixture image 2-2 (numeral 2), Test fixture image 2-3 (numeral 3), Test fixture image 2-4 (numeral 4), Test fixture image 2-5 (numeral 5), Test fixture image 2-6 (numeral 6) (+3 more)

### Community 44 - "Test Fixtures Folder 3 Digits"
Cohesion: 0.25
Nodes (8): Fixture digit 1 (dark blue on light blue), Fixture digit 10 (dark blue on light blue), Fixture digit 2 (dark blue on light blue), Fixture digit 3 (dark blue on light blue), Fixture digit 4 (dark blue on light blue), Fixture digit 5 (dark blue on light blue), Fixture digit 6 (dark blue on light blue), Fixture digit 7 (dark blue on light blue)

### Community 45 - "Nested Folder 4 Fixtures"
Cohesion: 0.29
Nodes (8): Fixture digit 8 (folder_3, light-blue), Fixture digit 9 (folder_3, light-blue), Fixture digit 1 (nested folder_4, cream), Fixture digit 10 (nested folder_4, cream), Fixture digit 2 (nested folder_4, cream), Fixture digit 3 (nested folder_4, cream), Fixture digit 4 (nested folder_4, cream), Fixture digit 5 (nested folder_4, cream)

### Community 46 - "Thumbnail Types Frontend"
Cohesion: 0.29
Nodes (5): Thumbnail, ThumbnailConfig, ThumbnailError, ThumbnailErrorCode, ThumbnailGenerationTask

### Community 47 - "Test Fixtures Folder 1"
Cohesion: 0.29
Nodes (7): folder_1 test fixtures, Test fixture image 1-4 (digit 4, pink), Test fixture image 1-5 (digit 5, pink), Test fixture image 1-6 (digit 6, pink), Test fixture image 1-7 (digit 7, pink), Test fixture image 1-8 (digit 8, pink), Test fixture image 1-9 (digit 9, pink)

### Community 48 - "Desktop App Icon Sizes"
Cohesion: 0.60
Nodes (6): Sun Riseup Viewrrr Brand Master Logo (1024 SVG, sunrise behind open book), App Icon 128@2x Retina (same motif, hi-DPI), App Icon 128x128 (sunrise + open book, standard desktop), App Icon 32x32 (taskbar / window chrome, pixelated), App Icon 64x64 (mid-size UI / dock), Square107x107Logo (Windows Store / tile branding)

### Community 50 - "ImageContainer Refactor Docs"
Cohesion: 0.33
Nodes (6): CommandError Dual Definition Concern, get_sibling_containers Navigation Concern, ImageContainer Trait Granularity, ImageContainerService, Old list_images_in_container Coexistence, useImages Full Container Image Load

### Community 51 - "useSiblingContainers.ts"
Cohesion: 0.33
Nodes (6): createFolderEntry(), FolderEntry, getSiblingContainerEntries(), mockFileSystemService, FolderSortFunction, naturalFolderSort()

### Community 52 - "React Security Patch Spec"
Cohesion: 0.50
Nodes (4): React 19 Security Patch Spec Quality Checklist, CVE-2025-55182, No Application Code Changes Contract, react@19.1.4 Security Patch Contract

### Community 53 - "Folder 1 Fixture Digits"
Cohesion: 0.67
Nodes (4): Test fixture folder_1 image 1-1 (numeral 1 on pink), Test fixture folder_1 image 1-10 (numeral 10 on pink), Test fixture folder_1 image 1-2 (numeral 2 on pink), Test fixture folder_1 image 1-3 (numeral 3 on pink)

### Community 54 - "Folder 4 Orange Digits"
Cohesion: 0.67
Nodes (4): Orange digit 6 on pale yellow, Orange digit 7 on pale yellow, Orange digit 8 on pale yellow, Orange digit 9 on pale yellow

### Community 56 - "Theme Context Types"
Cohesion: 0.67
Nodes (3): ThemeSelector, Theme, ThemeContextType

### Community 57 - "iOS iPad App Icons"
Cohesion: 1.00
Nodes (3): iOS AppIcon 76x76@1x (sunrise over open book), iOS AppIcon 76x76@2x (sunrise over open book), iOS AppIcon 83.5x83.5@2x (sunrise over open book)

### Community 88 - "Implementation Steps"
Cohesion: 0.12
Nodes (16): Common Issues & Solutions, ✅ Functional Requirements, Implementation Steps, Phase 1: Prepare shadcn/ui Theme Provider (30 min), Phase 2: Update Import Paths (15 min), Phase 3: Remove resolvedTheme Usage (45 min), Phase 4: Simplify Theme Components (30 min), Phase 5: Update Tests (45 min) (+8 more)

### Community 89 - "Sidebar.tsx"
Cohesion: 0.42
Nodes (5): Sidebar(), SidebarContent(), SidebarContentProps, SidebarHeader(), SidebarHeaderProps

### Community 90 - "folder-navigation/index.ts"
Cohesion: 0.16
Nodes (10): React, Props, State, TooltipContent, SIDEBAR_CONFIG, SidebarConfig, useFolderListPagination(), NOTE: folders の参照安定性に依存。React Compiler が有効な場合は自動メモ化される。 (+2 more)

### Community 91 - "Specification Quality Checklist: Replace Theme Provider with shadcn/ui Version"
Cohesion: 0.33
Nodes (5): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Replace Theme Provider with shadcn/ui Version

### Community 92 - "Specification Quality Checklist: Rust Backend Thumbnail Optimization"
Cohesion: 0.33
Nodes (5): Content Quality, Feature Readiness, Notes, Requirement Completeness, Specification Quality Checklist: Rust Backend Thumbnail Optimization

### Community 93 - "post-commit"
Cohesion: 0.40
Nodes (4): post-commit script, GRAPHIFY_CHANGED, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 94 - "post-checkout"
Cohesion: 0.50
Nodes (3): post-checkout script, GRAPHIFY_REBUILD_LOG, PYTHONHASHSEED

### Community 95 - "ImageContainerReaderConfig"
Cohesion: 0.22
Nodes (7): ImageContainerReaderConfig, P, Path, PathBuf, Self, String, Vec

### Community 96 - "Review Unit Tests"
Cohesion: 0.12
Nodes (14): Pass 1 — 機能別並列レビュー＋削除, Pass 2 — 削除の第二意見ループ, Review Unit Tests, 低価値の典型パターン（削除候補）, 再利用の言い方, 報告フォーマット（Pass 1）, 大規模時のオーケストレーション, 手順（単ファイル〜小規模） (+6 more)

### Community 97 - "hash_path"
Cohesion: 0.47
Nodes (5): hash_path(), P, String, test_hash_path_consistency(), test_hash_path_uniqueness()

### Community 98 - "CommandError"
Cohesion: 0.50
Nodes (4): CommandError, Error, From, Self

## Ambiguous Edges - Review These
- `Quality gate (type-check, lint, test)` → `Project constitution (.specify/memory/constitution.md)`  [AMBIGUOUS]
  AGENTS.md · relation: rationale_for

## Knowledge Gaps
- **487 isolated node(s):** `common.sh script`, `create-new-feature.sh script`, `SPECIFY_FEATURE`, `$schema`, `enabled` (+482 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Quality gate (type-check, lint, test)` and `Project constitution (.specify/memory/constitution.md)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `React` connect `folder-navigation/index.ts` to `UI Tooltip & Dev Mocks`, `App Menu & Folder Navigation`, `Action Registry Pattern`, `Biome Lint Config`, `App Shell State`, `useSiblingContainers.ts`, `mocks.ts`, `Local Folder Container`, `FileSystemService`, `Sidebar.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `globals` connect `Biome Lint Config` to `folder-navigation/index.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `common.sh script`, `create-new-feature.sh script`, `SPECIFY_FEATURE` to the rest of the system?**
  _487 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Agent Workflows & Architecture Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.058279370952821465 - nodes in this community are weakly interconnected._
- **Should `Frontend Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `App Menu & Folder Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._