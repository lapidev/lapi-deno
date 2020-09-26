# Style Guide

We follow the same style guide as Deno which [can be found here](https://deno.land/manual/contributing/style_guide).

## Dependencies

All dependencies should be imported from `deps.ts`. We will move to `import_map.json` once it is stable.

## Functions and Methods

### Documentation

It is preferred that parameters are self documenting, then they do not need a description in the comments. All functions and methods should have a comment with a short explanation, preferably on one line. If a function or method could throw and error, include the `@throws` annotation followed by the type of the error. E.g. `@throws {LapiError}`.

## Classes

All private class variables should be prefixed with a `_` to allow for a get method that has the same name as the variable. If a variable is public, it should not be prefixed with `_`.

```typescript
class Sample {
  private _name: string;

  constructor(name: string, public version: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}
```

## Tests

Test names should be generated using the `testName` function in `lib/__tests__/utils_test.ts`
