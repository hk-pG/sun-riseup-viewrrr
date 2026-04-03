# Implementation Plan: Replace Theme Provider with shadcn/ui Version

**Branch**: `001-replace-theme-provider` | **Date**: November 9, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-replace-theme-provider/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace the custom ThemeProvider implementation with shadcn/ui version while removing system theme support to simplify the codebase. The approach includes migrating to localStorage persistence, setting dark theme as default, removing resolvedTheme property, and updating all dependent components and tests.

## Technical Context

**Language/Version**: TypeScript 5.6+, React 19  
**Primary Dependencies**: shadcn/ui theme-provider, Tailwind CSS 4, Vite 6  
**Storage**: localStorage for theme persistence  
**Testing**: Vitest 3.2+, @testing-library/react 16  
**Target Platform**: Tauri v2 desktop application (cross-platform)
**Project Type**: Single desktop application with React frontend  
**Performance Goals**: Theme switching within 1 second, no impact on build time  
**Constraints**: Maintain 100% test coverage, no breaking changes to public APIs  
**Scale/Scope**: Single theme provider component, ~30 dependent files to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 機能ベースアーキテクチャ ✅ PASS
- **Status**: Compliant  
- **Rationale**: This is a provider replacement in `src/providers/`, not creating new features. Existing feature structure remains intact.
- **Post-Design**: No changes to feature boundaries. Provider moved to `src/components/` following shadcn/ui convention.

### II. 型安全性 ✅ PASS  
- **Status**: Compliant
- **Rationale**: TypeScript strict mode maintained, type imports used, no `any` types introduced.
- **Post-Design**: Contracts define strict typing for Theme type and interfaces. No type safety compromises.

### III. 品質ゲート ✅ PASS
- **Status**: Compliant  
- **Rationale**: All quality gates (build, type-check, lint, test) will be run before committing changes.
- **Post-Design**: Quickstart includes mandatory quality gate validation at each phase.

### IV. テスト容易性のための依存性注入 ✅ PASS
- **Status**: Compliant
- **Rationale**: Theme provider uses React Context pattern, which is approved for theme management. No new external APIs introduced.
- **Post-Design**: No DI pattern changes. localStorage access remains within provider boundary.

### V. テスト戦略 ✅ PASS
- **Status**: Compliant
- **Rationale**: Existing tests will be updated to maintain coverage. User interaction testing with @testing-library/react preserved.
- **Post-Design**: Test strategy maintains unit/integration/component levels. Test simplification improves maintainability.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── theme-provider.tsx          # shadcn/ui theme provider (NEW)
├── providers/
│   ├── ThemeProvider.tsx           # Current custom provider (TO BE REMOVED)
│   └── __tests__/
│       └── ThemeProvider.test.tsx  # Current tests (TO BE UPDATED)
├── components/ui/
│   ├── theme-toggle.tsx            # Theme toggle component (TO BE UPDATED)
│   └── __tests__/
│       └── theme-toggle.test.tsx   # Toggle tests (TO BE UPDATED)  
├── App.tsx                         # Main app component (TO BE UPDATED)
├── main.tsx                        # App entry point (TO BE UPDATED)
└── __tests__/
    ├── App.test.tsx                # App tests (TO BE UPDATED)
    └── theme-integration.test.tsx  # Integration tests (TO BE UPDATED)

# Story files using ThemeProvider
src/features/app-shell/stories/AppMenuBar.stories.tsx    # (TO BE UPDATED)
src/stories/ViewerIntegration.stories.tsx                # (TO BE UPDATED)
```

**Structure Decision**: Single project structure maintained. Theme provider replacement affects provider layer and dependent components. No new features created, existing feature boundaries preserved.

## Complexity Tracking

> **No constitutional violations identified - no complexity tracking required**
