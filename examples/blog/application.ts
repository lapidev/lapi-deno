import { Application } from "../../mod.ts";
import { assets } from "../../middleware/assets.ts";
import { cors } from "../../middleware/cors.ts";
import { router as indexRouter } from "./routes/index.ts";
import { router as postRouter } from "./routes/post.ts";

const application = new Application();

application
  .use(cors())
  .use(await assets("/assets", "./assets"))
  .use(indexRouter.routes())
  .use(postRouter.routes())
  .start();
