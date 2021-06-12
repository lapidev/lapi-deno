import {
  adapterFactory,
  engineFactory,
  viewEngine as ve,
} from "view_engine/mod.ts";

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

export function viewEngine() {
  return ve(oakAdapter, ejsEngine, {
    viewRoot: "./templates",
    viewExt: ".ejs",
    useCache: true,
  });
}
