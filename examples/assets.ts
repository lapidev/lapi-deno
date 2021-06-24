// Copyright 2020 Luke Shay. All rights reserved. MIT license.

import { Application } from "../mod.ts";
import { asset, assets } from "../middleware/assets.ts";

const application = new Application();

application.use(assets("/", "./assets"));
application.use(asset("/favicon.ico", "./assets/favicon.ico"));

application.start();
