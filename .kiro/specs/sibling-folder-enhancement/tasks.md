# Implementation Plan

- [x] 1. Create folder sort types and utilities

  - Create `FolderSortFunction` type following existing `SortFunction` pattern
  - Implement `naturalFolderSort` utility function with Japanese locale support
  - Export new types and utilities from shared module
  - Run validation: `pnpm build`, `pnpm lint:apply`, `pnpm test`
  - _Requirements: 3.1, 3.2_

- [x] 2. Enhance getSiblingFolderEntries service function

  - Add optional `sortFn` parameter with default `naturalFolderSort`
  - Add logic to create and include current folder in results using `createFolderEntry`
  - Apply sorting to complete folder list (siblings + current folder)
  - Maintain existing error handling behavior (return empty array on errors)
  - Run validation: `pnpm build`, `pnpm lint:apply`, `pnpm test`
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

- [ ] 3. Update useSiblingFolders hook integration
  - Modify `useSiblingFolders` hook to pass default sort function to service
  - Ensure backward compatibility with existing API
  - Run validation: `pnpm build`, `pnpm lint:apply`, `pnpm test`
  - _Requirements: 2.1, 2.2, 3.2_

- [ ] 4. Update module exports and integration
  - Export `FolderSortFunction` type from shared index
  - Export `naturalFolderSort` utility from shared index
  - Update folder-navigation feature exports if needed
  - Run validation: `pnpm build`, `pnpm lint:apply`, `pnpm test`
  - _Requirements: 3.1, 3.3_

- [ ] 5. Write comprehensive tests for new functionality
  - Write unit tests for `naturalFolderSort` function with various folder names
  - Write unit tests for enhanced `getSiblingFolderEntries` with current folder inclusion
  - Write tests for sorting behavior with custom sort functions
  - Write tests for error scenarios (current folder creation failure)
  - Run validation: `pnpm build`, `pnpm lint:apply`, `pnpm test`
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
