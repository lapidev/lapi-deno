import { Context } from "oak/mod.ts";

export function render(ctx: Context, template: string, data: object = {}) {
  return (ctx as any).render(template, data);
}

export function getPort(): number {
  const envPort = Deno.env.get("PORT");
  if (envPort) {
    return parseInt(envPort, 10);
  }

  return 8000;
}
