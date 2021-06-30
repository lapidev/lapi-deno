import { id } from "./deps.ts";
import { Post } from "./types.ts";

export const posts: Post[] = [
  {
    author: "Luke Shay",
    body: "My first blog post",
    createdDate: new Date("06/20/2022 12:00:00.000Z"),
    description: "This is a description of my first post",
    title: "My First Blog Post",
    updatedDate: new Date("06/20/2022 12:00:00.000Z"),
    id: id(),
  },
];

export function findPost(postId: string) {
  return posts.find(({ id }) => id === postId);
}
