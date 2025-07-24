// Shared Resources Exports
// This file exports commonly used utilities, components, and types

// Utils
export { isStringArray } from './utils/isStringArray';
export { naturalSort } from './utils/sort';
export { cn } from './utils/utils';

// Context
export { useServices, ServicesProvider } from './context/ServiceContext';

// Adapters
export { tauriFileSystemService } from './adapters/tauriAdapters';

// UI Components
export { Button, buttonVariants } from './components/ui/button';
export {
    Menubar,
    MenubarPortal,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarGroup,
    MenubarSeparator,
    MenubarLabel,
    MenubarItem,
    MenubarShortcut,
    MenubarCheckboxItem,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSub,
    MenubarSubTrigger,
    MenubarSubContent,
} from './components/ui/menubar';

// Hooks
export { useImages } from './hooks/data/useImages';

// Types
export type { SortFunction } from './types/SortFunction';