import postcss from "https://deno.land/x/postcss/mod.js";
import autoprefixer from "https://jspm.dev/autoprefixer";

const { css } = await postcss([autoprefixer as any]).process(
  `
  backdrop-filter: blur(5px);
  user-select: none;
`
);

console.log(css);
