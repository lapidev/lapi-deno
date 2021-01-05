# Getting Started

To create a basic API, you first need to import `Application` into your program. This can be done with the following import statment:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";
```

Once you have `Application` imported, you can create an API by calling the constructor:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();
```

You can then add routes by calling `application.addRoute`:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();

application.get("/hello", (req, res): void => {
  res.respond({ body: "Hello!" });
});
```

Now that you have a route created, you can start the API:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();

application.get("/hello", (req, res): void => {
  res.respond({ body: "Hello!" });
});

await application.start((): void => {
  console.log(
    `Server started on http://${application.serverHost}:${application.serverPort}`
  );
});
```

The full example [can be found here](./examples/basic_api.ts)

## Testing

There is an exposed method called `handleRequest` on the `Application` class that can be used to test your API. This method should never be called in production but is public to make testing very easy. `handleRequest` is an async function that returns `Promise<void>` and it takes in one parameter which is of type `ServerRequest`. The following is an example of how we could test the API created above:

```typescript
import {
  Application,
  RequestMethod,
  ServerRequest,
} from "https://deno.land/x/lapi/mod.ts";
import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

const application = new Application();

application.get("/hello", (req, res): void => {
  res.send({ body: "Hello!" });
});

if (Deno.env.get("DENO_ENV") !== "TEST") {
  await application.start((): void => {
    console.log(
      `Server started on http://${application.serverHost}:${application.serverPort}`
    );
  });
}

Deno.test('/hello should return { body: "Hello!" }', async () => {
  const responses: unknown[] = [];

  const request = ({
    method: RequestMethod.GET,
    url: "/hello",
    respond: (res: any) => {
      responses.push(res);
    },
  } as unknown) as ServerRequest;

  await application.handleRequest(request);

  assertEquals(responses[0], { body: "Hello!" });
});
```

We have plans of improving the testability in a way that will work similar to `supertest` but have our priorities elsewhere at the moment.

## Query Parameters

Lapi supports query params but they do not need to be defined in your code. They can be accessed through the property `queries` on the request parameter in your handler function. Please see the example below.

```typescript
const application = new Application();

application.get("/endpoint", (req, res) => {
  const name = req.queries.get("name");
  res.json({ name }).send();
});

await application.start();
```

## Path Parameters

Path parameters can be defined by adding `<paramName>` to the path or by using a RegExp for the request path. An example of using a string is below.

```typescript
const application = new Application();

application.get("/endpoint/<name>", (req, res) => {
  const name = req.params.name;
  res.json({ name }).send();
});

await application.start();
```

The following is the same as the example above but using a RegExp instead of a string.

```typescript
const application = new Application();

application.get(/\/endpoint\/(?<name>.+)/, (req, res) => {
  const name = req.params.name;
  res.json({ name }).send();
});

await application.start();
```

We only recommend using RegExp when absolutely necessary because there is a higher chance of an error occurring.