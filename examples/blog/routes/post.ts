import { Router } from "../../../middleware/router.ts";
import { render } from "../deps.ts";
import post from "../pages/post.ts";
import { findPost } from "../posts.ts";

const router = new Router({ basePath: "/post" });

router.get("/:id", (ctx) => {
  const thePost = findPost(ctx.request.pathParams.id);

  if (thePost) {
    ctx.response.body = render(post({ post: thePost }));
  }
});

export { router };
