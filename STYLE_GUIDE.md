# Style Guide

We follow the same style guide as Deno which [can be found here](https://deno.land/manual/contributing/style_guide).

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