import { html } from "../lib/html.ts";
import { Post } from "../types.ts";
import Layout from "../components/Layout.ts";
import { format } from "../lib/format_date.ts";
import ArrowLeftIcon from "../components/ArrowLeftIcon.ts";

export interface PostProps {
  post: Post;
}

function post({ post: { title, createdDate, author, body } }: PostProps) {
  return html`
    <${Layout}>
      <div class="min-h-screen pb-8">
        <div class="rounded-lg py-10 pr-12 pl-12 shadow h-full bg-white">
          <a href="/" class="flex">
            <div class="p-2 rounded hover:bg-gray-100 inline-flex items-center justify-center leading-none">
              <${ArrowLeftIcon} />
              <span>Back</span>
            </div>
          </a>
          <h1 class="text-4xl font-bold pb-2 mb-2 border-b w-full">${title}</h1>
          <h2 class="font-semibold pb-6">
            By ${author} - ${format(createdDate, "{MM}/{dd}/{yyyy}")}
          </h2>
          <div>${body}</div>
        </div>
      </div>
    </${Layout}>
  `;
}

export default post;
