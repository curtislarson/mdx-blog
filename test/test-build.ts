import { Blog } from "../src/Blog.tsx";

await new Blog({ root: new URL("./test-website", import.meta.url).pathname }).build();
