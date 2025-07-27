# Requirements Document

## Introduction

This feature enhances the sibling folder functionality to include the current folder itself in the display and provides configurable sorting capabilities. Due to a Rust backend specification change, the current folder is no longer included in the API response, but the UI still needs to display it for better user experience. Additionally, the folder list should be sortable to maintain a consistent order.

## Requirements

### Requirement 1

**User Story:** As a user viewing folders in the sidebar, I want to see the current folder included in the folder list, so that I have a complete view of all folders at the current level including the one I'm currently viewing.

#### Acceptance Criteria

1. WHEN the sibling folders are loaded THEN the system SHALL include the current folder in the displayed folder list
2. WHEN the current folder is added THEN the system SHALL create a FolderEntry with the correct name and path for the current folder
3. WHEN the current folder is displayed THEN it SHALL be visually distinguishable as the selected/current folder

### Requirement 2

**User Story:** As a user viewing the folder list, I want the folders to be displayed in a consistent alphabetical order, so that I can easily find and navigate to the folder I'm looking for.

#### Acceptance Criteria

1. WHEN folders are displayed THEN the system SHALL sort them alphabetically by folder name
2. WHEN the current folder is added to the list THEN it SHALL be sorted along with the sibling folders
3. WHEN sorting is applied THEN the system SHALL use a configurable sort function that can be injected

### Requirement 3

**User Story:** As a developer, I want the sorting mechanism to be configurable and extensible, so that different sorting strategies can be applied without modifying the core logic.

#### Acceptance Criteria

1. WHEN implementing the sorting feature THEN the system SHALL accept a sort function as a parameter
2. WHEN no sort function is provided THEN the system SHALL use a default alphabetical sort by folder name
3. WHEN a custom sort function is provided THEN the system SHALL apply that function to sort the folder entries

### Requirement 4

**User Story:** As a developer, I want the build, lint, and test processes to pass at each implementation step, so that code quality and functionality are maintained throughout the development process.

#### Acceptance Criteria

1. WHEN any code changes are made THEN the system SHALL pass `pnpm build` without errors
2. WHEN any code changes are made THEN the system SHALL pass `pnpm lint:apply` without errors
3. WHEN any code changes are made THEN the system SHALL pass `pnpm test` without errors
4. IF any step fails THEN the issues SHALL be resolved before proceeding to the next step
