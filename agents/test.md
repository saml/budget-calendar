# Test

## Test runner

[Vitest](https://vitest.dev/) — standard for Vite projects.

## Run all tests

```sh
npm test
```

Or in watch mode:

```sh
npm run test:watch
```

## Test file conventions

- Unit/integration tests: `src/**/*.test.ts` or `src/**/*.spec.ts`
- Test files live next to the code they test

## Testing approach

- TDD: write tests first, then implement
- Use `@testing-library/react` for component tests
- Pure logic (store reducers, date utilities) tested without React
