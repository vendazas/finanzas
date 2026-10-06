# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a clean workspace. As code is added, keep the
layout predictable:

- `src/` for application or library source code.
- `tests/` for automated tests, mirroring `src/` where practical.
- `assets/` for non-code resources such as templates or sample data.
- `docs/` for user-facing or architectural documentation.

Avoid placing generated files, local exports, credentials, or large datasets in
the repository. Add the relevant paths to `.gitignore` instead.

## Build, Test, and Development Commands

No build or test tooling has been established yet. When introducing tooling,
document the canonical commands in the project README and keep them simple and
repeatable. For example:

```powershell
npm run dev       # start local development
npm run build     # create a production build
npm test          # run the automated test suite
```

Run the applicable formatter, linter, build, and tests before opening a pull
request. Do not commit generated build output unless the project explicitly
requires it.

## Coding Style & Naming Conventions

Follow the formatter and linter configured for the selected language; do not
hand-format around their output. Use 2 spaces for JSON, YAML, and JavaScript or
TypeScript unless the tool configuration says otherwise. Name files and
directories consistently: use `kebab-case` for general files, `PascalCase` for
UI components or classes, and `camelCase` for functions and variables.

Keep modules focused, favor descriptive names, and add comments only where the
intent is not evident from the code.

## Testing Guidelines

Place tests under `tests/` or alongside the module when that is the adopted
project convention. Use descriptive test names such as
`calculates-monthly-balance.test.ts`. Cover normal behavior, edge cases, and
regressions for each bug fix. New features should include tests before review.

## Commit & Pull Request Guidelines

There is no existing Git history to establish a convention. Use concise,
imperative Conventional Commit-style subjects, for example
`feat: add expense import` or `fix: handle empty transactions`. Keep commits
small and single-purpose.

Pull requests should explain the change and its motivation, link related issues
when available, list validation performed, and include screenshots for visible
UI changes. Never include secrets, personal financial data, or local
configuration values in commits.
