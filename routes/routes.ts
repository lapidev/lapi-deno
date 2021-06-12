import { Router } from "oak/mod.ts";
import { router as indexRouter } from "/routes/index.routes.ts";

const router: Router = new Router();

router.use("/", indexRouter.routes(), indexRouter.allowedMethods());

export { router };
