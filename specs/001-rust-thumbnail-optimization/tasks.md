# Tasks: Rust Backend Thumbnail Optimization

**Feature**: 001-rust-thumbnail-optimization  
**Input**: Design documents from `/specs/001-rust-thumbnail-optimization/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/typescript-api-contracts.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

---

## Task Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths follow Tauri hybrid architecture (src/ for frontend, src-tauri/ for backend)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [X] T001 Add Rust dependencies to src-tauri/core_logic/Cargo.toml (image 0.25, rayon 1.11, blake3 1.8, thiserror 2.0, num_cpus 1.16)
- [X] T002 [P] Verify dependencies build successfully with `cargo build` in src-tauri/
- [X] T003 [P] Create src-tauri/core_logic/src/thumbnail.rs module file with basic structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Rust Core Infrastructure

- [X] T004 Implement ThumbnailError enum with thiserror in src-tauri/core_logic/src/thumbnail.rs
- [X] T005 [P] Implement hash_path() function using blake3 in src-tauri/core_logic/src/thumbnail.rs
- [X] T006 [P] Implement ThumbnailConfig struct with Default trait in src-tauri/core_logic/src/thumbnail.rs
- [X] T007 Implement get_cache_dir() function using Tauri path API in src-tauri/src/commands/fs.rs
- [X] T008 [P] Export thumbnail module in src-tauri/core_logic/src/lib.rs

### TypeScript Service Layer Infrastructure

- [X] T009 Extend FileSystemService interface with getOrCreateThumbnail method in src/shared/context/ServiceContext.tsx
- [X] T010 [P] Add Thumbnail type to src/features/folder-navigation/types/folderTypes.ts (if not already exists)
- [X] T011 [P] Update mock FileSystemService with getOrCreateThumbnail in src/test/mocks.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Fast Thumbnail Display During Scroll (Priority: P1) 🎯 MVP

**Goal**: ユーザーが100フォルダをスクロールしてもカクつかず、サムネイルが即座に表示される

**Independent Test**: 100フォルダ（各5MB画像）で高速スクロール（1秒間に10-20件通過）し、60fps維持を確認。キャッシュからの再表示が100ms以内。

**Dependencies**: Phase 2 (Foundational) must be complete

### Rust Backend Implementation (US1)

- [X] T012 [P] [US1] Implement generate_thumbnail() function with image crate in src-tauri/core_logic/src/thumbnail.rs
- [X] T013 [P] [US1] Implement ThumbnailGenerator struct with Lanczos3 resize in src-tauri/core_logic/src/thumbnail.rs
- [X] T014 [US1] Implement get_or_create_thumbnail Tauri command in src-tauri/src/commands/fs.rs (depends on T012, T013)
- [X] T015 [US1] Add cache validation logic (check modified_time) in get_or_create_thumbnail command
- [X] T016 [US1] Register get_or_create_thumbnail command in src-tauri/src/lib.rs invoke_handler
- [X] T017 [US1] Add error handling for unsupported formats and decode errors in get_or_create_thumbnail

### TypeScript Frontend Integration (US1)

- [X] T018 [US1] Implement Tauri adapter for getOrCreateThumbnail in src/shared/adapters/tauriAdapters.ts
- [X] T019 [US1] Update useThumbnail hook to call new Tauri command in src/features/folder-navigation/hooks/useThumbnail.ts
- [X] T020 [US1] Configure SWR caching strategy (revalidateOnFocus: false, dedupingInterval: 60000) in useThumbnail
- [X] T021 [US1] Update FolderView component to use updated useThumbnail hook in src/features/folder-navigation/components/FolderView.tsx
- [X] T022 [US1] Add error boundary for thumbnail loading failures in FolderView component

### Manual Testing (US1)

- [ ] T023 [US1] Test with 100 folders (5MB images): Verify smooth 60fps scrolling on Linux (WebKitGTK)
- [ ] T024 [US1] Test cache hit performance: Scroll back to previous folders and verify <100ms display
- [ ] T025 [US1] Test cache invalidation: Modify source image and verify thumbnail regeneration

**Checkpoint**: At this point, User Story 1 should be fully functional - smooth scrolling with thumbnail display

---

## Phase 4: User Story 2 - Initial Folder Load Performance (Priority: P2)

**Goal**: 新規ディレクトリを開いた際、可視領域のサムネイルが2秒以内に表示され、バックグラウンドで全体生成が進行

**Independent Test**: 新規ディレクトリ（100フォルダ）を開き、可視領域10件が2秒以内に表示。UIの応答性を維持しながらバックグラウンド生成を確認。

**Dependencies**: Phase 3 (User Story 1) must be complete

### Parallel Processing Implementation (US2)

- [X] T026 [P] [US2] Implement rayon thread pool initialization with dynamic thread count in src-tauri/core_logic/src/thumbnail.rs
- [X] T027 [US2] Implement batch_create_thumbnails Tauri command using rayon parallel iterator in src-tauri/src/commands/fs.rs
- [X] T028 [US2] Add priority-based task scheduling (visible thumbnails first) in batch_create_thumbnails
- [X] T029 [US2] Register batch_create_thumbnails command in src-tauri/src/lib.rs invoke_handler

### TypeScript Batch Processing Integration (US2)

- [X] T030 [US2] Extend FileSystemService interface with batchCreateThumbnails method in src/shared/context/ServiceContext.tsx
- [X] T031 [US2] Implement Tauri adapter for batchCreateThumbnails in src/shared/adapters/tauriAdapters.ts
- [ ] T032 [US2] Update useThumbnail hook to support batch mode (optional optimization) in src/features/folder-navigation/hooks/useThumbnail.ts
- [ ] T033 [US2] Add batch prefetch logic for visible folders in Sidebar component in src/features/folder-navigation/components/Sidebar.tsx

### Background Processing & UI Responsiveness (US2)

- [X] T034 [US2] Wrap rayon tasks with tokio::spawn_blocking for non-blocking execution in batch_create_thumbnails
- [ ] T035 [US2] Add loading state UI for thumbnail generation progress in FolderView component
- [X] T036 [US2] Update mock service with batchCreateThumbnails in src/test/mocks.ts

### Manual Testing (US2)

- [ ] T037 [US2] Test initial load: Open 100-folder directory and verify first 10 thumbnails appear within 2 seconds
- [ ] T038 [US2] Test UI responsiveness: Verify app remains interactive during background thumbnail generation
- [ ] T039 [US2] Test cache reuse: Re-open same directory and verify instant load (<100ms for all cached thumbnails)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - fast scrolling + fast initial load

---

## Phase 5: User Story 3 - Cross-Platform Performance Consistency (Priority: P3)

**Goal**: Linux（WebKitGTK）とmacOS（WKWebView）で同等のスクロール性能を実現（差10%以内）

**Independent Test**: 同一テストデータで両OS測定し、スクロールFPS・初回ロード時間が10%以内の差であることを確認。

**Dependencies**: Phase 4 (User Story 2) must be complete

### Cross-Platform Optimization (US3)

- [ ] T040 [US3] Implement platform-specific cache directory handling for Windows in get_cache_dir()
- [ ] T041 [US3] Add platform-specific thread count tuning (test on macOS, adjust if needed) in ThumbnailConfig
- [ ] T042 [US3] Verify asset:// protocol works correctly on both Linux and macOS in useThumbnail hook

### Performance Benchmarking Infrastructure (US3)

- [ ] T043 [P] [US3] Create benchmark script for FPS measurement during scroll in scripts/benchmark-fps.js
- [ ] T044 [P] [US3] Create benchmark script for initial load time measurement in scripts/benchmark-load.js
- [ ] T045 [US3] Create test data generator (100 folders with 5MB images) in scripts/generate-test-data.sh
- [ ] T046 [US3] Document benchmark execution steps in specs/001-rust-thumbnail-optimization/BENCHMARK.md

### Manual Testing (US3)

- [ ] T047 [US3] Run benchmarks on Linux: Record FPS, initial load time, memory usage
- [ ] T048 [US3] Run benchmarks on macOS: Record FPS, initial load time, memory usage
- [ ] T049 [US3] Compare results: Verify performance difference is within 10%
- [ ] T050 [US3] Test edge cases: Large images (20MB, 8000×6000px), corrupted files, unsupported formats

**Checkpoint**: All user stories should now be independently functional with consistent cross-platform performance

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Optimization切り替え、キャッシュ管理、ドキュメント、品質ゲート

### Feature Toggle & Comparison (FR-007)

- [ ] T051 [P] Implement clear_thumbnail_cache Tauri command in src-tauri/src/commands/fs.rs
- [ ] T052 [P] Register clear_thumbnail_cache command in src-tauri/src/lib.rs
- [ ] T053 Extend FileSystemService with clearThumbnailCache method in src/shared/context/ServiceContext.tsx
- [ ] T054 Implement Tauri adapter for clearThumbnailCache in src/shared/adapters/tauriAdapters.ts
- [ ] T055 Add cache clear option to AppMenuBar in src/features/app-shell/components/AppMenuBar.tsx (optional)

### Cache Management & LRU Cleanup

- [ ] T056 [P] Implement ThumbnailCache struct with LRU tracking in src-tauri/core_logic/src/thumbnail.rs
- [ ] T057 Implement cache size monitoring (current_size vs max_size 1GB) in ThumbnailCache
- [ ] T058 Implement evict_lru() method to delete oldest thumbnails in ThumbnailCache
- [ ] T059 Integrate ThumbnailCache into get_or_create_thumbnail command for automatic cleanup

### Documentation

- [ ] T060 [P] Document performance comparison results in specs/001-rust-thumbnail-optimization/BENCHMARK.md
- [ ] T061 [P] Create comparison table: Frontend optimization vs Rust backend optimization
- [ ] T062 [P] Update README.md with Rust backend thumbnail feature description

### Quality Gates

- [ ] T063 Run pnpm type-check and fix any TypeScript errors
- [ ] T064 Run pnpm lint and fix any linting issues
- [ ] T065 Run pnpm test and ensure all tests pass
- [ ] T066 Run cargo test in src-tauri/ and ensure all Rust tests pass
- [ ] T067 Run pnpm tauri build and verify successful production build

### Final Integration & Cleanup

- [ ] T068 Test full workflow: Select folder → Generate thumbnails → Scroll → Verify cache → Clear cache
- [ ] T069 Review all error messages for user-friendliness
- [ ] T070 Remove debug logging and console.log statements
- [ ] T071 Final code review: Check adherence to constitution principles

---

## Dependencies & Execution Order

### Critical Path (Must follow this order)

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKING: Must complete before user stories
    ↓
Phase 3 (US1: Fast Scroll) ← MVP - Deliver first
    ↓
Phase 4 (US2: Initial Load) ← Depends on US1
    ↓
Phase 5 (US3: Cross-Platform) ← Depends on US2
    ↓
Phase 6 (Polish)
```

### Parallel Execution Opportunities

**Within Phase 2 (Foundational)**:
- T005 (hash_path) ∥ T006 (ThumbnailConfig) ∥ T008 (export module)
- T009 (extend interface) ∥ T010 (add type) ∥ T011 (update mock)

**Within Phase 3 (User Story 1)**:
- T012 (generate_thumbnail) ∥ T013 (ThumbnailGenerator)
- T018 (Tauri adapter) can start once T014-T016 are complete

**Within Phase 4 (User Story 2)**:
- T026 (thread pool) ∥ T030 (extend interface)
- T043 (FPS benchmark) ∥ T044 (load benchmark) ∥ T045 (test data)

**Within Phase 6 (Polish)**:
- T051 (clear_cache command) ∥ T056 (ThumbnailCache struct)
- T060 (benchmark doc) ∥ T061 (comparison table) ∥ T062 (README)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Recommended for first delivery: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers:
- Core thumbnail generation (Rust backend)
- Cache management
- Smooth scrolling experience
- Independent test: 100 folders with smooth 60fps scrolling

**Benefits**:
- Validates core technical approach
- Provides immediate value to users
- Enables early performance comparison with frontend optimization
- Reduces risk by delivering incrementally

### Incremental Delivery Plan

1. **Sprint 1**: Phase 1 + Phase 2 + Phase 3 (US1) → MVP with fast scrolling
2. **Sprint 2**: Phase 4 (US2) → Add parallel processing for initial load optimization
3. **Sprint 3**: Phase 5 (US3) → Cross-platform consistency & benchmarking
4. **Sprint 4**: Phase 6 → Polish, cleanup, documentation

### Testing Approach

**Manual Testing Focus** (No automated tests requested in spec):
- Each phase includes manual testing tasks
- Independent test criteria per user story
- Performance benchmarking for quantitative comparison
- Edge case validation in US3

---

## Task Statistics

- **Total Tasks**: 71
- **Setup Phase**: 3 tasks
- **Foundational Phase**: 8 tasks (BLOCKING)
- **User Story 1 (P1)**: 14 tasks (MVP)
- **User Story 2 (P2)**: 14 tasks
- **User Story 3 (P3)**: 11 tasks
- **Polish Phase**: 21 tasks

**Parallel Opportunities**: 20 tasks marked with [P] can run in parallel within their phases

**MVP Task Count**: 25 tasks (Phase 1 + Phase 2 + Phase 3)

---

## Validation Checklist

✅ All tasks follow format: `- [ ] [ID] [P?] [Story] Description with file path`  
✅ Tasks organized by user story (US1, US2, US3)  
✅ Each user story has independent test criteria  
✅ Foundational phase identified as blocking  
✅ Dependencies documented  
✅ Parallel opportunities identified  
✅ MVP scope defined  
✅ File paths are specific and match project structure  

---

**Generated**: 2026-01-05  
**Status**: Ready for implementation  
**Next Step**: Begin Phase 1 (Setup) tasks
