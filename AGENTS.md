# AGENTS.md - Coding Guidelines for sun-riseup-viewrrr

## Project Overview

Tauri-based image viewer app for manga/illustration collections. Frontend: React 19 + TypeScript, Backend: Rust, Architecture: Feature-based.

## Build/Lint/Test Commands

```bash
# Development
pnpm dev                  # Vite dev server only
pnpm tauri dev           # Tauri with hot reload

# Build
pnpm build               # Production build
pnpm build:dev           # Development build

# Code Quality (MUST run after changes)
pnpm type-check          # TypeScript validation
pnpm lint                # Biome lint check
pnpm lint:apply          # Auto-fix safe issues
pnpm format              # Format code
pnpm test                # Run all tests

# Running Single Tests
pnpm vitest run <path>                    # Run specific test file
pnpm vitest run --reporter=verbose <path> # Verbose output
pnpm test -- --grep "test name"           # Run by test name
pnpm vitest run src/shared/utils/__tests__/utils.test.ts

# Watch Mode
pnpm test:watch          # Watch mode for tests

# Storybook
pnpm storybook           # Component playground
pnpm build-storybook     # Build Storybook
```

## Code Style Guidelines

### Imports
- Use `@/` alias for `src/` imports (configured in tsconfig.json)
- Use type imports: `import type { Foo } from 'bar'` (Biome enforces)
- Organize imports: Biome auto-organizes on format

### Formatting (Biome)
- Indent: 2 spaces
- Quotes: single
- Trailing commas: all
- Semicolons: always
- Arrow parentheses: always
- Line width: 80 characters
- Line ending: LF

### Naming Conventions
- Components: PascalCase (e.g., `ImageViewer`)
- Hooks: camelCase with `use` prefix (e.g., `useImages`)
- Utilities: camelCase (e.g., `cn`, `formatPath`)
- Types/Interfaces: PascalCase (e.g., `FileSystemService`)
- Files: camelCase for utilities, PascalCase for components

### TypeScript
- Strict mode enabled
- No unused locals/parameters
- No implicit returns
- No `any` type (warn level - avoid)
- Use `type` for type imports/exports

### Error Handling
- Wrap async operations in try/catch
- Handle null/undefined gracefully
- Use Result pattern: `{ folderPath: string; index: number } | null`
- Don't use `useTransition` for image navigation (performance)

### Architecture Patterns
- Feature-based: `features/{feature-name}/{components,hooks,types}/`
- Export via `index.ts` from each feature
- Dependency injection via `ServiceContext`
- Use `useServices()` hook, not direct Tauri API calls

### State Management
- Local state: `useState`
- Data fetching: SWR (`useImages` hook)
- Context API: Dependency injection (`ServiceContext`), theme
- `useTransition` for non-blocking folder updates only

### Styling
- Tailwind CSS 4
- shadcn/ui components in `src/shared/components/ui/`
- Use `cn()` utility from `src/shared/utils/utils.ts`
- Biome enforces `useSortedClasses` (alphabetical order)

### Testing
- Framework: Vitest + @testing-library/react
- Mock Tauri: `setupTauriMocks()` from `src/test/mocks.ts`
- Structure: `__tests__/` subdirectories or `.test.ts` suffix
- Test user interactions, not implementation details

### Commit Messages (Japanese)
Format: `type(scope): subject`
Types: feat, fix, docs, style, refactor, perf, test, chore
Always in Japanese for personal project tracking

## Key Pitfalls
- Don't wrap image navigation in `useTransition`
- Don't call Tauri API directly; use `useServices()`
- Don't create circular dependencies between features
- Don't skip `key` prop on `ImageViewer` when folder changes
- Don't use `any` type

## Project Structure
```
src/
  features/
    app-shell/        # Menu bar, global actions
    folder-navigation/# Sidebar, folder management
    image-viewer/     # Image display, controls
    shared/           # Services, hooks, utils, UI components
  components/         # shadcn/ui components
  test/              # Test utilities and mocks
```
