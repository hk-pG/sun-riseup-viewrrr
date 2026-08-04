# Graph Report - sun-riseup-viewrrr  (2026-07-26)

## Corpus Check
- 230 files · ~175,322 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1430 nodes · 2396 edges · 86 communities (66 shown, 20 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 134 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f0318baa`
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
- Image Container Trait
- Sidebar Scroll Layout Spec
- Local Folder Container
- Image Viewer UI
- Windows Store Square Logos
- Keyboard Shortcut Handling
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
- Rust Thumbnail Optimization
- Tauri Capability Permissions
- Test Fixtures Folder 2
- Test Fixtures Folder 3 Digits
- Nested Folder 4 Fixtures
- Thumbnail Types Frontend
- Test Fixtures Folder 1
- Desktop App Icon Sizes
- SpecKit Feature Branch Script
- ImageContainer Refactor Docs
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
- Specification Quality Checklist: Replace Theme Provider with shadcn/ui Version
- Specification Quality Checklist: Rust Backend Thumbnail Optimization
- post-commit
- post-checkout

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
- `CI jobs: lint, frontend-test, backend-test` --semantically_similar_to--> `Quality gate (type-check, lint, test)`  [INFERRED] [semantically similar]
  .github/workflows/ci.yml → AGENTS.md
- `sun-riseup-viewrrr image viewer app` --semantically_similar_to--> `Feature-based architecture (src/features/)`  [INFERRED] [semantically similar]
  README.md → AGENTS.md
- `FileSystemService abstraction` --semantically_similar_to--> `useServices() DI for Tauri APIs`  [INFERRED] [semantically similar]
  .github/copilot-instructions.md → AGENTS.md
- `Frontend Feature Layout` --semantically_similar_to--> `Feature-Based Architecture`  [INFERRED] [semantically similar]
  docs/frontend-architecture-analysis.md → .specify/memory/constitution.md
- `Thumbnail Prefetch Without Cache Check` --conceptually_related_to--> `prefetch_folder_thumbnails`  [INFERRED]
  src-tauri/core_logic/docs/todo.md → docs/specs/016-thumbnail-backend-responsibility/spec.md

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

## Hyperedges (group relationships)
- **SpecKit pipeline: specify → clarify → plan → tasks → analyze → implement** — _github_prompts_speckit_specify_prompt, _github_prompts_speckit_clarify_prompt, _github_prompts_speckit_plan_prompt, _github_prompts_speckit_tasks_prompt, _github_prompts_speckit_analyze_prompt, _github_prompts_speckit_implement_prompt [INFERRED 0.85]
- **Issue lifecycle: start → finish → review** — _github_prompts_issue_start_prompt, _github_prompts_issue_finish_prompt, _github_prompts_review_request_prompt [INFERRED 0.95]
- **Quality enforcement across agents, finish workflow, and CI** — agents_quality_gate, _github_prompts_issue_finish_prompt_pr_workflow, _github_workflows_ci_jobs [INFERRED 0.85]
- **ADR-002 Lazy Archive Migration Cluster** — docs_adr_002_lazy_archive_extraction_lazy_archive_extraction, docs_adr_002_lazy_archive_extraction_two_phase_container_api, docs_adr_002_todo_milestone_true_lazy_loading, docs_archive_support_decision_list_archive_mvp_scope [EXTRACTED 1.00]
- **Manual Memoization Removal SpecKit Cluster** — docs_specs_001_remove_manual_memoization_spec_remove_manual_memoization, docs_specs_001_remove_manual_memoization_research_react_compiler, docs_specs_001_remove_manual_memoization_data_model_useopenimagefile, docs_specs_001_remove_manual_memoization_data_model_usekeyboardhandler, docs_specs_001_remove_manual_memoization_data_model_usecontrolsvisibility, docs_specs_001_remove_manual_memoization_data_model_sidebar [EXTRACTED 1.00]
- **Testing and Mock Modernization Cluster** — docs_testing_strategy_2026_05_container_first_testing, docs_testing_strategy_2026_05_mock_centralization, docs_test_mock_refactor_todo_mock_factory_unification, docs_vitest4_mock_type_migration_vi_fn_generic, _specify_memory_constitution_test_pyramid [INFERRED 0.85]
- **Theme Provider Migration Core Entities** — docs_specs_001_replace_theme_provider_spec_themeprovider, docs_specs_001_replace_theme_provider_data_model_theme, docs_specs_001_replace_theme_provider_spec_usetheme, docs_specs_001_replace_theme_provider_research_system_theme_removal, docs_specs_001_replace_theme_provider_data_model_localstorage_persistence [EXTRACTED 1.00]
- **Rust Thumbnail Generation Pipeline** — docs_specs_001_rust_thumbnail_optimization_data_model_imagefile, docs_specs_001_rust_thumbnail_optimization_spec_generationtask, docs_specs_001_rust_thumbnail_optimization_spec_thumbnail, docs_specs_001_rust_thumbnail_optimization_spec_thumbnailcache, docs_specs_001_rust_thumbnail_optimization_contracts_get_or_create_thumbnail [EXTRACTED 1.00]
- **React Security Patch Upgrade Phases** — docs_specs_002_react_security_patch_data_model_react_19_1_4, docs_specs_002_react_security_patch_research_react_compiler_1_0_0, docs_specs_002_react_security_patch_tasks_testing_library_16_3_1, docs_specs_002_react_security_patch_plan_phased_upgrade, docs_specs_002_react_security_patch_spec_cve_2025_55182 [EXTRACTED 1.00]
- **Sidebar-Viewer Independent Scroll Layout Model** — docs_specs_003_fix_sidebar_scroll_data_model_layoutcontainer, docs_specs_003_fix_sidebar_scroll_data_model_sidebarpane, docs_specs_003_fix_sidebar_scroll_data_model_viewerpane, docs_specs_003_fix_sidebar_scroll_research_flex_min_height_0 [EXTRACTED 1.00]
- **Folder Thumbnail Backend Responsibility API** — docs_specs_016_thumbnail_backend_responsibility_spec_get_folder_thumbnail, docs_specs_016_thumbnail_backend_responsibility_spec_prefetch_folder_thumbnails, docs_specs_016_thumbnail_backend_responsibility_spec_folder_thumbnail_result, docs_specs_016_thumbnail_backend_responsibility_spec_filesystemservice [EXTRACTED 1.00]
- **Image Container Refactor Design Phase Concerns** — src_tauri_core_logic_docs_refactor_image_container_commanderror_dual, src_tauri_core_logic_docs_refactor_image_container_imagecontainerservice, src_tauri_core_logic_docs_refactor_image_container_imagecontainer_trait, src_tauri_core_logic_docs_refactor_image_container_get_sibling_containers [EXTRACTED 1.00]
- **App brand icon family (sunrise + open book motif across sizes)** — logo_brand_master_logo, src_tauri_icons_128x128_app_icon_128, src_tauri_icons_128x128_2x_app_icon_retina, src_tauri_icons_32x32_app_icon_32, src_tauri_icons_64x64_app_icon_64, src_tauri_icons_square107x107logo_windows_tile_logo [INFERRED 0.95]
- **Tauri desktop icon size variants (32/64/128/@2x)** — src_tauri_icons_32x32_app_icon_32, src_tauri_icons_64x64_app_icon_64, src_tauri_icons_128x128_app_icon_128, src_tauri_icons_128x128_2x_app_icon_retina [EXTRACTED 1.00]
- **Public web toolchain brand assets (Tauri + Vite + app master)** — logo_brand_master_logo, public_tauri_tauri_framework_logo, public_vite_vite_bundler_logo [INFERRED 0.65]
- **Windows Store Square Logo Size Set** — src_tauri_icons_square30x30logo, src_tauri_icons_square44x44logo, src_tauri_icons_square71x71logo, src_tauri_icons_square89x89logo, src_tauri_icons_square142x142logo, src_tauri_icons_square150x150logo, src_tauri_icons_square284x284logo, src_tauri_icons_square310x310logo [EXTRACTED 1.00]
- **sun-riseup-viewrrr Brand Motifs** — src_tauri_icons_square310x310logo_rising_sun, src_tauri_icons_square310x310logo_open_book, src_tauri_icons_square310x310logo_dawn_stars, src_tauri_icons_square310x310logo_brand_sun_riseup_viewrrr [EXTRACTED 1.00]
- **Android hdpi launcher icon set** — src_tauri_icons_android_mipmap_hdpi_ic_launcher, src_tauri_icons_android_mipmap_hdpi_ic_launcher_foreground, src_tauri_icons_android_mipmap_hdpi_ic_launcher_round [EXTRACTED 1.00]
- **Android mdpi launcher icon set** — src_tauri_icons_android_mipmap_mdpi_ic_launcher, src_tauri_icons_android_mipmap_mdpi_ic_launcher_foreground, src_tauri_icons_android_mipmap_mdpi_ic_launcher_round [EXTRACTED 1.00]
- **Cross-density sun-book launcher branding** — src_tauri_icons_storelogo, src_tauri_icons_android_mipmap_hdpi_ic_launcher, src_tauri_icons_android_mipmap_mdpi_ic_launcher, src_tauri_icons_android_mipmap_xhdpi_ic_launcher [INFERRED 0.95]
- **Android mipmap density ladder (xhdpi–xxxhdpi)** — src_tauri_icons_android_mipmap_xhdpi_ic_launcher_foreground_mipmap_xhdpi_density, src_tauri_icons_android_mipmap_xxhdpi_ic_launcher_mipmap_xxhdpi_density, src_tauri_icons_android_mipmap_xxxhdpi_ic_launcher_mipmap_xxxhdpi_density [EXTRACTED 1.00]
- **Android launcher icon layer set (foreground/composite/round)** — src_tauri_icons_android_mipmap_xxhdpi_ic_launcher_foreground_adaptive_foreground_layer, src_tauri_icons_android_mipmap_xxhdpi_ic_launcher_legacy_composite_launcher, src_tauri_icons_android_mipmap_xxhdpi_ic_launcher_round_round_mask_variant [EXTRACTED 1.00]
- **xxxhdpi launcher asset triplet** — src_tauri_icons_android_mipmap_xxxhdpi_ic_launcher, src_tauri_icons_android_mipmap_xxxhdpi_ic_launcher_foreground, src_tauri_icons_android_mipmap_xxxhdpi_ic_launcher_round [EXTRACTED 1.00]
- **iOS 20pt Notification AppIcon Scale Set** — src_tauri_icons_ios_appicon_20x20_1x_notification_20pt_1x, src_tauri_icons_ios_appicon_20x20_2x_notification_20pt_2x, src_tauri_icons_ios_appicon_20x20_2x_1_notification_20pt_2x_ipad, src_tauri_icons_ios_appicon_20x20_3x_notification_20pt_3x, src_tauri_icons_ios_appicon_20x20_1x_role_ios_notification_20pt [EXTRACTED 1.00]
- **iOS 29pt Settings AppIcon Scale Set** — src_tauri_icons_ios_appicon_29x29_1x_settings_29pt_1x, src_tauri_icons_ios_appicon_29x29_2x_settings_29pt_2x, src_tauri_icons_ios_appicon_29x29_2x_1_settings_29pt_2x_ipad, src_tauri_icons_ios_appicon_29x29_1x_role_ios_settings_29pt [EXTRACTED 1.00]
- **sun-riseup-viewrrr Brand Icon Set (Master + iOS)** — src_tauri_icons_icon_master_app_icon, src_tauri_icons_icon_brand_rising_sun, src_tauri_icons_icon_brand_open_book, src_tauri_icons_ios_appicon_20x20_1x_notification_20pt_1x, src_tauri_icons_ios_appicon_29x29_1x_settings_29pt_1x [INFERRED 0.85]
- **iOS AppIcon size/scale asset set** — src_tauri_icons_ios_appicon_29x29_3x, src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_appicon_512_2x, src_tauri_icons_ios_appicon_60x60_2x, src_tauri_icons_ios_appicon_60x60_3x [EXTRACTED 1.00]
- **AppIcon 40x40 scale family (@1x/@2x/@3x)** — src_tauri_icons_ios_appicon_40x40_1x, src_tauri_icons_ios_appicon_40x40_2x, src_tauri_icons_ios_appicon_40x40_2x_1, src_tauri_icons_ios_appicon_40x40_3x, src_tauri_icons_ios_size_40x40 [EXTRACTED 1.00]
- **iOS AppIcon resolution variants (sunrise book brand)** — src_tauri_icons_ios_appicon_76x76_1x, src_tauri_icons_ios_appicon_76x76_2x, src_tauri_icons_ios_appicon_83_5x83_5_2x [INFERRED 0.95]
- **folder_1 test fixtures for image viewer folder navigation** — tests_fixtures_images_folder_1_1_1, tests_fixtures_images_folder_1_1_2, tests_fixtures_images_folder_1_1_3, tests_fixtures_images_folder_1_1_10 [EXTRACTED 1.00]
- **folder_1 numbered navigation test sequence** — tests_fixtures_images_folder_1_1_4, tests_fixtures_images_folder_1_1_5, tests_fixtures_images_folder_1_1_6, tests_fixtures_images_folder_1_1_7, tests_fixtures_images_folder_1_1_8, tests_fixtures_images_folder_1_1_9 [EXTRACTED 1.00]
- **folder_3 numbered test fixture sequence (digits 1–7, 10)** — tests_fixtures_images_folder_3_3_1, tests_fixtures_images_folder_3_3_2, tests_fixtures_images_folder_3_3_3, tests_fixtures_images_folder_3_3_4, tests_fixtures_images_folder_3_3_5, tests_fixtures_images_folder_3_3_6, tests_fixtures_images_folder_3_3_7, tests_fixtures_images_folder_3_3_10 [EXTRACTED 1.00]
- **folder_4 nested under folder_3 navigation fixtures** — tests_fixtures_images_folder_3_folder_4_4_1, tests_fixtures_images_folder_3_folder_4_4_2, tests_fixtures_images_folder_3_folder_4_4_3, tests_fixtures_images_folder_3_folder_4_4_4, tests_fixtures_images_folder_3_folder_4_4_5, tests_fixtures_images_folder_3_folder_4_4_10 [EXTRACTED 1.00]
- **folder_3 + nested folder_4 navigation test set** — tests_fixtures_images_folder_3_3_8, tests_fixtures_images_folder_3_3_9, tests_fixtures_images_folder_3_folder_4_4_1, tests_fixtures_images_folder_3_folder_4_4_2, tests_fixtures_images_folder_3_folder_4_4_3, tests_fixtures_images_folder_3_folder_4_4_4, tests_fixtures_images_folder_3_folder_4_4_5, tests_fixtures_images_folder_3_folder_4_4_10 [INFERRED 0.85]
- **folder_4 nested digit fixtures 6-9** — tests_fixtures_images_folder_3_folder_4_4_6, tests_fixtures_images_folder_3_folder_4_4_7, tests_fixtures_images_folder_3_folder_4_4_8, tests_fixtures_images_folder_3_folder_4_4_9 [INFERRED 0.85]

## Communities (86 total, 20 thin omitted)

### Community 0 - "UI Tooltip & Dev Mocks"
Cohesion: 0.10
Nodes (29): App(), TooltipContent, FolderList(), FolderListLoadMore(), FolderListLoadMoreProps, mockThumbnailIdle(), mockThumbnailIdle(), TODO: 状態の変更がある場合はactでラップする必要がある場合がある (+21 more)

### Community 1 - "Agent Workflows & Architecture Docs"
Cohesion: 0.06
Nodes (46): grill-me skill, Design stress-test interview, Copilot instructions, Branch hierarchy main ← feature/core ← issue branches, Conventional Commits (Japanese messages), App data flow (actions → useServices → setState/SWR), FileSystemService abstraction, State management (useState, SWR, Context, useTransition) (+38 more)

### Community 2 - "Frontend Runtime Dependencies"
Cohesion: 0.04
Nodes (47): class-variance-authority, clsx, lucide-react, next-themes, dependencies, class-variance-authority, clsx, lucide-react (+39 more)

### Community 3 - "App Menu & Folder Navigation"
Cohesion: 0.15
Nodes (26): AppMenuBar(), fileMenu, MenuItemData, renderMenuItems(), viewMenu, Button(), buttonVariants, Menubar() (+18 more)

### Community 4 - "DevTooling Dependencies"
Cohesion: 0.04
Nodes (45): babel-plugin-react-compiler, @biomejs/biome, @commitlint/cli, @commitlint/config-conventional, globals, husky, jsdom, devDependencies (+37 more)

### Community 5 - "Action Registry Pattern"
Cohesion: 0.05
Nodes (58): React, AppState, createActionRegistry(), openFolderAction(), openImageAction(), toggleThemeAction(), ActionDependencies, ActionRegistry (+50 more)

### Community 6 - "Biome Lint Config"
Cohesion: 0.05
Nodes (44): source, assist, actions, css, formatter, parser, files, ignoreUnknown (+36 more)

### Community 7 - "App Shell State"
Cohesion: 0.05
Nodes (29): APP_VIEWER_CONTAINER_CONFIG, TODO: 状態管理が複雑化している。appStateでの管理に無理が生じ始めている。, TODO: App.tsx自体が肥大化してきている。状態管理とUIロジックの分離を検討。, ErrorBoundary, Props, State, initialState, Theme (+21 more)

### Community 8 - "Biome Recommended Rules"
Cohesion: 0.05
Nodes (39): recommended, useKeyWithClickEvents, useKeyWithMouseEvents, noAdjacentSpacesInRegex, noExtraBooleanCast, noUselessCatch, noUselessTypeConstraint, recommended (+31 more)

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

### Community 18 - "Image Container Trait"
Cohesion: 0.08
Nodes (54): Box, Q, get_sibling_containers(), list_image_handles(), list_images_in_container(), resolve_images_in_range(), ImageHandle, P (+46 more)

### Community 19 - "Sidebar Scroll Layout Spec"
Cohesion: 0.08
Nodes (26): 003 Spec Quality Checklist Ready, 003 Contracts UI Layout Only No New APIs, LayoutContainer, SidebarPane, ViewerPane, Sidebar and Viewer Scroll Fix Plan, Sidebar Scroll Quickstart CSS Layout Steps, Flex Layout with min-height:0 Decision (+18 more)

### Community 21 - "Local Folder Container"
Cohesion: 0.06
Nodes (45): KeyboardShortcutHelp(), KeyboardShortcutHelpProps, ContainerConfig, DEFAULT_CONTAINER_CONFIG, isImageHandle(), isImageHandleArray(), LocalFolderContainer, normalizeChunkSize() (+37 more)

### Community 22 - "Image Viewer UI"
Cohesion: 0.05
Nodes (42): 1.1. サムネイル生成ロジック, 1.2. Tauriコマンドの追加, 1.3. コマンドの登録, 1. ブランチのチェックアウト, 2.1. FileSystemServiceの拡張, 2.2. Tauriアダプターの実装, 2.3. useThumbnailフックの更新, 2. 依存関係のインストール (+34 more)

### Community 24 - "Windows Store Square Logos"
Cohesion: 0.12
Nodes (22): Square142x142Logo Windows Store Asset, Medium Tile Scaled Variant (142x142), Square150x150Logo Windows Store Asset, Medium Start Tile (150x150), Square284x284Logo Windows Store Asset, Large Tile Scaled Variant (284x284), Square30x30Logo Windows Store Asset, Small List / Compact Chrome Logo (30x30) (+14 more)

### Community 25 - "Keyboard Shortcut Handling"
Cohesion: 0.11
Nodes (18): Phase 4 手動テスト - チェックリスト, T037: 初回ロード性能テスト, T038: UI応答性テスト, T039: キャッシュ再利用テスト, キャッシュ確認, スクリーンショット・ログ, パフォーマンス, 事前準備 (+10 more)

### Community 27 - "shadcn Components Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 28 - "Archive Listing Logic"
Cohesion: 0.08
Nodes (38): R, ArchiveImageContainer, ArchiveImageEntry, get_zip_entries_without_extracting(), is_supported_archive_image_path(), lists_entries_from_fixture_zip_without_extracting(), lists_handles_without_extracting_archive(), resolve_range_reuses_cached_files() (+30 more)

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

### Community 40 - "Rust Thumbnail Optimization"
Cohesion: 0.18
Nodes (11): get_or_create_thumbnail, ImageFile, useThumbnail, 001-rust-thumbnail-optimization, FileSystemService, WebKitGTK Image Decode Bottleneck, BLAKE3 Cache Hash, rayon Parallel Processing (+3 more)

### Community 41 - "Tauri Capability Permissions"
Cohesion: 0.18
Nodes (10): core:default, dialog:default, fs:default, main, opener:default, description, identifier, permissions (+2 more)

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

## Ambiguous Edges - Review These
- `Quality gate (type-check, lint, test)` → `Project constitution (.specify/memory/constitution.md)`  [AMBIGUOUS]
  AGENTS.md · relation: rationale_for

## Knowledge Gaps
- **476 isolated node(s):** `common.sh script`, `create-new-feature.sh script`, `SPECIFY_FEATURE`, `$schema`, `enabled` (+471 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Quality gate (type-check, lint, test)` and `Project constitution (.specify/memory/constitution.md)`?**
  _Edge tagged AMBIGUOUS (relation: rationale_for) - confidence is low._
- **Why does `React` connect `Action Registry Pattern` to `UI Tooltip & Dev Mocks`, `App Menu & Folder Navigation`, `Biome Lint Config`, `App Shell State`, `Local Folder Container`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `globals` connect `Biome Lint Config` to `Action Registry Pattern`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `common.sh script`, `create-new-feature.sh script`, `SPECIFY_FEATURE` to the rest of the system?**
  _476 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Tooltip & Dev Mocks` be split into smaller, more focused modules?**
  _Cohesion score 0.09647058823529411 - nodes in this community are weakly interconnected._
- **Should `Agent Workflows & Architecture Docs` be split into smaller, more focused modules?**
  _Cohesion score 0.058279370952821465 - nodes in this community are weakly interconnected._
- **Should `Frontend Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._