import { MDXCompiler } from "../src/mdx-compiler.ts";
import { assertEquals } from "./test-deps.ts";

Deno.test("MDXCompiler", async (t) => {
  const cache = new MDXCompiler({}, new URL("../test/test-website", import.meta.url).pathname);

  await t.step("compiles and caches a mdx file to temp", () => {
    const mdxFile = new URL("./__fixtures__/button.mdx", import.meta.url).pathname;
    const outfile = cache.compileToTempFile(mdxFile);

    const stat = Deno.statSync(outfile);
    assertEquals(true, stat.isFile);

    Deno.removeSync(outfile);
  });
});
