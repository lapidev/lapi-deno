# Lapi {{prerelease}}

![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fhttps%2Fdeno.land%2Fx%2Flapi%2Fmod.ts)
[![CI](https://github.com/LukeShay/lapi/actions/workflows/ci.yaml/badge.svg)](https://github.com/LukeShay/lapi/actions/workflows/ci.yaml)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fhttps%2Fdeno.land%2Fx%2Flapi%2Fmod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fhttps%2Fdeno.land%2Fx%2Flapi%2Fmod.ts)
![Custom badge](https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fhttps%2Fdeno.land%2Fx%2Flapi%2Fmod.ts)


A full featured middleware based web framework for Deno.

Roadmap: https://github.com/LukeShay/lapi/discussions/28

**NOTE:** This project is a heavy WIP, therefore this may not be up to date.

## Why

I started this project because I wanted a very easy to use framework to build
APIs with in Deno. There are definitely some great ones that have already been
created but they always seem to be difficult to get started with. This framework
will contain the very basic implementation required to create a web application
and include middleware to make building web applications easier.

## Getting Started

To create a basic application, you first need to import `Application` into your
program. This can be done with the following import statment:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";
```

Once you have `Application` imported, you can create an application by calling
the constructor:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();
```

You can then add middleware by calling `application.use`:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = "Hello";
  }
});
```

Now that you have a middleware added created, you can create the API:

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

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

Lapi supports search parameters but they do not need to be defined in your code.
They can be accessed through the property `ctx.request.searchParams` in your
handler function. Please see the example below.

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";

const application = new Application();

application.use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = `Hello, ${ctx.request.searchParams.get("name")}!`;
  }
});

await application.start();
```

## Routing

There is a Middleware provided in `middleware/router.ts` that can handle routing
and route specific middleware. The following is a basic example. More can be
found in the `examples` directory.

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";
import { Router } from "https://deno.land/x/lapi/middleware/router.ts";

const application = new Application();
const router = new Router();

router.use("GET", "/", (ctx) => {
  ctx.response.body = { key: "value" };
});

application.use(router.routes()).start();
```

## Cors

There is a Middleware provided in `middleware/cors.ts` that will set up the
headers for your application. This Middleware is configurable. The following is
a basic example. More can be found in the `examples` directory.

```typescript
import { Application } from "https://deno.land/x/lapi/mod.ts";
import { cors } from "https://deno.land/x/lapi/middleware/cors.ts";

const application = new Application();

application.use(cors()).use((ctx) => {
  if (ctx.request.method === "GET") {
    ctx.response.body = { key: "value" };
  }
});

application.start();
```
