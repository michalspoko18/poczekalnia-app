# poczekalnia-app

## Features

This project uses features like:

- [PostCSS](https://postcss.org/) with [mantine-postcss-preset](https://mantine.dev/styles/postcss-preset)
- [TypeScript](https://www.typescriptlang.org/)
- [Storybook](https://storybook.js.org/)
- [Jest](https://jestjs.io/) setup with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- ESLint setup with [eslint-config-mantine](https://github.com/mantinedev/eslint-config-mantine)
- [Mantine UI](https://mantine.dev/) for modern and accessible UI components
- OAuth 2.0 authentication with Bearer tokens

## yarn scripts

### Build and dev scripts

- `yarn dev` – start the development server
- `yarn build` – bundle the application for production
- `yarn analyze` – analyze the application bundle with [@next/bundle-analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Testing scripts

- `yarn typecheck` – check TypeScript types
- `yarn lint` – run ESLint
- `yarn prettier:check` – check files with Prettier
- `yarn jest` – run Jest tests
- `yarn jest:watch` – start Jest in watch mode
- `yarn test` – run `jest`, `prettier:check`, `lint`, and `typecheck` scripts

### Other scripts

- `yarn storybook` – start the Storybook development server
- `yarn storybook:build` – build the production Storybook bundle to `storybook-static`
- `yarn prettier:write` – format all files with Prettier

## Installation

To install dependencies, run:

```bash
yarn install
```
