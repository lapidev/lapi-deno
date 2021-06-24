// Copyright 2020 Luke Shay. All rights reserved. MIT license.
/* @module lapi/middleware/cors */

import { Context } from "../context.ts";

export interface CorsOptions {
  /**
   * Sets the origins that are allowed to access your application.
   *
   * {@see defaultCorsOptions} for defaults
   */
  allowedOrigins?: string[];

  /**
   * Sets the headers that are allowed to be sent to your application.
   *
   * {@see defaultCorsOptions} for defaults
   */
  allowedHeaders?: string[];

  /**
   * Sets the exposed headers that your application can respond with.
   *
   * {@see defaultCorsOptions} for defaults
   */
  exposedHeaders?: string[];

  /**
   * Sets whether your credentials are allowed.
   *
   * {@see defaultCorsOptions} for defaults
   */
  credentials?: boolean;

  /**
   * Sets the max age of requests to your application.
   *
   * {@see defaultCorsOptions} for defaults
   */
  maxAge?: number;
}

export const defaultCorsOptions: CorsOptions = {
  allowedOrigins: ["*"],
  //   allowedHeaders: [
  //     "Credentials",
  //     "Content-Type",
  //     "Origin",
  //     "Authorization",
  //     "Accepts",
  //     "Host",
  //     "User-Agent",
  //     "Referer",
  //     "Accept-Encoding",
  //     "Connection",
  //   ],
  //   exposedHeaders: [
  //     "Vary",
  //     "Access-Control-Allow-Origin",
  //     "Access-Control-Allow-Credentials",
  //     "Access-Control-Request-Headers",
  //     "Access-Control-Max-Age",
  //     "Access-Control-Expose-Headers",
  //   ],
  credentials: true,
  maxAge: 3600,
};

function configureAllowedOrigin(ctx: Context, allowedOrigins?: string[]) {
  const requestOrigin = ctx.request.headers.get("Origin");

  let allowOrigin = "*";

  if (allowedOrigins?.includes("*")) {
    allowOrigin = "*";
    ctx.response.headers.append("Vary", "Origin");
  } else if (requestOrigin && allowedOrigins?.includes(requestOrigin)) {
    allowOrigin = requestOrigin;
    ctx.response.headers.append("Vary", "Origin");
  } else if (allowedOrigins) {
    allowOrigin = "false";
  }

  ctx.response.headers.set("Access-Control-Allow-Origin", allowOrigin);
}

function configureAllowCredentials(ctx: Context, credentials?: boolean) {
  if (credentials) {
    ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
  }
}

function configureAllowedHeaders(ctx: Context, allowedHeaders?: string[]) {
  let headers = null;
  if (!allowedHeaders?.length) {
    headers = ctx.request.headers.get("access-control-request-headers");
    ctx.response.headers.append("Vary", "Access-Control-Request-Headers");
  }

  if (allowedHeaders?.length) {
    headers = allowedHeaders.join(",");
  }

  if (headers) {
    ctx.response.headers.set("Access-Control-Allow-Headers", headers);
  }
}

function configureMaxAge(ctx: Context, maxAge?: number) {
  if (maxAge) {
    ctx.response.headers.set("Access-Control-Max-Age", maxAge.toString());
  }
}

function configureExposedHeaders(ctx: Context, exposedHeaders?: string[]) {
  if (exposedHeaders?.length) {
    ctx.response.headers.set(
      "Access-Control-Expose-Headers",
      exposedHeaders.join(","),
    );
  }
}

/** Configures default cors for your application. */
export function cors(opts = defaultCorsOptions) {
  opts = { ...defaultCorsOptions, ...opts };

  return async function (ctx: Context, next: () => Promise<void>) {
    configureAllowedOrigin(ctx, opts.allowedOrigins);
    configureAllowCredentials(ctx, opts.credentials);
    configureAllowedHeaders(ctx, opts.allowedHeaders);
    configureMaxAge(ctx, opts.maxAge);
    configureExposedHeaders(ctx, opts.exposedHeaders);

    await next();
  };
}
