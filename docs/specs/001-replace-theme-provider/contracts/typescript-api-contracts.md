# TypeScript API Contracts

## ThemeProvider Contract

```typescript
// Theme type definition
type Theme = 'dark' | 'light' | 'system';

// Props interface
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

// Context state interface  
type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

// Provider component
declare function ThemeProvider(props: ThemeProviderProps): JSX.Element;

// Hook for consuming theme context
declare function useTheme(): ThemeProviderState;
```

## Migration Contracts

### Before (Current Custom Provider)

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';  // ← REMOVED
}

function ThemeProvider({
  children,
  defaultTheme = 'system'  // ← CHANGED to 'dark'
}: ThemeProviderProps): JSX.Element;
```

### After (shadcn/ui Provider)

```typescript
type ThemeProviderState = {
  theme: 'dark' | 'light' | 'system';  // ← 'system' will be removed
  setTheme: (theme: Theme) => void;
  // resolvedTheme removed
};

function ThemeProvider({
  children,
  defaultTheme = 'dark',      // ← CHANGED from 'system'
  storageKey = 'vite-ui-theme'  // ← NEW feature
}: ThemeProviderProps): JSX.Element;
```

## Component Update Contracts

### ThemeToggle Component

```typescript
// Before: 3-state cycle (light → dark → system → light)
// After: 2-state cycle (light → dark → light)

function ThemeToggle(): JSX.Element;
// - Removes system theme option
// - Simplifies toggle logic
// - Updates icons (removes Monitor icon)
```

### ThemeSelector Component  

```typescript
function ThemeSelector(): JSX.Element;
// - Removes system button
// - Keeps light/dark buttons
// - Updates active state logic
```

### App Component

```typescript
// Before: Complex toggle logic with resolvedTheme
const getOppositeTheme = (
  current: typeof currentTheme,
  resolved: typeof resolvedTheme,  // ← REMOVED
) => current === 'system' ? ...

// After: Simple binary toggle
const getOppositeTheme = (current: Theme) => 
  current === 'dark' ? 'light' : 'dark';
```

## Test Contracts

### Provider Tests

```typescript
// Test cases to update:
// ✅ Keep: basic theme setting (light/dark)  
// ✅ Keep: localStorage persistence
// ❌ Remove: system theme detection
// ❌ Remove: resolvedTheme property tests
// ❌ Remove: media query listening tests
```

### Integration Tests

```typescript
// Test scenarios to update:
// ✅ Keep: theme switching via UI
// ✅ Keep: CSS class application
// ❌ Remove: system theme responsive tests
// ❌ Remove: resolvedTheme dependent tests
```

## Breaking Changes Summary

| Component | Change | Impact |
|-----------|--------|--------|
| ThemeProvider | Remove resolvedTheme | Update consuming code |
| ThemeProvider | Change default to 'dark' | Initial app state |
| ThemeProvider | Remove system support | Update toggle logic |
| useTheme hook | Remove resolvedTheme | Update App.tsx usage |
| ThemeToggle | Remove system option | Update icon/logic |
| ThemeSelector | Remove system button | Update UI |
| Tests | Remove system tests | Update test suites |