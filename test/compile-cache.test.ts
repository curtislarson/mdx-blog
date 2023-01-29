import { CompileCache } from "../src/compile-cache.ts";
import { assertEquals } from "./test-deps.ts";

Deno.test("CompileCache", async (t) => {
  const cache = new CompileCache({}, new URL("../test/test-website", import.meta.url).pathname);

  await t.step("compiles and caches a mdx file to temp", () => {
    const mdxFile = new URL("./__fixtures__/button.mdx", import.meta.url).pathname;
    const outfile = cache.compileToCacheSync(mdxFile);

    const stat = Deno.statSync(outfile);
    assertEquals(true, stat.isFile);

    Deno.removeSync(outfile);
  });
});
