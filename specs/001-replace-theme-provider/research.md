# Research: Replace Theme Provider with shadcn/ui Version

**Date**: November 9, 2025  
**Feature**: 001-replace-theme-provider

## Research Tasks Completed

### 1. shadcn/ui Theme Provider Analysis

**Decision**: Use shadcn/ui theme-provider.tsx with modifications
**Rationale**: 
- Industry standard implementation with localStorage persistence
- Smaller codebase to maintain
- Well-tested component from shadcn/ui ecosystem
- Simpler than maintaining custom implementation

**Alternatives considered**:
- Keep custom ThemeProvider: Rejected due to maintenance burden
- Build hybrid solution: Rejected due to complexity
- Use third-party theme library: Rejected due to additional dependencies

### 2. System Theme Support Removal

**Decision**: Remove 'system' theme option, support only 'light' and 'dark'
**Rationale**:
- Eliminates resolvedTheme complexity
- Simplifies toggle logic significantly  
- Reduces test complexity
- Personal application - user can manually choose preference

**Alternatives considered**:
- Extend shadcn/ui to support resolvedTheme: Rejected due to complexity
- Keep system support with workarounds: Rejected due to maintenance burden

### 3. Default Theme Selection

**Decision**: Set 'dark' as default theme
**Rationale**: 
- User preference for dark mode
- Personal application requirement
- Aligns with modern development tools

**Alternatives considered**:
- Keep 'system' default: Rejected as system support being removed
- Use 'light' default: Rejected due to user preference

### 4. Migration Strategy

**Decision**: Direct replacement with test-first approach
**Rationale**:
- Ensure no regressions through comprehensive testing
- Migrate all dependent components systematically
- Maintain backward compatibility during transition

**Alternatives considered**:
- Gradual migration: Rejected due to small scope
- Feature flag approach: Rejected as unnecessary for single-user app

### 5. localStorage Integration

**Decision**: Use shadcn/ui's built-in localStorage with default storageKey
**Rationale**:
- Standard web practice for theme persistence
- Built into shadcn/ui implementation
- No custom storage logic needed

**Alternatives considered**:
- No persistence: Rejected due to poor UX
- Custom storage: Rejected due to reinventing wheel

## Implementation Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test failures during migration | High | Medium | Update tests systematically, run after each change |
| Breaking existing components | Medium | High | Test all dependent components thoroughly |
| Performance degradation | Low | Low | Monitor build times and runtime performance |
| localStorage compatibility | Low | Medium | Fallback to memory-only theme state |

## Technical Dependencies

- **shadcn/ui theme-provider**: Standard React context-based implementation
- **localStorage API**: Browser standard, supported in Tauri webview
- **React Context**: Already used in codebase, no new patterns
- **Tailwind CSS**: Already configured, CSS variable switching remains same

## Success Criteria Validation

All success criteria from spec.md are achievable:
- ✅ SC-001: 100% test success - achievable through systematic test updates
- ✅ SC-002: <1s theme switching - shadcn/ui implementation is performant
- ✅ SC-003: Theme persistence - localStorage provides this
- ✅ SC-004: Dark default - configurable in ThemeProvider props