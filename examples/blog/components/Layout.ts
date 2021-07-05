import { html } from "../lib/html.ts";

export interface LayoutProps {
  // deno-lint-ignore no-explicit-any
  children: any;
  title?: string;
}

function Layout({ children, title }: LayoutProps) {
  return html`
    <html>
      <head>
        <title>${title || "Blog"}</title>
      </head>
      <link
        rel="stylesheet"
        type="text/css"
        href="/assets/css/main.css"
        media="screen"
      />
      <body class="w-full flex justify-center bg-gray-100">
        <section class="w-full max-w-screen-lg flex justify-center p-8">
          <div class="w-full">${children}</div>
        </section>
      </body>
    </html>
  `;
}

export default Layout;
