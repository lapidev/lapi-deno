# Lapi

An API framework for Deno

**NOTE:** This project is a heavy WIP, therefore this may not be up to date.

## Getting Started

To create a basic API, you first need to import `Lapi` into your program. This can be done with the following import statment:

```typescript
import { Lapi } from "https://deno.land/x/lapi/mod.ts";
```

Once you have `Lapi` imported, you can create an API by calling the constructor:

```typescript
import { Lapi } from "https://deno.land/x/lapi/mod.ts";

const lapi = new Lapi();
```

You can then add routes by calling `lapi.addRoute`:

```typescript
import { Lapi } from "https://deno.land/x/lapi/mod.ts";

const lapi = new Lapi();

lapi.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});
```

Now that you have a route created, you can start the API:

```typescript
import { Lapi } from "https://deno.land/x/lapi/mod.ts";

const lapi = new Lapi();

lapi.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

await lapi.start((): void => {
  console.log(`Server started on http://${lapi.serverHost}:${lapi.serverPort}`);
});
```

The full example [can be found here](./examples/basic-api.ts)

