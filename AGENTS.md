# AGENTS.md

## Cursor Cloud specific instructions

This repo is **`sun-riseup-viewrrr`**, a Tauri v2 cross-platform desktop image viewer:
a React 19 + TypeScript + Vite frontend (`src/`) and a Rust backend / Cargo workspace
(`src-tauri/`, with the domain logic in `src-tauri/core_logic`). Standard commands live in
`package.json`, `.github/workflows/ci.yml`, and `README.md` — prefer those as the source of truth.

### Running the app in the cloud VM (non-obvious)
- The full desktop app (`pnpm tauri dev` / `pnpm tauri build`) needs a GUI + WebKitGTK display
  and will not run in the headless cloud VM.
- To run/inspect the real UI here, use **mock mode**: `pnpm dev:mock` (sets `VITE_MOCK=true`,
  serves Vite on `http://localhost:1420`). This stubs the Rust/Tauri backend via
  `src/dev/mockService.ts` so the frontend runs in a plain browser.
- Mock-mode gotcha: only the **first** folder is populated with images; the other generated
  "ダミーフォルダ" (dummy folders) are intentionally empty, and image navigation is limited.
  This is expected mock behavior, not a bug.

### Toolchain notes (non-obvious)
- The Rust build requires a toolchain that supports **edition2024** (Rust >= 1.85) because of a
  transitive `toml` dependency. Neither `.tool-versions` nor CI pins Rust, and older stable
  toolchains (e.g. 1.83) fail with `feature 'edition2024' is required`. The VM snapshot ships a
  recent stable (`rustup default stable`).
- Rust tests need the Linux Tauri system libs (`libwebkit2gtk-4.1-dev`, `libappindicator3-dev`,
  `librsvg2-dev`, `patchelf`); these are preinstalled in the snapshot.
- The `browser` Vitest project (`*.browser.test.tsx`) runs in real headless Chromium via
  Playwright; the Playwright chromium browser is installed by the update script.

### Commands
- Lint: `pnpm lint` (Biome)
- Frontend tests: `pnpm test` (Vitest; jsdom + Playwright/chromium browser projects)
- Rust tests: `cd src-tauri && cargo test --workspace`
- Frontend build: `pnpm build`

### Git hooks
`core.hooksPath` may be overridden by Cursor agent hooks. The repo's own `.githook/pre-commit`
runs `pnpm build`, `pnpm lint`, and `pnpm test` when `src/` changes, and `cargo test --workspace`
when `src-tauri/core_logic` changes.
