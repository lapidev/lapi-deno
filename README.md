# Lapi

An API framework for Deno.

**NOTE:** This project is a heavy WIP, therefore this may not be up to date.

## Why

I started this project because I wanted a very easy to use framework to build APIs with in Deno. There are definitely some great ones that have already been created but they always seem to be very loose on implementation details which can lead to hard to read code. The goal of this framework is to be very easy to use, to be very extensible, and to have a consistent architecture.

## Getting Started

To create a basic API, you first need to import `Application` into your program. This can be done with the following import statment:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";
```

Once you have `Application` imported, you can create an API by calling the constructor:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();
```

You can then add routes by calling `application.addRoute`:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();

application.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});
```

Now that you have a route created, you can start the API:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();

application.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

await application.start((): void => {
  console.log(`Server started on http://${application.serverHost}:${application.serverPort}`);
});
```

The full example [can be found here](./examples/basic_api.ts)

## Testing

There is an exposed method called `handleRequest` on the `Application` class that can be used to test your API. This method should never be called in production but is public to make testing very easy. `handleRequest` is an async function that returns `Promise<void>` and it takes in one parameter which is of type `ServerRequest`. The following is an example of how we could test the API created above:

```typescript
import { Application, RequestMethod, ServerRequest } from "https://deno.land/x/application/mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const application = new Application();

application.get("/hello", (req): void => {
  req.respond({ body: "Hello!" });
});

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await application.start((): void => {
    console.log(
      `Server started on http://${application.serverHost}:${application.serverPort}`,
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

  await application.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
```

We have plans of improving the testability in a way that will work similar to `supertest` but have our priorities elsewhere at the moment.
