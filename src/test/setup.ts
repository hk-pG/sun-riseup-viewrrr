import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Setup global vi for tests
(globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;
