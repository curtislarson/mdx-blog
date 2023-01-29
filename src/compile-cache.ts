import { mdx } from "../deps.ts";
import { MDXConfig } from "./config.ts";

/**
 * When a `mdx` component imports another `mdx` component we need to performa an intermediary compile step to `jsx`. This
 * cache helps keep track of which components we have previously compiled and where they are located.
 */
export class CompileCache extends Map<string, string> {
  #config;

  constructor(config: MDXConfig, blogDir: string) {
    super();
    this.#config = {
      ...config,
      jsx: true,
      baseUrl: `file://${blogDir}/`,
    };
  }

  compileToCacheSync(sourcePath: string) {
    const existing = this.get(sourcePath);
    if (existing != null) {
      return existing;
    }

    console.log("Compile to cache", sourcePath);

    const outPath = Deno.makeTempFileSync() + ".jsx";
    const content = Deno.readTextFileSync(sourcePath);
    const compiled = mdx.compileSync(content, this.#config);
    Deno.writeTextFile(outPath, compiled.value);
    this.set(sourcePath, outPath);
    console.log("Compiled to outPath", outPath);
    return outPath;
  }
}
