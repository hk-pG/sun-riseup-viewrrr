# Quickstart: Replace Theme Provider with shadcn/ui Version

**Date**: November 9, 2025  
**Feature**: 001-replace-theme-provider  
**Estimated Time**: 2-3 hours

## Prerequisites

- [x] Feature specification completed
- [x] Implementation plan approved  
- [x] Constitution check passed
- [x] Branch `001-replace-theme-provider` checked out

## Implementation Steps

### Phase 1: Prepare shadcn/ui Theme Provider (30 min)

1. **Create new theme provider file**
   ```bash
   # Copy shadcn/ui theme-provider.tsx to src/components/
   # File should be already available in attachment
   ```

2. **Modify for project requirements**
   - Remove 'system' from Theme type union
   - Set defaultTheme to 'dark'  
   - Remove system theme detection logic
   - Keep localStorage functionality

3. **Verify build**
   ```bash
   pnpm type-check
   pnpm lint
   ```

### Phase 2: Update Import Paths (15 min)

4. **Update all imports** 
   ```typescript
   // Change all files from:
   import { ThemeProvider, useTheme } from '../providers/ThemeProvider';
   
   // To:
   import { ThemeProvider, useTheme } from '../components/theme-provider';
   ```

   **Files to update**:
   - `src/main.tsx`
   - `src/App.tsx` 
   - `src/components/ui/theme-toggle.tsx`
   - All test files
   - All story files

### Phase 3: Remove resolvedTheme Usage (45 min)

5. **Update App.tsx toggle logic**
   ```typescript
   // Before:
   const { theme: currentTheme, resolvedTheme, setTheme } = themeApi;
   const getOppositeTheme = (current, resolved) => 
     current === 'system' ? (resolved === 'dark' ? 'light' : 'dark') : ...
   
   // After:
   const { theme: currentTheme, setTheme } = themeApi;
   const getOppositeTheme = (current) => 
     current === 'dark' ? 'light' : 'dark';
   ```

6. **Update all test mocks**
   ```typescript
   // Remove resolvedTheme from mocks in:
   // - src/features/app-shell/components/__tests__/AppMenuBar.test.tsx
   // - All other files mocking useTheme
   ```

### Phase 4: Simplify Theme Components (30 min)

7. **Update ThemeToggle component**
   - Remove 'system' case from switch statement
   - Remove Monitor icon import and usage
   - Update aria-labels
   - Simplify cycle: light → dark → light

8. **Update ThemeSelector component**  
   - Remove system button
   - Keep only light/dark buttons
   - Update active state logic

### Phase 5: Update Tests (45 min)

9. **Update ThemeProvider tests**
   ```bash
   # Files to update:
   # - src/providers/__tests__/ThemeProvider.test.tsx
   # - src/__tests__/theme-integration.test.tsx
   # - src/components/ui/__tests__/theme-toggle.test.tsx
   ```
   
   **Changes needed**:
   - Remove all system theme test cases
   - Remove resolvedTheme assertions
   - Update default theme expectations to 'dark'
   - Remove media query mocking

10. **Update component tests**
    - Remove system-related test scenarios
    - Update theme cycle tests
    - Verify localStorage persistence tests

### Phase 6: Clean Up (15 min)

11. **Remove old provider**
    ```bash
    rm src/providers/ThemeProvider.tsx
    rm src/providers/__tests__/ThemeProvider.test.tsx
    # Update src/providers/index.ts if exists
    ```

12. **Final verification**
    ```bash
    pnpm type-check  # Must pass
    pnpm lint        # Must pass  
    pnpm test        # Must pass
    pnpm build       # Must pass
    ```

## Validation Checklist

### ✅ Functional Requirements
- [ ] FR-001: shadcn/ui provider replaces custom provider
- [ ] FR-002: All existing tests pass with updates
- [ ] FR-003: Light/dark theme switching works
- [ ] FR-004: localStorage persistence works
- [ ] FR-005: Custom storageKey supported
- [ ] FR-006: resolvedTheme removed completely
- [ ] FR-007: Only light/dark themes supported
- [ ] FR-008: Dark default theme set
- [ ] FR-009: Test mocks updated appropriately

### ✅ Success Criteria
- [ ] SC-001: 100% test success achieved
- [ ] SC-002: Theme switching <1s response time maintained
- [ ] SC-003: Theme settings persist after restart
- [ ] SC-004: Dark theme applied by default

### ✅ Quality Gates
- [ ] All TypeScript errors resolved
- [ ] All lint issues resolved
- [ ] All tests passing
- [ ] Build succeeds without warnings

## Rollback Plan

If issues occur:
```bash
git checkout main -- src/providers/ThemeProvider.tsx
git checkout main -- src/components/ui/theme-toggle.tsx
git checkout main -- src/App.tsx
# Restore other modified files as needed
pnpm test # Verify rollback success
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Import errors | Check all import paths updated to new location |
| Test failures | Update mocks to remove resolvedTheme |
| Type errors | Ensure Theme type only includes 'light'\|'dark' |
| Build failures | Run `pnpm type-check` to identify TypeScript issues |
| Runtime errors | Check browser console for theme-related errors |

## Success Metrics

- **Code Reduction**: ~50 lines removed from provider complexity
- **Test Simplification**: ~30% fewer test cases (system-related removed)
- **Maintenance**: Reduced to maintaining only shadcn/ui customizations
- **Performance**: No degradation in theme switching speed