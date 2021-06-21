# Lapi

A full featured middleware based web framework for Deno.

**NOTE:** This project is a heavy WIP, therefore this may not be up to date.

## Why

I started this project because I wanted a very easy to use framework to build APIs with in Deno. There are definitely some great ones that have already been created but they always seem to be difficult to get started with. This framework will contain the very basic implementation required to create a web application and include middleware to make building web applications easier.

## Getting Started

To create a basic application, you first need to import `Application` into your program. This can be done with the following import statment:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";
```

Once you have `Application` imported, you can create an application by calling the constructor:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();
```

You can then add middleware by calling `application.use`:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = "Hello";
  }
});
```

Now that you have a middleware added created, you can create the API:

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = "Hello";
  }
});

await application.start();
```

The full example [can be found here](./examples/basic_api.ts)

## Search Parameters

Lapi supports search parameters but they do not need to be defined in your code. They can be accessed through the property `ctx.request.searchParams` in your handler function. Please see the example below.

```typescript
import { Application } from "https://deno.land/x/application/mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = `Hello, ${ctx.request.searchParams.get("name")}!`;
  }
});

await application.start();
```

# Roadmap

This is just a list of what we have planned in order:

- middleware
  - [ ] CORS middleware
  - [ ] Sessions middleware
  - [ ] Static assets middleware
  - [ ] router
    - [ ] Support for path parameters
    - [ ] Support for regular expressions
- core
  - [ ] JSX support