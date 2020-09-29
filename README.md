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

## Testing

There is an exposed method called `handleRequest` on the `Lapi` class that can be used to test your API. This method should never be called in production but is public to make testing very easy. `handleRequest` is an async function that returns `Promise<void>` and it takes in one parameter which is of type `ServerRequest`. The following is an example of how we could test the API created above:

```typescript
import { Lapi, RequestMethod, ServerRequest } from "https://deno.land/x/lapi/mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const lapi = new Lapi();

lapi.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await lapi.start((): void => {
    console.log(
      `Server started on http://${lapi.serverHost}:${lapi.serverPort}`,
    );
  });
}

Deno.test('/hello should return { body: "Hello!" }', async () => {
  const responses: unknown[] = [];

  const request = {
    method: RequestMethod.GET,
    url: "/hello",
    respond: (res: any) => {
      responses.push(res);
    },
  } as unknown as ServerRequest;

  await lapi.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
```

We have plans of improving the testability in a way that will work similar to `supertest` but have our priorities elsewhere at the moment.
