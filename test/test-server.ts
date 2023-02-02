#!/usr/bin/env -S deno run -A --unstable --no-check

import { Blog } from "../src/Blog.tsx";

const root = new URL("./test-website", import.meta.url).pathname;

await new Blog({
  root,
  index: { title: "blog", description: "Unprompted thoughts" },
  css: { theme: "dracula" },
}).serve();
