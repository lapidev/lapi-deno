import { html } from "../html.ts";
import { Post } from "../types.ts";
import Layout from "../components/Layout.ts";

export interface HomeProps {
  posts: Post[];
}

function home({ posts }: HomeProps) {
  return html`
    <${Layout}>
      <div class="flex w-full justify-center">
        <div class="w-full max-w-screen-md">
          <h1 class="text-4xl font-bold pb-2 mb-8 border-b w-full">Posts</h1>
          <ul>
            ${posts.map(
              ({ title, author, description, id }) => html`
                <li
                  class="rounded shadow hover:cursor-pointer hover:ring-2 p-6 bg-white"
                >
                  <a href="/post/${id}">
                    <h2 class="pb-2 text-2xl font-bold">${title}</h2>
                    <h3 class="pb-2 text-lg font-semibold">By ${author}</h3>
                    <p>${description}</p>
                  </a>
                </li>
              `
            )}
          </ul>
        </div>
      </div>
    </${Layout}>
  `;
}

export default home;
