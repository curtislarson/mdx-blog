import { Blog } from "../src/Blog.tsx";

const root = new URL("./test-website", import.meta.url).pathname;

new Blog({ root, css: {} }).build().catch(console.error);
