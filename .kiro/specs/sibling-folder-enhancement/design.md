# Design Document

## Overview

This design enhances the sibling folder functionality to include the current folder in the display and provides configurable sorting capabilities. The solution involves modifying the frontend service layer to add the current folder to the sibling folders list and implementing a sorting mechanism similar to the existing image sorting pattern.

## Architecture

The enhancement follows the existing layered architecture:

1. **Service Layer**: `getSiblingFolderEntries` function enhanced to include current folder and sorting
2. **Hook Layer**: `useSiblingFolders` hook remains unchanged, consuming the enhanced service
3. **Type Layer**: New `FolderSortFunction` type following the existing `SortFunction` pattern
4. **Utility Layer**: Default folder sorting function implementation

## Components and Interfaces

### New Types

```typescript
// src/shared/types/FolderSortFunction.ts
export type FolderSortFunction = (a: FolderEntry, b: FolderEntry) => number;
```

### Enhanced Service Function

```typescript
// src/features/folder-navigation/services/getSiblingFolders.ts
export async function getSiblingFolderEntries(
  currentFolderPath: string,
  fs: FileSystemService,
  sortFn?: FolderSortFunction
): Promise<FolderEntry[]>
```

### New Utility Function

```typescript
// src/shared/utils/folderSort.ts
export const naturalFolderSort: FolderSortFunction = (a, b) => {
  return a.name.localeCompare(b.name, 'ja', { numeric: true });
};
```

## Data Models

### FolderEntry (existing)

```typescript
type FolderEntry = {
  name: string;  // Folder base name
  path: string;  // Full folder path
};
```

### FolderSortFunction (new)

```typescript
type FolderSortFunction = (a: FolderEntry, b: FolderEntry) => number;
```

## Implementation Strategy

### Step 1: Create Folder Sort Types and Utilities

- Create `FolderSortFunction` type following the existing `SortFunction` pattern
- Implement `naturalFolderSort` utility function
- Export from shared module

### Step 2: Enhance getSiblingFolderEntries Service

- Add optional `sortFn` parameter with default value
- Add logic to include current folder in the results
- Apply sorting to the complete folder list (siblings + current)
- Maintain error handling behavior

### Step 3: Update Hook Integration

- Modify `useSiblingFolders` hook to pass default sort function
- Ensure backward compatibility

### Step 4: Update Exports

- Export new types and utilities from appropriate index files
- Maintain existing API surface

## Detailed Implementation

### Current Folder Addition Logic

```typescript
// In getSiblingFolderEntries function:
1. Get sibling folders from API (excludes current folder)
2. Create FolderEntry for current folder using createFolderEntry
3. Combine current folder with siblings
4. Apply sorting function to complete list
5. Return sorted list
```

### Sorting Integration

```typescript
// Default behavior
const entries = await getSiblingFolderEntries(path, fs); // Uses naturalFolderSort

// Custom sorting
const entries = await getSiblingFolderEntries(path, fs, customSortFn);
```

## Error Handling

- Maintain existing error handling: return empty array on errors
- If current folder creation fails, still return sibling folders
- Sorting errors should not break the functionality

## Testing Strategy

### Unit Tests

- Test `naturalFolderSort` function with various folder names
- Test `getSiblingFolderEntries` with current folder inclusion
- Test sorting behavior with different sort functions
- Test error scenarios (current folder creation failure)

### Integration Tests

- Test hook behavior with enhanced service
- Test UI rendering with sorted folder list including current folder

### Build Validation

- Ensure `pnpm build` passes after each implementation step
- Ensure `pnpm lint:apply` passes after each implementation step  
- Ensure `pnpm test` passes after each implementation step

## Migration Strategy

The changes are backward compatible:

- Existing calls to `getSiblingFolderEntries` without sort function will use default sorting
- The `useSiblingFolders` hook API remains unchanged
- No breaking changes to consuming components
