export interface Post {
  createdDate: Date;
  updatedDate: Date;
  title: string;
  author: string;
  description: string;
  // deno-lint-ignore no-explicit-any
  body: any;
  id: string;
}
